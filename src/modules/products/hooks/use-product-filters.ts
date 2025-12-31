import { parseAsString, useQueryStates } from "nuqs";

export const useProductFilters = () => {
    return useQueryStates({
        minPrice: parseAsString
            .withOptions({
                clearOnDefault: true,
            })
            .withDefault(""),
        maxPrice: parseAsString
            .withOptions({
                clearOnDefault: true,
            })
            .withDefault(""),
    });
};
