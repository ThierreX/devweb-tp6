import express from "express";
import morgan from "morgan";
import logger from "loglevel";
import path from "node:path";
import fs from "node:fs";
import YAML from "yamljs";
import swaggerUi from "swagger-ui-express";
import config from "./config.mjs";
import apiV1 from "./router/api-v1.mjs";
import apiV2 from "./router/api-v2.mjs";

logger.setLevel(config.isDev ? logger.levels.DEBUG : logger.levels.WARN);

const app = express();
const host = "localhost";
const port = config.PORT;

// disable X-Powered-By header
app.disable("x-powered-by");

// middleware to add X-API-version header
app.use((req, res, next) => {
  res.setHeader("X-API-version", "1.0.0");
  next();
});

if (config.isDev) app.use(morgan("dev"));

// view engine
app.set("view engine", "ejs");
app.set("views", path.resolve("views"));

// static middleware (serve static files from static/)
app.use(express.static(path.resolve("static")));

// swagger / open api
if (fs.existsSync("static/open-api.yaml")) {
  const swaggerSpec = YAML.load("static/open-api.yaml");
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// mount routers
app.use("/api-v1", apiV1);
app.use("/api-v2", apiV2);

// legacy: route root to API v2 homepage
app.get("/", (req, res) => res.redirect("/api-v2/"));

// default 404 handler -> convert to http-error
import createError from "http-errors";
app.use((req, res, next) => next(createError(404)));

// error handler that renders error.ejs
app.use((err, req, res, next) => {
  logger.debug("error middleware", err && err.stack);
  const status = err.status ?? 500;
  const stack = config.isDev ? err.stack : "";
  const payload = { code: status, message: err.message ?? "Internal Error", stack };
  // if client accepts html, render template
  res.status(status);
  res.format({
    "application/json": () => res.json({ code: payload.code, message: payload.message }),
    "text/html": () => res.render("error", payload),
    default: () => res.send(payload.message)
  });
});

const PORT = process.env.PORT || port || 3000;
const HOST = '0.0.0.0';

const server = app.listen(PORT, HOST, () => 
  logger.info(`HTTP listening on http://${HOST}:${PORT} (${config.env})`)
);