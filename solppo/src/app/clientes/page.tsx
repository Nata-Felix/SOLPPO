import { getClientes, deleteCliente } from "@/lib/db/actions";
import Link from "next/link";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function ClientesPage() {
    const clientes = await getClientes();

    async function handleDelete(formData: FormData) {
        "use server";
        const id = Number(formData.get("id"));
        await deleteCliente(id);
        revalidatePath("/clientes");
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie seus clientes cadastrados
                    </p>
                </div>
                <Link
                    href="/clientes/novo"
                    className="btn-holographic inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium text-sm"
                >
                    <Plus className="h-4 w-4" />
                    Novo Cliente
                </Link>
            </div>

            {clientes.length === 0 ? (
                <div className="card-premium p-12 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                        Nenhum cliente cadastrado
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                        Comece adicionando seu primeiro cliente.
                    </p>
                    <Link
                        href="/clientes/novo"
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium"
                    >
                        <Plus className="h-4 w-4" />
                        Adicionar Cliente
                    </Link>
                </div>
            ) : (
                <div className="card-premium overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/30">
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                                        Nome
                                    </th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden sm:table-cell">
                                        Documento
                                    </th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">
                                        E-mail
                                    </th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">
                                        Telefone
                                    </th>
                                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {clientes.map((c) => (
                                    <tr
                                        key={c.id}
                                        className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                                    >
                                        <td className="py-3 px-4 font-medium text-foreground">
                                            {c.nome}
                                        </td>
                                        <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">
                                            {c.documento || "—"}
                                        </td>
                                        <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">
                                            {c.email || "—"}
                                        </td>
                                        <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell">
                                            {c.telefone || "—"}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/clientes/${c.id}`}
                                                    className="p-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                                <form action={handleDelete}>
                                                    <input type="hidden" name="id" value={c.id} />
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
