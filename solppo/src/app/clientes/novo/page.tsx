import { createCliente } from "@/lib/db/actions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NovoClientePage() {
    async function handleCreate(formData: FormData) {
        "use server";
        await createCliente({
            nome: formData.get("nome") as string,
            email: formData.get("email") as string,
            telefone: formData.get("telefone") as string,
            whatsapp: formData.get("whatsapp") as string,
            documento: formData.get("documento") as string,
            endereco: formData.get("endereco") as string,
        });
        revalidatePath("/clientes");
        redirect("/clientes");
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <Link
                    href="/clientes"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                </Link>
                <h1 className="text-3xl font-bold text-foreground">Novo Cliente</h1>
            </div>

            <form action={handleCreate} className="card-premium p-6 space-y-5">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                        Nome *
                    </label>
                    <input
                        name="nome"
                        required
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors"
                        placeholder="Nome do cliente"
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            Documento (CPF/CNPJ)
                        </label>
                        <input
                            name="documento"
                            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors"
                            placeholder="000.000.000-00"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            Telefone
                        </label>
                        <input
                            name="telefone"
                            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors"
                            placeholder="(00) 00000-0000"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                        WhatsApp
                    </label>
                    <input
                        name="whatsapp"
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors"
                        placeholder="(00) 00000-0000 — usado para enviar orçamentos"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                        E-mail
                    </label>
                    <input
                        name="email"
                        type="email"
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors"
                        placeholder="email@exemplo.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                        Endereço
                    </label>
                    <textarea
                        name="endereco"
                        rows={2}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors resize-none"
                        placeholder="Endereço completo"
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        className="btn-holographic bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium text-sm"
                    >
                        Salvar Cliente
                    </button>
                    <Link
                        href="/clientes"
                        className="px-6 py-2.5 border border-border text-muted-foreground hover:text-foreground rounded-xl text-sm transition-colors"
                    >
                        Cancelar
                    </Link>
                </div>
            </form>
        </div>
    );
}
