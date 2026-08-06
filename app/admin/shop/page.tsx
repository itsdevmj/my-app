import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/app/lib/content-store";
import { price } from "@/app/lib/shop";
import { updateProduct } from "../actions";

export const metadata: Metadata = { title: "Shop" };

export default async function AdminShopPage() {
    const products = await getProducts();

    return (
        <div className="mx-auto max-w-5xl">
            <header>
                <h1 className="h-section text-3xl sm:text-4xl">Shop</h1>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-fg-muted">
                    Price, sale price, badge and stock for each product. Names, copy and
                    images live in <code>app/lib/shop.ts</code> — those are structural, so
                    they stay in the source rather than becoming editable fields.
                </p>
            </header>

            <ul className="mt-8 space-y-4">
                {products.map((product) => (
                    <li key={product.handle} className="panel rounded-xl p-5">
                        <form action={updateProduct} className="flex flex-col gap-5 lg:flex-row lg:items-end">
                            <input type="hidden" name="handle" value={product.handle} />

                            {/* identity */}
                            <div className="flex min-w-0 flex-1 items-center gap-4">
                                <span className="media relative size-16 shrink-0 rounded-lg">
                                    <Image
                                        src={product.images[0]}
                                        alt=""
                                        fill
                                        sizes="64px"
                                        className="object-cover"
                                    />
                                </span>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-extrabold tracking-tight">
                                        <Link href={`/shop/${product.handle}`} className="hover:text-accent">
                                            {product.name}
                                        </Link>
                                    </p>
                                    <p className="mt-1 text-xs text-fg-dim">
                                        {product.category}
                                        {product.digital ? " · Digital" : " · Physical"} ·{" "}
                                        {price(product.cents)}
                                    </p>
                                </div>
                            </div>

                            {/* fields */}
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:shrink-0">
                                <label className="block">
                                    <span className="block text-[11px] uppercase tracking-wider text-fg-dim">
                                        Price $
                                    </span>
                                    <input
                                        name="dollars"
                                        type="number"
                                        min={0}
                                        max={100000}
                                        step="1"
                                        required
                                        defaultValue={product.cents / 100}
                                        className="mt-1.5 w-full rounded-lg border border-line-strong bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
                                    />
                                </label>

                                <label className="block">
                                    <span className="block text-[11px] uppercase tracking-wider text-fg-dim">
                                        Was $
                                    </span>
                                    <input
                                        name="compareDollars"
                                        type="number"
                                        min={0}
                                        max={100000}
                                        step="1"
                                        defaultValue={
                                            product.compareAtCents ? product.compareAtCents / 100 : ""
                                        }
                                        placeholder="—"
                                        className="mt-1.5 w-full rounded-lg border border-line-strong bg-bg px-3 py-2 text-sm outline-none placeholder:text-fg-dim focus:border-accent"
                                    />
                                </label>

                                <label className="block">
                                    <span className="block text-[11px] uppercase tracking-wider text-fg-dim">
                                        Badge
                                    </span>
                                    <input
                                        name="badge"
                                        type="text"
                                        maxLength={24}
                                        defaultValue={product.badge ?? ""}
                                        placeholder="—"
                                        className="mt-1.5 w-full rounded-lg border border-line-strong bg-bg px-3 py-2 text-sm outline-none placeholder:text-fg-dim focus:border-accent"
                                    />
                                </label>

                                <label className="flex items-end gap-2 pb-2">
                                    <input
                                        name="inStock"
                                        type="checkbox"
                                        defaultChecked={product.inStock}
                                        className="size-4 accent-accent"
                                    />
                                    <span className="text-xs font-semibold">In stock</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="shrink-0 rounded-full bg-accent px-5 py-2.5 text-sm font-bold tracking-tight text-accent-fg transition-transform duration-300 hover:scale-[1.03]"
                            >
                                Save
                            </button>
                        </form>
                    </li>
                ))}
            </ul>
        </div>
    );
}
