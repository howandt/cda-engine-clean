import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const __dirname = process.cwd();

const GITHUB_BASE = "https://raw.githubusercontent.com/howandt/cda-engine-clean/main/data";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 min cache
const cache = new Map();

// ---------- Hjælpefunktioner ----------
async function fetchJson(url) {
  const res = await fetch(url, { headers: { "Cache-Control": "no-cache" } });
  if (!res.ok) throw new Error(`Fetch ${url} failed: ${res.status}`);
  return await res.json();
}

function readLocalJson(localPath) {
  const raw = fs.readFileSync(localPath, "utf8");
  return JSON.parse(raw);
}

async function fetchOrLocalCached(key, githubUrl, localPath) {
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && now - hit.ts < CACHE_TTL_MS) return hit.data;

  try {
    const data = await fetchJson(githubUrl);
    cache.set(key, { data, ts: now });
    return data;
  } catch {
    const data = readLocalJson(localPath);
    cache.set(key, { data, ts: now });
    return data;
  }
}

// ---------- Cases ----------
app.get("/api/cases", async (req, res) => {
  try {
    const localDir = path.join(__dirname, "data", "cases");
    const files = fs.readdirSync(localDir).filter(f => f.endsWith(".json"));
    let all = [];

    for (const file of files) {
      const key = `cases_${file}`;
      const gh = `${GITHUB_BASE}/cases/${file}`;
      const local = path.join(localDir, file);
      const data = await fetchOrLocalCached(key, gh, local);
      if (Array.isArray(data)) all.push(...data);
    }
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: "Kunne ikke hente cases", details: err.message });
  }
});

app.get("/api/cases/:file", async (req, res) => {
  const file = req.params.file;
  const key = `case_${file}`;
  const gh = `${GITHUB_BASE}/cases/${file}`;
  const local = path.join(__dirname, "data", "cases", file);
  try {
    const data = await fetchOrLocalCached(key, gh, local);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Kunne ikke hente case", details: err.message });
  }
});

// ---------- Komorbiditet ----------
app.get("/api/komorbiditet", async (req, res) => {
  const key = "komorbiditet";
  const gh = `${GITHUB_BASE}/CDA_Komorbiditet.json`;
  const local = path.join(__dirname, "data", "CDA_Komorbiditet.json");
  try {
    const data = await fetchOrLocalCached(key, gh, local);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Kunne ikke hente komorbiditet", details: err.message });
  }
});

// ---------- Specialister ----------
app.get("/api/specialister", async (req, res) => {
  const key = "specialister";
  const gh = `${GITHUB_BASE}/CDA_SpecialistPanel.json`;
  const local = path.join(__dirname, "data", "CDA_SpecialistPanel.json");
  try {
    const data = await fetchOrLocalCached(key, gh, local);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Kunne ikke hente specialister", details: err.message });
  }
});

// ---------- Rollespil ----------
app.get("/api/rollespil", async (req, res) => {
  const key = "rollespil";
  const gh = `${GITHUB_BASE}/rollespil_scenarier.json`;
  const local = path.join(__dirname, "data", "rollespil_scenarier.json");
  try {
    const data = await fetchOrLocalCached(key, gh, local);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Kunne ikke hente rollespil", details: err.message });
  }
});

// ---------- Templates ----------
async function getTemplatesIndex() {
  const key = "templates_index";
  const gh = `${GITHUB_BASE}/CDA_Templates/cda_templates_index.json`;
  const local = path.join(__dirname, "data", "CDA_Templates", "cda_templates_index.json");
  return await fetchOrLocalCached(key, gh, local);
}

async function getTemplatesLibrary() {
  const key = "templates_library";
  const gh = `${GITHUB_BASE}/CDA_Templates.json`;
  const local = path.join(__dirname, "data", "CDA_Templates.json");
  return await fetchOrLocalCached(key, gh, local);
}

// Samlet katalog
function buildTemplatesCatalog(indexJson, libraryJson) {
  const libList = Array.isArray(libraryJson)
    ? libraryJson
    : Array.isArray(libraryJson.templates)
      ? libraryJson.templates
      : [];

  const byId = new Map(libList.map(t => [t.id, t]));

  const categories = (indexJson.categories || []).map(cat => {
    const enriched = (cat.templates || []).map(t => {
      const body = byId.get(t.id) || null;
      return { ...t, category: cat.category, body };
    });
    return { category: cat.category, templates: enriched };
  });

  const indexedIds = new Set(categories.flatMap(c => c.templates.map(t => t.id)));
  const orphans = libList.filter(t => !indexedIds.has(t.id));

  return {
    version: indexJson.version || "v1",
    updated: indexJson.updated || null,
    categories,
    orphans,
    missing_templates: indexJson.missing_templates || []
  };
}

// Endpoints
app.get("/api/templates/index", async (req, res) => {
  try {
    const idx = await getTemplatesIndex();
    res.json(idx);
  } catch (err) {
    res.status(500).json({ error: "Kunne ikke hente templates index", details: err.message });
  }
});

app.get("/api/templates/library", async (req, res) => {
  try {
    const lib = await getTemplatesLibrary();
    res.json(lib);
  } catch (err) {
    res.status(500).json({ error: "Kunne ikke hente templates library", details: err.message });
  }
});

app.get("/api/templates", async (req, res) => {
  try {
    const [idx, lib] = await Promise.all([getTemplatesIndex(), getTemplatesLibrary()]);
    const catalog = buildTemplatesCatalog(idx, lib);
    res.json(catalog);
  } catch (err) {
    res.status(500).json({ error: "Kunne ikke bygge samlet templates katalog", details: err.message });
  }
});

app.get("/api/templates/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [idx, lib] = await Promise.all([getTemplatesIndex(), getTemplatesLibrary()]);
    const libList = Array.isArray(lib) ? lib : Array.isArray(lib.templates) ? lib.templates : [];
    const match = libList.find(t => t.id === id);

    if (match) return res.json(match);

    const cat = (idx.categories || []).find(c => (c.templates || []).some(t => t.id === id));
    if (cat) {
      const meta = cat.templates.find(t => t.id === id);
      return res.json({ ...meta, category: cat.category, body: null });
    }

    return res.status(404).json({ error: "Template ikke fundet", id });
  } catch (err) {
    res.status(500).json({ error: "Fejl ved hentning af template", details: err.message });
  }
});

// ---------- Start ----------
app.listen(PORT, () => {
  console.log(`✅ CDA-systemet kører på http://localhost:${PORT}`);
});
