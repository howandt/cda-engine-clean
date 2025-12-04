// Diagnoser API - Alle 15 diagnoser med fuld dokumentation
// Hans' 9000+ timers arbejde samlet i ét API

import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  // ---- CORS ----
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed",
      allowed_methods: ["GET"],
    });
  }

  try {
    // ---- Hent query-parametre ----
    const { id, kategori, search, komorbiditet } = req.query;

    // ---- Indlæs diagnosefil ----
    const filePath = path.join(process.cwd(), "public", "CDA", "data", "CDA_Diagnoser.json");
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: `Diagnosefil ikke fundet: ${filePath}`,
      });
    }

    const raw = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(raw);

    if (!data?.diagnoser || !Array.isArray(data.diagnoser)) {
      throw new Error("Ugyldigt format i CDA_Diagnoser.json – mangler feltet 'diagnoser'");
    }

    // ---- Hvis specifikt ID ----
    if (id) {
      const diagnose = data.diagnoser.find(
        (d) => d.id?.toLowerCase() === id.toLowerCase()
      );

      if (!diagnose) {
        return res.status(404).json({
          error: "Diagnose ikke fundet",
          requested_id: id,
          available_ids: data.diagnoser.map((d) => d.id),
        });
      }

      return res.status(200).json({
        version: data.version || null,
        diagnose,
      });
    }

    // ---- Ellers filtrér ----
    let filtered = [...data.diagnoser];

    // Kategori
    if (kategori) {
      filtered = filtered.filter((d) =>
        d.kategori?.toLowerCase().includes(kategori.toLowerCase())
      );
    }

    // Komorbiditet
    if (komorbiditet) {
      const komLower = komorbiditet.toLowerCase();
      filtered = filtered.filter((d) =>
        d.komorbiditet_links?.some((link) =>
          typeof link === "string" && link.toLowerCase().includes(komLower)
        )
      );
    }

    // Søgeord
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((d) => {
        if (
          d.navn?.toLowerCase().includes(searchLower) ||
          d.fuld_navn?.toLowerCase().includes(searchLower)
        ) {
          return true;
        }
        if (Array.isArray(d.hovedsymptomer) &&
            d.hovedsymptomer.some((s) => s.toLowerCase().includes(searchLower))) {
          return true;
        }
        if (Array.isArray(d.noegleord) &&
            d.noegleord.some((n) => n.toLowerCase().includes(searchLower))) {
          return true;
        }
        if (d.indhold_markdown?.toLowerCase().includes(searchLower)) {
          return true;
        }
        return false;
      });
    }

    // ---- Send svar ----
    return res.status(200).json({
      version: data.version || null,
      description: data.description || null,
      total_diagnoser: data.diagnoser.length,
      filtered_count: filtered.length,
      filters_applied: { id, kategori, search, komorbiditet },
      diagnoser: filtered,
    });
  } catch (error) {
    console.error("API Error (diagnoser):", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}
