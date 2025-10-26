export const config = { runtime: "nodejs" };
import fs from "fs";
import path from "path";
import matter from "gray-matter"; // <– Parser YAML-metadata i .md

export default function handler(req, res) {
  try {
    res.setHeader("Access-Control-Allow-Origin", "*");

    // Find .md-filen med cases
    const filePath = path.join(process.cwd(), "data", "CDA_CaseBank.md");
    const fileContent = fs.readFileSync(filePath, "utf8");

    // Split filen op – hver case starter fx med "### 🧩 CASE "
    const rawCases = fileContent.split("### 🧩 CASE ").slice(1);

    // Parser alle cases
    const cases = rawCases.map((block, index) => {
      const parsed = matter("### 🧩 CASE " + block);
      const meta = parsed.data || {};
      return {
        id: meta.id || `case-${index + 1}`,
        title: meta.title || meta.navn || `Ukendt Case ${index + 1}`,
        alder: meta.alder || null,
        diagnose: meta.diagnose || meta.primær_diagnose || null,
        specialist: meta.specialist || null,
        tags: meta.tags || [],
        markdown: parsed.content.trim()
      };
    });

    // Keyword-søgning
    const keyword = req.query.keyword?.toLowerCase();
    let filtered = cases;
    if (keyword) {
      filtered = cases.filter(c =>
        JSON.stringify(c).toLowerCase().includes(keyword)
      );
    }

    // Returnér som JSON
    res.setHeader("Content-Type", "application/json");
    res.status(200).send(JSON.stringify(filtered.slice(0, 10), null, 2));
  } catch (error) {
    console.error("FEJL I CASES API:", error);
    res.status(500).json({ error: "Der opstod en fejl i Case API'et." });
  }
}
