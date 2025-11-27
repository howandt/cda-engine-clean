import path from "path";

export default async function handler(req, res) {
  const { module } = req.query;

  if (!module) {
    return res.status(400).json({
      success: false,
      message: "Angiv et modul: ?module=food eller ?module=health",
    });
  }

  try {
    // 🔹 Modulnavn
    const name = module.charAt(0).toUpperCase() + module.slice(1).toLowerCase();

    // 🔹 Base URL (virker både lokalt og på Vercel)
    const baseURL = "https://cda-engine-clean.vercel.app";

    // 🔹 Prøv først .json, derefter .md
    const jsonURL = `${baseURL}/CDF/modules/${name}.json`;
    const mdURL = `${baseURL}/CDF/modules/${name}.md`;

    console.log("🔍 Prøver at hente:", jsonURL);

    let data;

    const jsonResp = await fetch(jsonURL);
    const mdResp = await fetch(mdURL);

    if (jsonResp.ok) {
      data = await jsonResp.json();
    } else if (mdResp.ok) {
      const content = await mdResp.text();
      data = { module: name, format: "markdown", content };
    } else {
      throw new Error(`Ingen modulfil fundet for '${name}' (.json eller .md)`);
    }

    return res.status(200).json({
      success: true,
      module: name,
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
