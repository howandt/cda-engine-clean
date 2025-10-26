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
  const lower = keyword.toLowerCase();
  const filtered = data.specialists.filter(spec => {
  const fields = [
    spec.function || "",
    spec.focus || "",
    (spec.keywords || []).join(" ")
  ].join(" ").toLowerCase();
  return fields.includes(lower);
});

  return res
    .status(200)
    .send(JSON.stringify({ filtered }, null, 2));
}

    // Send dataen som API-svar
    res.setHeader("Content-Type", "text/plain");
res.status(200).send(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Fejl i API:", error);
    res.status(500).json({ error: "Der opstod en fejl i API'en" });
  }
}
