// Vercel Serverless Function - Templates API med caching
const fetch = require('node-fetch');

// In-memory cache
let cache = {
  templates: { data: null, timestamp: 0 },
  index: { data: null, timestamp: 0 }
};

const CACHE_DURATION = 1000 * 60 * 60; // 1 time
const GITHUB_BASE = 'https://raw.githubusercontent.com/howandt/cda-engine-clean/main/data/';

function isCacheValid(cacheKey) {
  const cached = cache[cacheKey];
  if (!cached.data) return false;
  const age = Date.now() - cached.timestamp;
  return age < CACHE_DURATION;
}

async function fetchFromGitHub(filename) {
  const response = await fetch(`${GITHUB_BASE}${filename}`);
  if (!response.ok) {
    throw new Error(`GitHub fetch failed: ${response.status}`);
  }
  return await response.json();
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { type } = req.query;

    if (type === 'index') {
      if (isCacheValid('index')) {
        console.log('[CACHE HIT] Templates Index');
        return res.status(200).json({
          source: 'cache',
          data: cache.index.data,
          cached_at: new Date(cache.index.timestamp).toISOString()
        });
      }

      console.log('[CACHE MISS] Templates Index - fetching from GitHub');
      const data = await fetchFromGitHub('CDA_Templates/cda_templates_index.json');
      cache.index = { data, timestamp: Date.now() };

      return res.status(200).json({
        source: 'github',
        data: data,
        fetched_at: new Date().toISOString()
      });
    }

    if (isCacheValid('templates')) {
      console.log('[CACHE HIT] Templates');
      return res.status(200).json({
        source: 'cache',
        data: cache.templates.data,
        cached_at: new Date(cache.templates.timestamp).toISOString()
      });
    }

    console.log('[CACHE MISS] Templates - fetching from GitHub');
    const data = await fetchFromGitHub('CDA_Templates.json');
    cache.templates = { data, timestamp: Date.now() };

    return res.status(200).json({
      source: 'github',
      data: data,
      fetched_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Templates API error:', error);
    return res.status(500).json({
      error: 'Failed to fetch templates',
      message: error.message
    });
  }
};