import type { SearchParams } from "nuqs/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { loadProductFilters } from "@/modules/products/search-params";
import { ProductsListView } from "@/modules/products/ui/views/products-list-view";

import { DEFAULT_LIMIT } from "@/constants";
import { getQueryClient, trpc } from "@/trpc/server";

interface Props {
    searchParams: Promise<SearchParams>;
};

const Page = async ({ searchParams }: Props) => {
    const filters = await loadProductFilters(searchParams);

    const queryClient = getQueryClient();
    void queryClient.prefetchInfiniteQuery(trpc.products.getMany.infiniteQueryOptions({
        ...filters,
        limit: DEFAULT_LIMIT,
    }));

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ProductsListView />
        </HydrationBoundary>
    );
};

export default Page;
