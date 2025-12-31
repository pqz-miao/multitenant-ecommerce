import { z } from "zod";
import type { Where } from "payload";

import { Category } from "@/payload-types";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const productsRouter = createTRPCRouter({
    getMany: baseProcedure
        .input(
            z.object({
                category: z.string().nullable().optional(),
                minPrice: z.string().nullable().optional(),
                maxPrice: z.string().nullable().optional(),
            })
        )
        .query(async ({ ctx, input }) => {
            const where: Where = {};

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

            const data = await ctx.db.find({
                collection: "products",
                depth: 1, // Populate "category" & "image"
                where,
            });

            return data;
        }),
});
