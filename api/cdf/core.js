import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  const { module } = req.query;

  if (!module) {
    return res.status(400).json({
      success: false,
      message: "Angiv et modul: fx ?module=food eller ?module=health",
    });
  }

  // Hvis brugeren beder om en oversigt over modulerne (?module=list)
  if (module === "list") {
    const listPath = path.join(process.cwd(), "public", "CDF", "modules", "cdf_master_modules.json");
    console.log("📁 Prøver at hente moduloversigt fra:", listPath);

    try {
      const listData = fs.readFileSync(listPath, "utf-8");
      const jsonData = JSON.parse(listData);
      return res.status(200).json({
        success: true,
        message: "Tilgængelige CDF-moduler",
        modules: jsonData.labs
      });
    } catch (error) {
      console.error("🚨 Fejl ved hentning af moduloversigt:", error);
      return res.status(500).json({
        success: false,
        message: "Kunne ikke hente moduloversigt",
        error: error.message
      });
    }
  }

  // Almindelig modulhentning
  try {
    const baseURL = "https://cda-engine-clean.vercel.app";
    const modulePath = `/CDF/modules/${module}.json`;
    const response = await fetch(`${baseURL}${modulePath}`);
    const data = await response.text();

    if (!response.ok) {
      throw new Error(`Kunne ikke hente data for ${module}`);
    }

    const jsonData = JSON.parse(data);

    return res.status(200).json({
      success: true,
      module: module,
      data: jsonData
    });
  } catch (error) {
    console.error("🚨 Fejl i core.js:", error);
    return res.status(500).json({
      success: false,
      message: `Kunne ikke hente data for ${module}`,
      error: error.message
    });
  }
}
