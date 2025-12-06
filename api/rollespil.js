import fs from "fs";
import path from "path";

// In-memory cache
let cache = {
  all: { data: null, timestamp: 0 },
  cases: {}
};

const CACHE_DURATION = 1000 * 60 * 60; // 1 time

function isCacheValid(cacheKey) {
  const cached = cacheKey === 'all' ? cache.all : cache.cases[cacheKey];
  if (!cached || !cached.data) return false;
  const age = Date.now() - cached.timestamp;
  return age < CACHE_DURATION;
}

function readLocalFile() {
  const dataPath = path.join(process.cwd(), "public", "CDA", "data", "rollespil_scenarier.json");
  
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
    const { caseId } = req.query;
    const cacheKey = caseId || 'all';

    // Check cache
    if (isCacheValid(cacheKey)) {
      console.log(`[CACHE HIT] Rollespil - ${cacheKey}`);
      const cached = cacheKey === 'all' ? cache.all : cache.cases[cacheKey];
      return res.status(200).json({
        success: true,
        source: 'cache',
        data: cached.data,
        cached_at: new Date(cached.timestamp).toISOString()
      });
    }

    // Læs fra disk
    console.log(`[CACHE MISS] Rollespil - ${cacheKey}`);
    const allData = readLocalFile();

    if (caseId) {
      // Find specifikt scenarie
      const scenario = allData.scenarier?.find(s => s.caseId === caseId) || null;
      cache.cases[caseId] = { data: scenario, timestamp: Date.now() };
      
      return res.status(200).json({
        success: true,
        source: 'disk',
        data: scenario,
        fetched_at: new Date().toISOString()
      });
    }

    // Returner alle
    cache.all = { data: allData, timestamp: Date.now() };
    return res.status(200).json({
      success: true,
      source: 'disk',
      data: allData,
      fetched_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Rollespil API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch rollespil data',
      message: error.message
    });
  }
}