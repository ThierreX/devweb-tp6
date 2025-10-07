import express from "express";
import createError from "http-errors";
import { nanoid } from "nanoid";
import * as db from "../database/database.mjs";
import config from "../config.mjs";

const router = express.Router();

// helper: render JSON or HTML using res.format()
function handleCreateResult(res, acceptHTMLView, result) {
  res.format({
    "application/json": () => {
      res.status(201).json(result);
    },
    "text/html": () => {
      // render an EJS template showing the created link
      res.status(201).render("created", { result });
    },
    default: () => {
      res.status(406).send("Not Acceptable");
    }
  });
}

// GET /api-v2/ : JSON => count ; HTML => homepage form
router.get("/", (req, res) => {
  res.format({
    "application/json": () => {
      const count = db.getCount();
      res.json({ count });
    },
    "text/html": () => {
      res.render("root");
    },
    default: () => {
      res.status(406).send("Not Acceptable");
    }
  });
});

// POST /api-v2/ : create short url (like v1) but supports HTML
router.post("/", express.urlencoded({ extended: true }), express.json(), (req, res, next) => {
  // accept both JSON body and form-encoded
  const url = req.body.url;
  if (!url) return next(createError(400, "missing url"));
  try {
    new URL(url);
  } catch (e) {
    return next(createError(400, "invalid url"));
  }

  const short = nanoid(config.LINK_LEN);
  const secret = nanoid(6);
  const created = db.createLink({ short, url, secret });

  const result = {
    short,
    url,
    created_at: created.created_at,
    visits: created.visits,
    secret
  };
  handleCreateResult(res, true, result);
});

// GET /api-v2/:short -> si Accept json alors retourne meta, si Accept html -> increment visits et redirect
router.get("/:short", (req, res, next) => {
  const short = req.params.short;
  const row = db.findByShort(short);
  if (!row) return next(createError(404, "not found"));

  res.format({
    "application/json": () => {
      res.json({
        short: row.short,
        url: row.url,
        created_at: row.created_at,
        visits: row.visits
      });
    },
    "text/html": () => {
      // increment then redirect
      db.incrementVisits(short);
      res.redirect(302, row.url);
    },
    default: () => {
      res.status(406).send("Not Acceptable");
    }
  });
});

// DELETE /api-v2/:short -> requires X-API-KEY header matching secret
router.delete("/:short", (req, res, next) => {
  const short = req.params.short;
  const key = req.header("X-API-KEY");
  const result = db.deleteIfSecretMatches(short, key);
  if (!result.ok) {
    // map code to proper errors
    if (result.code === 404) return next(createError(404, "not found"));
    if (result.code === 401) return next(createError(401, "missing api key"));
    if (result.code === 403) return next(createError(403, "forbidden"));
  }
  res.status(200).json({ ok: true });
});

export default router;