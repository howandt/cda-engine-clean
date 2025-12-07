import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  try {
    const { module } = req.query;

    // 🔹 Sti til CDF data
    const cdfDataDir = path.join(process.cwd(), "public", "CDF", "data");
    const cdfCorePath = path.join(process.cwd(), "public", "CDF", "CDF_Core.json");

    if (!fs.existsSync(cdfDataDir)) {
      return res.status(404).json({
        success: false,
        error: `CDF data mappe ikke fundet: ${cdfDataDir}`
      });
    }

    // 🔍 Hvis ingen modul specificeret - vis liste af tilgængelige moduler
    if (!module) {
      const files = fs.readdirSync(cdfDataDir).filter(f => f.endsWith('.json'));
      
      // Tilføj også Core
      const modules = ["Core (CDF_Core.json)", ...files];
      
      return res.status(200).json({
        success: true,
        modules: modules,
        message: "Tilgængelige CDF moduler. Brug ?module=navnet for at hente specifikt modul."
      });
    }

    // 🔍 Hvis Core ønskes
    if (module.toLowerCase() === "core" || module.toLowerCase() === "cdf_core") {
      if (!fs.existsSync(cdfCorePath)) {
        return res.status(404).json({
          success: false,
          error: "CDF_Core.json ikke fundet"
        });
      }

      const coreData = JSON.parse(fs.readFileSync(cdfCorePath, "utf8"));
      
      return res.status(200).json({
        success: true,
        module: "CDF_Core",
        data: coreData
      });
    }

    // 🔍 Søg efter specifikt modul i data mappen
    const files = fs.readdirSync(cdfDataDir);
    
    // Find fil der matcher (case-insensitive)
    let targetFile = null;
    for (const file of files) {
      if (file.toLowerCase() === module.toLowerCase() + '.json' ||
          file.toLowerCase() === module.toLowerCase()) {
        targetFile = file;
        break;
      }
    }

    if (!targetFile) {
      return res.status(404).json({
        success: false,
        error: `Modul ikke fundet: ${module}`,
        available: files.filter(f => f.endsWith('.json'))
      });
    }

    // 🔹 Læs og returner modulet
    const filePath = path.join(cdfDataDir, targetFile);
    const moduleData = JSON.parse(fs.readFileSync(filePath, "utf8"));

    return res.status(200).json({
      success: true,
      module: targetFile.replace('.json', ''),
      data: moduleData
    });

  } catch (error) {
    console.error("❌ FEJL i /api/cdf:", error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
