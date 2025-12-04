import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  try {
    const dataPath = path.join(process.cwd(), "public", "CDA", "data", "CDA_Templates_Index.json");

    if (!fs.existsSync(dataPath)) {
      return res.status(404).json({
        success: false,
        error: `Templates fil ikke fundet: ${dataPath}`
      });
    }

    const raw = fs.readFileSync(dataPath, "utf8");
    const data = JSON.parse(raw);

    return res.status(200).json({
      success: true,
      total: data.length || 0,
      data: data
    });

  } catch (error) {
    console.error("❌ FEJL i /api/templates:", error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}