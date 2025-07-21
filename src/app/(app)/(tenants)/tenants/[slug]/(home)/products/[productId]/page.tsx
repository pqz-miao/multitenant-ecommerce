import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { ProductView } from "@/modules/products/ui/views/product-view";

import { getQueryClient, trpc } from "@/trpc/server";

interface Props {
    params: Promise<{ slug: string; productId: string; }>;
};

const Page = async ({ params }: Props) => {
    const { slug, productId } = await params;

    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.products.getOne.queryOptions({ id: productId }));

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ProductView productId={productId} tenantSlug={slug} />
        </HydrationBoundary>
    );
};

export default Page;
