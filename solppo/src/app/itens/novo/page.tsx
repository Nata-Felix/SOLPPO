import { createItem } from "@/lib/db/actions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NovoItemPage() {
    async function handleCreate(formData: FormData) {
        "use server";
        await createItem({
            tipo: formData.get("tipo") as "produto" | "servico",
            nome: formData.get("nome") as string,
            descricao: formData.get("descricao") as string,
            preco_base: parseFloat(formData.get("preco_base") as string) || 0,
        });
        revalidatePath("/itens");
        redirect("/itens");
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <Link
                    href="/itens"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                </Link>
                <h1 className="text-3xl font-bold text-foreground">Novo Item</h1>
            </div>

            <form action={handleCreate} className="card-premium p-6 space-y-5">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                        Tipo *
                    </label>
                    <select
                        name="tipo"
                        required
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors"
                    >
                        <option value="produto">Produto</option>
                        <option value="servico">Serviço</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                        Nome *
                    </label>
                    <input
                        name="nome"
                        required
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors"
                        placeholder="Nome do item"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                        Descrição
                    </label>
                    <textarea
                        name="descricao"
                        rows={3}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors resize-none"
                        placeholder="Descrição detalhada do item"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                        Preço Base (R$) *
                    </label>
                    <input
                        name="preco_base"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors"
                        placeholder="0.00"
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        className="btn-holographic bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium text-sm"
                    >
                        Salvar Item
                    </button>
                    <Link
                        href="/itens"
                        className="px-6 py-2.5 border border-border text-muted-foreground hover:text-foreground rounded-xl text-sm transition-colors"
                    >
                        Cancelar
                    </Link>
                </div>
            </form>
        </div>
    );
}
