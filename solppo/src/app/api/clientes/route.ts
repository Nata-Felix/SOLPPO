import { NextResponse } from "next/server";
import { getClientes } from "@/lib/db/actions";

export async function GET() {
    const clientes = await getClientes();
    return NextResponse.json(clientes);
}
