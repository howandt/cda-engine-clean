import fs from "fs";
import path from "path";

export default function handler(req, res) {
  try {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");

    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Der skal angives et case-id." });
    }

    // 🔹 Find case-mappen
    const caseDir = path.join(process.cwd(), "data", "cases");
    const files = fs.readdirSync(caseDir).filter(f => f.endsWith(".json"));

    let foundCase = null;
    let sourceFile = "";

    // 🔹 Gennemgå alle case-filer (adhd_angst, autisme_angst, osv.)
    for (const file of files) {
      const filePath = path.join(caseDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

      const match = data.find(c => c.id === id);
      if (match) {
        foundCase = match;
        sourceFile = file;
        break;
      }
    }

    if (!foundCase) {
      return res.status(404).json({ error: `Case med ID '${id}' ikke fundet i nogen case-fil.` });
    }

    // 🔹 Tilføj metadata (så du kan se hvor casen kom fra)
    const output = {
      metadata: {
        source_file: sourceFile,
        hentet_fra: "data/cases/",
        tidspunkt: new Date().toISOString(),
      },
      case: foundCase,
    };

    res.status(200).json(output);

  } catch (err) {
    res.status(500).json({
      error: "Fejl i rollespil API",
      details: err.message,
    });
  }
}
