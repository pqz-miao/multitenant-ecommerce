"use client";

import Link from "next/link";
import Image from "next/image";
import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { generateTenantURL } from "@/lib/utils";

interface Props {
    tenantSlug: string;
};

export const Navbar = ({ tenantSlug }: Props) => {
    const trpc = useTRPC();
    const { data } = useSuspenseQuery(trpc.tenants.getOne.queryOptions({ slug: tenantSlug }));

    return (
        <nav className="h-20 border-b font-medium bg-white">
            <div className="max-w-(--breakpoint-xl) mx-auto flex justify-between items-center h-full px-4 lg:px-12">
                <Link href={generateTenantURL(tenantSlug)} className="flex items-center gap-2">
                    {data.image?.url && (
                        <Image
                            src={data.image?.url || ""}
                            width={32}
                            height={32}
                            className="rounded-full border shrink-0 size-[32px]"
                            alt={tenantSlug}
                        />
                    )}
                    <p className="text-xl">{data.name}</p>
                </Link>
            </div>
        </nav>
    );
};

export const NavbarSkeleton = () => {
    return (
        <nav className="h-20 border-b font-medium bg-white">
            <div className="max-w-(--breakpoint-xl) mx-auto flex justify-between items-center h-full px-4 lg:px-12">
                <div />
                {/* TODO: Skeleton for checkout button */}
            </div>
        </nav>
    );
};
