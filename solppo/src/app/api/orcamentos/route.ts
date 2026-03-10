import { NextRequest, NextResponse } from "next/server";
import { createOrcamento } from "@/lib/db/actions";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const result = await createOrcamento({
            cliente_id: body.cliente_id,
            validade_dias: body.validade_dias || 30,
            observacoes: body.observacoes || "",
            itens: body.itens || [],
        });
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error("Error creating orcamento:", error);
        return NextResponse.json(
            { error: "Failed to create orcamento" },
            { status: 500 }
        );
    }
}
