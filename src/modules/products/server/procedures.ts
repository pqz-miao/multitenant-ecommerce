import { z } from "zod";
import type { Sort, Where } from "payload";

import { DEFAULT_LIMIT } from "@/constants";
import { Category, Media } from "@/payload-types";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

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
            })
        )
        .query(async ({ ctx, input }) => {
            const where: Where = {};
            let sort: Sort = "-createdAt";

            if (input.sort === "hot_and_new") {
                sort = "-createdAt";
            } else if (input.sort === "curated") {
                sort = "+createdAt";
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

                const subcategorySlugs = [];
                const formattedData = categoriesData.docs.map((doc) => ({
                    ...doc,
                    subcategorySlugs: (doc.subcategories?.docs ?? []).map((subdoc) => ({
                        // Because of "depth: 1" we are confident "subdoc" will be a type of "Category"
                        ...(subdoc as Category),
                    })),
                }));

                const parentCategory = formattedData[0];

                if (parentCategory) {
                    subcategorySlugs.push(
                        ...parentCategory.subcategorySlugs?.map((subcategory) => subcategory.slug)
                    );

                    where["category.slug"] = {
                        in: [parentCategory.slug, ...subcategorySlugs],
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
                depth: 1, // Populate "category" & "image"
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
                })),
            };
        }),
});
