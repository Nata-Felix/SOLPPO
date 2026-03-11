import { NextRequest, NextResponse } from "next/server";
import { updateOrcamento, getOrcamento } from "@/lib/db/actions";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const orcamentoId = Number(id);

        const existing = await getOrcamento(orcamentoId);
        if (!existing) {
            return NextResponse.json(
                { error: "Orçamento não encontrado" },
                { status: 404 }
            );
        }

        const body = await req.json();
        await updateOrcamento(orcamentoId, {
            cliente_id: body.cliente_id,
            validade_dias: body.validade_dias || 30,
            observacoes: body.observacoes || "",
            itens: body.itens || [],
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating orcamento:", error);
        return NextResponse.json(
            { error: "Failed to update orcamento" },
            { status: 500 }
        );
    }
}

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const orcamento = await getOrcamento(Number(id));
        if (!orcamento) {
            return NextResponse.json(
                { error: "Orçamento não encontrado" },
                { status: 404 }
            );
        }
        return NextResponse.json(orcamento);
    } catch (error) {
        console.error("Error fetching orcamento:", error);
        return NextResponse.json(
            { error: "Failed to fetch orcamento" },
            { status: 500 }
        );
    }
}
