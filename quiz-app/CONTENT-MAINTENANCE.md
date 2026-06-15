# Innehållsunderhåll — Affärsmannaskap-quiz

Guide för att förbättra frågor, facit och coach-feedback.

## Var innehållet bor

| Fil | Innehåll |
|-----|----------|
| `src/logic/questions.ts` | Frågor + facit (`answer`, `why`, `example`) |
| `src/logic/rubrics.ts` | Coach-bedömning: nyckelord, misconceptions, memoryRule |
| `feedback and questions.md` | Arbetslogg — klistra in problem innan du fixar |

## Facit-fält i appen

- **answer** — visas som "Facit — Modellssvar" (viktigast för studenten)
- **why** — "Varför viktigt?" (expanderbar)
- **example** — konkret exempel (expanderbar)
- **memoryRule** (i rubrics) — visas under "Varför viktigt?" som "Kom ihåg: …"

Facit ska vara självförklarande: definiera begrepp, visa kedjan (A → B → beslut) och avsluta med vad ett starkt svar innehåller.

## Arbetsflöde

### 1. Hitta svagt facit

Öva i appen (`npm run dev`). Anteckna när facit är:

- för kort eller vagt ("rutorna ska hänga ihop")
- saknar begreppsförklaring (FAB, SWOT, SLA, …)
- saknar *varför* (inte bara *vad*)

### 2. Logga i feedback-filen

Öppna `feedback and questions.md` och lägg till under **Öppna ärenden** med mallen:

```markdown
### [fråge-id eller frågetext]

**Problem:** Vad saknas eller är otydligt?

**Förslag:** Vad facit bör förklara.

**Status:** öppen | fixad
```

### 3. Uppdatera facit

Redigera `questions.ts` för samma `id`:

1. Skriv om `answer` — tydlig modellkedja, 3–6 meningar
2. Justera `why` om syftet med frågan behöver förtydligas
3. Uppdatera `example` om det ska spegla det nya facit

### 4. Synka coach (vid behov)

Om facit kräver nya nyckelord, uppdatera `rubrics.ts` för samma `id`:

- `requiredConcepts` / `concepts` — vad coachen letar efter
- `memoryRule` — kort regel under fördjupning
- `misconceptions` — vanliga feltolkningar

### 5. Validera och bygg

```bash
npm run validate:content   # kontrollerar att allt hänger ihop
npm run build              # TypeScript + produktionsbygge
```

### 6. Markera fixad och deploya

- Sätt **Status: fixad** i feedback-filen
- Merge till `main` → GitHub Pages deployas automatiskt (`.github/workflows/deploy-pages.yml`)

## Checklista för bra facit

- [ ] Begrepp förklaras vid första nämnandet (FAB, BMC, SLA, …)
- [ ] Kedja är tydlig: situation → analys → beslut/nytta
- [ ] Svarar på *varför* frågan ställs, inte bara listar buzzwords
- [ ] `example` matchar facit och är konkret (IT-konsult-kontext)
- [ ] Rubric finns för samma `id` i `FOKUS_RUBRICS`

## Fokusfrågor (tentamen, 30 st)

De första 30 öppna frågorna i `FOKUS_QUESTIONS` (före sälj/affärsplan-tilläggen) är tentamens kärna. Prioritera dessa vid innehållsgranskning.

Kör `npm run validate:content` för lista med status per fråga.