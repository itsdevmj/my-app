import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getShopCategories } from "@/app/lib/content-store";
import { ProductEditor } from "./editor";

type PageProps = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { handle } = await params;
    const product = await getProduct(handle);
    return { title: product ? `Edit ${product.name}` : "Not found" };
}

export default async function AdminProductPage({ params }: PageProps) {
    const { handle } = await params;
    const [product, categories] = await Promise.all([getProduct(handle), getShopCategories()]);
    if (!product) notFound();

    return (
        <div className="mx-auto max-w-3xl">
            <nav aria-label="Breadcrumb">
                <ol className="flex flex-wrap items-center gap-2 text-xs text-fg-dim">
                    <li>
                        <Link href="/admin/shop" className="transition-colors hover:text-accent">
                            Shop
                        </Link>
                    </li>
                    <li aria-hidden>/</li>
                    <li aria-current="page" className="text-fg">
                        {product.name}
                    </li>
                </ol>
            </nav>

            <header className="mt-5 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="h-section text-3xl">{product.name}</h1>
                    <p className="mt-2 text-sm text-fg-muted">
                        {product.category}
                        {product.digital ? " · Digital download" : " · Physical, ships"}
                    </p>
                </div>
                <Link
                    href={`/shop/${product.handle}`}
                    className="rounded-full border border-line-strong px-4 py-2 text-xs font-bold tracking-tight text-fg-muted transition-colors hover:border-accent hover:text-accent"
                >
                    View on shop ↗
                </Link>
            </header>

            <div className="mt-8">
                <ProductEditor product={product} categories={categories} />
            </div>
        </div>
    );
}
