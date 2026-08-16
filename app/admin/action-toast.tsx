"use client";

import { useEffect } from "react";
import { useToast } from "@/app/components/toaster";

export function ActionToast({
    cleanPath,
    kind,
    message,
}: {
    cleanPath: string;
    kind: "success" | "error";
    message?: string;
}) {
    const { push } = useToast();

    useEffect(() => {
        if (!message) return;
        push({ kind, message });
        window.history.replaceState(null, "", cleanPath);
    }, [cleanPath, kind, message, push]);

    return null;
}
