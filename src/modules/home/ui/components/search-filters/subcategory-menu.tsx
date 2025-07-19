import Link from "next/link";

import { CategoriesGetManyOutput } from "@/modules/categories/types";

interface Props {
    category: CategoriesGetManyOutput[number];
    isOpen: boolean;
};

export const SubcategoryMenu = ({
    category,
    isOpen,
}: Props) => {
    if (!isOpen || !category.subcategories || category.subcategories.length === 0) {
        return null;
    }

    const backgroundColor = category.color || "#F5F5F5";

    return (
        <div className="absolute z-100 top-full left-0" >
            {/* Invisible bridge to maintain hover */}
            <div className="h-3 w-60" />
            <div 
                style={{ backgroundColor }}
                className="w-60 text-black rounded-md overflow-hidden border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-x-[2px] -translate-y-[2px]"
            >
                <div>
                    {category.subcategories.map((subcategory) => (
                        <Link 
                            key={subcategory.slug} 
                            href={`/c/${category.slug}/${subcategory.slug}`}
                            className="w-full text-left p-4 hover:bg-black hover:text-white flex justify-between items-center underline font-medium"
                        >
                            {subcategory.name}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};
