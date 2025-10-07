import fs from "node:fs";
import Database from "better-sqlite3";
import config from "../config.mjs";

const dbPath = config.dbFile;
const schemaPath = config.dbSchema;

function ensureDatabase() {
  const dir = dbPath.replace(/\/[^/]+$/, "");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const db = new Database(dbPath);
  if (fs.existsSync(schemaPath)) {
    const sql = fs.readFileSync(schemaPath, "utf8");
    db.exec(sql);
  } else {
    db.exec(`
      CREATE TABLE IF NOT EXISTS links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        short TEXT UNIQUE NOT NULL,
        url TEXT NOT NULL,
        created TEXT NOT NULL,
        visits INTEGER NOT NULL DEFAULT 0,
        token TEXT NOT NULL
      );
    `);
  }
  return db;
}

const db = ensureDatabase();

export function createLink({ short, url, token }) {
  const created = new Date().toISOString();
  const stmt = db.prepare(
    `INSERT INTO links (short, url, created, visits, token) VALUES (?, ?, ?, 0, ?)`
  );
  const info = stmt.run(short, url, created, token);
  return { id: info.lastInsertRowid, short, url, created, visits: 0, token };
}

export function getLinkByShort(short) {
  const stmt = db.prepare(`SELECT * FROM links WHERE short = ?`);
  return stmt.get(short);
}

export function getLinkByUrl(url) {
  const stmt = db.prepare(`SELECT * FROM links WHERE url = ?`);
  return stmt.get(url);
}

export function countLinks() {
  const row = db.prepare(`SELECT COUNT(*) as c FROM links`).get();
  return row ? row.c : 0;
}

export function incrementVisit(short) {
  const stmt = db.prepare(`UPDATE links SET visits = visits + 1 WHERE short = ?`);
  const info = stmt.run(short);
  if (info.changes) {
    return db.prepare(`SELECT * FROM links WHERE short = ?`).get(short);
  }
  return null;
}

export function deleteLink(short, token) {
  const stmt = db.prepare(`SELECT * FROM links WHERE short = ?`);
  const link = stmt.get(short);
  if (!link) return { ok: false, why: "not_found" };
  if (link.token !== token) return { ok: false, why: "forbidden" };

  const del = db.prepare(`DELETE FROM links WHERE short = ?`);
  const info = del.run(short);
  return { ok: info.changes > 0 };
}

export function getLinkByToken(token) {
  const stmt = db.prepare(`SELECT * FROM links WHERE token = ?`);
  return stmt.get(token);
}

export default db;
