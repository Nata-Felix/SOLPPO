import { getItens, deleteItem } from "@/lib/db/actions";
import Link from "next/link";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { revalidatePath } from "next/cache";

function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

export default async function ItensPage() {
    const itens = await getItens();

    async function handleDelete(formData: FormData) {
        "use server";
        const id = Number(formData.get("id"));
        await deleteItem(id);
        revalidatePath("/itens");
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Produtos & Serviços
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie os itens disponíveis para orçamentos
                    </p>
                </div>
                <Link
                    href="/itens/novo"
                    className="btn-holographic inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium text-sm"
                >
                    <Plus className="h-4 w-4" />
                    Novo Item
                </Link>
            </div>

            {itens.length === 0 ? (
                <div className="card-premium p-12 text-center">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                        Nenhum item cadastrado
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                        Adicione produtos ou serviços para usar nos orçamentos.
                    </p>
                    <Link
                        href="/itens/novo"
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium"
                    >
                        <Plus className="h-4 w-4" />
                        Adicionar Item
                    </Link>
                </div>
            ) : (
                <div className="card-premium overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/30">
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                                        Tipo
                                    </th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                                        Nome
                                    </th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">
                                        Descrição
                                    </th>
                                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                                        Preço Base
                                    </th>
                                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {itens.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                                    >
                                        <td className="py-3 px-4">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${item.tipo === "produto"
                                                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                                                        : "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                                                    }`}
                                            >
                                                {item.tipo === "produto" ? "Produto" : "Serviço"}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 font-medium text-foreground">
                                            {item.nome}
                                        </td>
                                        <td className="py-3 px-4 text-muted-foreground hidden md:table-cell max-w-xs truncate">
                                            {item.descricao || "—"}
                                        </td>
                                        <td className="py-3 px-4 text-right font-mono text-foreground">
                                            {formatCurrency(item.preco_base)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/itens/${item.id}`}
                                                    className="p-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                                <form action={handleDelete}>
                                                    <input type="hidden" name="id" value={item.id} />
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
