import fs from "fs";
import path from "path";

// In-memory cache
let cache = {
  templates: { data: null, timestamp: 0 },
  index: { data: null, timestamp: 0 }
};

const CACHE_DURATION = 1000 * 60 * 60; // 1 time

function isCacheValid(cacheKey) {
  const cached = cache[cacheKey];
  if (!cached.data) return false;
  const age = Date.now() - cached.timestamp;
  return age < CACHE_DURATION;
}

function readLocalFile(filename) {
  const dataPath = path.join(process.cwd(), "public", "CDA", "data", "CDA_Templates.json");
  
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
    const { type } = req.query;

    // Hvis type=index, returner index filen
    if (type === 'index') {
      if (isCacheValid('index')) {
        console.log('[CACHE HIT] Templates Index');
        return res.status(200).json({
          success: true,
          source: 'cache',
          data: cache.index.data,
          cached_at: new Date(cache.index.timestamp).toISOString()
        });
      }

      console.log('[CACHE MISS] Templates Index - læser fra disk');
      const data = readLocalFile('cda_templates_index.json');
      cache.index = { data, timestamp: Date.now() };

      return res.status(200).json({
        success: true,
        source: 'disk',
        data: data,
        fetched_at: new Date().toISOString()
      });
    }

    // Standard: Returner fuld templates database
    if (isCacheValid('templates')) {
      console.log('[CACHE HIT] Templates');
      const templateData = cache.templates.data;
      
      // Ekstrahér templates array fra nested struktur
      const templates = templateData.template_database?.templates || [];
      const metadata = templateData.template_database?.metadata || {};
      
      return res.status(200).json({
        success: true,
        source: 'cache',
        templates: templates,
        metadata: metadata,
        total: templates.length,
        cached_at: new Date(cache.templates.timestamp).toISOString()
      });
    }

    console.log('[CACHE MISS] Templates - læser fra disk');
    const data = readLocalFile('CDA_Templates.json');
    cache.templates = { data, timestamp: Date.now() };

    // Ekstrahér templates array fra nested struktur
    const templates = data.template_database?.templates || [];
    const metadata = data.template_database?.metadata || {};

    return res.status(200).json({
      success: true,
      source: 'disk',
      templates: templates,
      metadata: metadata,
      total: templates.length,
      fetched_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Templates API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch templates',
      message: error.message
    });
  }
}