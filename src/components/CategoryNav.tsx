"use client";

import { ChevronDown } from "lucide-react";
import { categories } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IntlLink } from "@/components/IntlLink";

function buildProductsUrl(categoryId?: string, subCategoryId?: string) {
  const params = new URLSearchParams();
  if (categoryId) params.set("categoryId", categoryId);
  if (subCategoryId) params.set("subCategoryId", subCategoryId);
  const q = params.toString();
  return q ? `/products?${q}` : "/products";
}

export default function CategoryNav() {
  return (
    <div className="border-t bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between overflow-x-auto py-2 scrollbar-hide">
          {categories.map((category) => (
            <DropdownMenu key={category.id}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="whitespace-nowrap">
                  {category.name}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <IntlLink href={buildProductsUrl(category.id)}>{`All ${category.name}`}</IntlLink>
                </DropdownMenuItem>
                {category.subCategories?.map((subCat) => (
                  <DropdownMenuItem key={subCat.id} asChild>
                    <IntlLink href={buildProductsUrl(category.id, subCat.id)}>{subCat.name}</IntlLink>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </div>
      </div>
    </div>
  );
}
