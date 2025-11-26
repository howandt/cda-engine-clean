import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const { module } = req.query;

  if (!module) {
    return res.status(400).json({ success: false, message: "Angiv et modul: ?module=food eller ?module=health" });
  }

  const basePath = path.join(process.cwd(), "CDF", "modules");
  const fileName = module === "food" ? "FoodLab.json" :
                   module === "health" ? "HealthLab.json" : null;

  if (!fileName) {
    return res.status(400).json({ success: false, message: "Ugyldigt modulnavn" });
  }

  const filePath = path.join(basePath, fileName);

  try {
    const data = fs.readFileSync(filePath, "utf8");
    const jsonData = JSON.parse(data);

    res.status(200).json({
      success: true,
      module,
      data: jsonData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Kunne ikke hente data for ${module}`,
      error: error.message
    });
  }
}
