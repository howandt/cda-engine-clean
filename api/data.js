import fs from "fs";
import path from "path";
import { semanticSearch } from "../scripts/semantic_matcher.js";

export default async function handler(req, res) {
  try {
    const { id, category, diagnose, miljø, age, search, sort } = req.query;

    // 🔹 Hent den rensede index-fil
    const dataPath = path.join(process.cwd(), "public", "CDA", "data", "CDA_Cases_Index_clean.json");

    if (!fs.existsSync(dataPath)) {
      return res.status(404).json({
        success: false,
        error: `Datafil ikke fundet: ${dataPath}`
      });
    }

    const raw = fs.readFileSync(dataPath, "utf8");
    const data = JSON.parse(raw);
    const cases = data.cases || data;
    let filtered = cases;

    // 🔍 Hvis der søges på specifikt ID
    if (id) {
      const match = cases.find(c => c.id?.toLowerCase() === id.toLowerCase());
      if (!match) {
        return res.status(404).json({
          success: false,
          error: `Ingen case fundet med ID: ${id}`
        });
      }
      return res.status(200).json({
        success: true,
        total: 1,
        source: JSON.stringify(filtered.slice(0, 5), null, 2)
      });
    }

    // 🔍 Ellers filtrer på kategori, diagnose, miljø, alder
    
    // 🔹 Semantisk søgning via q parameter
    const q = req.query.q || req.query.search || "";
    if (q) {
      const { terms, related } = semanticSearch(q);
      filtered = cases.filter(c => {
        const content = JSON.stringify(c).toLowerCase();
        return (
          terms.some(t => content.includes(t)) ||
          related.some(r => content.includes(r))
        );
      });
    }

    if (category) {
      filtered = filtered.filter(c =>
        c.category?.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (diagnose) {
      filtered = filtered.filter(c =>
        c.diagnoser?.some(d =>
          d.toLowerCase().includes(diagnose.toLowerCase())
        )
      );
    }

    if (miljø) {
      filtered = filtered.filter(c =>
        c.miljø?.toLowerCase().includes(miljø.toLowerCase())
      );
    }

    if (age) {
      filtered = filtered.filter(c => c.age === Number(age));
    }

    // 🔎 Fritekst-søgning med semantik
    if (search) {
      const { terms, related } = semanticSearch(search);
      filtered = filtered.filter(c => {
        const content = JSON.stringify(c).toLowerCase();
        const q = search.toLowerCase();
        return (
          terms.some(t => content.includes(t)) ||
          related.some(r => content.includes(r)) ||
          (c.title && c.title.toLowerCase().includes(q)) ||
          (c.theme && c.theme.toLowerCase().includes(q)) ||
          (c.problem && c.problem.toLowerCase().includes(q)) ||
          (c.solution && c.solution.toLowerCase().includes(q)) ||
          (c.category && c.category.toLowerCase().includes(q))
        );
      });
    }

    // 🧭 Sortering
    if (sort) {
      const dir = sort.toLowerCase();
      if (dir === "age-asc") filtered.sort((a, b) => a.age - b.age);
      if (dir === "age-desc") filtered.sort((a, b) => b.age - a.age);
      if (dir === "title") filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    // ✅ Returnér resultatet - ALLE matches
    if (filtered.length === 0 && search) {
  const fallbackUrl = `https://cda-engine-clean.vercel.app/api/semantic-search?search=${encodeURIComponent(search)}`;
  const fallbackRes = await fetch(fallbackUrl);
const fallbackData = await fallbackRes.json();
filtered = fallbackData.slice(0, 2);
}
    return res.status(200).json({
      success: true,
      total: filtered.length,
      source: JSON.stringify(filtered, null, 2)
    });

  } catch (error) {
    console.error("❌ FEJL i /api/data:", error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}