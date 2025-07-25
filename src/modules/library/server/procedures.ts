import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { DEFAULT_LIMIT } from "@/constants";
import { Media, Tenant } from "@/payload-types";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const libraryRouter = createTRPCRouter({
    getMany: protectedProcedure
        .input(
            z.object({
                cursor: z.number().default(1),
                limit: z.number().default(DEFAULT_LIMIT),
            })
        )
        .query(async ({ ctx, input }) => {
            const data = await ctx.db.find({
                collection: "orders",
                depth: 0, // We want to just get ids, without populating
                page: input.cursor,
                limit: input.limit,
                where: {
                    user: {
                        equals: ctx.session.user.id,
                    },
                },
            });

            const productIds = data.docs.map((order) => order.product);

            const productsData = await ctx.db.find({
                collection: "products",
                pagination: false,
                where: {
                    id: {
                        in: productIds,
                    },
                },
            });

            return {
                ...productsData,
                docs: productsData.docs.map((doc) => ({
                    ...doc,
                    image: doc.image as Media | null,
                    tenant: doc.tenant as Tenant & { image: Media | null },
                })),
            };
        }),
    getOne: protectedProcedure
        .input(
            z.object({
                productId: z.string(),
            })
        )
        .query(async ({ ctx, input }) => {
            const data = await ctx.db.find({
                collection: "orders",
                limit: 1,
                pagination: false,
                where: {
                    and: [
                        {
                            product: {
                                equals: input.productId,
                            },
                        },
                        {
                            user: {
                                equals: ctx.session.user.id,
                            },
                        },
                    ],
                },
            });

            const order = data.docs[0];

            if (!order) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Order not found",
                });
            }

            const product = await ctx.db.findByID({
                collection: "products",
                id: input.productId,
            });

            if (!product) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" }
                );
            }

            return product;
        }),
});