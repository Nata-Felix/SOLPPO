"use client";

import { jsPDF } from "jspdf";

export type PdfOrcamentoData = {
    id: number;
    cliente_nome: string;
    data_emissao: string;
    validade_dias: number;
    status: string;
    valor_total: number;
    observacoes: string;
    itens: {
        descricao: string;
        quantidade: number;
        preco_unitario: number;
        subtotal: number;
    }[];
};

export type PdfRelatorioData = {
    totalClientes: number;
    totalItens: number;
    totalOrcamentos: number;
    totalAprovados: number;
    valorTotal: number;
    valorAprovado: number;
    orcamentos: {
        id: number;
        cliente_nome: string;
        valor_total: number;
        status: string;
        data_emissao: string;
    }[];
};

type RGB = [number, number, number];

function fmt(v: number) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}
function fmtDate(d: string) {
    try { const [y, m, dd] = d.split("-"); return `${dd}/${m}/${y}`; } catch { return d; }
}

const statusLabels: Record<string, string> = { rascunho: "Rascunho", enviado: "Enviado", aprovado: "Aprovado", rejeitado: "Rejeitado" };

// ─── Gradient fill (replaces solid black) ───
function fillGradient(doc: jsPDF, x: number, y: number, w: number, h: number, from: RGB, to: RGB) {
    const steps = 12;
    const stepH = h / steps;
    for (let i = 0; i < steps; i++) {
        const r = from[0] + (to[0] - from[0]) * (i / steps);
        const g = from[1] + (to[1] - from[1]) * (i / steps);
        const b = from[2] + (to[2] - from[2]) * (i / steps);
        doc.setFillColor(Math.round(r), Math.round(g), Math.round(b));
        doc.rect(x, y + i * stepH, w, stepH + 0.5, "F");
    }
}

// Gradient colors: dark navy → dark teal (instead of solid black)
const gradFrom: RGB = [15, 23, 42];    // slate-900
const gradTo: RGB = [30, 58, 78];      // dark teal

// ══════════════════════════════════════════════════
//   ORÇAMENTO PDF — versão simples + gradiente
// ══════════════════════════════════════════════════

export async function generateOrcamentoPdf(data: PdfOrcamentoData, options?: { includeDescription?: boolean }) {
    const withDesc = options?.includeDescription ?? true;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pw = doc.internal.pageSize.getWidth();
    const m = 15;
    const cw = pw - m * 2;

    let logoImg: HTMLImageElement | null = null;
    try { logoImg = await loadImage("/logo.png"); } catch { /* */ }

    // ─── Header with gradient ───
    fillGradient(doc, 0, 0, pw, 36, gradFrom, gradTo);

    if (logoImg) {
        doc.addImage(logoImg, "PNG", m, 8, 20, 20);
    }

    const tx = logoImg ? m + 24 : m;
    doc.setTextColor(245, 158, 11);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("SOLPPO", tx, 17);

    doc.setTextColor(180, 180, 190);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Sistema de Orçamentos", tx, 23);

    // Right side
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Orçamento #${data.id.toString().padStart(4, "0")}`, pw - m, 17, { align: "right" });

    doc.setTextColor(200, 200, 210);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(statusLabels[data.status] || data.status, pw - m, 23, { align: "right" });

    let y = 44;

    // ─── Client info ───
    doc.setTextColor(120, 120, 130);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("CLIENTE", m, y);
    doc.setTextColor(40, 40, 50);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(data.cliente_nome || "Sem cliente vinculado", m, y + 6);

    const c2 = m + cw * 0.5;
    doc.setTextColor(120, 120, 130);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("EMISSÃO", c2, y);
    doc.setTextColor(40, 40, 50);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(fmtDate(data.data_emissao), c2, y + 6);

    doc.setTextColor(120, 120, 130);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("VALIDADE", c2 + 40, y);
    doc.setTextColor(40, 40, 50);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`${data.validade_dias} dias`, c2 + 40, y + 6);

    // Separator
    y += 14;
    doc.setDrawColor(220, 220, 225);
    doc.setLineWidth(0.3);
    doc.line(m, y, m + cw, y);
    y += 8;

    // ─── Table header with gradient ───
    const col = {
        num: m + 2,
        desc: m + 12,
        qtd: m + cw * 0.6,
        preco: m + cw * 0.72,
        sub: m + cw * 0.87,
    };

    fillGradient(doc, m, y, cw, 8, gradFrom, gradTo);

    doc.setTextColor(245, 158, 11);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("#", col.num, y + 5.5);
    doc.text(withDesc ? "DESCRIÇÃO" : "ITEM", col.desc, y + 5.5);
    doc.text("QTD", col.qtd, y + 5.5);
    doc.text("PREÇO UNIT.", col.preco, y + 5.5);
    doc.text("SUBTOTAL", col.sub, y + 5.5);
    y += 10;

    // ─── Table rows ───
    data.itens.forEach((item, idx) => {
        const maxW = col.qtd - col.desc - 3;
        const descLines = withDesc
            ? doc.splitTextToSize(item.descricao, maxW)
            : [doc.splitTextToSize(item.descricao, maxW)[0]];
        const rowH = Math.max(12, descLines.length * 4.5 + 6);

        if (y + rowH > 260) {
            doc.addPage();
            y = 20;
        }

        if (idx % 2 === 1) {
            doc.setFillColor(248, 248, 250);
            doc.rect(m, y - 5, cw, rowH, "F");
        }

        // Row separator
        doc.setDrawColor(235, 235, 238);
        doc.setLineWidth(0.2);
        doc.line(m, y + rowH - 5, m + cw, y + rowH - 5);

        doc.setTextColor(150, 150, 160);
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.text(String(idx + 1), col.num, y + 3.5);

        doc.setTextColor(40, 40, 50);
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        doc.text(descLines, col.desc, y + 3.5);

        doc.setTextColor(80, 80, 90);
        doc.setFontSize(8.5);
        doc.text(item.quantidade.toString(), col.qtd, y + 3.5);
        doc.text(fmt(item.preco_unitario), col.preco, y + 3.5);

        doc.setTextColor(40, 40, 50);
        doc.setFont("helvetica", "bold");
        doc.text(fmt(item.subtotal), col.sub, y + 3.5);

        y += rowH;
    });

    // ─── Total bar with gradient ───
    y += 4;
    fillGradient(doc, m, y, cw, 12, gradFrom, gradTo);

    doc.setTextColor(180, 180, 190);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("TOTAL", m + 6, y + 8);

    doc.setTextColor(245, 158, 11);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(fmt(data.valor_total), pw - m - 4, y + 8.5, { align: "right" });

    y += 18;

    // ─── Observations ───
    if (data.observacoes && withDesc) {
        if (y > 245) { doc.addPage(); y = 20; }

        doc.setTextColor(120, 120, 130);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("OBSERVAÇÕES", m, y);
        y += 5;

        doc.setTextColor(60, 60, 70);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(data.observacoes, cw - 4);
        doc.text(lines, m, y);
    }

    // ─── Footer ───
    const tp = doc.getNumberOfPages();
    for (let p = 1; p <= tp; p++) {
        doc.setPage(p);
        const ph = doc.internal.pageSize.getHeight();
        doc.setTextColor(180, 180, 190);
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "normal");
        doc.text("SOLPPO — Sistema de Orçamentos", m, ph - 8);
        doc.text(`${p}/${tp}`, pw - m, ph - 8, { align: "right" });
    }

    doc.save(`orcamento-${data.id.toString().padStart(4, "0")}.pdf`);
}

// ─── Blob version for WhatsApp ───
export async function generateOrcamentoPdfBlob(data: PdfOrcamentoData, options?: { includeDescription?: boolean }): Promise<Blob> {
    const withDesc = options?.includeDescription ?? true;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pw = doc.internal.pageSize.getWidth();
    const m = 15;
    const cw = pw - m * 2;

    let logoImg: HTMLImageElement | null = null;
    try { logoImg = await loadImage("/logo.png"); } catch { /* */ }

    fillGradient(doc, 0, 0, pw, 36, gradFrom, gradTo);
    if (logoImg) doc.addImage(logoImg, "PNG", m, 8, 20, 20);
    const tx = logoImg ? m + 24 : m;
    doc.setTextColor(245, 158, 11); doc.setFontSize(16); doc.setFont("helvetica", "bold");
    doc.text("SOLPPO", tx, 17);
    doc.setTextColor(180, 180, 190); doc.setFontSize(8); doc.setFont("helvetica", "normal");
    doc.text("Sistema de Orçamentos", tx, 23);
    doc.setTextColor(255, 255, 255); doc.setFontSize(12); doc.setFont("helvetica", "bold");
    doc.text(`Orçamento #${data.id.toString().padStart(4, "0")}`, pw - m, 17, { align: "right" });
    doc.setTextColor(200, 200, 210); doc.setFontSize(8); doc.setFont("helvetica", "normal");
    doc.text(statusLabels[data.status] || data.status, pw - m, 23, { align: "right" });

    let y = 44;
    doc.setTextColor(120, 120, 130); doc.setFontSize(7); doc.setFont("helvetica", "bold");
    doc.text("CLIENTE", m, y);
    doc.setTextColor(40, 40, 50); doc.setFontSize(11); doc.setFont("helvetica", "bold");
    doc.text(data.cliente_nome || "Sem cliente", m, y + 6);
    const c2 = m + cw * 0.5;
    doc.setTextColor(120, 120, 130); doc.setFontSize(7); doc.setFont("helvetica", "bold");
    doc.text("EMISSÃO", c2, y); doc.setTextColor(40, 40, 50); doc.setFontSize(9); doc.setFont("helvetica", "normal");
    doc.text(fmtDate(data.data_emissao), c2, y + 6);
    doc.setTextColor(120, 120, 130); doc.setFontSize(7); doc.setFont("helvetica", "bold");
    doc.text("VALIDADE", c2 + 40, y); doc.setTextColor(40, 40, 50); doc.setFontSize(9); doc.setFont("helvetica", "normal");
    doc.text(`${data.validade_dias} dias`, c2 + 40, y + 6);

    y += 14; doc.setDrawColor(220, 220, 225); doc.setLineWidth(0.3); doc.line(m, y, m + cw, y); y += 8;

    const col = { num: m + 2, desc: m + 12, qtd: m + cw * 0.6, preco: m + cw * 0.72, sub: m + cw * 0.87 };
    fillGradient(doc, m, y, cw, 8, gradFrom, gradTo);
    doc.setTextColor(245, 158, 11); doc.setFontSize(7); doc.setFont("helvetica", "bold");
    doc.text("#", col.num, y + 5.5); doc.text(withDesc ? "DESCRIÇÃO" : "ITEM", col.desc, y + 5.5);
    doc.text("QTD", col.qtd, y + 5.5); doc.text("PREÇO UNIT.", col.preco, y + 5.5); doc.text("SUBTOTAL", col.sub, y + 5.5);
    y += 10;

    data.itens.forEach((item, idx) => {
        const maxW = col.qtd - col.desc - 3;
        const descLines = withDesc
            ? doc.splitTextToSize(item.descricao, maxW)
            : [doc.splitTextToSize(item.descricao, maxW)[0]];
        const rowH = Math.max(12, descLines.length * 4.5 + 6);
        if (y + rowH > 260) { doc.addPage(); y = 20; }
        if (idx % 2 === 1) { doc.setFillColor(248, 248, 250); doc.rect(m, y - 5, cw, rowH, "F"); }
        doc.setDrawColor(235, 235, 238); doc.setLineWidth(0.2); doc.line(m, y + rowH - 5, m + cw, y + rowH - 5);
        doc.setTextColor(150, 150, 160); doc.setFontSize(7); doc.setFont("helvetica", "normal");
        doc.text(String(idx + 1), col.num, y + 3.5);
        doc.setTextColor(40, 40, 50); doc.setFontSize(8.5); doc.setFont("helvetica", "normal");
        doc.text(descLines, col.desc, y + 3.5);
        doc.setTextColor(80, 80, 90); doc.setFontSize(8.5); doc.text(item.quantidade.toString(), col.qtd, y + 3.5);
        doc.text(fmt(item.preco_unitario), col.preco, y + 3.5);
        doc.setTextColor(40, 40, 50); doc.setFont("helvetica", "bold"); doc.text(fmt(item.subtotal), col.sub, y + 3.5);
        y += rowH;
    });

    y += 4; fillGradient(doc, m, y, cw, 12, gradFrom, gradTo);
    doc.setTextColor(180, 180, 190); doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.text("TOTAL", m + 6, y + 8);
    doc.setTextColor(245, 158, 11); doc.setFontSize(14); doc.setFont("helvetica", "bold");
    doc.text(fmt(data.valor_total), pw - m - 4, y + 8.5, { align: "right" });

    if (data.observacoes && withDesc) {
        y += 18; if (y > 245) { doc.addPage(); y = 20; }
        doc.setTextColor(120, 120, 130); doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.text("OBSERVAÇÕES", m, y);
        y += 5; doc.setTextColor(60, 60, 70); doc.setFontSize(8); doc.setFont("helvetica", "normal");
        doc.text(doc.splitTextToSize(data.observacoes, cw - 4), m, y);
    }

    const tp = doc.getNumberOfPages();
    for (let p = 1; p <= tp; p++) {
        doc.setPage(p); const ph = doc.internal.pageSize.getHeight();
        doc.setTextColor(180, 180, 190); doc.setFontSize(6.5); doc.setFont("helvetica", "normal");
        doc.text("SOLPPO — Sistema de Orçamentos", m, ph - 8);
        doc.text(`${p}/${tp}`, pw - m, ph - 8, { align: "right" });
    }

    return doc.output("blob");
}

// ══════════════════════════════════════════════════
//   RELATÓRIO GERAL PDF — versão simples + gradiente
// ══════════════════════════════════════════════════

export async function generateRelatorioPdf(data: PdfRelatorioData) {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pw = doc.internal.pageSize.getWidth();
    const m = 15;
    const cw = pw - m * 2;

    let logoImg: HTMLImageElement | null = null;
    try { logoImg = await loadImage("/logo.png"); } catch { /* */ }

    // ─── Header ───
    fillGradient(doc, 0, 0, pw, 36, gradFrom, gradTo);

    if (logoImg) doc.addImage(logoImg, "PNG", m, 8, 20, 20);
    const tx = logoImg ? m + 24 : m;
    doc.setTextColor(245, 158, 11); doc.setFontSize(16); doc.setFont("helvetica", "bold");
    doc.text("SOLPPO", tx, 17);
    doc.setTextColor(180, 180, 190); doc.setFontSize(8); doc.setFont("helvetica", "normal");
    doc.text("Sistema de Orçamentos", tx, 23);

    doc.setTextColor(255, 255, 255); doc.setFontSize(12); doc.setFont("helvetica", "bold");
    doc.text("Relatório Geral", pw - m, 17, { align: "right" });
    const dateStr = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
    doc.setTextColor(200, 200, 210); doc.setFontSize(8); doc.setFont("helvetica", "normal");
    doc.text(dateStr, pw - m, 23, { align: "right" });

    let y = 46;

    // ─── Stats summary ───
    doc.setTextColor(120, 120, 130); doc.setFontSize(7); doc.setFont("helvetica", "bold");
    doc.text("RESUMO", m, y);
    y += 7;

    const statsText = [
        `Clientes: ${data.totalClientes}`,
        `Produtos & Serviços: ${data.totalItens}`,
        `Orçamentos: ${data.totalOrcamentos}`,
        `Aprovados: ${data.totalAprovados}`,
        `Valor Total: ${fmt(data.valorTotal)}`,
        `Valor Aprovado: ${fmt(data.valorAprovado)}`,
    ];

    doc.setTextColor(40, 40, 50);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    statsText.forEach((txt) => {
        doc.text(txt, m, y);
        y += 5;
    });

    y += 4;
    doc.setDrawColor(220, 220, 225);
    doc.setLineWidth(0.3);
    doc.line(m, y, m + cw, y);
    y += 8;

    // ─── Table header ───
    const cols = { num: m + 2, cli: m + 18, data: m + cw * 0.5, val: m + cw * 0.66, st: m + cw * 0.84 };

    fillGradient(doc, m, y, cw, 8, gradFrom, gradTo);
    doc.setTextColor(245, 158, 11); doc.setFontSize(7); doc.setFont("helvetica", "bold");
    doc.text("#", cols.num, y + 5.5);
    doc.text("CLIENTE", cols.cli, y + 5.5);
    doc.text("DATA", cols.data, y + 5.5);
    doc.text("VALOR", cols.val, y + 5.5);
    doc.text("STATUS", cols.st, y + 5.5);
    y += 10;

    // ─── Table rows ───
    data.orcamentos.forEach((orc, idx) => {
        if (y > 255) { doc.addPage(); y = 20; }

        if (idx % 2 === 1) {
            doc.setFillColor(248, 248, 250);
            doc.rect(m, y - 5, cw, 12, "F");
        }

        // Row separator
        doc.setDrawColor(235, 235, 238);
        doc.setLineWidth(0.2);
        doc.line(m, y + 7, m + cw, y + 7);

        doc.setTextColor(150, 150, 160); doc.setFontSize(7); doc.setFont("helvetica", "normal");
        doc.text(`#${orc.id.toString().padStart(4, "0")}`, cols.num, y + 3.5);

        doc.setTextColor(40, 40, 50); doc.setFontSize(8.5); doc.setFont("helvetica", "normal");
        doc.text(doc.splitTextToSize(orc.cliente_nome || "—", cols.data - cols.cli - 3)[0], cols.cli, y + 3.5);

        doc.setTextColor(80, 80, 90); doc.setFontSize(8.5);
        doc.text(fmtDate(orc.data_emissao), cols.data, y + 3.5);

        doc.setTextColor(40, 40, 50); doc.setFont("helvetica", "bold");
        doc.text(fmt(orc.valor_total), cols.val, y + 3.5);

        doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 90);
        doc.text(statusLabels[orc.status] || orc.status, cols.st, y + 3.5);

        y += 12;
    });

    // ─── Total bar ───
    y += 4;
    fillGradient(doc, m, y, cw, 12, gradFrom, gradTo);

    doc.setTextColor(180, 180, 190); doc.setFontSize(8); doc.setFont("helvetica", "normal");
    doc.text(`${data.orcamentos.length} orçamento${data.orcamentos.length !== 1 ? "s" : ""}`, m + 6, y + 8);

    doc.setTextColor(245, 158, 11); doc.setFontSize(14); doc.setFont("helvetica", "bold");
    doc.text(fmt(data.valorTotal), pw - m - 4, y + 8.5, { align: "right" });

    // ─── Footer ───
    const tp = doc.getNumberOfPages();
    for (let p = 1; p <= tp; p++) {
        doc.setPage(p);
        const ph = doc.internal.pageSize.getHeight();
        doc.setTextColor(180, 180, 190); doc.setFontSize(6.5); doc.setFont("helvetica", "normal");
        doc.text("SOLPPO — Sistema de Orçamentos", m, ph - 8);
        doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")}`, pw / 2, ph - 8, { align: "center" });
        doc.text(`${p}/${tp}`, pw - m, ph - 8, { align: "right" });
    }

    doc.save(`relatorio-solppo-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ─── Utilities ───
function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}
