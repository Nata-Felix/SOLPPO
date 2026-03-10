"use client";

import { Printer, FileDown, MessageCircle, ChevronDown } from "lucide-react";
import { generateOrcamentoPdf, generateOrcamentoPdfBlob, type PdfOrcamentoData } from "@/lib/pdf";
import { useState, useRef, useEffect } from "react";

export function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-xl text-sm hover:bg-muted transition-colors"
        >
            <Printer className="h-4 w-4" />
            Imprimir
        </button>
    );
}

export function ExportPdfButton({ data }: { data: PdfOrcamentoData }) {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    async function handleExport(withDesc: boolean) {
        setOpen(false);
        setLoading(true);
        try {
            await generateOrcamentoPdf(data, { includeDescription: withDesc });
        } catch (err) {
            console.error("Erro ao gerar PDF:", err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                disabled={loading}
                className="btn-holographic inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium disabled:opacity-50"
            >
                <FileDown className="h-4 w-4" />
                {loading ? "Gerando..." : "Exportar PDF"}
                <ChevronDown className="h-3 w-3" />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-xl shadow-xl min-w-[220px] overflow-hidden">
                    <button
                        onClick={() => handleExport(true)}
                        className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors border-b border-border"
                    >
                        <span className="font-medium">Com descrição</span>
                        <span className="block text-xs text-muted-foreground mt-0.5">Inclui detalhes e observações</span>
                    </button>
                    <button
                        onClick={() => handleExport(false)}
                        className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                        <span className="font-medium">Sem descrição</span>
                        <span className="block text-xs text-muted-foreground mt-0.5">Apenas itens e valores</span>
                    </button>
                </div>
            )}
        </div>
    );
}

export function WhatsAppButton({ data, clienteWhatsapp }: { data: PdfOrcamentoData; clienteWhatsapp?: string }) {
    const [loading, setLoading] = useState(false);

    async function handleSend() {
        if (!clienteWhatsapp) {
            alert("Este cliente não possui número de WhatsApp cadastrado. Cadastre o WhatsApp na página de edição do cliente.");
            return;
        }

        setLoading(true);
        try {
            // Clean phone number (remove spaces, dashes, parentheses)
            let phone = clienteWhatsapp.replace(/[\s\-\(\)\.]/g, "");
            // Add country code if missing
            if (!phone.startsWith("+")) {
                if (phone.startsWith("0")) phone = phone.substring(1);
                phone = "55" + phone;
            } else {
                phone = phone.substring(1); // remove +
            }

            // Generate PDF as blob
            const blob = await generateOrcamentoPdfBlob(data, { includeDescription: true });

            // Try Web Share API first (works on mobile and some desktop browsers)
            if (navigator.share && navigator.canShare) {
                const file = new File(
                    [blob],
                    `orcamento-${data.id.toString().padStart(4, "0")}.pdf`,
                    { type: "application/pdf" }
                );

                const shareData = {
                    text: `Olá ${data.cliente_nome}! Segue o orçamento #${data.id.toString().padStart(4, "0")} no valor de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(data.valor_total)}. Aguardo seu retorno!`,
                    files: [file],
                };

                if (navigator.canShare(shareData)) {
                    await navigator.share(shareData);
                    setLoading(false);
                    return;
                }
            }

            // Fallback: open WhatsApp Web with message (user attaches PDF manually)
            const msg = encodeURIComponent(
                `Olá ${data.cliente_nome}! 👋\n\nSegue o orçamento *#${data.id.toString().padStart(4, "0")}*\n💰 Valor total: *${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(data.valor_total)}*\n📅 Validade: ${data.validade_dias} dias\n\nAguardo seu retorno! 😊`
            );

            // Also download the PDF for the user to attach
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `orcamento-${data.id.toString().padStart(4, "0")}.pdf`;
            a.click();
            URL.revokeObjectURL(url);

            // Open WhatsApp
            window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
        } catch (err) {
            console.error("Erro ao enviar por WhatsApp:", err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleSend}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
        >
            <MessageCircle className="h-4 w-4" />
            {loading ? "Enviando..." : "WhatsApp"}
        </button>
    );
}
