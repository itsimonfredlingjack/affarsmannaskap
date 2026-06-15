import type { Concept, Misconception, Rubric } from './rubrics';

const termFeedback = {
  correct: "Rätt. Du fångar huvudpoängen.",
  almost: "Nästan. Jämför med facit och fyll på {missing}.",
  too_vague: "Nästan, men för allmänt. Jämför med facit.",
  confused_with: "Det här låter mer som {misconception}. Rätt svar står i facit nedan.",
  wrong: "Rätt svar står i facit nedan.",
  nonsense: "Rätt svar står i facit nedan.",
  uncertain: "Jämför med facit och välj nivå själv.",
};

function c(key: string, label: string, accepted: string[]): Concept {
  return { key, label, accepted };
}

function m(id: string, label: string, signals: string[], explanation: string): Misconception {
  return { id, label, signals, explanation };
}

function tr(
  id: string,
  concepts: Concept[],
  requiredConcepts: string[],
  supportingConcepts: string[],
  memoryRule: string,
  extra: Partial<Rubric> = {}
): Rubric {
  return {
    id,
    concepts,
    requiredConcepts,
    supportingConcepts,
    memoryRule,
    feedbackTemplates: { ...termFeedback, ...extra.feedbackTemplates },
    misconceptions: extra.misconceptions,
    goodExamples: extra.goodExamples,
    commonMistakes: extra.commonMistakes ?? [
      "Svarar för allmänt utan att definiera begreppet.",
      "Blandar ihop med ett närliggande ekonomibegrepp."
    ],
  };
}

export const TERM_RUBRICS: Record<string, Rubric> = {
  "term-soliditet": tr(
    "term-soliditet",
    [
      c("equity", "eget kapital", ["eget kapital", "ägarnas kapital", "ägarkapital"]),
      c("relation", "andel eller relation", ["andel", "hur stor del", "i relation till", "finansierade med", "dividerat med"]),
      c("assets", "tillgångar", ["tillgångar", "totala tillgångar", "balansomslutning"]),
      c("stability", "långsiktig stabilitet", ["stabilitet", "motståndskraft", "långsiktig", "buffert"])
    ],
    ["equity", "relation"],
    ["assets", "stability"],
    "Soliditet = ägarnas andel av det företaget äger.",
    {
      misconceptions: [
        m("likviditet", "likviditet", ["kassa", "betala fakturor", "kortsiktig betalningsförmåga", "likvida medel"], "Likviditet handlar om kortsiktig betalningsförmåga. Soliditet handlar om eget kapital i relation till tillgångar."),
        m("lonsamhet", "lönsamhet", ["vinst", "lönsam", "går med plus"], "Lönsamhet handlar om vinst. Soliditet handlar om hur tillgångarna är finansierade.")
      ]
    }
  ),
  "term-likviditet": tr(
    "term-likviditet",
    [
      c("shortTerm", "kortsiktig betalningsförmåga", ["kortsiktig betalningsförmåga", "kort sikt", "betala skulder i tid", "betala fakturor"]),
      c("cash", "pengar eller kassa", ["pengar", "kassa", "bank", "likvida medel"]),
      c("notProfit", "skiljer från vinst", ["inte samma som vinst", "inte vinst", "inte resultat"])
    ],
    ["shortTerm"],
    ["cash", "notProfit"],
    "Likviditet = kan företaget betala nu?",
    {
      misconceptions: [
        m("soliditet", "soliditet", ["eget kapital", "totala tillgångar", "långsiktig stabilitet"], "Soliditet handlar om eget kapital i relation till tillgångar."),
        m("lonsamhet", "lönsamhet", ["vinst", "förlust", "resultat"], "Lönsamhet handlar om resultat. Likviditet handlar om betalningsförmåga.")
      ]
    }
  ),
  "term-kassalikviditet": tr(
    "term-kassalikviditet",
    [
      c("formula", "formel med lager exkluderat", ["exklusive lager", "minus lager", "utan lager", "pågående arbeten"]),
      c("currentAssets", "omsättningstillgångar", ["omsättningstillgångar", "ot"]),
      c("shortLiabilities", "kortfristiga skulder", ["kortfristiga skulder", "korta skulder"])
    ],
    ["formula"],
    ["currentAssets", "shortLiabilities"],
    "Kassalikviditet exkluderar lager: (OT − lager) / korta skulder."
  ),
  "term-balanslikviditet": tr(
    "term-balanslikviditet",
    [
      c("formula", "omsättningstillgångar dividerat skulder", ["omsättningstillgångar", "dividerat", "delat med", "/"]),
      c("shortLiabilities", "kortfristiga skulder", ["kortfristiga skulder", "korta skulder"]),
      c("broad", "bred kortsiktig bild", ["bred", "inkluderar lager", "alla omsättningstillgångar"])
    ],
    ["formula", "shortLiabilities"],
    ["broad"],
    "Balanslikviditet = OT / kortfristiga skulder."
  ),
  "term-resultatrakning": tr(
    "term-resultatrakning",
    [
      c("income", "intäkter", ["intäkter", "omsättning", "nettoomsättning", "försäljning"]),
      c("cost", "kostnader", ["kostnader", "utgifter", "minus kostnader"]),
      c("period", "period", ["period", "under året", "under en tid", "räkenskapsår"]),
      c("profitLoss", "resultat", ["vinst", "förlust", "resultat", "årets resultat"])
    ],
    ["income", "cost"],
    ["period", "profitLoss"],
    "Resultaträkning = intäkter minus kostnader under en period.",
    {
      misconceptions: [
        m("balansrakning", "balansräkning", ["tillgångar", "skulder", "eget kapital", "vid ett datum"], "Balansräkningen visar tillgångar och skulder vid en tidpunkt.")
      ]
    }
  ),
  "term-balansrakning": tr(
    "term-balansrakning",
    [
      c("assets", "tillgångar", ["tillgångar", "omsättningstillgångar", "anläggningstillgångar"]),
      c("liabilities", "skulder", ["skulder", "kortfristiga skulder", "långfristiga skulder"]),
      c("equity", "eget kapital", ["eget kapital", "ägarnas kapital"]),
      c("pointInTime", "tidpunkt", ["tidpunkt", "balansdag", "vid ett datum", "en viss dag"])
    ],
    ["assets", "liabilities", "equity"],
    ["pointInTime"],
    "Balansräkning = vad företaget äger och hur det är finansierat.",
    {
      misconceptions: [
        m("resultatrakning", "resultaträkning", ["intäkter", "kostnader", "vinst", "under året"], "Resultaträkningen visar intäkter och kostnader över en period.")
      ]
    }
  ),
  "term-eget-kapital": tr(
    "term-eget-kapital",
    [
      c("assetsMinusLiabilities", "tillgångar minus skulder", ["tillgångar minus skulder", "tillgångar - skulder", "skillnaden mellan tillgångar och skulder"]),
      c("owners", "ägarnas del", ["ägarnas kapital", "ägarnas del", "ägare", "ägarkapital"]),
      c("buffer", "buffert", ["buffert", "risk", "soliditet", "motståndskraft"])
    ],
    ["assetsMinusLiabilities"],
    ["owners", "buffer"],
    "Eget kapital = tillgångar minus skulder.",
    {
      misconceptions: [
        m("kassa", "kassa", ["pengar på banken", "kassa", "likvida medel"], "Kassa är pengar tillgängliga. Eget kapital är tillgångar minus skulder.")
      ]
    }
  ),
  "term-kassaflode": tr(
    "term-kassaflode",
    [
      c("cashInOut", "pengar in och ut", ["pengar in och ut", "pengar kommer in", "pengar går ut", "inbetalningar", "utbetalningar"]),
      c("time", "över tid", ["över tid", "under en period", "löpande"]),
      c("notResult", "skiljer från resultat", ["inte samma som resultat", "inte vinst", "resultat"])
    ],
    ["cashInOut"],
    ["time", "notResult"],
    "Kassaflöde = pengar som faktiskt rör sig.",
    {
      misconceptions: [
        m("resultat", "resultat", ["vinst", "förlust", "intäkter minus kostnader"], "Resultat är bokföring. Kassaflöde handlar om faktiska pengar.")
      ]
    }
  ),
  "term-tackningsbidrag": tr(
    "term-tackningsbidrag",
    [
      c("income", "intäkt", ["intäkt", "försäljning", "försäljningsintäkt"]),
      c("directCosts", "direkta kostnader", ["direkta kostnader", "rörliga kostnader", "minus kostnader"]),
      c("contribution", "bidrag till fasta kostnader", ["fasta kostnader", "vinst", "marginal", "bidrar"])
    ],
    ["income", "directCosts"],
    ["contribution"],
    "Täckningsbidrag = intäkt minus direkta kostnader."
  ),
  "term-budget-prognos": tr(
    "term-budget-prognos",
    [
      c("plan", "budget är plan i förväg", ["plan i förväg", "plan", "budgetera", "mål i förväg"]),
      c("updatedView", "prognos är uppdaterad bedömning", ["uppdaterad bedömning", "hur utfallet verkar bli", "justerar prognosen", "prognos"])
    ],
    ["plan", "updatedView"],
    [],
    "Budget = plan. Prognos = ny bedömning.",
    {
      misconceptions: [
        m("samma-sak", "budget och prognos som samma sak", ["samma sak", "ingen skillnad"], "Budget är planen i förväg. Prognos uppdateras när verkligheten förändras.")
      ]
    }
  ),
  "term-debiteringsgrad": tr(
    "term-debiteringsgrad",
    [
      c("billable", "fakturerbar tid", ["faktureras", "fakturerbar", "debiterbar", "debiteras"]),
      c("share", "andel av arbetstid", ["andel", "hur stor del", "procent", "grad"]),
      c("workTime", "arbetstid", ["arbetstid", "timmar", "beläggning"])
    ],
    ["billable", "share"],
    ["workTime"],
    "Debiteringsgrad = andelen arbetstid som kan faktureras."
  ),
  "term-snittdebitering": tr(
    "term-snittdebitering",
    [
      c("average", "genomsnitt", ["genomsnitt", "snitt", "medel"]),
      c("price", "pris per timme", ["pris per timme", "timpris", "timtaxa", "fakturerat pris"]),
      c("revenue", "intäkt", ["intäkt", "fakturerat", "debitering"])
    ],
    ["average", "price"],
    ["revenue"],
    "Snittdebitering = genomsnittligt fakturerat pris per insats."
  ),
  "term-arsredovisning": tr(
    "term-arsredovisning",
    [
      c("managementReport", "förvaltningsberättelse", ["förvaltningsberättelse"]),
      c("incomeStatement", "resultaträkning", ["resultaträkning"]),
      c("balanceSheet", "balansräkning", ["balansräkning"]),
      c("notesAudit", "noter eller revision", ["noter", "revisionsberättelse", "revision"])
    ],
    ["managementReport", "incomeStatement", "balanceSheet"],
    ["notesAudit"],
    "Årsredovisning = berättelse + RR + BR + noter (+ revision).",
    {
      commonMistakes: ["Tror att årsredovisning bara är resultaträkningen."]
    }
  ),
  "term-forvaltningsberattelse": tr(
    "term-forvaltningsberattelse",
    [
      c("events", "händelser under året", ["händelser", "under året", "verksamheten", "vad som hänt"]),
      c("context", "kontext till siffror", ["kontext", "varför", "förklarar", "sammanhang"]),
      c("outlook", "framtid eller omvärld", ["framtid", "omvärld", "marknad", "utsikter"])
    ],
    ["events", "context"],
    ["outlook"],
    "Förvaltningsberättelsen förklarar varför siffrorna ser ut som de gör."
  ),
  "term-likviditet-soliditet-samband": tr(
    "term-likviditet-soliditet-samband",
    [
      c("liquidity", "likviditet kortsiktigt", ["likviditet", "kortsiktig", "betala", "betalningsförmåga"]),
      c("solidity", "soliditet långsiktigt", ["soliditet", "långsiktig", "eget kapital", "motståndskraft"]),
      c("different", "skiljer tidshorisont", ["skiljer", "olika", "båda", "medan", "däremot"])
    ],
    ["liquidity", "solidity"],
    ["different"],
    "Likviditet = kort sikt. Soliditet = lång sikt."
  ),
  "term-resultat-kassaflode-samband": tr(
    "term-resultat-kassaflode-samband",
    [
      c("result", "resultat bokföring", ["resultat", "vinst", "intäkter minus kostnader", "bokförs"]),
      c("cashflow", "kassaflöde faktiska pengar", ["kassaflöde", "pengar in och ut", "faktiska pengar", "inbetalning"]),
      c("timing", "timing eller fordringar", ["fakturering", "kundfordringar", "betalning", "timing", "senare"])
    ],
    ["result", "cashflow"],
    ["timing"],
    "Resultat bokförs vid fakturering. Kassaflöde följer faktiska betalningar."
  ),
};

