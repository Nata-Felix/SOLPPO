"use server";

import { getDb } from "./index";

// ============================================================
// CLIENTES
// ============================================================
export type Cliente = {
    id: number;
    nome: string;
    email: string;
    telefone: string;
    whatsapp: string;
    documento: string;
    endereco: string;
    created_at: string;
};

export async function getClientes(): Promise<Cliente[]> {
    const db = getDb();
    return db.prepare("SELECT * FROM clientes ORDER BY nome").all() as Cliente[];
}

export async function getCliente(id: number): Promise<Cliente | undefined> {
    const db = getDb();
    return db.prepare("SELECT * FROM clientes WHERE id = ?").get(id) as
        | Cliente
        | undefined;
}

export async function createCliente(
    data: Omit<Cliente, "id" | "created_at">
): Promise<{ id: number }> {
    const db = getDb();
    const stmt = db.prepare(
        "INSERT INTO clientes (nome, email, telefone, whatsapp, documento, endereco) VALUES (?, ?, ?, ?, ?, ?)"
    );
    const result = stmt.run(
        data.nome,
        data.email,
        data.telefone,
        data.whatsapp,
        data.documento,
        data.endereco
    );
    return { id: Number(result.lastInsertRowid) };
}

export async function updateCliente(
    id: number,
    data: Omit<Cliente, "id" | "created_at">
): Promise<void> {
    const db = getDb();
    db.prepare(
        "UPDATE clientes SET nome = ?, email = ?, telefone = ?, whatsapp = ?, documento = ?, endereco = ? WHERE id = ?"
    ).run(data.nome, data.email, data.telefone, data.whatsapp, data.documento, data.endereco, id);
}

export async function deleteCliente(id: number): Promise<void> {
    const db = getDb();
    db.prepare("DELETE FROM clientes WHERE id = ?").run(id);
}

// ============================================================
// ITENS (Produtos e Serviços)
// ============================================================
export type Item = {
    id: number;
    tipo: "produto" | "servico";
    nome: string;
    descricao: string;
    preco_base: number;
    created_at: string;
};

export async function getItens(): Promise<Item[]> {
    const db = getDb();
    return db
        .prepare("SELECT * FROM itens ORDER BY tipo, nome")
        .all() as Item[];
}

export async function getItem(id: number): Promise<Item | undefined> {
    const db = getDb();
    return db.prepare("SELECT * FROM itens WHERE id = ?").get(id) as
        | Item
        | undefined;
}

export async function createItem(
    data: Omit<Item, "id" | "created_at">
): Promise<{ id: number }> {
    const db = getDb();
    const stmt = db.prepare(
        "INSERT INTO itens (tipo, nome, descricao, preco_base) VALUES (?, ?, ?, ?)"
    );
    const result = stmt.run(data.tipo, data.nome, data.descricao, data.preco_base);
    return { id: Number(result.lastInsertRowid) };
}

export async function updateItem(
    id: number,
    data: Omit<Item, "id" | "created_at">
): Promise<void> {
    const db = getDb();
    db.prepare(
        "UPDATE itens SET tipo = ?, nome = ?, descricao = ?, preco_base = ? WHERE id = ?"
    ).run(data.tipo, data.nome, data.descricao, data.preco_base, id);
}

export async function deleteItem(id: number): Promise<void> {
    const db = getDb();
    db.prepare("DELETE FROM itens WHERE id = ?").run(id);
}

// ============================================================
// ORÇAMENTOS
// ============================================================
export type Orcamento = {
    id: number;
    cliente_id: number | null;
    status: "rascunho" | "enviado" | "aprovado" | "rejeitado";
    data_emissao: string;
    validade_dias: number;
    valor_total: number;
    observacoes: string;
    created_at: string;
    // joined
    cliente_nome?: string;
};

export type OrcamentoItem = {
    id: number;
    orcamento_id: number;
    item_id: number | null;
    descricao: string;
    quantidade: number;
    preco_unitario: number;
    desconto: number;
    subtotal: number;
    // joined from itens table
    item_descricao_detalhe?: string;
};

export async function getOrcamentos(): Promise<Orcamento[]> {
    const db = getDb();
    return db
        .prepare(
            `SELECT o.*, c.nome as cliente_nome
       FROM orcamentos o
       LEFT JOIN clientes c ON o.cliente_id = c.id
       ORDER BY o.created_at DESC`
        )
        .all() as Orcamento[];
}

export async function getOrcamento(
    id: number
): Promise<(Orcamento & { itens: OrcamentoItem[] }) | undefined> {
    const db = getDb();
    const orcamento = db
        .prepare(
            `SELECT o.*, c.nome as cliente_nome, c.whatsapp as cliente_whatsapp
       FROM orcamentos o
       LEFT JOIN clientes c ON o.cliente_id = c.id
       WHERE o.id = ?`
        )
        .get(id) as (Orcamento & { cliente_whatsapp?: string }) | undefined;
    if (!orcamento) return undefined;

    const itens = db
        .prepare(
            `SELECT oi.*, i.descricao as item_descricao_detalhe
             FROM orcamento_itens oi
             LEFT JOIN itens i ON oi.item_id = i.id
             WHERE oi.orcamento_id = ?`
        )
        .all(id) as OrcamentoItem[];

    return { ...orcamento, itens };
}

export async function createOrcamento(data: {
    cliente_id: number | null;
    validade_dias: number;
    observacoes: string;
    itens: { item_id: number | null; descricao: string; quantidade: number; preco_unitario: number; desconto?: number }[];
}): Promise<{ id: number }> {
    const db = getDb();

    const valorTotal = data.itens.reduce(
        (sum, item) => {
            const desc = item.desconto || 0;
            return sum + item.quantidade * item.preco_unitario * (1 - desc / 100);
        },
        0
    );

    const insertOrcamento = db.prepare(
        `INSERT INTO orcamentos (cliente_id, validade_dias, observacoes, valor_total) VALUES (?, ?, ?, ?)`
    );

    const insertItem = db.prepare(
        `INSERT INTO orcamento_itens (orcamento_id, item_id, descricao, quantidade, preco_unitario, desconto, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?)`
    );

    const transaction = db.transaction(() => {
        const result = insertOrcamento.run(
            data.cliente_id,
            data.validade_dias,
            data.observacoes,
            valorTotal
        );
        const orcamentoId = Number(result.lastInsertRowid);

        for (const item of data.itens) {
            const desc = item.desconto || 0;
            const subtotal = item.quantidade * item.preco_unitario * (1 - desc / 100);
            insertItem.run(
                orcamentoId,
                item.item_id,
                item.descricao,
                item.quantidade,
                item.preco_unitario,
                desc,
                subtotal
            );
        }

        return orcamentoId;
    });

    const id = transaction();
    return { id };
}

export async function updateOrcamentoStatus(
    id: number,
    status: Orcamento["status"]
): Promise<void> {
    const db = getDb();
    db.prepare("UPDATE orcamentos SET status = ? WHERE id = ?").run(status, id);
}

export async function updateOrcamento(
    id: number,
    data: {
        cliente_id: number | null;
        validade_dias: number;
        observacoes: string;
        itens: { item_id: number | null; descricao: string; quantidade: number; preco_unitario: number; desconto?: number }[];
    }
): Promise<void> {
    const db = getDb();

    const valorTotal = data.itens.reduce(
        (sum, item) => {
            const desc = item.desconto || 0;
            return sum + item.quantidade * item.preco_unitario * (1 - desc / 100);
        },
        0
    );

    const updateStmt = db.prepare(
        `UPDATE orcamentos SET cliente_id = ?, validade_dias = ?, observacoes = ?, valor_total = ? WHERE id = ?`
    );

    const deleteItems = db.prepare(
        `DELETE FROM orcamento_itens WHERE orcamento_id = ?`
    );

    const insertItem = db.prepare(
        `INSERT INTO orcamento_itens (orcamento_id, item_id, descricao, quantidade, preco_unitario, desconto, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?)`
    );

    const transaction = db.transaction(() => {
        updateStmt.run(
            data.cliente_id,
            data.validade_dias,
            data.observacoes,
            valorTotal,
            id
        );

        deleteItems.run(id);

        for (const item of data.itens) {
            const desc = item.desconto || 0;
            const subtotal = item.quantidade * item.preco_unitario * (1 - desc / 100);
            insertItem.run(
                id,
                item.item_id,
                item.descricao,
                item.quantidade,
                item.preco_unitario,
                desc,
                subtotal
            );
        }
    });

    transaction();
}

export async function deleteOrcamento(id: number): Promise<void> {
    const db = getDb();
    db.prepare("DELETE FROM orcamentos WHERE id = ?").run(id);
}

// ============================================================
// DASHBOARD STATS
// ============================================================
export type DashboardStats = {
    totalClientes: number;
    totalItens: number;
    totalOrcamentos: number;
    totalAprovados: number;
    valorTotal: number;
    valorAprovado: number;
    recentOrcamentos: Orcamento[];
};

export async function getDashboardStats(): Promise<DashboardStats> {
    const db = getDb();

    const totalClientes = (
        db.prepare("SELECT COUNT(*) as count FROM clientes").get() as { count: number }
    ).count;
    const totalItens = (
        db.prepare("SELECT COUNT(*) as count FROM itens").get() as { count: number }
    ).count;
    const totalOrcamentos = (
        db.prepare("SELECT COUNT(*) as count FROM orcamentos").get() as {
            count: number;
        }
    ).count;
    const totalAprovados = (
        db
            .prepare(
                "SELECT COUNT(*) as count FROM orcamentos WHERE status = 'aprovado'"
            )
            .get() as { count: number }
    ).count;
    const valorTotal = (
        db
            .prepare("SELECT COALESCE(SUM(valor_total), 0) as total FROM orcamentos")
            .get() as { total: number }
    ).total;
    const valorAprovado = (
        db
            .prepare(
                "SELECT COALESCE(SUM(valor_total), 0) as total FROM orcamentos WHERE status = 'aprovado'"
            )
            .get() as { total: number }
    ).total;

    const recentOrcamentos = db
        .prepare(
            `SELECT o.*, c.nome as cliente_nome
       FROM orcamentos o
       LEFT JOIN clientes c ON o.cliente_id = c.id
       ORDER BY o.created_at DESC
       LIMIT 5`
        )
        .all() as Orcamento[];

    return {
        totalClientes,
        totalItens,
        totalOrcamentos,
        totalAprovados,
        valorTotal,
        valorAprovado,
        recentOrcamentos,
    };
}
