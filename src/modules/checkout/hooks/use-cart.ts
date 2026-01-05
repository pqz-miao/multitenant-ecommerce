import { useCartStore } from "../store/use-cart-store";

export const useCart = (tenantSlug: string) => {
    const {
        getCartByTenant,
        addProduct,
        removeProduct,
        clearCart,
        clearAllCarts
    } = useCartStore();

    const productIds = getCartByTenant(tenantSlug);

    const toggleProduct = (productId: string) => {
        if (getCartByTenant(tenantSlug).includes(productId)) {
            removeProduct(tenantSlug, productId);
        } else {
            addProduct(tenantSlug, productId);
        }
    };

    const isProductInCart = (productId: string) => {
        return getCartByTenant(tenantSlug).includes(productId);
    };

    const clearTenantCart = () => {
        clearCart(tenantSlug);
    };

    return {
        productIds,
        addProduct: (productId: string) => addProduct(tenantSlug, productId),
        removeProduct: (productId: string) => removeProduct(tenantSlug, productId),
        clearCart: clearTenantCart,
        clearAllCarts,
        toggleProduct,
        isProductInCart,
        totalItems: getCartByTenant(tenantSlug).length,
    };
};
