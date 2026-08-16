import type { Metadata } from "next";
import Link from "next/link";
import { getShopCategories } from "@/app/lib/content-store";
import { ProductCreateForm } from "./create-form";

export const metadata: Metadata = { title: "Add product" };

export default async function NewProductPage() {
    const categories = await getShopCategories();

    return (
        <div className="mx-auto max-w-3xl">
            <nav aria-label="Breadcrumb">
                <ol className="flex items-center gap-2 text-xs text-fg-dim">
                    <li>
                        <Link href="/admin/shop" className="transition-colors hover:text-accent">
                            Shop
                        </Link>
                    </li>
                    <li aria-hidden>/</li>
                    <li aria-current="page" className="text-fg">
                        Add product
                    </li>
                </ol>
            </nav>

            <header className="mt-5">
                <h1 className="h-section text-3xl sm:text-4xl">Add product</h1>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-fg-muted">
                    Create a new storefront product, upload its main image, and set its naira price.
                </p>
            </header>

            <div className="mt-8">
                <ProductCreateForm categories={categories} />
            </div>
        </div>
    );
}
