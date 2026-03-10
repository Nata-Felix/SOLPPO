"use client";

import { FileDown } from "lucide-react";
import { generateRelatorioPdf } from "@/lib/pdf";
import { useState } from "react";

export function ExportReportButton() {
    const [loading, setLoading] = useState(false);

    async function handleExport() {
        setLoading(true);
        try {
            const res = await fetch("/api/relatorio");
            if (!res.ok) throw new Error("Failed to fetch report data");
            const data = await res.json();
            await generateRelatorioPdf(data);
        } catch (err) {
            console.error("Erro ao gerar relatório:", err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleExport}
            disabled={loading}
            className="btn-holographic inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium text-sm disabled:opacity-50"
        >
            <FileDown className="h-4 w-4" />
            {loading ? "Gerando..." : "Relatório PDF"}
        </button>
    );
}
