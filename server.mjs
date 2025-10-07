import express from "express";
import morgan from "morgan";
import path from "node:path";
import helmet from "helmet";
import cors from "cors";
import config from "./config.mjs";
import apiV1Router from "./router/api-v1.mjs";
import apiV2Router from "./router/api-v2.mjs";
import fs from "node:fs";

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (app.get("env") === "development") app.use(morgan("dev"));

app.use(express.static("static"));

app.use("/api-v1", apiV1Router);
app.use("/api-v2", apiV2Router);

app.get("/", (req, res) => {
  res.render("root", { created: null, error: null, message: null });
});

import { getLinkByShort, incrementVisit } from "./database/database.mjs";

app.get("/:short", (req, res, next) => {
  const short = req.params.short;
  const link = getLinkByShort(short);
  if (!link) return res.status(404).send("Not Found");

  res.format({
    "application/json": () => {
      res.json({
        short: link.short,
        url: link.url,
        created: link.created,
        visits: link.visits
      });
    },
    "text/html": () => {
      incrementVisit(short);
      return res.redirect(link.url);
    },
    default: () => {
      res.status(406).send("Not Acceptable");
    }
  });
});


app.get("/error", () => {
  throw new Error("Internal test error");
});


app.use((err, req, res, next) => {
  console.error(err && err.stack ? err.stack : err);
  res.status(500).json({ error: "internal_server_error", message: String(err) });
});

//script de nettoyage
import db from "./database/database.mjs";

const info = db.prepare(`
  DELETE FROM links
  WHERE short IS NULL OR short = '' OR url IS NULL OR url = '';
`).run();

if (info.changes > 0) {
  console.log(` Nettoyage : ${info.changes} entrées invalides supprimées.`);
}
//

const PORT = process.env.PORT ? Number(process.env.PORT) : (config.port || 3000);
const BASE_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;


app.listen(PORT, "0.0.0.0", () => {
  console.info(`Server running on ${BASE_URL} (port ${PORT})`);
});