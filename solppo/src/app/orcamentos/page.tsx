import {
    getOrcamentos,
    deleteOrcamento,
    updateOrcamentoStatus,
} from "@/lib/db/actions";
import Link from "next/link";
import {
    Plus,
    Trash2,
    FileText,
    Eye,
    CheckCircle2,
    XCircle,
    Send,
} from "lucide-react";
import { revalidatePath } from "next/cache";

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

export default async function OrcamentosPage() {
    const orcamentos = await getOrcamentos();

    async function handleDelete(formData: FormData) {
        "use server";
        const id = Number(formData.get("id"));
        await deleteOrcamento(id);
        revalidatePath("/orcamentos");
    }

    async function handleStatus(formData: FormData) {
        "use server";
        const id = Number(formData.get("id"));
        const status = formData.get("status") as
            | "rascunho"
            | "enviado"
            | "aprovado"
            | "rejeitado";
        await updateOrcamentoStatus(id, status);
        revalidatePath("/orcamentos");
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Orçamentos</h1>
                    <p className="text-muted-foreground mt-1">
                        Crie e gerencie seus orçamentos
                    </p>
                </div>
                <Link
                    href="/orcamentos/novo"
                    className="btn-holographic inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium text-sm"
                >
                    <Plus className="h-4 w-4" />
                    Novo Orçamento
                </Link>
            </div>

            {orcamentos.length === 0 ? (
                <div className="card-premium p-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                        Nenhum orçamento criado
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                        Comece criando seu primeiro orçamento.
                    </p>
                    <Link
                        href="/orcamentos/novo"
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium"
                    >
                        <Plus className="h-4 w-4" />
                        Criar Orçamento
                    </Link>
                </div>
            ) : (
                <div className="card-premium overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/30">
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                                        #
                                    </th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                                        Cliente
                                    </th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden sm:table-cell">
                                        Data
                                    </th>
                                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                                        Valor
                                    </th>
                                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                                        Status
                                    </th>
                                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {orcamentos.map((orc) => (
                                    <tr
                                        key={orc.id}
                                        className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                                    >
                                        <td className="py-3 px-4 font-mono text-muted-foreground">
                                            #{orc.id.toString().padStart(4, "0")}
                                        </td>
                                        <td className="py-3 px-4 font-medium text-foreground">
                                            {orc.cliente_nome || "Sem cliente"}
                                        </td>
                                        <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">
                                            {orc.data_emissao}
                                        </td>
                                        <td className="py-3 px-4 text-right font-mono font-medium text-foreground">
                                            {formatCurrency(orc.valor_total)}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-xs font-medium badge-${orc.status}`}
                                            >
                                                {statusLabels[orc.status]}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={`/orcamentos/${orc.id}`}
                                                    className="p-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                    title="Ver detalhes"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>

                                                {orc.status === "rascunho" && (
                                                    <form action={handleStatus}>
                                                        <input type="hidden" name="id" value={orc.id} />
                                                        <input
                                                            type="hidden"
                                                            name="status"
                                                            value="enviado"
                                                        />
                                                        <button
                                                            type="submit"
                                                            className="p-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                            title="Marcar como Enviado"
                                                        >
                                                            <Send className="h-4 w-4" />
                                                        </button>
                                                    </form>
                                                )}

                                                {(orc.status === "rascunho" ||
                                                    orc.status === "enviado") && (
                                                        <>
                                                            <form action={handleStatus}>
                                                                <input type="hidden" name="id" value={orc.id} />
                                                                <input
                                                                    type="hidden"
                                                                    name="status"
                                                                    value="aprovado"
                                                                />
                                                                <button
                                                                    type="submit"
                                                                    className="p-2 text-muted-foreground hover:text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
                                                                    title="Aprovar"
                                                                >
                                                                    <CheckCircle2 className="h-4 w-4" />
                                                                </button>
                                                            </form>
                                                            <form action={handleStatus}>
                                                                <input type="hidden" name="id" value={orc.id} />
                                                                <input
                                                                    type="hidden"
                                                                    name="status"
                                                                    value="rejeitado"
                                                                />
                                                                <button
                                                                    type="submit"
                                                                    className="p-2 text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition-colors"
                                                                    title="Rejeitar"
                                                                >
                                                                    <XCircle className="h-4 w-4" />
                                                                </button>
                                                            </form>
                                                        </>
                                                    )}

                                                <form action={handleDelete}>
                                                    <input type="hidden" name="id" value={orc.id} />
                                                    <button
                                                        type="submit"
                                                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        title="Excluir"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
