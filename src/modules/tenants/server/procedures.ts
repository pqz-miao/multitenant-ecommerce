import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { Media, Tenant } from "@/payload-types";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const tenantsRouter = createTRPCRouter({
    getOne: baseProcedure
        .input(
            z.object({
                slug: z.string(),
            })
        )
        .query(async ({ ctx, input }) => {
            const data = await ctx.db.find({
                collection: "tenants",
                depth: 1, // "tenant.image" is a type of "Media"
                where: {
                    slug: {
                        equals: input.slug,
                    },
                },
                limit: 1,
                pagination: false,
            });

            const tenant = data.docs[0];

            if (!tenant) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Tenant not found" });
            }

            return tenant as Tenant & { image: Media | null };
        }),
});