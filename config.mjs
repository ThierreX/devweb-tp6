import dotenv from "dotenv";
dotenv.config();

export default {
  port: process.env.PORT ? Number(process.env.PORT) : 8080,
  linkLen: process.env.LINK_LEN ? Number(process.env.LINK_LEN) : 6,
  dbFile: process.env.DB_FILE || "database/database.sqlite",
  dbSchema: process.env.DB_SCHEMA || "database/database.sql",
  baseUrl: process.env.BASE_URL 
        || process.env.RENDER_EXTERNAL_URL 
        || `http://localhost:${process.env.PORT || 8080}`
};