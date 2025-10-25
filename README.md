# CDA Engine – Specialist Panel

Dette repository indeholder **CDA Specialist Panel**, som anvendes af *CDA-GPT* i rådgivnings- og evalueringssystemet *Children Diagnosis Adviser (CDA)*.  
Panelet består af AI-baserede specialister, som kan simulere faglige råd, samarbejde i evalueringer og give differentieret feedback til lærere, forældre og fagpersoner.

---

## 🎯 Formål

Formålet med dette projekt er at gøre specialistpanelet tilgængeligt som en **dynamisk og valideret JSON-fil**, som CDA-systemet kan hente direkte via et offentligt API-endpoint (Vercel).

Systemet gør det muligt at:
- aktivere op til **3 AI-specialister** per case
- indhente flere faglige perspektiver
- generere en **samlet AI-evaluering**
- sikre ensartet tone, etik og struktur i al rådgivning

---

## 📁 Indhold

| Fil | Beskrivelse |
|------|--------------|
| `CDA_SpecialistPanel.json` | Komplet datasæt med alle AI-specialister (id, kategori, tone, keywords, eksempler) |
| `vercel.json` | Konfigurationsfil der gør panelet til et offentligt endpoint på Vercel |
| `README.md` | Denne beskrivelse af systemets funktion og brug |

---

## ⚙️ Teknisk opsætning

Projektet kan køres som statisk JSON-API via [Vercel](https://vercel.com):

1. Opret et projekt i Vercel og forbind det til dette repo  
2. Deploy → vent til bygningen er færdig  
3. JSON-filen vil være tilgængelig herfra:  
https://cda-engine.vercel.app/CDA_SpecialistPanel.json

yaml
Kopier kode

---

## 🧠 Anvendelse i CDA-GPT

- *Heidi* (systemets primære AI-guide) anvender panelet i baggrunden til at hente rådgivning.  
- Brugere kan spørge direkte:  
> “Hvad siger AI-Psychologist Sara Holm om dette barn?”  
- Panelet returnerer specialisters stemme og synspunkt ud fra toneprofiler og keywords.  
- Alle specialister kan **kun rådgive**, ikke diagnosticere eller ordinere medicin.

---

## 🧩 Versionering

| Version | Dato | Kommentar |
|----------|------|-----------|
| **v2025.4** | 2025-10-25 | Valideret JSON-struktur, kategorisering, toneprofiler og keywords |
| **v2025.5** | (kommende) | Integrationstest og automatisk synkronisering med CDA-GPT |

Versionsstyring sker via Git-tags, fx:
git tag -a v2025.4 -m "CDA Specialist Panel – validated version"
git push origin main --tags

yaml
Kopier kode

---

## 👤 Udviklet af

**Hans-Ole Wandt**  
Psykoterapeut, specialist i børne- og diagnosearbejde  
Udvikler af CDA, CDT og Ann – *Children Diagnosis AI Systems*  
📍 Danmark  
🔗 https://cdaisystems.com  

---

© 2025 CDA Systems – *All rights reserved*