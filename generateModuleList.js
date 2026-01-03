// generateModuleList.js

import fs from "fs";
import path from "path";

const dirPath = path.join(process.cwd(), "public", "CDF", "data");
const outputPath = path.join(process.cwd(), "public", "CDF", "data", "cdf_master_modules.json");

const files = fs.readdirSync(dirPath)
  .filter(file => file.endsWith(".json") && file !== "cdf_master_modules.json")
  .map(file => path.basename(file, ".json"));

const result = {
  labs: files
};

fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf-8");

console.log("✅ Modul-listen blev genereret:");
console.log(result);
