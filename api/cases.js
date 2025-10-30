// Vercel Serverless Function - Cases API med caching
const fetch = require('node-fetch');

// In-memory cache
let cache = {
  adhd_angst: { data: null, timestamp: 0 },
  autisme_angst: { data: null, timestamp: 0 }
};

const CACHE_DURATION = 1000 * 60 * 60; // 1 time
const GITHUB_BASE = 'https://raw.githubusercontent.com/howandt/cda-engine-clean/main/data/cases/';

async function fetchFromGitHub(filename) {
  const response = await fetch(`${GITHUB_BASE}${filename}`);
  if (!response.ok) {
    throw new Error(`GitHub fetch failed: ${response.status}`);
  }
  return await response.json();
}

function isCacheValid(cacheKey) {
  const cached = cache[cacheKey];
  if (!cached.data) return false;
  const age = Date.now() - cached.timestamp;
  return age < CACHE_DURATION;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { file } = req.query;

    if (!file) {
      return res.status(200).json({
        available_cases: [
          'adhd_angst_cases.json',
          'autisme_angst_cases.json'
        ],
        usage: '/api/cases?file=adhd_angst_cases.json'
      });
    }

    const cacheKey = file.replace('_cases.json', '').replace('.json', '');

    if (isCacheValid(cacheKey)) {
      console.log(`[CACHE HIT] ${file}`);
      return res.status(200).json({
        source: 'cache',
        data: cache[cacheKey].data,
        cached_at: new Date(cache[cacheKey].timestamp).toISOString()
      });
    }

    console.log(`[CACHE MISS] ${file} - fetching from GitHub`);
    const data = await fetchFromGitHub(file);

    cache[cacheKey] = {
      data: data,
      timestamp: Date.now()
    };

    return res.status(200).json({
      source: 'github',
      data: data,
      fetched_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cases API error:', error);
    return res.status(500).json({
      error: 'Failed to fetch cases',
      message: error.message
    });
  }
};