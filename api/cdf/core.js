import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const { module } = req.query;

  if (!module) {
    return res.status(400).json({
      success: false,
      message: "Angiv et modul: ?module=food eller ?module=health"
    });
  }

  try {
    const baseDir = path.join(process.cwd(), "CDF/modules");
    const name = module.charAt(0).toUpperCase() + module.slice(1);
    const jsonPath = path.join(baseDir, `${name}.json`);
    const mdPath = path.join(baseDir, `${name}.md`);

    console.log("🔍 Læser modul:", name);
    console.log("📁 BaseDir:", baseDir);

    let data;

    if (fs.existsSync(jsonPath)) {
      // Hvis JSON findes
      data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    } else if (fs.existsSync(mdPath)) {
      // Hvis Markdown findes
      const content = fs.readFileSync(mdPath, "utf-8");
      data = {
        module: name,
        format: "markdown",
        content: content
      };
    } else {
      throw new Error(`Ingen modulfil fundet for '${name}' (.json eller .md)`);
    }

    return res.status(200).json({
      success: true,
      module: name,
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Kunne ikke hente data for ${module}`,
      error: error.message
    });
  }
}
