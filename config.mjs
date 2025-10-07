import dotenv from "dotenv";
dotenv.config();

export default {
  port: process.env.PORT || 3000,
  baseUrl: process.env.RENDER_EXTERNAL_URL || `http://localhost:3000`,
  dbFile: "./data/links.db",
  dbSchema: "./database/schema.sql",
  linkLen: 6
};