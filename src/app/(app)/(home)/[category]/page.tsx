import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient, trpc } from "@/trpc/server";
import { ProductsList, ProductsListSkeleton } from "@/modules/products/ui/components/products-list";

interface Props {
    params: Promise<{
        category: string;
    }>
};

const Page = async ({ params }: Props) => {
    const { category } = await params;

    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.products.getMany.queryOptions({ category }));

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<ProductsListSkeleton />}>
                <ProductsList category={category} />
            </Suspense>
        </HydrationBoundary>
    );
};

export default Page;
