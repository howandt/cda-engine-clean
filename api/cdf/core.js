import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const { module } = req.query;

  if (!module) {
    return res.status(400).json({
      success: false,
      message: "Angiv et modul: ?module=food eller ?module=health"
    });
  }

  try {
    const baseDir = path.join(process.cwd(), "CDF/modules");
    const jsonPath = path.join(baseDir, `${module.charAt(0).toUpperCase() + module.slice(1)}.json`);
    const mdPath = path.join(baseDir, `${module.charAt(0).toUpperCase() + module.slice(1)}.md`);

    let data;

    if (fs.existsSync(jsonPath)) {
      // JSON-format
      data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    } else if (fs.existsSync(mdPath)) {
      // Markdown-format
      const content = fs.readFileSync(mdPath, "utf-8");
      data = {
        module: module,
        format: "markdown",
        content: content
      };
    } else {
      throw new Error(`Modulet '${module}' blev ikke fundet som .json eller .md`);
    }

    res.status(200).json({
      success: true,
      module,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Kunne ikke hente data for ${module}`,
      error: error.message
    });
  }
}
