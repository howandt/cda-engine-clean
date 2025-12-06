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
console.log("📁 Prøver at hente:", listPath);
    try {
      const listData = fs.readFileSync(listPath, "utf-8");
      const jsonData = JSON.parse(listData);
      return res.status(200).json({
        success: true,
        message: "Tilgængelige CDF-moduler",
        modules: jsonData.labs
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Kunne ikke hente moduloversigt",
        error: error.message
      });
    }
  }

  try {
    const baseURL = "https://cda-engine-clean.vercel.app";

    // 🔹 Mapping af brugerens input til faktiske filnavne
    const moduleMap = {
      core: "CDF_Core",
      food: "FoodLab",
      health: "HealthLab",
      recipes: "RecipesAndHealth",
      support: "SupportLab",
      care: "CareLab",
      calm: "CalmSpace",
      adapt: "AdaptCore",
      move: "MoveLab",
      push: "PushSupport",
      grow: "GrowLab",
      hjemmeterapi: "Hjemmeterapi",
      crisis: "CrisisSupport",
      emotions: "Emotions",
      lifetools: "LifeTools",
      green: "GreenLab",
      lifeflow: "LifeFlow",
      hobby: "HobbyLab",
      specialist: "SpecialistSupport"
    };

    // 🔹 Find filnavn
    const key = module.toLowerCase();
    const fileName = moduleMap[key] || module.charAt(0).toUpperCase() + module.slice(1);

    // 🔹 Core ligger i /CDF/, resten i /CDF/modules/
    const isCore = fileName.toLowerCase().includes("core");
    const folder = isCore ? "CDF" : "CDF/modules";

    const jsonURL = `${baseURL}/${folder}/${fileName}.json`;
    const mdURL = `${baseURL}/${folder}/${fileName}.md`;

    console.log(`🔍 Prøver at hente: ${jsonURL}`);

    let data;
    const jsonResp = await fetch(jsonURL);
    const mdResp = await fetch(mdURL);

    if (jsonResp.ok) {
      data = await jsonResp.json();
    } else if (mdResp.ok) {
      const content = await mdResp.text();
      data = { module: fileName, format: "markdown", content };
    } else {
      throw new Error(`Ingen modulfil fundet for '${fileName}' (.json eller .md)`);
    }

    return res.status(200).json({
      success: true,
      module: fileName,
      data,
    });

  } catch (error) {
    console.error("❌ FEJL I CORE.JS:", error.message);
    return res.status(500).json({
      success: false,
      message: `Kunne ikke hente data for ${req.query.module}`,
      error: error.message,
    });
  }
}
