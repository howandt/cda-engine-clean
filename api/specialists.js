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
    const { keyword } = req.query;

if (keyword) {
  if (keyword) {
  // Midlertidig test-output
  if (req.query.debug === "true") {
    return res
      .status(200)
      .send(`DEBUG: keyword = ${keyword}\n\nData indeholder ${data.specialists.length} specialister`);
  }
  
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

  return res
    .status(200)
    .send(JSON.stringify({ topMatches }, null, 2));
}

    // Send dataen som API-svar
    res.setHeader("Content-Type", "text/plain");
res.status(200).send(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Fejl i API:", error);
    res.status(500).json({ error: "Der opstod en fejl i API'en" });
  }
}
