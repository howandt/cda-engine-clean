// 🔹 CDA PBL Projects API
// Henter projekter fra CDA_PBL_Projects.json og understøtter fleksibel søgning

import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  try {
    // CORS tilladelser
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    // Kun GET tilladt
    if (req.method !== "GET") {
      return res.status(405).json({
        success: false,
        error: "Method not allowed",
        allowed: ["GET"],
      });
    }

    // 🔹 Hent query-parametre
    const { id, search, title } = req.query;

    // 🔹 Indlæs PBL datafil
const dataPath = path.join(
  process.cwd(),
  "public",
  "CDA",
  "data",
  "CDA_PBL_Projects.json"
);

    if (!fs.existsSync(dataPath)) {
      return res.status(404).json({
        success: false,
        error: `PBL Projects fil ikke fundet: ${dataPath}`,
      });
    }

    const raw = fs.readFileSync(dataPath, "utf8");
    const json = JSON.parse(raw);
    const projects = json.projects || [];

    // 🔹 Fleksibel søgning i projekter
    let filtered = projects;

    // Find via ID
    if (id) {
      filtered = filtered.filter(
        (p) => p.id.toLowerCase() === id.toLowerCase()
      );
    }

    // Fritekstsøgning
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.subtitle?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    // Titel-søgning
    if (title) {
      const q = title.toLowerCase();
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(q)
      );
    }

    // Hvis ingen projekter findes
    if (filtered.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Ingen PBL-projekter fundet til denne søgning.",
        total: 0,
        results: [],
      });
    }

    // 🔹 Returnér resultat
    // Hent limit fra query — default = 3
const limit = parseInt(req.query.limit || "3", 10);

// Returnér maks. 'limit'
return res.status(200).json({
  success: true,
  total: filtered.length,
  results: filtered.slice(0, limit)
});
  } catch (error) {
    console.error("❌ FEJL i /api/pbl-projects:", error);
    return res.status(500).json({
      success: false,
      error: "Intern serverfejl",
      message: error.message,
    });
  }
}
