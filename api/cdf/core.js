export default async function handler(req, res) {
  const { module } = req.query;

  if (!module) {
    return res.status(400).json({
      success: false,
      message: "Angiv et modul: fx ?module=food eller ?module=health",
    });
  }

  try {
    // 🔹 Base URL til public-mappen på Vercel
    const baseURL = "https://cda-engine-clean.vercel.app";

    // 🔹 Definer mulige filnavne for moduler (du kan udvide listen frit)
    const moduleMap = {
      food: "FoodLab",
      health: "HealthLab",
      recipes: "recipes_and_health",
      core: "CDF_Core"
    };

    // 🔹 Find filnavn ud fra module-parameter
    const key = module.toLowerCase();
    const fileName = moduleMap[key] || module.charAt(0).toUpperCase() + module.slice(1);

    // 🔹 Byg URL'er
    const jsonURL = `${baseURL}/CDF/modules/${fileName}.json`;
    const mdURL = `${baseURL}/CDF/modules/${fileName}.md`;

    console.log(`🔍 Prøver at hente: ${jsonURL}`);

    let data;

    // 🔹 Hent JSON eller Markdown
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

    // ✅ Succes!
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
