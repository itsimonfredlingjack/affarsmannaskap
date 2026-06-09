export interface Criterion {
  key: string;
  label: string;
  accepted: string[];
}

export interface Concept {
  key: string;
  label: string;
  accepted: string[];
  aliases?: string[];
  signals?: string[];
}

export interface Misconception {
  id: string;
  label: string;
  signals: string[];
  explanation: string;
  examples?: string[];
}

export interface CompoundRule {
  key: string;
  minMatches: number;
  from: string[];
  label?: string;
}

export interface Rubric {
  id: string;
  correctRequires?: string[];
  almostRequiresAny?: string[];
  criteria?: Criterion[];
  commonMistakes?: string[];
  concepts?: Concept[];
  requiredConcepts?: string[];
  supportingConcepts?: string[];
  misconceptions?: Misconception[];
  goodExamples?: string[];
  almostExamples?: string[];
  wrongExamples?: string[];
  memoryRule?: string;
  feedbackTemplates?: Record<string, string>;
  compound?: CompoundRule[];
}

export const FOKUS_RUBRICS: Record<string, Rubric> = {
  "soliditet": {
    id: "soliditet",
    correctRequires: ["equity", "relation"],
    almostRequiresAny: ["equity", "relation"],
    criteria: [
      { key: "equity", label: "Nämner eget kapital", accepted: ["eget kapital", "ägarnas kapital", "kapital"] },
      { key: "relation", label: "Kopplar till totala tillgångar", accepted: ["totala tillgångar", "balansomslutning", "i relation till tillgångar", "andel av tillgångarna"] },
      { key: "meaning", label: "Förklarar motståndskraft eller risk", accepted: ["motståndskraft", "risk", "buffert", "långsiktig", "stabilitet"] }
    ],
    commonMistakes: [
      "Säger bara hur mycket eget kapital man har.",
      "Blandar ihop soliditet med likviditet."
    ],
    concepts: [
      { key: "equity", label: "eget kapital", accepted: ["eget kapital", "ägarnas kapital", "ägarnas pengar", "ägarkapital"] },
      { key: "relation", label: "andel eller relation", accepted: ["andel", "hur stor del", "i relation till", "delat med", "dividerat med", "finansierade med", "i stället för lån"] },
      { key: "assets", label: "tillgångar", accepted: ["tillgångar", "totala tillgångar", "balansomslutning", "företagets tillgångar"] },
      { key: "stability", label: "långsiktig stabilitet", accepted: ["stabilitet", "stabilt", "motståndskraft", "risk", "långsiktig", "buffert"] }
    ],
    requiredConcepts: ["equity", "relation"],
    supportingConcepts: ["assets", "stability"],
    misconceptions: [
      {
        id: "likviditet",
        label: "likviditet",
        signals: ["pengar i kassan", "kassa", "betala fakturor", "betala skulder snabbt", "kortsiktig betalningsförmåga", "likvida medel"],
        explanation: "Likviditet handlar om kortsiktig betalningsförmåga. Soliditet handlar om eget kapital i relation till tillgångar."
      },
      {
        id: "lonsamhet",
        label: "lönsamhet",
        signals: ["vinst", "tjäna pengar", "går med plus", "lönsam"],
        explanation: "Lönsamhet handlar om vinst. Soliditet handlar om hur tillgångarna är finansierade."
      }
    ],
    goodExamples: [
      "Det visar hur stor del av tillgångarna som är finansierade med ägarnas kapital i stället för lån.",
      "Soliditet är eget kapital delat med totala tillgångar."
    ],
    almostExamples: ["Det handlar om hur stabilt företaget är."],
    wrongExamples: ["Det betyder pengar i kassan så företaget kan betala fakturor snabbt.", "gris"],
    memoryRule: "Soliditet = ägarnas andel av det företaget äger.",
    feedbackTemplates: {
      confused_with: "Det här låter mer som {misconception}, inte soliditet. Rätt svar står i facit nedan."
    }
  },
  "likviditet": {
    id: "likviditet",
    correctRequires: ["shortTerm"],
    almostRequiresAny: ["shortTerm", "cash"],
    criteria: [
      { key: "shortTerm", label: "Förklarar kortsiktig betalningsförmåga", accepted: ["kortsiktig betalningsförmåga", "betala korta skulder", "betala skulder i tid", "kort sikt", "kortsiktigt kunna betala"] },
      { key: "cash", label: "Kopplar till pengar eller kassa", accepted: ["pengar", "kassa", "bank", "likvida medel"] },
      { key: "notProfit", label: "Skiljer från vinst eller resultat", accepted: ["inte samma som vinst", "inte vinst", "resultat", "lönsamhet"] }
    ],
    commonMistakes: [
      "Säger att likviditet betyder att bolaget går med vinst.",
      "Blandar ihop likviditet med soliditet."
    ],
    concepts: [
      { key: "shortTerm", label: "kortsiktig betalningsförmåga", accepted: ["kortsiktig betalningsförmåga", "kort sikt", "betala skulder i tid", "betala fakturor", "betala korta skulder", "betala sina korta skulder"] },
      { key: "cash", label: "pengar eller kassa", accepted: ["pengar", "kassa", "bank", "likvida medel", "pengar i kassan"] },
      { key: "notProfit", label: "skiljer från vinst", accepted: ["inte samma som vinst", "inte vinst", "inte resultat", "lönsamhet"] }
    ],
    requiredConcepts: ["shortTerm"],
    supportingConcepts: ["cash", "notProfit"],
    misconceptions: [
      {
        id: "soliditet",
        label: "soliditet",
        signals: ["eget kapital", "ägarnas kapital", "totala tillgångar", "balansomslutning", "långsiktig stabilitet"],
        explanation: "Soliditet handlar om eget kapital i relation till tillgångar. Likviditet handlar om betalningsförmåga på kort sikt."
      },
      {
        id: "lonsamhet",
        label: "lönsamhet",
        signals: ["vinst", "förlust", "går med plus", "resultat"],
        explanation: "Lönsamhet handlar om resultat. Likviditet handlar om pengar att betala med när skulder förfaller."
      }
    ],
    memoryRule: "Likviditet = kan företaget betala nu?",
    goodExamples: ["Om företaget kan betala sina kortfristiga skulder med pengar och likvida medel."],
    almostExamples: ["Det handlar om pengar i företaget."],
    wrongExamples: ["Det visar hur mycket eget kapital företaget har."]
  },
  "resultatrakning": {
    id: "resultatrakning",
    correctRequires: ["income", "cost", "period"],
    almostRequiresAny: ["income", "cost", "profitLoss"],
    criteria: [
      { key: "income", label: "Nämner intäkter", accepted: ["intäkter", "omsättning", "nettoomsättning", "försäljning"] },
      { key: "cost", label: "Nämner kostnader", accepted: ["kostnader", "utgifter", "minus kostnader"] },
      { key: "period", label: "Förstår att den gäller en period", accepted: ["period", "under året", "under en tid", "räkenskapsår"] },
      { key: "profitLoss", label: "Kopplar till vinst, förlust eller resultat", accepted: ["vinst", "förlust", "resultat", "årets resultat"] }
    ],
    commonMistakes: [
      "Blandar ihop resultaträkning med balansräkning.",
      "Tittar bara på omsättning och glömmer kostnader."
    ],
    concepts: [
      { key: "income", label: "intäkter", accepted: ["intäkter", "omsättning", "nettoomsättning", "försäljning"] },
      { key: "cost", label: "kostnader", accepted: ["kostnader", "utgifter", "minus kostnader"] },
      { key: "period", label: "period", accepted: ["period", "under året", "under en tid", "räkenskapsår"] },
      { key: "profitLoss", label: "resultat", accepted: ["vinst", "förlust", "resultat", "årets resultat"] }
    ],
    requiredConcepts: ["income", "cost"],
    supportingConcepts: ["period", "profitLoss"],
    misconceptions: [
      {
        id: "balansrakning",
        label: "balansräkning",
        signals: ["tillgångar", "skulder", "eget kapital", "balansdag", "vid ett datum"],
        explanation: "Balansräkningen visar tillgångar, skulder och eget kapital vid en tidpunkt. Resultaträkningen visar intäkter och kostnader under en period."
      }
    ],
    memoryRule: "Resultaträkning = intäkter minus kostnader under en period.",
    goodExamples: ["Den visar intäkter och kostnader under året och om det blir vinst eller förlust."],
    almostExamples: ["Den visar om företaget går med vinst."],
    wrongExamples: ["Den visar företagets tillgångar och skulder."]
  },
  "balansrakning": {
    id: "balansrakning",
    correctRequires: ["assets", "liabilities", "equity", "pointInTime"],
    almostRequiresAny: ["assets", "liabilities", "equity"],
    criteria: [
      { key: "assets", label: "Nämner tillgångar", accepted: ["tillgångar", "omsättningstillgångar", "anläggningstillgångar"] },
      { key: "liabilities", label: "Nämner skulder", accepted: ["skulder", "kortfristiga skulder", "långfristiga skulder"] },
      { key: "equity", label: "Nämner eget kapital", accepted: ["eget kapital", "ägarnas kapital"] },
      { key: "pointInTime", label: "Förstår att den gäller en tidpunkt", accepted: ["tidpunkt", "balansdag", "vid ett datum", "en viss dag"] }
    ],
    commonMistakes: [
      "Läser balansräkningen som om den visar försäljning över tid.",
      "Glömmer eget kapital."
    ],
    concepts: [
      { key: "assets", label: "tillgångar", accepted: ["tillgångar", "omsättningstillgångar", "anläggningstillgångar"] },
      { key: "liabilities", label: "skulder", accepted: ["skulder", "kortfristiga skulder", "långfristiga skulder"] },
      { key: "equity", label: "eget kapital", accepted: ["eget kapital", "ägarnas kapital"] },
      { key: "pointInTime", label: "tidpunkt", accepted: ["tidpunkt", "balansdag", "vid ett datum", "en viss dag"] }
    ],
    requiredConcepts: ["assets", "liabilities", "equity"],
    supportingConcepts: ["pointInTime"],
    misconceptions: [
      {
        id: "resultatrakning",
        label: "resultaträkning",
        signals: ["intäkter", "kostnader", "omsättning", "vinst", "förlust", "under året"],
        explanation: "Resultaträkningen visar intäkter och kostnader över en period. Balansräkningen visar tillgångar, skulder och eget kapital vid a tidpunkt."
      }
    ],
    memoryRule: "Balansräkning = vad företaget äger och hur det är finansierat."
  },
  "eget-kapital": {
    id: "eget-kapital",
    correctRequires: ["assetsMinusLiabilities"],
    almostRequiresAny: ["assetsMinusLiabilities", "owners"],
    criteria: [
      { key: "assetsMinusLiabilities", label: "Förklarar tillgångar minus skulder", accepted: ["tillgångar minus skulder", "tillgångar - skulder", "skillnaden mellan tillgångar och skulder"] },
      { key: "owners", label: "Kopplar till ägarnas kapital", accepted: ["ägarnas kapital", "ägare", "ägarnas del", "kapital i bolaget"] },
      { key: "buffer", label: "Nämner buffert, risk eller soliditet", accepted: ["buffert", "risk", "soliditet", "motståndskraft"] }
    ],
    commonMistakes: [
      "Säger bara pengar på banken.",
      "Blandar ihop eget kapital med omsättning."
    ],
    concepts: [
      { key: "assetsMinusLiabilities", label: "tillgångar minus skulder", accepted: ["tillgångar minus skulder", "tillgångar - skulder", "skillnaden mellan tillgångar och skulder"] },
      { key: "owners", label: "ägarnas del", accepted: ["ägarnas kapital", "ägarnas del", "ägare", "kapital i bolaget", "ägarkapital"] },
      { key: "buffer", label: "buffert eller risk", accepted: ["buffert", "risk", "soliditet", "motståndskraft"] }
    ],
    requiredConcepts: ["assetsMinusLiabilities"],
    supportingConcepts: ["owners", "buffer"],
    misconceptions: [
      {
        id: "kassa",
        label: "kassa",
        signals: ["pengar på banken", "kassa", "likvida medel"],
        explanation: "Kassa är pengar som finns tillgängliga. Eget kapital är skillnaden mellan tillgångar och skulder."
      }
    ],
    memoryRule: "Eget kapital = tillgångar minus skulder."
  },
  "kassaflode": {
    id: "kassaflode",
    correctRequires: ["cashInOut"],
    almostRequiresAny: ["cashInOut", "time"],
    criteria: [
      { key: "cashInOut", label: "Nämner pengar in och ut", accepted: ["pengar in och ut", "pengar kommer in", "pengar går ut", "inbetalningar och utbetalningar"] },
      { key: "time", label: "Förstår att det sker över tid", accepted: ["över tid", "under en period", "löpande", "period"] },
      { key: "notResult", label: "Skiljer från resultat", accepted: ["inte samma som resultat", "resultat", "vinst", "likviditet"] }
    ],
    commonMistakes: [
      "Tror att positivt resultat automatiskt betyder bra kassaflöde.",
      "Blandar ihop kassaflöde med omsättning."
    ],
    concepts: [
      { key: "cashInOut", label: "pengar in och ut", accepted: ["pengar in och ut", "pengar kommer in", "pengar som kommer in", "pengar går ut", "går ut", "inbetalningar och utbetalningar"] },
      { key: "time", label: "över tid", accepted: ["över tid", "under en period", "löpande", "period"] },
      { key: "notResult", label: "skiljer från resultat", accepted: ["inte samma som resultat", "inte vinst", "resultat", "vinst"] }
    ],
    requiredConcepts: ["cashInOut"],
    supportingConcepts: ["time", "notResult"],
    misconceptions: [
      {
        id: "resultat",
        label: "resultat",
        signals: ["vinst", "förlust", "intäkter minus kostnader", "årets resultat"],
        explanation: "Resultat är intäkter minus kostnader. Kassaflöde handlar om faktiska pengar in och ut."
      }
    ],
    memoryRule: "Kassaflöde = pengar som faktiskt rör sig."
  },
  "tackningsbidrag": {
    id: "tackningsbidrag",
    correctRequires: ["income", "directCosts"],
    almostRequiresAny: ["income", "directCosts"],
    criteria: [
      { key: "income", label: "Nämner intäkt eller försäljning", accepted: ["intäkt", "försäljning", "försäljningsintäkt", "säljs för"] },
      { key: "directCosts", label: "Nämner direkta kostnader", accepted: ["direkta kostnader", "rörliga kostnader", "kostar direkt", "minus kostnader"] },
      { key: "contribution", label: "Förstår bidrag till fasta kostnader eller vinst", accepted: ["fasta kostnader", "vinst", "marginal", "bidrar"] }
    ],
    commonMistakes: [
      "Kallar hela intäkten för vinst.",
      "Glömmer att direkta kostnader ska dras av."
    ],
    concepts: [
      { key: "income", label: "intäkt", accepted: ["intäkt", "försäljning", "försäljningsintäkt", "säljs för"] },
      { key: "directCosts", label: "direkta eller rörliga kostnader", accepted: ["direkta kostnader", "rörliga kostnader", "kostar direkt", "minus kostnader"] },
      { key: "contribution", label: "bidrag till fasta kostnader/vinst", accepted: ["fasta kostnader", "vinst", "marginal", "bidrar"] }
    ],
    requiredConcepts: ["income", "directCosts"],
    supportingConcepts: ["contribution"],
    misconceptions: [
      {
        id: "vinst",
        label: "vinst",
        signals: ["hela intäkten", "allt man säljer för", "omsättningen"],
        explanation: "Täckningsbidrag är inte hela intäkten. Direkta kostnader ska dras bort först."
      }
    ],
    memoryRule: "Täckningsbidrag = intäkt minus direkta kostnader."
  },
  "budget-prognos": {
    id: "budget-prognos",
    correctRequires: ["plan", "updatedView"],
    almostRequiresAny: ["plan", "updatedView"],
    criteria: [
      { key: "plan", label: "budget är plan i förväg", accepted: ["plan i förväg", "plan", "budgetera", "mål i förväg"] },
      { key: "updatedView", label: "prognos är uppdaterad bedömning", accepted: ["uppdaterad bedömning", "bedömning", "utfall verkar bli", "prognos", "justerad"] }
    ],
    concepts: [
      { key: "plan", label: "budget är plan i förväg", accepted: ["budget är planen", "plan i förväg", "budgetera", "mål i förväg"] },
      { key: "updatedView", label: "prognos är uppdaterad bedömning", accepted: ["prognos är en uppdaterad bedömning", "uppdaterad bedömning", "hur utfallet verkar bli", "justerar prognosen"] }
    ],
    requiredConcepts: ["plan", "updatedView"],
    supportingConcepts: [],
    misconceptions: [
      {
        id: "samma-sak",
        label: "budget och prognos som samma sak",
        signals: ["samma sak", "ingen skillnad"],
        explanation: "Budget är planen i förväg. Prognos är den uppdaterade bedömningen när verkligheten börjar synas."
      }
    ],
    memoryRule: "Budget = plan. Prognos = ny bedömning."
  },
  "arsredovisning": {
    id: "arsredovisning",
    correctRequires: ["twoParts"],
    almostRequiresAny: ["twoParts", "purpose"],
    criteria: [
      { key: "managementReport", label: "Nämner förvaltningsberättelse", accepted: ["förvaltningsberättelse"] },
      { key: "incomeStatement", label: "Nämner resultaträkning", accepted: ["resultaträkning"] },
      { key: "balanceSheet", label: "Nämner balansräkning", accepted: ["balansräkning"] },
      { key: "notesAudit", label: "Nämner noter eller revision", accepted: ["noter", "revisionsberättelse", "revision"] },
      { key: "purpose", label: "Förklarar att den visar hur bolaget mår", accepted: ["hur bolaget mår", "ekonomi och verksamhet", "sammanhang", "helhet"] }
    ],
    compound: [{ key: "twoParts", minMatches: 2, from: ["managementReport", "incomeStatement", "balanceSheet", "notesAudit"] }],
    commonMistakes: [
      "Läser bara en siffra utan sammanhang.",
      "Tror att årsredovisning bara är resultaträkning."
    ]
  },
  "bmc": {
    id: "bmc",
    correctRequires: ["businessModel", "value"],
    almostRequiresAny: ["businessModel", "value", "money"],
    criteria: [
      { key: "businessModel", label: "Förstår att BMC beskriver affärsmodellen", accepted: ["affärsmodell", "hur företaget fungerar", "hur bolaget fungerar"] },
      { key: "value", label: "Nämner värdeskapande, kund eller erbjudande", accepted: ["värde", "värdeskapande", "kund", "erbjudande", "värdeerbjudande"] },
      { key: "money", label: "Nämner intäkter, kostnader eller resurser", accepted: ["intäkter", "kostnader", "resurser", "nyckelresurser"] }
    ],
    concepts: [
      { key: "businessModel", label: "affärsmodell", accepted: ["affärsmodell", "hur företaget fungerar", "hur bolaget fungerar"] },
      { key: "value", label: "värde/kund/erbjudande", accepted: ["värde", "värdeskapande", "kund", "erbjudande", "värdeerbjudande"] },
      { key: "money", label: "intäkter/kostnader/resurser", accepted: ["intäkter", "kostnader", "resurser", "nyckelresurser"] }
    ],
    requiredConcepts: ["businessModel", "value"],
    supportingConcepts: ["money"],
    commonMistakes: [
      "Fyller rutorna utan röd tråd.",
      "Beskriver produkten och missar intäkter/kostnader."
    ],
    memoryRule: "BMC visar hur affären skapar, levererar och fångar värde."
  },
  "vardeerbjudande": {
    id: "vardeerbjudande",
    correctRequires: ["customerNeed", "whyChoose"],
    almostRequiresAny: ["customerNeed", "whyChoose"],
    criteria: [
      { key: "customerNeed", label: "Utgår från kundens problem eller nytta", accepted: ["kundnytta", "kundens nytta", "problem", "behov", "löser"] },
      { key: "whyChoose", label: "Förklarar varför kunden ska välja erbjudandet", accepted: ["varför kunden ska välja", "välja oss", "differentiering", "alternativ"] },
      { key: "concretePromise", label: "Är konkret, inte bara en slogan", accepted: ["konkret", "löfte", "erbjudande", "nytta"] }
    ],
    commonMistakes: [
      "Skriver en slogan i stället för ett konkret löfte.",
      "Beskriver funktioner utan kundnytta."
    ]
  },
  "fab": {
    id: "fab",
    correctRequires: ["feature", "advantage", "benefit"],
    almostRequiresAny: ["feature", "advantage", "benefit"],
    criteria: [
      { key: "feature", label: "Nämner egenskap", accepted: ["egenskap", "feature", "funktion"] },
      { key: "advantage", label: "Nämner fördel", accepted: ["fördel", "advantage"] },
      { key: "benefit", label: "Nämner kundnytta", accepted: ["kundnytta", "nytta", "benefit"] }
    ],
    concepts: [
      { key: "feature", label: "egenskap", accepted: ["egenskap", "feature", "funktion"] },
      { key: "advantage", label: "fördel", accepted: ["fördel", "advantage"] },
      { key: "benefit", label: "kundnytta", accepted: ["kundnytta", "nytta", "benefit"] }
    ],
    requiredConcepts: ["feature", "advantage", "benefit"],
    supportingConcepts: [],
    commonMistakes: [
      "Stannar vid egenskaper.",
      "Blandar ihop fördel och kundnytta."
    ],
    memoryRule: "FAB = egenskap, fördel, kundnytta."
  },
  "swot": {
    id: "swot",
    correctRequires: ["internal", "external"],
    almostRequiresAny: ["strengthWeakness", "opportunityThreat", "internal", "external"],
    criteria: [
      { key: "strengthWeakness", label: "Nämner styrkor och svagheter", accepted: ["styrkor och svagheter", "styrkor", "svagheter"] },
      { key: "opportunityThreat", label: "Nämner möjligheter och hot", accepted: ["möjligheter och hot", "möjligheter", "hot"] },
      { key: "internal", label: "Skiljer interna faktorer", accepted: ["internt", "interna", "inne i bolaget"] },
      { key: "external", label: "Skiljer externa faktorer", accepted: ["externt", "externa", "omvärld"] }
    ],
    concepts: [
      { key: "strengthWeakness", label: "styrkor/svagheter", accepted: ["styrkor och svagheter", "styrkor", "svagheter"] },
      { key: "opportunityThreat", label: "möjligheter/hot", accepted: ["möjligheter och hot", "möjligheter", "hot"] },
      { key: "internal", label: "internt", accepted: ["internt", "interna", "inne i bolaget"] },
      { key: "external", label: "externt", accepted: ["externt", "externa", "omvärld"] }
    ],
    requiredConcepts: ["internal", "external"],
    supportingConcepts: ["strengthWeakness", "opportunityThreat"],
    commonMistakes: [
      "Lägger externa hot som interna svagheter.",
      "Gör SWOT till en åsiktslista utan beslut."
    ],
    memoryRule: "SWOT = internt starkt/svagt och externt omvärldshot/möjlighet."
  },
  "pestelid": {
    id: "pestelid",
    correctRequires: ["outsideFactors", "businessImpact"],
    almostRequiresAny: ["outsideFactors", "businessImpact", "examples"],
    criteria: [
      { key: "outsideFactors", label: "Förstår att PESTELID är omvärldsanalys", accepted: ["omvärldsanalys", "omvärld", "faktorer utanför", "externa faktorer"] },
      { key: "examples", label: "Nämner typer av faktorer", accepted: ["politiskt", "ekonomiskt", "socialt", "teknologiskt", "legalt", "miljö", "demografi"] },
      { key: "businessImpact", label: "Kopplar faktorerna till affären", accepted: ["påverkar affären", "påverkar efterfrågan", "risk", "möjlighet", "marknad"] }
    ],
    concepts: [
      { key: "outsideFactors", label: "omvärldsanalys", accepted: ["omvärldsanalys", "omvärld", "faktorer utanför", "externa faktorer"] },
      { key: "examples", label: "faktortyper", accepted: ["politiskt", "ekonomiskt", "socialt", "teknologiskt", "legalt", "miljö", "demografi"] },
      { key: "businessImpact", label: "påverkan på affären", accepted: ["påverkar affären", "påverkar efterfrågan", "risk", "möjlighet", "marknad"] }
    ],
    requiredConcepts: ["outsideFactors", "businessImpact"],
    supportingConcepts: ["examples"],
    commonMistakes: [
      "Fyller alla rutor utan att prioritera.",
      "Beskriver omvärlden utan att koppla till affären."
    ],
    memoryRule: "PESTELID = omvärldsfaktorer som påverkar affären."
  },
  "ansoff": {
    id: "ansoff",
    correctRequires: ["product", "market"],
    almostRequiresAny: ["product", "market", "growthRisk"],
    criteria: [
      { key: "product", label: "Nämner produkt eller tjänst", accepted: ["produkt", "tjänst", "erbjudande"] },
      { key: "market", label: "Nämner marknad", accepted: ["marknad", "kundgrupp", "kundsegment"] },
      { key: "growthRisk", label: "Kopplar till tillväxt eller risk", accepted: ["tillväxt", "risk", "diversifiering", "marknadspenetration"] }
    ],
    concepts: [
      { key: "product", label: "produkt/tjänst", accepted: ["produkt", "tjänst", "erbjudande"] },
      { key: "market", label: "marknad", accepted: ["marknad", "kundgrupp", "kundsegment"] },
      { key: "growthRisk", label: "tillväxt/risk", accepted: ["tillväxt", "risk", "diversifiering", "marknadspenetration"] }
    ],
    requiredConcepts: ["product", "market"],
    supportingConcepts: ["growthRisk"],
    commonMistakes: [
      "Glömmer att matrisen har både produkt och marknad.",
      "Tror att hög risk alltid är fel."
    ],
    memoryRule: "Ansoff = gammal/ny produkt mot gammal/ny marknad."
  },
  "halsos-essiq-jamfor-case": {
    id: "halsos-essiq-jamfor-case",
    correctRequires: ["essiqStronger", "halsoWeaker", "twoMeasures"],
    almostRequiresAny: ["essiqStronger", "halsoWeaker", "measures"],
    criteria: [
      { key: "essiqStronger", label: "Ser att Essiq AB står starkare resultatmässigt", accepted: ["essiq", "vinst", "positivt resultat", "starkare resultat"] },
      { key: "halsoWeaker", label: "Ser att Hälsö Fisk AB är mer pressat", accepted: ["hälsö", "halso", "fisk", "förlust", "pressad", "11 procent"] },
      { key: "resultMeasure", label: "Använder resultat som AM5-mått", accepted: ["resultat", "vinst", "förlust"] },
      { key: "liquidityMeasure", label: "Använder likviditet som AM5-mått", accepted: ["likviditet", "balanslikviditet", "kassalikviditet", "kassa"] },
      { key: "solidityMeasure", label: "Använder soliditet som AM5-mått", accepted: ["soliditet", "eget kapital"] },
      { key: "context", label: "Läser siffror tillsammans med berättelsen", accepted: ["förvaltningsberättelse", "sammanhang", "efterfrågan", "kundbesök", "tillväxt"] }
    ],
    compound: [
      { key: "measures", minMatches: 1, from: ["resultMeasure", "liquidityMeasure", "solidityMeasure"] },
      { key: "twoMeasures", minMatches: 2, from: ["resultMeasure", "liquidityMeasure", "solidityMeasure"] }
    ],
    concepts: [
      { key: "essiqStronger", label: "Essiq starkare resultatmässigt", accepted: ["essiq", "vinst", "positivt resultat", "starkare resultat"] },
      { key: "halsoWeaker", label: "Hälsö mer pressat", accepted: ["hälsö", "halso", "fisk", "förlust", "pressad", "11 procent"] },
      { key: "resultMeasure", label: "resultat", accepted: ["resultat", "vinst", "förlust"] },
      { key: "liquidityMeasure", label: "likviditet", accepted: ["likviditet", "balanslikviditet", "kassalikviditet", "kassa"] },
      { key: "solidityMeasure", label: "soliditet", accepted: ["soliditet", "eget kapital"] },
      { key: "context", label: "förvaltningsberättelse/sammanhang", accepted: ["förvaltningsberättelse", "sammanhang", "efterfrågan", "kundbesök", "tillväxt"] }
    ],
    requiredConcepts: ["essiqStronger", "halsoWeaker", "twoMeasures"],
    supportingConcepts: ["context"],
    commonMistakes: [
      "Säger bara att Essiq har högre omsättning.",
      "Jämför en siffra utan likviditet, soliditet eller förvaltningsberättelse."
    ],
    memoryRule: "Jämför bolag med flera mått: resultat, likviditet, soliditet och berättelsen."
  }
};
