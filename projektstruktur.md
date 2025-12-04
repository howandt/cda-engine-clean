# CD AI Systems - Komplet Projekt Struktur

## 📊 Hovedoversigt

Dit projekt består af **3 hovedsystemer** med delte data:

```
Projekt Rod/
├── CDA/           → Skolesystem (data og eksport)
├── public/        → Tilgængelige data til alle systemer
│   ├── CDA/       → CDA data (JSON filer)
│   ├── CDF/       → CDF moduler (Sarah/Ann)
│   └── cases/     → Cases til CDA/CDT
├── api/           → API endpoints til Vercel
└── DOCUMENTATION/ → Projekt dokumentation
```

---

## 🗂️ Detaljeret Struktur

### 1. CDA - Skolesystem (Udvikling & Data)

```
CDA/
├── cases/                    # Strukturerede cases (JSON)
│   ├── born/                # Cases fra barnets perspektiv
│   ├── fagperson/           # Cases for fagfolk
│   ├── familiesager/        # Familie-cases
│   ├── laerer/              # Lærer-cases
│   └── paedagoger/          # Pædagog-cases
│       ├── bornehave/
│       └── fritid/
│
├── data/                     # Hoved-datafiler
│   ├── CDA_Cases_Index_clean.json
│   ├── CDA_Diagnoser.json
│   ├── CDA_Emotionengine.json
│   ├── CDA_Komorbiditet.json
│   ├── CDA_PBL_Projects.json
│   ├── CDA_Quiz_Bank.json
│   ├── CDA_SpecialistPanel.json
│   ├── CDA_Templates.json
│   ├── rollespil_scenarier.json
│   └── semantic_engine.json
│
├── tools/                    # Python værktøjer
│   ├── cda_to_cdt_export.py
│   ├── cdt_module_builder.py
│   └── cdt_logger.py
│
├── export/                   # CDT eksport moduler
├── logs/                     # Session logs
├── meta/                     # System metadata
└── dev_notes/                # Udvikler noter
```

**Vigtig Note**: CDA/data/ er din "arbejdsmappe" - færdige filer kopieres til public/CDA/data/

---

### 2. Public - Tilgængelige Data (Production)

```
public/
├── CDA/
│   └── data/                 # Production CDA data (JSON)
│       ├── CDA_Cases_Index_clean.json
│       ├── CDA_Diagnoser.json
│       ├── CDA_Emotionengine.json
│       ├── CDA_Komorbiditet.json
│       ├── CDA_PBL_Projects.json
│       ├── CDA_Quiz_Bank.json
│       ├── CDA_SpecialistPanel.json
│       ├── CDA_Templates.json
│       ├── rollespil_scenarier.json
│       └── semantic_engine.json
│
├── CDF/
│   ├── CDF_Core.json         # Sarahs kernepersonlighed
│   └── modules/              # Alle CDF moduler
│       ├── cdf_master_modules.json    # Master index
│       ├── cdf_modules_index.json
│       ├── FoodLab.json
│       ├── HealthLab.json
│       ├── MoveLab.json
│       ├── GrowLab.json
│       ├── SupportLab.json
│       ├── SpecialistSupport.json
│       ├── PBLProjects.json  # Kopi fra CDA
│       ├── Emotions.json
│       ├── LifeFlow.json
│       ├── LifeTools.json
│       ├── CareLab.json
│       ├── CarmSpace.json
│       ├── GreenLab.json
│       ├── HobbyLab.json
│       ├── Hjemmeterapi.json
│       ├── CrisisSupport.json
│       ├── PushSupport.json
│       ├── AdaptCore.json
│       └── RecipesAndHealth.json
│
└── cases/                    # Markdown cases (originale)
    ├── navigation/           # Navigationsfiler
    │   ├── CDA_Cases_INDEKS.md
    │   ├── CDA_Cases_OVERSIGT.md
    │   └── README_CASEBANK.md
    │
    └── [diverse case-filer].md
```

---

### 3. API - Vercel Endpoints

```
api/
├── cdf/                      # CDF endpoints
│   ├── core.js              # Hovedmodul for CDF
│   └── test.js              # Test endpoint
│
├── cases.js                  # CDA cases endpoint
├── diagnoser.js              # Diagnoser endpoint
├── emotion-engine.js         # Emotion engine
├── komorbiditet.js           # Komorbiditet data
├── pbl-projects.js           # PBL projekter
├── quiz.js                   # Quiz system
├── rollespil.js              # Rollespil scenarier
├── semantic-search.js        # Semantisk søgning
├── specialister.js           # Specialistpanel
└── templates.js              # Templates
```

**API Struktur**:
- Alle API'er læser fra `public/CDA/data/` eller `public/CDF/modules/`
- De bliver tilgængelige på: `https://cda-engine-clean.vercel.app/api/[navn]`

---

### 4. Documentation

```
DOCUMENTATION/
├── CDA_Case_Schema.json      # Case struktur definition
├── DEV_ROADMAP.md            # Udviklings-roadmap
├── openapi.json              # API dokumentation
├── privacy_cdf.md            # Privacy for CDF
├── Professor_Personal_Endorsement.md
└── SYSTEM_FIL_PLACERING.md   # Fil placerings-guide
```

---

### 5. Backup & Scripts

```
api_backup/                   # Gamle API versioner
├── foodlab.js
└── healthlab.js

scripts/                      # Hjælpe-scripts
├── build-clean-index.js
└── semantic_matcher.js

blueprint/                    # Design dokumenter
├── CDF_Relationel_Hybridmodel_v1.md
└── README.md
```

---

## 🔄 Dataflow - Hvordan tingene hænger sammen

### CDA Data Flow
```
1. Udvikling: CDA/data/CDA_*.json
2. Production: public/CDA/data/CDA_*.json  (kopieres hertil)
3. API: api/*.js (læser fra public/CDA/data/)
4. Vercel: Tilgængelig på nettet
```

### CDF Data Flow
```
1. Udvikling: public/CDF/modules/*.json (direkte)
2. API: api/cdf/core.js (læser fra modules/)
3. Vercel: Tilgængelig til Sarah/Ann
```

### Cases Flow
```
1. Original: public/cases/*.md (markdown)
2. Struktureret: CDA/cases/**/*.json (opdelt efter rolle)
3. Index: public/CDA/data/CDA_Cases_Index_clean.json
4. API: api/cases.js
```

---

## 📍 Vigtige Placeringer

### Når du tilføjer NYE filer:

**CDA Data (diagnoser, templates, etc.)**:
1. Arbejd i: `CDA/data/`
2. Kopier til: `public/CDA/data/`
3. API læser automatisk fra public/

**CDF Moduler (Sarah)**:
- Direkte i: `public/CDF/modules/`
- API læser herfra

**Cases**:
- Markdown: `public/cases/`
- JSON struktur: `CDA/cases/[rolle]/`
- Navigation: `public/cases/navigation/`

**API Endpoints**:
- Ny fil: `api/[navn].js`
- Test lokalt: `vercel dev`
- Deploy: `git push` (automatisk til Vercel)

---

## 🚀 Workflow

### Når du vil opdatere data:

**For CDA**:
```bash
1. Rediger: CDA/data/CDA_[filnavn].json
2. Kopier til: public/CDA/data/
3. git add .
4. git commit -m "Opdateret [beskrivelse]"
5. git push
```

**For CDF**:
```bash
1. Rediger: public/CDF/modules/[filnavn].json
2. git add .
3. git commit -m "Opdateret [beskrivelse]"
4. git push
```

---

## 🎯 System Formål - Hurtig Reference

| System | Data Placering | API Endpoint | Formål |
|--------|---------------|--------------|---------|
| **CDA** | `public/CDA/data/` | `/api/cases`, `/api/diagnoser`, etc. | Skolesystem for fagfolk |
| **CDT** | Bruger CDA data | Samme som CDA | Interaktiv lærebog |
| **CDF** | `public/CDF/modules/` | `/api/cdf/core` | AI-ven Sarah/Ann |

---

## ⚠️ Vigtige Regler

1. **CDA og CDF er ADSKILTE**
   - CDA data: `public/CDA/data/`
   - CDF data: `public/CDF/modules/`
   
2. **Kopier, ikke flyt**
   - CDA udvikling: `CDA/data/` → kopier til `public/CDA/data/`
   - Behold begge versioner

3. **PBL Projects eksisterer 2 steder**
   - Original: `public/CDA/data/CDA_PBL_Projects.json`
   - CDF kopi: `public/CDF/modules/PBLProjects.json`
   - De kan være forskellige!

4. **API'er skal pege rigtigt**
   - `/api/pbl-projects.js` → læser fra `public/CDA/data/`
   - `/api/cdf/core.js` → læser fra `public/CDF/modules/`

---

## 📦 Node Modules

`node_modules/` - installerede pakker (ignoreres af Git)
- Express (web server)
- CORS (cross-origin)
- Diverse hjælpepakker

**Glem ikke**: `node_modules` skal ALDRIG pushes til Git!

---

## 🔍 Hurtig Navigation

**Vil du redigere**:
- Sarah's personlighed? → `public/CDF/CDF_Core.json`
- Sarah's moduler? → `public/CDF/modules/*.json`
- CDA diagnoser? → `public/CDA/data/CDA_Diagnoser.json`
- Cases? → `CDA/cases/**/*.json`
- API? → `api/*.js`

**Vil du se**:
- Hvordan cases er organiseret? → `public/cases/navigation/`
- System dokumentation? → `DOCUMENTATION/`
- API dokumentation? → `DOCUMENTATION/openapi.json`

---

## 💡 Tips til Nye Chats

Når du starter en ny chat, fortæl:

```
"Jeg arbejder på CD AI Systems med 3 systemer:
- CDA (skolesystem) → public/CDA/data/
- CDT (lærebog) → bruger CDA data
- CDF (AI-ven Sarah) → public/CDF/modules/

API'er ligger i /api/ og deployes til Vercel.
Jeg kender ikke kode - vi tager det trin-for-trin."
```

---

*Strukturen er klar og logisk opdelt. Hvert system har sit eget område, men de kan dele data når det giver mening.* 🌱
