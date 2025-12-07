import fs from "fs";
import path from "path";
import { semanticSearch } from "../scripts/semantic_matcher.js";

export default async function handler(req, res) {
  try {
    const { id, category, diagnose, miljø, age, search, sort } = req.query;

    // 🔹 Læs ALLE opdelte JSON filer fra cases mappen
    const casesDir = path.join(process.cwd(), "public", "CDA", "cases");
    
    if (!fs.existsSync(casesDir)) {
      return res.status(404).json({
        success: false,
        error: `Cases mappe ikke fundet: ${casesDir}`
      });
    }

    // Læs alle JSON filer i cases mappen
    const files = fs.readdirSync(casesDir).filter(f => f.endsWith('.json'));
    let allCases = [];

    for (const file of files) {
      const filePath = path.join(casesDir, file);
      const raw = fs.readFileSync(filePath, "utf8");
      const data = JSON.parse(raw);
      
      // Tilføj cases fra denne fil
      if (data.cases && Array.isArray(data.cases)) {
        allCases = allCases.concat(data.cases);
      }
    }

    let filtered = allCases;

    // 🔍 Hvis der søges på specifikt ID
    if (id) {
      const match = allCases.find(c => c.id?.toLowerCase() === id.toLowerCase());
      if (!match) {
        return res.status(404).json({
          success: false,
          error: `Ingen case fundet med ID: ${id}`
        });
      }
      return res.status(200).json({
        success: true,
        total: 1,
        source: JSON.stringify([match], null, 2)
      });
    }

    // 🔹 Semantisk søgning via q parameter
    const q = req.query.q || req.query.search || "";
    if (q) {
      const { terms, related } = semanticSearch(q);
      filtered = allCases.filter(c => {
        const content = JSON.stringify(c).toLowerCase();
        return (
          terms.some(t => content.includes(t)) ||
          related.some(r => content.includes(r))
        );
      });
    }

    // 🔍 Filtrer på kategori
    if (category) {
      filtered = filtered.filter(c =>
        c.kategori?.toLowerCase().includes(category.toLowerCase()) ||
        c.category?.toLowerCase().includes(category.toLowerCase())
      );
    }

    // 🔍 Filtrer på diagnose (eller adfærd for børnehave)
    if (diagnose) {
      filtered = filtered.filter(c => {
        const diagnoser = c.diagnoser || [];
        const adfærd = c.adfærd || [];
        return diagnoser.some(d => d.toLowerCase().includes(diagnose.toLowerCase())) ||
               adfærd.some(a => a.toLowerCase().includes(diagnose.toLowerCase()));
      });
    }

    // 🔍 Filtrer på miljø
    if (miljø) {
      filtered = filtered.filter(c =>
        c.miljø?.some(m => m.toLowerCase().includes(miljø.toLowerCase()))
      );
    }

    // 🔍 Filtrer på alder
    if (age) {
      filtered = filtered.filter(c => c.alder === Number(age));
    }

    // 🔎 Fritekst-søgning med semantik
    if (search) {
      const { terms, related } = semanticSearch(search);
      filtered = filtered.filter(c => {
        const content = JSON.stringify(c).toLowerCase();
        const searchLower = search.toLowerCase();
        return (
          terms.some(t => content.includes(t)) ||
          related.some(r => content.includes(r)) ||
          (c.titel && c.titel.toLowerCase().includes(searchLower)) ||
          (c.tema && c.tema.toLowerCase().includes(searchLower)) ||
          (c.problem && c.problem.toLowerCase().includes(searchLower)) ||
          (c.løsning && c.løsning.toLowerCase().includes(searchLower)) ||
          (c.kategori && c.kategori.toLowerCase().includes(searchLower))
        );
      });
    }

    // 🧭 Sortering
    if (sort) {
      const dir = sort.toLowerCase();
      if (dir === "age-asc") filtered.sort((a, b) => a.alder - b.alder);
      if (dir === "age-desc") filtered.sort((a, b) => b.alder - a.alder);
      if (dir === "title") filtered.sort((a, b) => (a.titel || "").localeCompare(b.titel || ""));
    }

    // ✅ Fallback til semantic-search hvis ingen matches
    if (filtered.length === 0 && search) {
      const fallbackUrl = `https://cda-engine-clean.vercel.app/api/semantic-search?search=${encodeURIComponent(search)}`;
      const fallbackRes = await fetch(fallbackUrl);
      const fallbackData = await fallbackRes.json();
      console.log("Fallback-data:", fallbackData);
      filtered = fallbackData.results?.slice(0, 2) || [];
    }

    // ✅ Returnér resultatet - max 5 cases
    return res.status(200).json({
      success: true,
      total: filtered.length,
      source: JSON.stringify(filtered.slice(0, 5), null, 2)
    });

  } catch (error) {
    console.error("❌ FEJL i /api/data:", error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}