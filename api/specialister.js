import fs from "fs";
import path from "path";

// In-memory cache
let cache = {
  data: null,
  timestamp: 0
};

const CACHE_DURATION = 1000 * 60 * 60; // 1 time

function isCacheValid() {
  if (!cache.data) return false;
  const age = Date.now() - cache.timestamp;
  return age < CACHE_DURATION;
}

function readLocalFile() {
  const dataPath = path.join(process.cwd(), "public", "CDA", "data", "CDA_SpecialistPanel.json");
  
  if (!fs.existsSync(dataPath)) {
    throw new Error(`Fil ikke fundet: ${dataPath}`);
  }
  
  const raw = fs.readFileSync(dataPath, "utf8");
  return JSON.parse(raw);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Check cache først
    if (isCacheValid()) {
      console.log('[CACHE HIT] Specialister');
      return res.status(200).json({
        success: true,
        source: 'cache',
        data: cache.data,
        cached_at: new Date(cache.timestamp).toISOString()
      });
    }

    // Læs fra disk
    console.log('[CACHE MISS] Specialister - læser fra disk');
    const data = readLocalFile();
    cache.data = data;
    cache.timestamp = Date.now();

    return res.status(200).json({
      success: true,
      source: 'disk',
      data: data,
      fetched_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Specialister API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch specialister data',
      message: error.message
    });
  }
}