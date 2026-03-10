import { NextResponse } from "next/server";
import { getDashboardStats, getOrcamentos } from "@/lib/db/actions";

export async function GET() {
    const stats = await getDashboardStats();
    const orcamentos = await getOrcamentos();

    return NextResponse.json({
        totalClientes: stats.totalClientes,
        totalItens: stats.totalItens,
        totalOrcamentos: stats.totalOrcamentos,
        totalAprovados: stats.totalAprovados,
        valorTotal: stats.valorTotal,
        valorAprovado: stats.valorAprovado,
        orcamentos: orcamentos.map((o) => ({
            id: o.id,
            cliente_nome: o.cliente_nome || "—",
            valor_total: o.valor_total,
            status: o.status,
            data_emissao: o.data_emissao,
        })),
    });
}
