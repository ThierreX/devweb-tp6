import express from "express";
import { nanoid } from "nanoid";
import config from "../config.mjs";
import {
  createLink,
  getLinkByShort,
  getLinkByUrl,
  countLinks,
  incrementVisit
} from "../database/database.mjs";

const router = express.Router();


router.get("/", (req, res) => {
  const c = countLinks();
  res.json({ count: c });
});


router.post("/", (req, res) => {
  const { url } = req.body;
  try {
    const parsed = new URL(url);
    const exist = getLinkByUrl(parsed.href);
    if (exist) {
      return res.status(200).json({
        short: exist.short,
        url: exist.url,
        created: exist.created,
        visits: exist.visits,
        baseUrl: config.baseUrl
      });
    }

    const short = nanoid(config.linkLen);
    const token = nanoid(24); 
    const link = createLink({ short, url: parsed.href, token });
    return res.status(201).json({
      short: link.short,
      url: link.url,
      created: link.created,
      visits: link.visits,
      token,
      baseUrl: config.baseUrl
    });
  } catch (e) {
    return res.status(400).json({ error: "invalid_url", message: e.message });
  }
});


router.get("/status/:short", (req, res) => {
  const short = req.params.short;
  const link = getLinkByShort(short);
  if (!link) return res.status(404).json({ error: "not_found" });
  res.json({
    short: link.short,
    url: link.url,
    created: link.created,
    visits: link.visits
  });
});

router.get("/:short", (req, res) => {
  const short = req.params.short;
  const link = getLinkByShort(short);
  if (!link) return res.status(404).json({ error: "not_found" });
  incrementVisit(short);
  res.redirect(link.url);
});

export default router;
