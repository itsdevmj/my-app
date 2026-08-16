import { NextResponse } from "next/server";
import { getShots } from "@/app/lib/content-store";

export async function GET() {
    return NextResponse.json(await getShots());
}
