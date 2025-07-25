import { z } from "zod";
import type { Sort, Where } from "payload";
import { headers as getHeaders } from "next/headers";

import { DEFAULT_LIMIT } from "@/constants";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { Category, Media, Product, Tenant } from "@/payload-types";

import { sortValues } from "../search-params";

export const productsRouter = createTRPCRouter({
    getMany: baseProcedure
        .input(
            z.object({
                cursor: z.number().default(1),
                limit: z.number().default(DEFAULT_LIMIT),
                category: z.string().nullable().optional(),
                minPrice: z.string().nullable().optional(),
                maxPrice: z.string().nullable().optional(),
                tags: z.array(z.string()).nullable().optional(),
                sort: z.enum(sortValues).nullable().optional(),
                tenantSlug: z.string().nullable().optional(),
            })
        )
        .query(async ({ ctx, input }) => {
            const where: Where = {};
            let sort: Sort = "createdAt";
            
            if (input.sort === "curated") {
                sort = "-createdAt";
            } else if (input.sort === "hot_and_new") {
                sort = "createdAt";
            } else if (input.sort === "trending") {
                sort = "name";
            }

            if (input.minPrice && input.maxPrice) {
                where.price = {
                    greater_than_equal: input.minPrice,
                    less_than_equal: input.maxPrice,
                };
            } else if (input.minPrice) {
                where.price = {
                    greater_than_equal: input.minPrice,
                };
            } else if (input.maxPrice) {
                where.price = {
                    less_than_equal: input.maxPrice,
                };
            }

            if (input.tenantSlug) {
                where["tenant.slug"] = {
                    equals: input.tenantSlug,
                };
            }

            if (input.category) {
                const categoriesData = await ctx.db.find({
                    collection: "categories",
                    limit: 1,
                    depth: 1, // Populate subcategories, subcategories.[0] will be a type of "Category"
                    pagination: false,
                    where: {
                        slug: {
                            equals: input.category,
                        },
                    },
                });

                const formattedData = categoriesData.docs.map((doc) => ({
                    ...doc,
                    subcategories: (doc.subcategories?.docs ?? []).map((subDoc) => ({
                        // Because of "depth: 1" we are confident "doc" will be a type of "Category"
                        ...(subDoc as Category),
                        subcategories: undefined,
                    }))
                }));

                const subcategories = [];
                const parentCategory = formattedData[0];

                if (parentCategory) {
                    subcategories.push(
                        ...parentCategory.subcategories.map((subcategory) => subcategory.slug)
                    );
                    
                    where["category.slug"] = {
                        in: [parentCategory.slug, ...subcategories],
                    };
                }
            }

            if (input.tags && input.tags.length > 0) {
                where["tags.name"] = {
                    in: input.tags,
                };
            }

            const data = await ctx.db.find({
                collection: "products",
                depth: 2, // Populate "category", "image", "tenant", "tenant.image"
                where,
                sort,
                page: input.cursor,
                limit: input.limit,
            });

            return {
                ...data,
                docs: data.docs.map((doc) => ({
                    ...doc,
                    image: doc.image as Media | null,
                    tenant: doc.tenant as Tenant & { image: Media | null },
                })),
            };
        }),
    getOne: baseProcedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .query(async ({ ctx, input }) => {
            const headers = await getHeaders();
            const session = await ctx.db.auth({ headers });

            const product = await ctx.db.findByID({
                collection: "products",
                id: input.id,
                depth: 2, // Load the "product.image", "product.tenant", and "product.tenant.image"
            });

            let isPurchased = false;
            if (session.user) {
                const orderData = await ctx.db.find({
                    collection: "orders",
                    pagination: false,
                    limit: 1,
                    where: {
                        and: [
                            {
                                product: {
                                    equals: input.id,
                                },
                            },
                            {
                                user: {
                                    equals: session.user.id,
                                },
                            },
                        ],
                    },
                });

                isPurchased = !!orderData.docs[0];
            }

            return {
                ...product,
                isPurchased,
                image: product.image as Media | null,
                tenant: product.tenant as Tenant & { image: Media | null },
            };
        }),
});