import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), "CDF", "CDF_Core.json");

  try {
    const data = fs.readFileSync(filePath, "utf8");
    const jsonData = JSON.parse(data);

    res.status(200).json({
      success: true,
      data: jsonData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Kunne ikke hente CDF_Core.json",
      error: error.message
    });
  }
}
