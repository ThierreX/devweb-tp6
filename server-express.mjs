import express from "express";
import morgan from "morgan";
import createError from "http-errors";
import logger from "loglevel";

const host = "localhost";
const port = 8000;

logger.setLevel(logger.levels.DEBUG);

const app = express();

// View engine
app.set("view engine", "ejs");

// Middlewares
app.use(express.static("static"));
if (app.get("env") === "development") app.use(morgan("dev"));

// Routes
app.get(["/", "/index.html"], (req, res) => {
  res.sendFile("index.html", { root: "./static" });
});

app.get("/random/:nb", (req, res, next) => {
  const length = parseInt(req.params.nb, 10);
  if (isNaN(length)) return next(createError(400, "nb must be a number"));

  const numbers = Array.from({ length }).map(() =>
    Math.floor(Math.random() * 100)
  );
  const welcome = "Random numbers";
  res.render("random", { numbers, welcome });
});

// Default 404
app.use((req, res, next) => {
  logger.debug(`default route handler : ${req.url}`);
  next(createError(404));
});

// Error handler
app.use((error, _req, res, _next) => {
  logger.debug(`default error handler: ${error}`);
  const status = error.status ?? 500;
  const stack = app.get("env") === "development" ? error.stack : "";
  res.status(status).render("error", {
    code: status,
    message: error.message,
    stack,
  });
});

// Server
const server = app.listen(port, host);
server.on("listening", () => {
  console.info(
    `HTTP listening on http://${server.address().address}:${server.address().port} with mode '${process.env.NODE_ENV}'`
  );
});