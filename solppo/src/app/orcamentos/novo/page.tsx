"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Search, X } from "lucide-react";
import { toast } from "sonner";

// ─── Autocomplete search for items ───
function ItemSearch({
    itens,
    value,
    onSelect,
}: {
    itens: ItemOption[];
    value: number | null;
    onSelect: (id: number | null) => void;
}) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [highlighted, setHighlighted] = useState(-1);
    const ref = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Display selected item name
    const selectedItem = value ? itens.find((i) => i.id === value) : null;

    // Filter results
    const filtered = query.trim()
        ? itens.filter((i) => {
            const q = query.toLowerCase();
            return i.nome.toLowerCase().includes(q);
        }).slice(0, 15)
        : [];

    // Close on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!open) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlighted((h) => Math.max(h - 1, 0));
        } else if (e.key === "Enter" && highlighted >= 0) {
            e.preventDefault();
            const item = filtered[highlighted];
            if (item) {
                onSelect(item.id);
                setQuery("");
                setOpen(false);
            }
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    }, [open, highlighted, filtered, onSelect]);

    function handleClear() {
        onSelect(null);
        setQuery("");
        inputRef.current?.focus();
    }

    if (selectedItem) {
        return (
            <div className="flex items-center gap-1.5 w-full px-3 py-2 bg-background border border-border rounded-lg text-sm">
                <span className={`inline-flex items-center justify-center text-[10px] font-bold px-1.5 py-0.5 rounded ${selectedItem.tipo === "produto" ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"}`}>
                    {selectedItem.tipo === "produto" ? "P" : "S"}
                </span>
                <span className="truncate flex-1 text-foreground">{selectedItem.nome}</span>
                <button
                    type="button"
                    onClick={handleClear}
                    className="text-muted-foreground hover:text-red-400 transition-colors flex-shrink-0"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>
        );
    }

    return (
        <div className="relative" ref={ref}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                        setHighlighted(-1);
                    }}
                    onFocus={() => { if (query.trim()) setOpen(true); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Buscar item..."
                    className="w-full pl-8 pr-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                />
            </div>

            {open && filtered.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-card border border-border rounded-xl shadow-xl max-h-[280px] overflow-y-auto">
                    {filtered.map((item, idx) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                                onSelect(item.id);
                                setQuery("");
                                setOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 transition-colors border-b border-border/30 last:border-0 ${idx === highlighted ? "bg-primary/10" : "hover:bg-muted"}`}
                        >
                            <span className={`inline-flex items-center justify-center text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${item.tipo === "produto" ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"}`}>
                                {item.tipo === "produto" ? "P" : "S"}
                            </span>
                            <span className="truncate flex-1 text-foreground">{item.nome}</span>
                            <span className="text-xs text-muted-foreground flex-shrink-0 font-mono">
                                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.preco_base)}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {open && query.trim() && filtered.length === 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-card border border-border rounded-xl shadow-xl p-3">
                    <p className="text-sm text-muted-foreground text-center">
                        Nenhum item encontrado para &quot;{query}&quot;
                    </p>
                </div>
            )}
        </div>
    );
}

type ClienteOption = { id: number; nome: string };
type ItemOption = {
    id: number;
    nome: string;
    preco_base: number;
    tipo: string;
};
type LineItem = {
    key: string;
    item_id: number | null;
    descricao: string;
    quantidade: number;
    preco_unitario: number;
};

function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

export default function NovoOrcamentoPage() {
    const router = useRouter();
    const [clientes, setClientes] = useState<ClienteOption[]>([]);
    const [itensDisponiveis, setItensDisponiveis] = useState<ItemOption[]>([]);
    const [clienteId, setClienteId] = useState<number | "">("");
    const [validadeDias, setValidadeDias] = useState(30);
    const [observacoes, setObservacoes] = useState("");
    const [linhas, setLinhas] = useState<LineItem[]>([
        {
            key: crypto.randomUUID(),
            item_id: null,
            descricao: "",
            quantidade: 1,
            preco_unitario: 0,
        },
    ]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch("/api/clientes")
            .then((r) => r.json())
            .then(setClientes);
        fetch("/api/itens")
            .then((r) => r.json())
            .then(setItensDisponiveis);
    }, []);

    const total = linhas.reduce(
        (sum, l) => sum + l.quantidade * l.preco_unitario,
        0
    );

    function addLine() {
        setLinhas([
            ...linhas,
            {
                key: crypto.randomUUID(),
                item_id: null,
                descricao: "",
                quantidade: 1,
                preco_unitario: 0,
            },
        ]);
    }

    function removeLine(key: string) {
        if (linhas.length <= 1) return;
        setLinhas(linhas.filter((l) => l.key !== key));
    }

    function updateLine(key: string, updates: Partial<LineItem>) {
        setLinhas(linhas.map((l) => (l.key === key ? { ...l, ...updates } : l)));
    }

    function selectItem(key: string, itemId: number) {
        const item = itensDisponiveis.find((i) => i.id === itemId);
        if (item) {
            updateLine(key, {
                item_id: item.id,
                descricao: item.nome,
                preco_unitario: item.preco_base,
            });
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (linhas.some((l) => !l.descricao.trim())) {
            toast.error("Preencha a descrição de todos os itens");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch("/api/orcamentos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cliente_id: clienteId || null,
                    validade_dias: validadeDias,
                    observacoes,
                    itens: linhas.map((l) => ({
                        item_id: l.item_id,
                        descricao: l.descricao,
                        quantidade: l.quantidade,
                        preco_unitario: l.preco_unitario,
                    })),
                }),
            });

            if (res.ok) {
                toast.success("Orçamento criado com sucesso!");
                router.push("/orcamentos");
                router.refresh();
            } else {
                toast.error("Erro ao criar orçamento");
            }
        } catch {
            toast.error("Erro ao criar orçamento");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <Link
                    href="/orcamentos"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                </Link>
                <h1 className="text-3xl font-bold text-foreground">Novo Orçamento</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header Info */}
                <div className="card-premium p-6 space-y-5">
                    <h2 className="text-lg font-semibold text-foreground">
                        Informações Gerais
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Cliente
                            </label>
                            <select
                                value={clienteId}
                                onChange={(e) =>
                                    setClienteId(
                                        e.target.value ? Number(e.target.value) : ""
                                    )
                                }
                                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors"
                            >
                                <option value="">Sem cliente vinculado</option>
                                {clientes.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.nome}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Validade (dias)
                            </label>
                            <input
                                type="number"
                                min={1}
                                value={validadeDias}
                                onChange={(e) =>
                                    setValidadeDias(Number(e.target.value))
                                }
                                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            Observações
                        </label>
                        <textarea
                            value={observacoes}
                            onChange={(e) => setObservacoes(e.target.value)}
                            rows={2}
                            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors resize-none"
                            placeholder="Observações adicionais..."
                        />
                    </div>
                </div>

                {/* Line Items */}
                <div className="card-premium p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-foreground">
                            Itens do Orçamento
                        </h2>
                        <button
                            type="button"
                            onClick={addLine}
                            className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium"
                        >
                            <Plus className="h-4 w-4" />
                            Adicionar Linha
                        </button>
                    </div>

                    <div className="space-y-3">
                        {linhas.map((linha, idx) => (
                            <div
                                key={linha.key}
                                className="grid grid-cols-12 gap-2 items-end p-3 bg-muted/30 rounded-xl border border-border/50"
                            >
                                <div className="col-span-12 sm:col-span-3">
                                    <label className="block text-xs text-muted-foreground mb-1">
                                        Item Cadastrado
                                    </label>
                                    <ItemSearch
                                        itens={itensDisponiveis}
                                        value={linha.item_id}
                                        onSelect={(id) => {
                                            if (id) {
                                                selectItem(linha.key, id);
                                            } else {
                                                updateLine(linha.key, { item_id: null, descricao: "", preco_unitario: 0 });
                                            }
                                        }}
                                    />
                                </div>
                                <div className="col-span-12 sm:col-span-4">
                                    <label className="block text-xs text-muted-foreground mb-1">
                                        Descrição *
                                    </label>
                                    <input
                                        value={linha.descricao}
                                        onChange={(e) =>
                                            updateLine(linha.key, { descricao: e.target.value })
                                        }
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                                        placeholder="Descrição do item"
                                        required
                                    />
                                </div>
                                <div className="col-span-4 sm:col-span-2">
                                    <label className="block text-xs text-muted-foreground mb-1">
                                        Qtd
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={linha.quantidade}
                                        onChange={(e) =>
                                            updateLine(linha.key, {
                                                quantidade: Number(e.target.value),
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                                    />
                                </div>
                                <div className="col-span-5 sm:col-span-2">
                                    <label className="block text-xs text-muted-foreground mb-1">
                                        Preço Unit.
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={linha.preco_unitario}
                                        onChange={(e) =>
                                            updateLine(linha.key, {
                                                preco_unitario: Number(e.target.value),
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                                    />
                                </div>
                                <div className="col-span-3 sm:col-span-1 flex items-end justify-end gap-2">
                                    <span className="text-sm font-mono font-semibold text-foreground whitespace-nowrap hidden sm:block">
                                        {formatCurrency(linha.quantidade * linha.preco_unitario)}
                                    </span>
                                    {linhas.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeLine(linha.key)}
                                            className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Total */}
                    <div className="flex justify-end pt-4 border-t border-border">
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Total</p>
                            <p className="text-2xl font-bold text-foreground">
                                {formatCurrency(total)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn-holographic bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium text-sm disabled:opacity-50"
                    >
                        {saving ? "Salvando..." : "Criar Orçamento"}
                    </button>
                    <Link
                        href="/orcamentos"
                        className="px-6 py-2.5 border border-border text-muted-foreground hover:text-foreground rounded-xl text-sm transition-colors"
                    >
                        Cancelar
                    </Link>
                </div>
            </form>
        </div>
    );
}
