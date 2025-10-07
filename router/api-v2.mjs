import express from "express";
import { nanoid } from "nanoid";
import config from "../config.mjs";
import {
  createLink,
  getLinkByShort,
  getLinkByUrl,
  incrementVisit,
  getLinkByToken, 
  deleteLink,
} from "../database/database.mjs";


const router = express.Router();


function createOrReturn(url) {
  const exist = getLinkByUrl(url);
  if (exist) {
    return {
      short: exist.short,
      url: exist.url,
      created: exist.created,
      visits: exist.visits,
      token: exist.token,
      baseUrl: config.baseUrl
    };
  }
  const short = nanoid(config.linkLen);
  const token = nanoid(24);
  const created = createLink({ short, url, token });
  return {
    short: created.short,
    url: created.url,
    created: created.created,
    visits: created.visits,
    token,
    baseUrl: config.baseUrl
  };
}


router.get("/", (req, res) => {
  res.format({
    "application/json": () => {
      const { countLinks } = require("../database/database.mjs");
      const c = countLinks();
      res.json({ count: c });
    },
    "text/html": () => {
      res.render("root", { created: null, error: null });
    },
    default: () => {
      res.status(406).send("Not Acceptable");
    }
  });
});


router.post("/", async (req, res) => {
  let url = req.body.url || (req.headers["content-type"] === "application/json" ? req.body.url : undefined);

  try {
    const parsed = new URL(url);

    const out = createOrReturn(parsed.href);

    res.format({
      "application/json": () => {
        res.status(201).json({
          short: out.short,
          url: out.url,
          created: out.created,
          visits: out.visits,
          token: out.token,
          shortUrl: `${config.baseUrl}/${out.short}`
        });
      },
      "text/html": () => {
        res.render("root", {
          created: {
            short: out.short,
            url: out.url,
            shortUrl: `${config.baseUrl}/${out.short}`,
            token: out.token
          },
          error: null,
          message: null  
        });
      },
      default: () => {
        res.status(406).send("Not Acceptable");
      }
    });
  } catch (e) {
    res.format({
      "application/json": () => res.status(400).json({ error: "invalid_url", message: e.message }),
      "text/html": () => res.render("root", { created: null, error: e.message, message: null }),
      default: () => res.status(406).send("Not Acceptable")
    });
  }
});


router.get("/:short", (req, res) => {
  const short = req.params.short;
  const link = getLinkByShort(short);
  if (!link) {
    return res.format({
      "application/json": () => res.status(404).json({ error: "not_found" }),
      "text/html": () => res.status(404).send("Not Found"),
      default: () => res.status(406).send("Not Acceptable")
    });
  }

  res.format({
    "application/json": () =>
      res.json({
        short: link.short,
        url: link.url,
        created: link.created,
        visits: link.visits
      }),
    "text/html": () => {
      incrementVisit(short);
      res.redirect(link.url);
    },
    default: () => res.status(406).send("Not Acceptable")
  });
});


router.delete("/:short", (req, res) => {
  const short = req.params.short;
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "missing_token" });

  const result = deleteLink(short, token);
  if (!result.ok) {
    if (result.why === "not_found") return res.status(404).json({ error: "not_found" });
    if (result.why === "forbidden") return res.status(403).json({ error: "forbidden" });
  }
  return res.json({ ok: true });
});


router.post("/:short/delete", (req, res) => {
  const short = req.params.short;
  const token = req.body.token?.trim();

  if (!token) {
    return res.format({
      "application/json": () => res.status(400).json({ error: "missing_token" }),
      "text/html": () =>
        res.render("root", {
          created: null,
          error: "Token manquant. Vous devez fournir un token pour supprimer le lien.",
          message: null
        })
    });
  }

  const result = deleteLink(short, token);

  if (!result.ok) {
    if (result.why === "not_found") {
      return res.format({
        "application/json": () => res.status(404).json({ error: "not_found" }),
        "text/html": () =>
          res.render("root", {
            created: null,
            error: `Le lien ${short} n'existe pas.`,
            message: null
          })
      });
    }
    if (result.why === "forbidden") {
      return res.format({
        "application/json": () => res.status(403).json({ error: "invalid_token" }),
        "text/html": () =>
          res.render("root", {
            created: null,
            error: "Token invalide. Vous ne pouvez pas supprimer ce lien.",
            message: null
          })
      });
    }
  }
  return res.format({
    "application/json": () =>
      res.json({ ok: true, message: `Le lien ${short} a été supprimé avec succès.` }),
    "text/html": () =>
      res.render("root", {
        created: null,
        error: null,
        message: `Le lien ${short} a été supprimé avec succès.`
      })
  });
});


router.post("/delete-by-token", (req, res) => {
  const token = req.body.token?.trim();
  console.log("Suppression demandée avec token :", token);
  const link = getLinkByToken(token);
  if (!token) {
    return res.render("root", {
      created: null,
      error: "Token manquant. Veuillez entrer votre token.",
      message: null
    });
  }

  if (!link) {
    return res.render("root", {
      created: null,
      error: "Aucun lien trouvé pour ce token.",
      message: null
    });
  }

  const result = deleteLink(link.short, token);
  if (!result.ok) {
    return res.render("root", {
      created: null,
      error: "Token invalide. Suppression refusée.",
      message: null
    });
  }

  return res.render("root", {
    created: null,
    error: null,
    message: `Le lien <strong>${link.short}</strong> (URL : <a href="${link.url}" target="_blank">${link.url}</a>) a été supprimé avec succès !`
  });
});


export default router;
