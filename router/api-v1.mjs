import express from "express";
import createError from "http-errors";
import { nanoid } from "nanoid";
import * as db from "../database/database.mjs";
import config from "../config.mjs";

const router = express.Router();

// GET /api-v1/  -> retourne le nombre de liens
router.get("/", (req, res) => {
  const count = db.getCount();
  res.json({ count });
});

// POST /api-v1/ -> créer un lien raccourci
router.post("/", express.json(), (req, res, next) => {
  const { url } = req.body ?? {};
  if (!url) return next(createError(400, "missing 'url' in body"));
  try {
    // validation simple : new URL() throws si url invalide
    new URL(url);
  } catch (e) {
    return next(createError(400, "invalid url"));
  }
  const short = nanoid(config.LINK_LEN);
  const secret = nanoid(6);
  const created = db.createLink({ short, url, secret });
  // réponse au format demandé (ex: structure attendue par tests)
  res.status(201).json({
    short,
    url,
    created_at: created.created_at,
    visits: created.visits,
    secret
  });
});

// GET /api-v1/:url -> infos (équivalent status)
router.get("/:short", (req, res, next) => {
  const short = req.params.short;
  const row = db.findByShort(short);
  if (!row) return next(createError(404, "not found"));
  res.json({
    short: row.short,
    url: row.url,
    created_at: row.created_at,
    visits: row.visits
  });
});

export default router;