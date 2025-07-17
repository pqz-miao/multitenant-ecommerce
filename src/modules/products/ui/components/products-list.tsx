"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";

interface Props {
    category?: string;
};

export const ProductsList = ({ category }: Props) => {
    const trpc = useTRPC();
    const { data } = useSuspenseQuery(trpc.products.getMany.queryOptions({ category }));

    return (
        <div>
            {JSON.stringify(data, null, 2)}
        </div>
    );
};

export const ProductsListSkeleton = () => {
    return (
        <div>
            Loading...
        </div>
    );
};
