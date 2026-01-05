import { useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCart } from "@/modules/checkout/hooks/use-cart";

interface Props {
    tenantSlug: string;
    productId: string;
};

export const CartButton = ({ tenantSlug, productId }: Props) => {
    const cart = useCart(tenantSlug);
    const [inCart, setInCart] = useState(cart.isProductInCart(productId));

    const handleClick = () => {
        cart.toggleProduct(productId);
        setInCart(cart.isProductInCart(productId));
    };

    return (
        <Button
            variant="elevated"
            className={cn(
                "flex-1 bg-pink-400", 
                inCart && "bg-white",
            )}
            onClick={handleClick}
        >
            {inCart ? "Remove from cart" : "Add to cart"}
        </Button>
    );
};
