import { getOrcamento } from "@/lib/db/actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PrintButton, ExportPdfButton, WhatsAppButton } from "@/components/PrintButton";

function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

const statusLabels: Record<string, string> = {
    rascunho: "Rascunho",
    enviado: "Enviado",
    aprovado: "Aprovado",
    rejeitado: "Rejeitado",
};

export default async function OrcamentoDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const orcamento = await getOrcamento(Number(id));
    if (!orcamento) notFound();

    const pdfData = {
        id: orcamento.id,
        cliente_nome: orcamento.cliente_nome || "Sem cliente",
        data_emissao: orcamento.data_emissao,
        validade_dias: orcamento.validade_dias,
        status: orcamento.status,
        valor_total: orcamento.valor_total,
        observacoes: orcamento.observacoes,
        itens: orcamento.itens.map((item) => ({
            descricao: item.descricao,
            quantidade: item.quantidade,
            preco_unitario: item.preco_unitario,
            subtotal: item.subtotal,
        })),
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between print:hidden">
                <div>
                    <Link
                        href="/orcamentos"
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Voltar
                    </Link>
                    <h1 className="text-3xl font-bold text-foreground">
                        Orçamento #{orcamento.id.toString().padStart(4, "0")}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <WhatsAppButton data={pdfData} clienteWhatsapp={(orcamento as Record<string, unknown>).cliente_whatsapp as string | undefined} />
                    <ExportPdfButton data={pdfData} />
                    <PrintButton />
                </div>
            </div>

            {/* Budget Header */}
            <div className="card-premium p-6 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Cliente</p>
                        <p className="text-lg font-semibold text-foreground">
                            {orcamento.cliente_nome || "Sem cliente vinculado"}
                        </p>
                    </div>
                    <span
                        className={`px-3 py-1.5 rounded-full text-sm font-medium badge-${orcamento.status}`}
                    >
                        {statusLabels[orcamento.status]}
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-border">
                    <div>
                        <p className="text-xs text-muted-foreground">Data de Emissão</p>
                        <p className="text-sm font-medium text-foreground">
                            {orcamento.data_emissao}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Validade</p>
                        <p className="text-sm font-medium text-foreground">
                            {orcamento.validade_dias} dias
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Total de Itens</p>
                        <p className="text-sm font-medium text-foreground">
                            {orcamento.itens.length}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Valor Total</p>
                        <p className="text-lg font-bold text-primary">
                            {formatCurrency(orcamento.valor_total)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <div className="card-premium overflow-hidden">
                <div className="p-4 border-b border-border">
                    <h2 className="text-lg font-semibold text-foreground">
                        Itens do Orçamento
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                                    #
                                </th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                                    Descrição
                                </th>
                                <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                                    Qtd
                                </th>
                                <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                                    Preço Unit.
                                </th>
                                <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                                    Subtotal
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {orcamento.itens.map((item, idx) => (
                                <tr
                                    key={item.id}
                                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                                >
                                    <td className="py-3 px-4 text-muted-foreground">
                                        {idx + 1}
                                    </td>
                                    <td className="py-3 px-4 text-foreground font-medium">
                                        {item.descricao}
                                    </td>
                                    <td className="py-3 px-4 text-right text-foreground">
                                        {item.quantidade}
                                    </td>
                                    <td className="py-3 px-4 text-right font-mono text-foreground">
                                        {formatCurrency(item.preco_unitario)}
                                    </td>
                                    <td className="py-3 px-4 text-right font-mono font-medium text-foreground">
                                        {formatCurrency(item.subtotal)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-muted/50">
                                <td colSpan={4} className="py-3 px-4 text-right font-semibold text-foreground">
                                    Total
                                </td>
                                <td className="py-3 px-4 text-right font-mono font-bold text-lg text-primary">
                                    {formatCurrency(orcamento.valor_total)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Observations */}
            {orcamento.observacoes && (
                <div className="card-premium p-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        Observações
                    </h3>
                    <p className="text-foreground whitespace-pre-wrap">
                        {orcamento.observacoes}
                    </p>
                </div>
            )}

        </div>
    );
}
