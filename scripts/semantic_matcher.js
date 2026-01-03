import fs from "fs";
import path from "path";

// 🔹 Semantisk matcher med konflikt-detection
export function semanticSearch(query) {
  try {
    const semanticPath = path.join(process.cwd(), "public", "CDA", "data", "semantic_engine.json");
    if (!fs.existsSync(semanticPath)) return { terms: [], related: [], conflict: null };

    const raw = fs.readFileSync(semanticPath, "utf8");
    const semantic = JSON.parse(raw);
    
    // Basis-split af søgning
    query = query.replace(/,/g, " ");
    const terms = query
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    // Saml alle synonymer, temaer og emotioner
    const combined = {
      ...semantic.synonyms,
      ...semantic.themes,
      ...semantic.emotions,
    };

    const related = new Set();

    // Find relaterede ord fra semantic_engine.json
    for (const term of terms) {
      for (const [key, value] of Object.entries(combined)) {
        if (
          term.includes(key.toLowerCase()) ||
          key.toLowerCase().includes(term)
        ) {
          value.forEach((v) => related.add(v.toLowerCase()));
        }
      }
    }

    // 🆕 KONFLIKT-DETECTION
    const conflict = detectConflict(query, semantic, related);

    // Returnér resultater
    return {
      terms,
      related: Array.from(related),
      conflict, // 🆕 Konflikt-info (null hvis ingen konflikt)
    };
  } catch (err) {
    console.error("❌ Semantic matcher fejl:", err);
    return { terms: [], related: [], conflict: null };
  }
}

// 🆕 KONFLIKT-DETEKTIONS FUNKTION
function detectConflict(query, semantic, relatedSet) {
  const lowerQuery = query.toLowerCase();
  
  // Tjek om conflict_triggers eksisterer
  if (!semantic.conflict_triggers) return null;

  const triggers = semantic.conflict_triggers;
  
  // 1️⃣ Tjek nøgleord
  const hasKeyword = triggers.keywords.some(keyword => 
    lowerQuery.includes(keyword.toLowerCase())
  );

  // 2️⃣ Tjek mønstre (fx "X men Y")
  const hasPattern = triggers.patterns.some(pattern => {
    if (pattern === "X men Y") {
      return lowerQuery.includes(" men ") || lowerQuery.includes(" but ");
    }
    if (pattern === "skole siger X forælder siger Y") {
      return (lowerQuery.includes("skole") || lowerQuery.includes("lærer")) &&
             (lowerQuery.includes("forælder") || lowerQuery.includes("hjem")) &&
             (lowerQuery.includes("siger") || lowerQuery.includes("mener"));
    }
    if (pattern === "lærer vil X vi vil Y") {
      return lowerQuery.includes("lærer") && lowerQuery.includes("vil");
    }
    if (pattern === "hjemme er barnet X i skole er barnet Y") {
      return (lowerQuery.includes("hjemme") || lowerQuery.includes("hjem")) &&
             (lowerQuery.includes("skole") || lowerQuery.includes("klasse"));
    }
    return false;
  });

  // 3️⃣ Hvis INGEN konflikt detekteret
  if (!hasKeyword && !hasPattern) return null;

  // 4️⃣ Hvis konflikt detekteret - identificer TYPE
  const conflictType = identifyConflictType(lowerQuery, semantic, relatedSet);

  // 5️⃣ Returner konflikt-objekt
  return {
    detected: true,
    type: conflictType,
    confidence: hasKeyword && hasPattern ? "high" : "medium",
  };
}

// 🆕 IDENTIFICER KONFLIKT-TYPE
function identifyConflictType(query, semantic, relatedSet) {
  const types = semantic.themes?.konflikttype;
  if (!types) return "unknown";

  const scores = {};

  // Tjek hver konflikttype
  for (const [typeName, keywords] of Object.entries(types)) {
    let score = 0;
    
    // Tjek om query indeholder keywords fra denne type
    keywords.forEach(keyword => {
      if (query.includes(keyword.toLowerCase())) {
        score += 2; // Direkte match = høj score
      }
    });

    // Tjek om related termer matcher
    keywords.forEach(keyword => {
      if (relatedSet.has(keyword.toLowerCase())) {
        score += 1; // Indirect match = lav score
      }
    });

    scores[typeName] = score;
  }

  // Find typen med højest score
  const topType = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    [0];

  // Returner type hvis score > 0, ellers "unknown"
  return topType && topType[1] > 0 ? topType[0] : "unknown";
}