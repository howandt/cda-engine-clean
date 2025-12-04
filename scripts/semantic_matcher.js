import fs from "fs";
import path from "path";

// 🔹 Simpel semantisk matcher
export function semanticSearch(query) {
  try {
    const semanticPath = path.join(process.cwd(), "public", "CDA", "data", "semantic_engine.json");
    if (!fs.existsSync(semanticPath)) return { terms: [], related: [] };

    const raw = fs.readFileSync(semanticPath, "utf8");
    const semantic = JSON.parse(raw);
    const terms = query.toLowerCase().split(/\s+/);
    const related = new Set();
    const expanded = [];
for (const t of terms) {
  if (t.includes("og")) {
    expanded.push(...t.split("og").map(x => x.trim()));
  } else {
    expanded.push(t.trim());
  }
}

    for (const term of expanded) {
      for (const [key, value] of Object.entries({ ...semantic.synonyms, ...semantic.themes, ...semantic.emotions })) {
        if (term.includes(key.toLowerCase()) || key.toLowerCase().includes(term)) {
          value.forEach(v => related.add(v.toLowerCase()));
        }
      }
    }

    return { terms, related: Array.from(related) };
  } catch (err) {
    console.error("❌ Semantic matcher fejl:", err);
    return { terms: [], related: [] };
  }
}
