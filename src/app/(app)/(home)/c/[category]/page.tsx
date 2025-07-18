import type { SearchParams } from "nuqs/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { loadProductFilters } from "@/modules/products/search-params";
import { ProductsListView } from "@/modules/products/ui/views/products-list-view";

import { getQueryClient, trpc } from "@/trpc/server";

interface Props {
    params: Promise<{
        category: string;
    }>;
    searchParams: Promise<SearchParams>;
};

const Page = async ({ params, searchParams }: Props) => {
    const { category } = await params;
    const filters = await loadProductFilters(searchParams);

    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.products.getMany.queryOptions({
        ...filters,
        category,
    }));

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ProductsListView category={category} />
        </HydrationBoundary>
    );
};

export default Page;
