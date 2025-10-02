import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import config from "../config.mjs";

const DB_FILE = config.DB_FILE;
const DB_SCHEMA = config.DB_SCHEMA;

function ensureDatabase() {
  const dbDir = path.dirname(DB_FILE);
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

  const db = new Database(DB_FILE);
  // create schema if schema file exists
  if (fs.existsSync(DB_SCHEMA)) {
    const sql = fs.readFileSync(DB_SCHEMA, "utf8");
    db.exec(sql);
  }
  return db;
}

const db = ensureDatabase();

export function getCount() {
  const row = db.prepare("SELECT COUNT(*) as c FROM links").get();
  return row?.c ?? 0;
}

export function createLink({ short, url, secret }) {
  const now = new Date().toISOString();
  const stmt = db.prepare(
    `INSERT INTO links (short, url, created_at, visits, secret) VALUES (?, ?, ?, 0, ?)`
  );
  const info = stmt.run(short, url, now, secret ?? null);
  return { id: info.lastInsertRowid, short, url, created_at: now, visits: 0, secret };
}

export function findByShort(short) {
  return db.prepare("SELECT * FROM links WHERE short = ?").get(short);
}

export function incrementVisits(short) {
  const stmt = db.prepare("UPDATE links SET visits = visits + 1 WHERE short = ?");
  const info = stmt.run(short);
  return info.changes > 0;
}

export function deleteIfSecretMatches(short, secret) {
  const row = findByShort(short);
  if (!row) return { ok: false, code: 404 };
  if (!secret) return { ok: false, code: 401 };
  if (row.secret !== secret) return { ok: false, code: 403 };
  const info = db.prepare("DELETE FROM links WHERE short = ?").run(short);
  return { ok: info.changes > 0, code: 200 };
}