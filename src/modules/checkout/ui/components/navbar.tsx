"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

import { generateTenantURL } from "@/lib/utils";

interface Props {
    tenantSlug: string;
};

export const Navbar = ({ tenantSlug }: Props) => {
    return (
        <nav className="h-20 border-b font-medium bg-white">
            <div className="max-w-(--breakpoint-xl) mx-auto flex justify-between items-center h-full px-4 lg:px-12">
                <p className="text-xl">Checkout</p>
                <Button
                    variant="elevated"
                    asChild
                >
                    <Link href={generateTenantURL(tenantSlug)}>
                        Continue Shopping
                    </Link>
                </Button>
            </div>
        </nav>
    );
};
