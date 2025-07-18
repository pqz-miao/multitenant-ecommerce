import { SearchParams } from "nuqs/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { loadProductFilters } from "@/modules/products/search-params";
import { ProductsListView } from "@/modules/products/ui/views/products-list-view";

import { getQueryClient, trpc } from "@/trpc/server";

interface Props {
    params: Promise<{
        subcategory: string;
    }>;
    searchParams: Promise<SearchParams>;
};

const Page = async ({ params, searchParams }: Props) => {
    const { subcategory } = await params;
    const filters = await loadProductFilters(searchParams);

    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.products.getMany.queryOptions({
        ...filters,
        category: subcategory,
    }));

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ProductsListView category={subcategory} />
        </HydrationBoundary>
    );
};

export default Page;
