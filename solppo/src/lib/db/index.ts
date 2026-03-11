import Database from "better-sqlite3";
import path from "path";

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    const dbPath = process.env.DB_PATH || path.join(process.cwd(), "solppo.db");
    console.log("[DB] Opening database at:", dbPath);
    _db = new Database(dbPath);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    initSchema(_db);
  }
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT DEFAULT '',
      telefone TEXT DEFAULT '',
      whatsapp TEXT DEFAULT '',
      documento TEXT DEFAULT '',
      endereco TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS itens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo TEXT NOT NULL CHECK(tipo IN ('produto', 'servico')),
      nome TEXT NOT NULL,
      descricao TEXT DEFAULT '',
      preco_base REAL NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orcamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER,
      status TEXT NOT NULL DEFAULT 'rascunho' CHECK(status IN ('rascunho', 'enviado', 'aprovado', 'rejeitado')),
      data_emissao DATE DEFAULT (date('now')),
      validade_dias INTEGER DEFAULT 30,
      valor_total REAL DEFAULT 0,
      observacoes TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS orcamento_itens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orcamento_id INTEGER NOT NULL,
      item_id INTEGER,
      descricao TEXT NOT NULL,
      quantidade REAL NOT NULL DEFAULT 1,
      preco_unitario REAL NOT NULL DEFAULT 0,
      subtotal REAL NOT NULL DEFAULT 0,
      FOREIGN KEY (orcamento_id) REFERENCES orcamentos(id) ON DELETE CASCADE,
      FOREIGN KEY (item_id) REFERENCES itens(id) ON DELETE SET NULL
    );
  `);

  // Migration: add whatsapp column if it doesn't exist
  try {
    db.exec(`ALTER TABLE clientes ADD COLUMN whatsapp TEXT DEFAULT ''`);
  } catch {
    // Column already exists
  }

  // Migration: add desconto column to orcamento_itens
  try {
    db.exec(`ALTER TABLE orcamento_itens ADD COLUMN desconto REAL NOT NULL DEFAULT 0`);
  } catch {
    // Column already exists
  }
}
