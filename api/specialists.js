export const config = { runtime: "nodejs" };
import fs from "fs";
import path from "path";

export default function handler(req, res) {
  try {
    // Tillad adgang fra GPT og andre systemer
    res.setHeader("Access-Control-Allow-Origin", "*");

    // Find JSON-filen i projektmappen
    const filePath = path.join(process.cwd(), "CDA_SpecialistPanel.json");

    // Læs og parse JSON-indholdet
    const fileData = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(fileData);

    // Hent evt. søgeord
    const { keyword, debug } = req.query;

    // Hvis debug=true, vis hurtig info
    if (debug === "true") {
      res.setHeader("Content-Type", "text/plain");
      return res
        .status(200)
        .send(`DEBUG: keyword = ${keyword}\nData indeholder ${data.specialists.length} specialister`);
    }

    // Hvis der er et keyword, filtrer specialister
    if (keyword) {
      const searchTerms = keyword.toLowerCase().split(/\s+/);

      const scored = data.specialists.map(spec => {
        const allKeywords = (spec.keywords || []).map(k => k.toLowerCase());
        const matches = searchTerms.filter(term => allKeywords.includes(term));
        let score = matches.length;

        // Straf meget brede profiler
        if (allKeywords.length > 40) score = score / 2;
        if (allKeywords.length > 60) score = score / 3;

        return { ...spec, matchScore: score };
      });

      const topMatches = scored
        .filter(s => s.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 3);

      res.setHeader("Content-Type", "text/plain");
      return res.status(200).send(JSON.stringify({ topMatches }, null, 2));
    }

    // Hvis ingen keyword - returnér hele JSON som tekst
    res.setHeader("Content-Type", "text/plain");
    res.status(200).send(JSON.stringify(data, null, 2));

  } catch (error) {
    // 👇 Udvidet fejlrapport direkte i browser
    const message = [
      "FEJL I API:",
      error.message || error.toString(),
      error.stack || ""
    ].join("\n");

    res.setHeader("Content-Type", "text/plain");
    res.status(500).send(message);
  }
}
