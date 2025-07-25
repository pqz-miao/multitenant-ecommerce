import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    // minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

export function generateTenantURL(tenantSlug: string) {
  return `/tenants/${tenantSlug}`;
}
