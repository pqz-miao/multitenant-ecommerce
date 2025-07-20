import type { SearchParams } from "nuqs/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { loadProductFilters } from "@/modules/products/search-params";
import { ProductsListView } from "@/modules/products/ui/views/products-list-view";

import { DEFAULT_LIMIT } from "@/constants";
import { getQueryClient, trpc } from "@/trpc/server";

interface Props {
    searchParams: Promise<SearchParams>;
    params: Promise<{ slug: string; }>;
};

const Page = async ({ searchParams, params }: Props) => {
    const { slug } = await params;
    const filters = await loadProductFilters(searchParams);

    const queryClient = getQueryClient();
    void queryClient.prefetchInfiniteQuery(trpc.products.getMany.infiniteQueryOptions({
        ...filters,
        tenantSlug: slug,
        limit: DEFAULT_LIMIT,
    }));

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ProductsListView tenantSlug={slug} narrowView />
        </HydrationBoundary>
    );
};

export default Page;
