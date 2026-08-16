import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/app/lib/content-store";
import { price } from "@/app/lib/shop";
import { BuyBox, ProductGallery } from "./buy-box";

/* Prerender the handles currently present in the configured catalogue backend. */
export async function generateStaticParams() {
    const products = await getProducts();
    return products.map((product) => ({ handle: product.handle }));
}

type PageProps = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { handle } = await params;
    const product = await getProduct(handle);
    if (!product) return { title: "Not found" };

    return {
        title: product.name,
        description: product.tagline,
        openGraph: {
            title: `${product.name} · Capture Studio Shop`,
            description: product.tagline,
            images: [{ url: product.images[0] }],
            type: "website",
        },
    };
}

export default async function ProductPage({ params }: PageProps) {
    const { handle } = await params;
    const product = await getProduct(handle);
    if (!product) notFound();

    /* Same category first, then anything else, capped at three. */
    const catalogue = await getProducts();
    const related = [
        ...catalogue.filter((p) => p.handle !== handle && p.category === product.category),
        ...catalogue.filter((p) => p.handle !== handle && p.category !== product.category),
    ].slice(0, 3);

    return (
        <main className="pb-24">
            {/* breadcrumb */}
            <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
                <ol className="flex flex-wrap items-center gap-2 text-sm text-fg-dim">
                    <li>
                        <Link href="/shop" className="transition-colors hover:text-accent">
                            Shop
                        </Link>
                    </li>
                    <li aria-hidden>/</li>
                    <li>
                        <Link
                            href={`/shop?category=${encodeURIComponent(product.category)}`}
                            className="transition-colors hover:text-accent"
                        >
                            {product.category}
                        </Link>
                    </li>
                    <li aria-hidden>/</li>
                    <li aria-current="page" className="text-fg">
                        {product.name}
                    </li>
                </ol>
            </nav>

            {/* product */}
            <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
                <ProductGallery product={product} />
                <BuyBox product={product} />
            </div>

            {/* related */}
            <section className="mx-auto mt-24 max-w-7xl px-5 sm:px-8">
                <h2 className="h-section text-2xl sm:text-3xl">You might also want</h2>

                <div className="mt-8 grid gap-5 sm:grid-cols-3">
                    {related.map((item) => (
                        <article key={item.handle} className="panel group overflow-hidden rounded-xl">
                            <Link
                                href={`/shop/${item.handle}`}
                                className="media relative block aspect-[4/3] rounded-none border-0 border-b border-line"
                            >
                                <Image
                                    src={item.images[0]}
                                    alt={item.name}
                                    fill
                                    sizes="(max-width: 640px) 100vw, 33vw"
                                    className="media-zoom object-cover"
                                />
                            </Link>
                            <div className="flex items-start justify-between gap-3 p-5">
                                <div className="min-w-0">
                                    <h3 className="truncate text-sm font-extrabold tracking-tight">
                                        <Link href={`/shop/${item.handle}`} className="hover:text-accent">
                                            {item.name}
                                        </Link>
                                    </h3>
                                    <p className="mt-1 text-xs uppercase tracking-wider text-fg-dim">
                                        {item.category}
                                    </p>
                                </div>
                                <span className="shrink-0 text-sm font-extrabold tracking-tight">
                                    {price(item.priceNaira)}
                                </span>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    );
}
