import fs from "fs";
import path from "path";

const srcDir = path.join(process.cwd(), "CDA", "data");
const destDir = path.join(process.cwd(), "public", "CDA", "data");

if (!fs.existsSync(srcDir)) {
  console.warn("⚠️  Kildemappe mangler:", srcDir);
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });

for (const file of fs.readdirSync(srcDir)) {
  const srcPath = path.join(srcDir, file);
  const destPath = path.join(destDir, file);

  // ✅ Spring mapper over – kopier kun filer
  const stats = fs.statSync(srcPath);
  if (stats.isDirectory()) {
    console.log(`⏭️  Springer mappe over: ${file}`);
    continue;
  }

  fs.copyFileSync(srcPath, destPath);
  console.log(`✅ Kopieret: ${file}`);
}

console.log("✨ CDA-data synkroniseret til public/CDA/data/");
