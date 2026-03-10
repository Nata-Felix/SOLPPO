import { NextResponse } from "next/server";
import { getItens } from "@/lib/db/actions";

export async function GET() {
    const itens = await getItens();
    return NextResponse.json(itens);
}
