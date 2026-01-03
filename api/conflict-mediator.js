import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { conflictType, query, userRole } = req.body;

    // Valider input
    if (!conflictType) {
      return res.status(400).json({ error: "conflictType is required" });
    }

    // Load templates
    const templatesPath = path.join(process.cwd(), "public", "CDA", "data", "CDA_Templates.json");
    const templatesRaw = fs.readFileSync(templatesPath, "utf8");
    const templatesData = JSON.parse(templatesRaw);

    // Map konflikttype til template ID
    const conflictTemplateMap = {
      "kulturel": "konflikt_kulturel_bro",
      "metode": "konflikt_pbl_valg",
      "lov": "konflikt_lov_praksis",
      "tillid": "konflikt_tillid_genopbyg",
      "ressource": "konflikt_tillid_genopbyg", // Brug tillid-genopbygger
      "observation": "konflikt_pbl_valg", // Brug PBL da det ofte er observationsforskel
    };

    const templateId = conflictTemplateMap[conflictType] || "konflikt_kulturel_bro";

    // Find template
    const template = templatesData.template_database.templates.find(
      t => t.id === templateId
    );

    if (!template) {
      return res.status(404).json({ 
        error: "Template not found",
        conflictType,
        templateId
      });
    }

    // Returner template med konflikt-kontekst
    return res.status(200).json({
      success: true,
      conflictDetected: true,
      conflictType,
      template: {
        id: template.id,
        title: template.title,
        description: template.content.description,
        purpose: template.content.purpose,
        use_cases: template.content.use_cases,
        specialists: template.ai_specialists,
        markdown: template.template_markdown,
        related_templates: template.related_templates
      },
      guidance: getConflictGuidance(conflictType, userRole),
      next_steps: getNextSteps(conflictType)
    });

  } catch (error) {
    console.error("❌ Conflict mediator error:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
}

// Giv kontekstuel vejledning baseret på konflikttype og brugerrolle
function getConflictGuidance(conflictType, userRole) {
  const guidance = {
    "kulturel": {
      "forælder": "Dette værktøj hjælper med at forklare dansk skolepraksis på en respektfuld måde. Brug tolk-funktionen hvis nødvendigt.",
      "lærer": "Dette værktøj giver kulturel kontekst om familiens baggrund og foreslår konkrete kommunikaionsstrategier.",
      "specialist": "Brug dette til at bygge bro mellem kulturelle forventninger og dansk skolesystem."
    },
    "metode": {
      "forælder": "Dette værktøj foreslår en 3-lektioners test af praktisk læring i stedet for lang diskussion.",
      "lærer": "Dette værktøj forklarer neuropsykologien bag praktisk læring og giver struktureret testforløb.",
      "specialist": "Brug dette til at mediere mellem forældres ønske om PBL og lærers bekymringer."
    },
    "lov": {
      "forælder": "Dette værktøj forklarer dansk lovgivning klart - nogle ting er ikke til forhandling.",
      "lærer": "Dette værktøj hjælper dig med at forklare lovkrav respektfuldt men fast.",
      "specialist": "Brug dette ved juridiske konflikter - det adskiller fast lov fra lokal praksis."
    },
    "tillid": {
      "forælder": "Dette værktøj viser objektiv historik over hvad der blev aftalt vs hvad der skete.",
      "lærer": "Dette værktøj hjælper med at genopbygge tillid gennem neutral dokumentation.",
      "specialist": "Brug dette når samarbejdet er brudt - det faciliterer vej tilbage til tillid."
    },
    "observation": {
      "forælder": "Barnet opfører sig forskelligt hjemme vs skole - lad os teste hvad der virker.",
      "lærer": "Forælders og lærers observationer er begge gyldige - brug testforløb til at finde løsning.",
      "specialist": "Observationskonflikter løses bedst gennem struktureret test, ikke diskussion."
    },
    "ressource": {
      "forælder": "Manglende ressourcer skaber frustration - lad os dokumentere behov og søge løsninger.",
      "lærer": "Ressourcemangel er reel - vis objektiv historik og søg hjælp udefra.",
      "specialist": "Dokumentér systematisk hvad der mangler og hvad konsekvensen er."
    }
  };

  return guidance[conflictType]?.[userRole] || guidance[conflictType]?.["specialist"] || "Brug denne template til at løse konflikten professionelt.";
}

// Foreslå konkrete næste skridt
function getNextSteps(conflictType) {
  const steps = {
    "kulturel": [
      "Aktiver tolk-funktion hvis relevant",
      "Forklar dansk skolepraksis konkret",
      "Lav fælles forventningsafstemning",
      "Aftale opfølgningsmøde om 1 måned"
    ],
    "metode": [
      "Lad barnet vælge mellem 2-3 PBL-projekter",
      "Gennemfør 3-lektioners testforløb",
      "Lærer observerer fokus, uro, engagement",
      "Evalueringsmøde efter 3 lektioner"
    ],
    "lov": [
      "Forklar hvilken lov der gælder",
      "Vis hvorfor loven eksisterer",
      "Tilbyd alternative løsninger inden for loven",
      "Henvise til skoleleder/kommune ved behov"
    ],
    "tillid": [
      "Vis objektiv historik over 3 måneder",
      "Identificer mønstre (hvad virkede, hvad ikke)",
      "Lav små, målbare aftaler",
      "Ugentlig kort check-in"
    ],
    "observation": [
      "Anerkend begge perspektiver",
      "Foreslå struktureret testforløb",
      "Observer i begge miljøer",
      "Brug data til beslutning"
    ],
    "ressource": [
      "Dokumentér præcis hvad der mangler",
      "Vis konsekvens af mangel",
      "Kontakt PPR/kommunal forvaltning",
      "Søg alternative løsninger"
    ]
  };

  return steps[conflictType] || [
    "Identificer kerneproblemet",
    "Lav konkret handlingsplan",
    "Aftale evaluering",
    "Inddrag PPR ved behov"
  ];
}