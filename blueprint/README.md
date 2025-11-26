# 🧩 Blueprint – Systemdesign & Dokumentation

Denne mappe indeholder alle *arkitektur- og designbeskrivelser* for **CD AI Systems**' projekter.  
Blueprint-filer bruges som **fundament for udvikling**, ikke som kode.  
De definerer logik, struktur og filosofi for systemerne **CDA**, **CDT** og **CDF**.

---

## 📘 Indhold
| Fil | Formål |
|------|---------|
| `CDA_Roadmap.md` *(kommer)* | Arkitektur og datastruktur for skoleplatformen |
| `CDT_Basic_Pro_Blueprint.md` | Struktur og licensmodel for CDT-læringssystemet |
| `CDF_Relationel_Hybridmodel_v1.md` | Fundament for AI-vennen og tutor (livslang hybridmodel) |
| `README.md` | Denne oversigt |

---

## 🧱 Formål
Blueprints beskriver:
- den **konceptuelle arkitektur** for hvert subsystem  
- hvordan **API’er, data og empati-engine** arbejder sammen  
- hvilke **designprincipper** der ligger bag brugeroplevelsen  

---

## 🌿 Nyt i systemet
### **CDF – Relationel Hybridmodel**
CDF er den tredje søjle i CD AI Systems.  
Den beskriver en **livslang AI-ven og tutor**, som bygger videre på CDA’s empati og CDT’s læringslogik.  
AI’en udvikler sig sammen med brugeren, og fungerer som *ven, rådgiver og guide* i alle livets faser.

> Fundamentet for CDF (v1) er baseret på en *relationel hybridmodel* –  
> AI’en deltager aktivt, men styrer ikke. Den mærker, hvornår noget betyder noget.

---

## ⚙️ Brug
Blueprint-filer:
- bruges som reference under udvikling  
- dokumenteres parallelt med Vercel/API-implementeringerne  
- ligger til grund for datafiler og endpoints i `/data/` og `/api/`

---

**Bemærk:**  
Blueprints er *statisk dokumentation* og skal ikke kaldes som endpoints.  
Al logik og data implementeres via CDA-engine’s API-struktur.
