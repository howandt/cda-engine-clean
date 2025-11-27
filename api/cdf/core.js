import fs from "fs";
import path from "path";
// @vercel/include api/cdf/modules/FoodLab.md
// @vercel/include api/cdf/modules/HealthLab.json
// @vercel/include api/cdf/modules/recipes_and_health.json

export default function handler(req, res) {
  const { module } = req.query;

  if (!module) {
    return res.status(400).json({
      success: false,
      message: "Angiv et modul: ?module=food eller ?module=health",
    });
  }

  try {
    console.log("📁 Debug list of modules dir");
try {
  const testDir = path.join(process.cwd(), "api", "cdf", "modules");
  console.log("👉 Path I'm checking:", testDir);
  console.log("👉 Exists?", fs.existsSync(testDir));
  if (fs.existsSync(testDir)) {
    console.log("👉 Contents:", fs.readdirSync(testDir));
  }
} catch (err) {
  console.error("🛑 Could not read modules dir:", err);
}

    const cwd = process.cwd();
    const basePath = path.join(cwd, "api", "cdf", "modules");
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
