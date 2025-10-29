import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const __dirname = process.cwd();

// ---------- HJÆLPEFUNKTION ----------
function readJSON(filePath) {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Fejl ved læsning af fil:", filePath, err.message);
    return { error: "Kunne ikke læse fil." };
  }
}

// ---------- API: CASEBANK ----------
app.get("/api/cases", (req, res) => {
  const casesDir = path.join(__dirname, "data", "cases");
  const files = fs.readdirSync(casesDir).filter(f => f.endsWith(".json"));

  let allCases = [];
  for (const file of files) {
    const filePath = path.join(casesDir, file);
    const data = readJSON(filePath);
    if (Array.isArray(data)) allCases.push(...data);
  }

  res.json(allCases);
});

// ---------- API: ROLLESPIL ----------
app.get("/api/rollespil", (req, res) => {
  const { id } = req.query;
  const filePath = path.join(__dirname, "data", "rollespil_scenarier.json");
  const data = readJSON(filePath);
  if (!id) return res.json(data);
  const result = data.find((r) => r.id === id);
  res.json(result || { error: "Rollespil ikke fundet." });
});

// ---------- API: KOMORBIDITET ----------
app.get("/api/komorbiditet", (req, res) => {
  const filePath = path.join(__dirname, "data", "CDA_Komorbiditet.json");
  const data = readJSON(filePath);
  res.json(data);
});

// ---------- API: CASE MAPPE ----------
app.get("/api/cases/:file", (req, res) => {
  const file = req.params.file;
  const filePath = path.join(__dirname, "data", "cases", file);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Case-fil ikke fundet." });
  const data = readJSON(filePath);
  res.json(data);
});

// ---------- EXPORT ----------
export default app;
