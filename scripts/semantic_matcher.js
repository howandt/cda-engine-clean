import fs from "fs";
import path from "path";

// 🔹 Simpel semantisk matcher
export function semanticSearch(query) {
  try {
    const semanticPath = path.join(process.cwd(), "public", "CDA", "data", "semantic_engine.json");
    if (!fs.existsSync(semanticPath)) return { terms: [], related: [] };

    const raw = fs.readFileSync(semanticPath, "utf8");
    const semantic = JSON.parse(raw);
    
    // Tilføj basis-split af søgning (så "adhd autisme" bliver til ["adhd","autisme"])
query = query.replace(/,/g, " ");
const terms = query
  .toLowerCase()
  .split(/\s+/)
  .filter(Boolean);

// Saml alle synonymer, temaer og emotioner i ét objekt
const combined = {
  ...semantic.synonyms,
  ...semantic.themes,
  ...semantic.emotions,
};

const related = new Set();

// Find relaterede ord fra semantic_engine.json
for (const term of terms) {
  for (const [key, value] of Object.entries(combined)) {
    if (
      term.includes(key.toLowerCase()) ||
      key.toLowerCase().includes(term)
    ) {
      value.forEach((v) => related.add(v.toLowerCase()));
    }
  }
}
// Returnér resultater
  return {
    terms,
    related: Array.from(related),
  };
} catch (err) {
  console.error("❌ Semantic matcher fejl:", err);
  return { terms: [], related: [] };
}
}
