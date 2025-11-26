# CDA Engine – Dataserver (v2025.11)

Dette repository udgør **den officielle dataserver for CD AI Systems** – herunder *CDA, CDT og CDF*.  
Repoet stiller validerede data og dokumenter til rådighed for AI-baseret rådgivning, læring og personlig støtte.

---

## 🎯 Formål

At levere **rene, vedligeholdelsesvenlige og dynamiske JSON- og markdown-datasæt** til brug i:

- **CDA-GPT** (Children Diagnosis Adviser) – skole- og diagnosesystem  
- **CDT-GPT** (Cognitive Diagnostic Training) – digital lærebog og læringssystem  
- **CDF-GPT** (Companion Diagnostic Friend) – personlig AI-ven og livsvejleder  

Dataserveren er **frontend-uafhængig** og hostes via **GitHub + Vercel** som statisk API.

---

## 🧩 Systemoversigt

| System | Formål | Status |
|--------|---------|--------|
| **CDA** | Skoleplatform for børn med særlige behov | ✅ Færdig prototype |
| **CDT** | Lærebog og træningsværktøj for lærere og fagfolk | ⚙️ I udvikling |
| **CDF** | Livslang AI-ven og tutor (relationel hybridmodel) | 🔄 Designfase |

---

## 📁 Struktur og indhold

| Mappe / fil | Indhold |
|-------------|----------|
| `/api/` | Vercel API-endpoints (data, diagnoser, emotion-engine, osv.) |
| `/data/` | JSON-databiblioteker til CDA, CDT og CDF |
| `/blueprint/` | Systemdesign, arkitektur og dokumentation |
| `/public/cases/` | Kliniske cases i `.md`-format med metadata |
| `/diagnoser/` | Markdown-filer for hver diagnose (ADHD, ASF, angst...) |
| `/templates/` | Skabeloner til intervention, støtte og kommunikation |
| `/scripts/` | Hjælpescripts (fx clean-index-generator) |
| `vercel.json` | Konfiguration til Vercel API-hosting |

---

## ⚙️ Teknisk brug

1. Klon repo:
   ```bash
   git clone https://github.com/[bruger]/cda-engine-clean.git

