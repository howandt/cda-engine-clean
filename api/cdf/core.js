import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const { module } = req.query;

  if (!module) {
    return res.status(400).json({
      success: false,
      message: "Angiv et modul: ?module=food eller ?module=health",
    });
  }

  try {
    const cwd = process.cwd();
    const basePath = path.join(process.cwd(), "CDF", "modules");
    console.log("📍 process.cwd():", cwd);
    console.log("✅ Base path:", basePath);

    const name =
      module.charAt(0).toUpperCase() + module.slice(1).toLowerCase();
    const jsonPath = path.join(basePath, `${name}.json`);
    const mdPath = path.join(basePath, `${name}.md`);

    console.log("🔍 Søger efter:", jsonPath, mdPath);

    let data;
    if (fs.existsSync(jsonPath)) {
      data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    } else if (fs.existsSync(mdPath)) {
      data = {
        module: name,
        format: "markdown",
        content: fs.readFileSync(mdPath, "utf-8"),
      };
    } else {
      throw new Error(`Ingen modulfil fundet for '${name}' (.json eller .md)`);
    }

    return res.status(200).json({
      success: true,
      module: name,
      data,
    });
  } catch (error) {
    console.error("❌ FEJL I CORE.JS:", error);
    return res.status(500).json({
      success: false,
      message: `Kunne ikke hente data for ${req.query.module}`,
      error: error.message,
    });
  }
}
