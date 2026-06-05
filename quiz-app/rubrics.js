window.FOKUS_RUBRICS = {
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    commonMistakes: [
      "Fyller rutorna utan röd tråd.",
      "Beskriver bara produkten och missar intäkter/kostnader."
    ]
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
    commonMistakes: [
      "Stannar vid egenskaper.",
      "Blandar ihop fördel och kundnytta."
    ]
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
    commonMistakes: [
      "Lägger externa hot som interna svagheter.",
      "Gör SWOT till en åsiktslista utan beslut."
    ]
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
    commonMistakes: [
      "Fyller alla rutor utan att prioritera.",
      "Beskriver omvärlden utan att koppla till affären."
    ]
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
    commonMistakes: [
      "Glömmer att matrisen har både produkt och marknad.",
      "Tror att hög risk alltid är fel."
    ]
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
    commonMistakes: [
      "Säger bara att Essiq har högre omsättning.",
      "Jämför en siffra utan likviditet, soliditet eller förvaltningsberättelse."
    ]
  }
};
