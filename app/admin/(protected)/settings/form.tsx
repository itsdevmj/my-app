"use client";

import { useActionState } from "react";
import type { StudioSettings } from "@/app/lib/content-store";
import { updateStudio, type ActionState } from "@/app/admin/actions";
import { Result, Submit, inputClass } from "@/app/admin/ui";

const INITIAL: ActionState = {};

const FIELDS = [
    { name: "name", label: "Studio name", type: "text", required: true },
    { name: "email", label: "Contact email", type: "email", required: true },
    { name: "phone", label: "Phone", type: "tel", required: false },
    {
        name: "whatsappNumber",
        label: "Order WhatsApp number",
        type: "tel",
        required: false,
        placeholder: "+2348012345678",
        hint: "Storefront orders are sent here. Use international format with country code.",
    },
    { name: "address", label: "Address", type: "text", required: false },
] as const;

export function SettingsForm({ studio }: { studio: StudioSettings }) {
    const [state, formAction] = useActionState(updateStudio, INITIAL);

    return (
        <form action={formAction} className="panel rounded-xl p-6">
            <div className="space-y-5">
                {FIELDS.map((field) => (
                    <label key={field.name} className="block">
                        <span className="block text-sm font-semibold">
                            {field.label}
                            {field.required && <span className="text-accent"> *</span>}
                        </span>
                        <input
                            name={field.name}
                            type={field.type}
                            required={field.required}
                            defaultValue={studio[field.name]}
                            placeholder={"placeholder" in field ? field.placeholder : undefined}
                            className={inputClass}
                        />
                        {"hint" in field && (
                            <span className="mt-1.5 block text-xs text-fg-dim">{field.hint}</span>
                        )}
                    </label>
                ))}
            </div>

            <div className="mt-7 flex items-center gap-4">
                <Submit>Save settings</Submit>
                <Result state={state} />
            </div>
        </form>
    );
}
