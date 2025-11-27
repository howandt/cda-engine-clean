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
    console.log("📍 VERCEL DEBUG START");
    console.log("🗂️ process.cwd():", cwd);
    console.log("📁 Indhold af cwd:", fs.readdirSync(cwd));

    // 🔍 Mulige basePaths afhængigt af hvor Vercel pakker projektet
    const possiblePaths = [
      path.join(cwd, "CDF", "modules"),
      path.join(cwd, "../CDF/modules"),
      path.join(cwd, "api", "cdf", "CDF", "modules"),
      path.join("/var/task", "CDF", "modules"),
    ];

    // Find første eksisterende sti
    let basePath = possiblePaths.find((p) => fs.existsSync(p));
    if (!basePath) {
      console.error("❌ Ingen gyldig basePath fundet. Testede:", possiblePaths);
      throw new Error("Ingen CDF/modules-mappe fundet i runtime.");
    }

    console.log("✅ Valgt basePath:", basePath);

    const name =
      module.charAt(0).toUpperCase() + module.slice(1).toLowerCase();
    const jsonPath = path.join(basePath, `${name}.json`);
    const mdPath = path.join(basePath, `${name}.md`);

    console.log("🔍 Søger efter modul:", name);
    console.log("📄 JSON:", jsonPath);
    console.log("📄 MD:", mdPath);

    let data;

    if (fs.existsSync(jsonPath)) {
      data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    } else if (fs.existsSync(mdPath)) {
      const content = fs.readFileSync(mdPath, "utf-8");
      data = {
        module: name,
        format: "markdown",
        content,
      };
    } else {
      throw new Error(`Ingen modulfil fundet for '${name}' (.json eller .md)`);
    }

    console.log("📍 VERCEL DEBUG SLUT");

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
