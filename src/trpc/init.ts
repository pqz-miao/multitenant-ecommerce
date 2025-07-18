import { cache } from "react";
import superjson from "superjson";
import { getPayload } from "payload";
import { initTRPC } from "@trpc/server";

import config from "@payload-config";

export const createTRPCContext = cache(async () => {
    return { userId: "user_123" };
});

const t = initTRPC.create({
    transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure.use(async ({ next }) => {
    const payload = await getPayload({ config });

    return next({ ctx: { db: payload } });
});
