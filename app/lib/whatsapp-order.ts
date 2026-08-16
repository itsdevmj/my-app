export const ORDER_CODE_PREFIX = "CSO1.";

export type WhatsAppOrderLine = {
    handle: string;
    variant: string;
    qty: number;
};

export type WhatsAppOrderPayload = {
    createdAt: string;
    items: WhatsAppOrderLine[];
    version: 1;
};

function toBase64Url(value: string) {
    const bytes = new TextEncoder().encode(value);
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    const binary = atob(padded);
    return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
}

function validateItems(value: unknown): WhatsAppOrderLine[] {
    if (!Array.isArray(value) || value.length === 0 || value.length > 50) {
        throw new Error("The order code has no valid items.");
    }

    return value.map((item) => {
        if (!item || typeof item !== "object") throw new Error("The order code is malformed.");
        const row = item as Record<string, unknown>;
        const handle = typeof row.handle === "string" ? row.handle.trim() : "";
        const variant = typeof row.variant === "string" ? row.variant.trim() : "";
        const qty = Number(row.qty);
        if (!/^[a-z0-9-]{1,100}$/.test(handle) || !variant || variant.length > 160) {
            throw new Error("The order code contains an invalid product selection.");
        }
        if (!Number.isInteger(qty) || qty < 1 || qty > 99) {
            throw new Error("The order code contains an invalid quantity.");
        }
        return { handle, variant, qty };
    });
}

export function createWhatsAppOrderCode(items: readonly WhatsAppOrderLine[]) {
    const payload: WhatsAppOrderPayload = {
        version: 1,
        createdAt: new Date().toISOString(),
        items: validateItems(items),
    };
    return `${ORDER_CODE_PREFIX}${toBase64Url(JSON.stringify(payload))}`;
}

export function readWhatsAppOrderCode(input: string): WhatsAppOrderPayload {
    if (input.length > 50_000) throw new Error("That message is too large to read safely.");
    const match = input.match(/CSO1\.([A-Za-z0-9_-]+)/);
    if (!match) throw new Error("No Capture Studio order code was found in that message.");
    if (match[1].length > 10_000) throw new Error("That order code is too large.");

    let parsed: Record<string, unknown>;
    try {
        parsed = JSON.parse(fromBase64Url(match[1])) as Record<string, unknown>;
    } catch {
        throw new Error("That order code is damaged or incomplete.");
    }

    if (parsed.version !== 1 || typeof parsed.createdAt !== "string") {
        throw new Error("Unsupported order code.");
    }
    const createdAt = new Date(parsed.createdAt);
    if (Number.isNaN(createdAt.getTime())) throw new Error("Invalid order date.");
    return {
        version: 1,
        createdAt: createdAt.toISOString(),
        items: validateItems(parsed.items),
    };
}
