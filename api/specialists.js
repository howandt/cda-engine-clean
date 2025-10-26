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

    // Send dataen som API-svar
    res.status(200).json(data);
  } catch (error) {
    console.error("Fejl i API:", error);
    res.status(500).json({ error: "Der opstod en fejl i API'en" });
  }
}
