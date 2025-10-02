import fs from "node:fs";
import path from "node:path";

const env = process.env.NODE_ENV ?? "development";
const PORT = Number(process.env.PORT ?? 8080);
const LINK_LEN = Number(process.env.LINK_LEN ?? 6);
const DB_FILE = process.env.DB_FILE ?? "database/database.sqlite";
const DB_SCHEMA = process.env.DB_SCHEMA ?? "database/database.sql";

export default {
  env,
  PORT,
  LINK_LEN,
  DB_FILE,
  DB_SCHEMA,
  isDev: env === "development",
  root: (p = "") => path.resolve(p)
};