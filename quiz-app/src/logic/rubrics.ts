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

const essayFeedback = {
  correct: "Det här fungerar som ett kort essäsvar: du har med de centrala delarna och kopplar dem till frågan.",
  almost: "Du är nära. Fyll på {missing} och gör kopplingen tydligare.",
  too_vague: "Du är på rätt område men svaret är för allmänt. Lägg till {missing} och avsluta med en tydlig slutsats.",
  confused_with: "Du nämner något relevant, men svaret styr mot {misconception}. Jämför med facit och korrigera kopplingen.",
  uncertain: "Du har med flera rätta delar, men svaret innehåller en tydlig tentarisk: {misconception}. Korrigera den innan du markerar svaret som säkert.",
  wrong: "Svaret fångar inte frågans kärna än. Jämför med facit och skriv om med rätt nyckeldelar.",
  nonsense: "Skriv ett riktigt försök först. Facit visar vilka delar ett kort essäsvar bör innehålla.",
};

function c(key: string, label: string, accepted: string[], extra: Partial<Concept> = {}): Concept {
  return { key, label, accepted, ...extra };
}

function m(id: string, label: string, signals: string[], explanation: string, examples: string[] = []): Misconception {
  return { id, label, signals, explanation, examples };
}

function r(
  id: string,
  concepts: Concept[],
  requiredConcepts: string[],
  supportingConcepts: string[],
  memoryRule: string,
  goodExamples: string[] = [],
  compound: CompoundRule[] = [],
  extra: Partial<Rubric> = {}
): Rubric {
  const { commonMistakes, feedbackTemplates, ...rest } = extra;

  return {
    id,
    concepts,
    requiredConcepts,
    supportingConcepts,
    compound,
    commonMistakes: commonMistakes ?? [
      "Räknar bara upp ord utan att koppla dem till situationen.",
      "Saknar tydligt beslut, konsekvens eller kundperspektiv."
    ],
    goodExamples,
    memoryRule,
    feedbackTemplates: { ...essayFeedback, ...feedbackTemplates },
    ...rest
  };
}

const kund = c("kund", "kund eller kundsegment", ["kund", "kunden", "kundsegment", "målgrupp", "målgruppen", "köpare"]);
const problem = c("problem", "kundproblem", ["problem", "behov", "smärta", "utmaning", "friktion", "manuell", "ineffektivt", "administration"]);
const kundnytta = c("kundnytta", "konkret kundnytta", ["kundnytta", "nytta", "värde", "värdet", "effekt", "hjälper kunden", "sparar tid", "lägre kostnad", "minskar risk", "färre fel", "snabbare"]);
const vardeerbjudande = c("vardeerbjudande", "värdeerbjudande", ["värdeerbjudande", "erbjudande", "lösning", "paket", "tjänst"]);
const feature = c("feature", "egenskap", ["feature", "egenskap", "funktion", "teknisk", "power automate", "automation", "m365"]);
const advantage = c("advantage", "fördel", ["advantage", "fördel", "förbättring", "färre steg", "snabbare", "enklare", "effektivare"]);
const benefit = c("benefit", "kundnytta i FAB", ["benefit", "benefits", "nytta", "kundnytta", "sparad tid", "lägre risk", "mindre fel"]);
const bmc = c("bmc", "Business Model Canvas", ["bmc", "business model canvas", "affärsmodell", "canvas"]);
const kundsegment = c("kundsegment", "kundsegment", ["kundsegment", "målgrupp", "målkund", "kundgrupp"]);
const kanal = c("kanal", "kanal eller relation", ["kanal", "kanaler", "relation", "kundrelation", "linkedin", "referens", "sälj"]);
const intakter = c("intakter", "intäkter", ["intäkt", "intäkter", "intäktsmodell", "får betalt", "betalning", "abonnemang", "projektpris", "timpris", "supportavtal"]);
const kostnader = c("kostnader", "kostnader", ["kostnad", "kostnader", "kostnadsstruktur", "lön", "overhead", "direkta kostnader"]);
const resurser = c("resurser", "nyckelresurser", ["nyckelresurs", "nyckelresurser", "kompetens", "personal", "konsult", "verktyg"]);
const pestelid = c("pestelid", "PESTELID", ["pestelid", "omvärld", "politisk", "ekonomisk", "social", "teknologisk", "legal", "demografisk"]);
const swot = c("swot", "SWOT", ["swot", "styrka", "svaghet", "möjlighet", "hot"]);
const intern = c("intern", "intern faktor", ["intern", "styrka", "svaghet", "egna", "internt"]);
const extern = c("extern", "extern faktor", ["extern", "omvärld", "hot", "möjlighet", "marknad", "konjunktur"]);
const beslut = c("beslut", "konkret beslut", ["beslut", "väljer", "därför bör", "slutsats", "åtgärd", "prioritera", "motiverar"]);
const konkurrent = c("konkurrent", "konkurrent", ["konkurrent", "konkurrenter", "byråer", "konsulter", "aktörer"]);
const substitut = c("substitut", "substitut", ["substitut", "alternativ", "göra själv", "ai-verktyg", "intern lösning", "excel"]);
const differentiering = c("differentiering", "differentiering", ["differentiering", "skiljer", "sticker ut", "nisch", "unik", "position", "positionering"]);
const bevis = c("bevis", "bevis eller referens", ["bevis", "referens", "referenser", "case", "pilot", "demo", "certifiering", "mätning"]);
const ansoff = c("ansoff", "produkt-/marknadstänk", ["ansoff", "produkt", "marknad", "produktutveckling", "marknadspenetration", "marknadsutveckling", "diversifiering"]);
const risk = c("risk", "risk", ["risk", "osäkerhet", "hot", "scope", "försening", "kundrisk", "leveransrisk"]);
const foretagsform = c("foretagsform", "företagsform", ["företagsform", "aktiebolag", "ab", "enskild firma", "handelsbolag"]);
const ansvar = c("ansvar", "ansvar", ["ansvar", "personligt ansvar", "begränsat ansvar", "skyldighet", "risk"]);
const trov = c("trovardighet", "trovärdighet", ["trovärdighet", "förtroende", "seriös", "seriositet", "trygghet", "litar"]);
const vision = c("vision", "vision eller riktning", ["vision", "riktning", "framtid", "vart bolaget ska"]);
const mission = c("mission", "mission eller uppdrag", ["mission", "uppdrag", "varför bolaget finns", "syfte"]);
const vardering = c("vardering", "värderingar", ["värdering", "värderingar", "kultur", "transparens", "etik"]);
const beteende = c("beteende", "konkret beteende", ["beteende", "agerar", "säljer", "levererar", "prioriterar", "säger nej", "offert"]);
const bsc = c("bsc", "Balanced Scorecard", ["balanced scorecard", "bsc", "styrkort"]);
const mal = c("mal", "mål", ["mål", "målsättning", "målet"]);
const kpi = c("kpi", "KPI eller mätetal", ["kpi", "mätetal", "nyckeltal", "mäta", "mätning"]);
const perspektiv = c("perspektiv", "flera perspektiv", ["ekonomi", "kund", "process", "lärande", "tillväxt", "perspektiv"]);
const bscEkonomi = c("bscEkonomi", "ekonomiskt perspektiv", ["ekonomiskt perspektiv", "ekonomi", "täckningsbidrag", "marginal", "lönsamhet"]);
const bscKund = c("bscKund", "kundperspektiv", ["kundperspektiv", "kund", "kundnöjdhet", "nps", "återköp", "återköpsfrekvens"]);
const bscProcess = c("bscProcess", "processperspektiv", ["processperspektiv", "process", "leverans", "leverans i tid", "ledtid", "kvalitet"]);
const bscLarande = c("bscLarande", "lärandeperspektiv", ["lärandeperspektiv", "lärande", "kompetens", "certifiering", "utveckling"]);
const resultat = c("resultat", "resultat eller lönsamhet", ["resultat", "vinst", "förlust", "lönsamhet", "intäkter minus kostnader"]);
const balans = c("balans", "balansräkning", ["balans", "balansräkning", "tillgångar", "skulder", "eget kapital"]);
const likviditet = c("likviditet", "likviditet", ["likviditet", "betalningsförmåga", "betala", "kassa", "kort sikt", "kortsiktig"]);
const soliditet = c("soliditet", "soliditet", ["soliditet", "eget kapital", "motståndskraft", "långsiktig", "finansiell stabilitet"]);
const kassaflode = c("kassaflode", "kassaflöde", ["kassaflöde", "pengar in", "pengar ut", "inbetalning", "utbetalning", "cash flow"]);
const slutsats = c("slutsats", "försiktig slutsats", ["slutsats", "bedömning", "tolkning", "därför", "sammantaget", "försiktig"]);
const ar = c("arsredovisning", "årsredovisning", ["årsredovisning", "resultaträkning", "balansräkning", "förvaltningsberättelse", "nyckeltal"]);
const jamforelse = c("jamforelse", "jämförelse", ["jämför", "jämförelse", "skillnad", "medan", "å ena sidan", "å andra sidan"]);
const forvaltning = c("forvaltning", "förvaltningsberättelse", ["förvaltningsberättelse", "verksamheten", "händelser", "bransch", "omvärld"]);
const budget = c("budget", "budget", ["budget", "budgetera", "plan", "kostnader", "intäkter"]);
const prognos = c("prognos", "prognos", ["prognos", "utfall", "uppdaterad", "bedömning"]);
const scenario = c("scenario", "scenario", ["scenario", "optimistiskt", "försiktigt", "bästa fall", "sämsta fall"]);
const lon = c("lon", "lön", ["lön", "månadslön", "bruttolön"]);
const sociala = c("sociala", "sociala avgifter", ["sociala avgifter", "arbetsgivaravgift", "pension", "semester"]);
const overhead = c("overhead", "overhead", ["overhead", "administration", "kontor", "dator", "ledning", "säljtid", "icke debiterbar"]);
const belaggning = c("belaggning", "beläggning eller debiteringsgrad", ["beläggning", "debiteringsgrad", "debiterbar", "fakturerbar"]);
const pris = c("pris", "pris", ["pris", "timpris", "fastpris", "prissättning"]);
const tb = c("tackningsbidrag", "täckningsbidrag", ["täckningsbidrag", "bidrag", "direkta kostnader", "fasta kostnader", "marginal"]);
const affarsmodell = c("affarsmodell", "affärsmodell", ["affärsmodell", "bmc", "skapar värde", "får betalt"]);
const fastpris = c("fastpris", "fastpris", ["fastpris", "fast pris", "fast ersättning"]);
const timpris = c("timpris", "timpris", ["timpris", "löpande", "per timme", "time and material"]);
const scope = c("scope", "scope eller avgränsning", ["scope", "omfattning", "avgränsning", "ändring", "ändringshantering", "scope creep"]);
const avtal = c("avtal", "avtal", ["avtal", "uppdragsavtal", "kundavtal", "kontrakt"]);
const sekretess = c("sekretess", "sekretess", ["sekretess", "nda", "tystnadsplikt"]);
const gdpr = c("gdpr", "GDPR", ["gdpr", "dataskydd", "personuppgift", "personuppgifter"]);
const ansvarig = c("ansvarig", "personuppgiftsansvar", ["personuppgiftsansvarig", "ansvarig", "rollfördelning", "roller", "bestämmer ändamål", "bestämmer medel"]);
const bitradesroll = c("bitradesroll", "biträdesroll och instruktion", ["för kundens räkning", "kundens räkning", "på instruktion", "enligt instruktion", "kundens instruktion", "personuppgiftsbiträde"]);
const dpa = c("dpa", "personuppgiftsbiträdesavtal", ["dpa", "personuppgiftsbiträdesavtal", "biträdesavtal"]);
const sakerhet = c("sakerhet", "säkerhet eller åtkomst", ["säkerhet", "åtkomst", "incident", "behörighet", "rutiner"]);
const sla = c("sla", "SLA", ["sla", "servicenivå", "svarstid", "supportnivå"]);
const support = c("support", "support eller efterleverans", ["support", "efterleverans", "underhåll", "förvaltning", "övervakning"]);
const aterkommande = c("aterkommande", "återkommande intäkt", ["återkommande", "månatlig", "retainer", "abonnemang", "löpande intäkt"]);
const kapacitet = c("kapacitet", "kapacitet och uppföljning", ["kapacitet", "bemanning", "bemanna", "eskalering", "uppföljning", "följa upp", "realistisk", "hålla löftet"]);
const rebr = c("rebr", "REBR eller extern källa", ["rebr", "källa", "rapport", "extern källa", "trendrapport", "underlag"]);
const kallkritik = c("kallkritik", "källkritik", ["källkritik", "bevisar inte", "tolkning", "antagande", "begränsning", "osäker"]);
const lagkonjunktur = c("lagkonjunktur", "lågkonjunktur", ["lågkonjunktur", "pressad budget", "sämre tider", "konjunktur"]);
const paketering = c("paketering", "paketering", ["paketering", "paket", "avgränsat", "erbjudande"]);
const besparing = c("besparing", "kostnadsbesparing eller riskminskning", ["kostnadsbesparing", "spara", "effektivisering", "riskminskning", "lägre kostnad", "roi"]);
const baseline = c("baseline", "nuläge eller kunddata", ["baseline", "nuläge", "kunddata", "kundens data", "pilot", "före", "efter", "mätning", "nulägesmätning", "mäta dagens"]);
const matbar = c("matbar", "mätbar effekt", ["mätbar", "mätbar effekt", "mäta effekt", "före", "efter", "sparad tid", "färre fel"]);
const roi = c("roi", "ROI eller återbetalning", ["roi", "återbetalning", "payback", "lönar sig", "effekt"]);
const bradska = c("bradska", "skäl att agera nu", ["nu", "inte vänta", "brådska", "direkt", "prioritera"]);
const alternativkostnad = c("alternativkostnad", "kostnad med att vänta", ["alternativkostnad", "kostnad med att vänta", "förlorad tid", "fortsatt risk", "dyrare senare"]);
const pilot = c("pilot", "pilot eller test", ["pilot", "test", "förstudie", "demo", "litet projekt"]);
const riskreducering = c("riskreducering", "riskreducering", ["minskar risk", "riskreducering", "trygghet", "fast pris", "tydlig scope"]);
const fragor = c("fragor", "kundens frågor", ["fråga", "frågor", "kunden bör fråga", "vad ingår", "vem ansvarar", "vad kostar"]);
const hallbar = c("hallbar", "hållbar affär", ["hållbar", "hållbar affär", "långsiktig", "etisk", "levererbar"]);
const bada = c("bada", "båda parter", ["båda parter", "kund och bolag", "kunden och företaget", "win win"]);
const lonsamhet = c("lonsamhet", "lönsamhet", ["lönsamhet", "marginal", "vinst", "täckningsbidrag", "tjäna pengar"]);
const rodTrad = c("rodtrad", "röd tråd", ["röd tråd", "struktur", "från problem", "till ekonomi", "helhet"]);
const analys = c("analys", "analysmodell", ["analys", "swot", "pestelid", "bmc", "konkurrent", "omvärld"]);

const economyMix: CompoundRule = {
  key: "economyMix",
  minMatches: 2,
  from: ["resultat", "balans", "likviditet", "soliditet", "kassaflode", "lonsamhet"],
  label: "minst två ekonomiska mått"
};

const riskAgreementMix: CompoundRule = {
  key: "riskAgreementMix",
  minMatches: 2,
  from: ["avtal", "risk", "scope", "gdpr", "sekretess", "sla"],
  label: "risk och avtal kopplade ihop"
};

const bscPerspectiveMix: CompoundRule = {
  key: "bscPerspectiveMix",
  minMatches: 2,
  from: ["bscEkonomi", "bscKund", "bscProcess", "bscLarande"],
  label: "minst två BSC-perspektiv"
};

export const FOKUS_RUBRICS: Record<string, Rubric> = {
  "essay-kundproblem-vardeerbjudande": r(
    "essay-kundproblem-vardeerbjudande",
    [kund, problem, kundnytta, vardeerbjudande, beslut],
    ["kund", "problem", "kundnytta"],
    ["vardeerbjudande", "beslut"],
    "Börja med kundens problem och visa konkret nytta.",
    ["Kunden har manuella flöden. Erbjudandet minskar administration och frigör tid."]
  ),
  "essay-fab-saljargument": r(
    "essay-fab-saljargument",
    [feature, advantage, benefit, kund],
    ["feature", "advantage", "benefit"],
    ["kund"],
    "FAB = egenskap -> fördel -> kundnytta.",
    ["Power Automate är egenskapen, färre manuella steg är fördelen och snabbare handläggning är nyttan."]
  ),
  "essay-bmc-roda-traden": r(
    "essay-bmc-roda-traden",
    [bmc, kundsegment, vardeerbjudande, kanal, intakter, kostnader, resurser],
    ["kundsegment", "vardeerbjudande", "intakter"],
    ["bmc", "kanal", "kostnader", "resurser"],
    "BMC ska hänga ihop: kund, värde, leverans och betalning.",
    ["SME-kunder får automationsnytta, bolaget säljer projekt plus support och bär kostnader för konsulter."]
  ),
  "essay-swot-pestelid-beslut": r(
    "essay-swot-pestelid-beslut",
    [pestelid, swot, intern, extern, beslut, risk],
    ["pestelid", "swot", "beslut"],
    ["intern", "extern", "risk"],
    "Omvärldsdata blir användbar först när den leder till ett beslut.",
    ["PESTELID visar lågkonjunktur och teknikskifte. I SWOT blir det hot/möjlighet och beslutet blir kostnadsbesparande paketering."]
  ),
  "essay-konkurrent-positionering": r(
    "essay-konkurrent-positionering",
    [konkurrent, substitut, differentiering, kundnytta, bevis],
    ["konkurrent", "substitut", "differentiering", "kundnytta"],
    ["bevis"],
    "Positionering måste visa vad kunden väljer mellan, även substitut.",
    ["Kunden jämför byrå, egen intern lösning och SaaS. Bolaget nischar sig mot HR-onboarding och bevisar skillnaden med pilot och mätning."]
  ),
  "essay-produktmarknad-risk": r(
    "essay-produktmarknad-risk",
    [ansoff, risk, beslut, kund, vardeerbjudande],
    ["ansoff", "risk", "beslut"],
    ["kund", "vardeerbjudande"],
    "Jämför potential med risk innan du väljer tillväxtväg.",
    ["Ett nystartat bolag väljer befintlig marknad med tydligt paket eftersom diversifiering är för riskfyllt."]
  ),
  "essay-foretagsform-trovardighet": r(
    "essay-foretagsform-trovardighet",
    [foretagsform, ansvar, trov, risk, avtal],
    ["foretagsform", "ansvar", "trovardighet"],
    ["risk", "avtal"],
    "Företagsform påverkar ansvar och förtroende, men läs kundens faktiska krav.",
    ["AB kan stärka struktur och ansvarsskillnad, men offentliga leverantörskrav måste läsas i upphandlingsunderlaget."],
    [],
    {
      misconceptions: [
        m(
          "ab-alltid-myndighet",
          "myndighet kräver alltid AB",
          ["myndighet kräver alltid", "måste vara ab", "alltid aktiebolag", "kräver ofta ab"],
          "AB kan vara en trovärdighetssignal, men det är inte en generell regel att alla myndighetsaffärer kräver aktiebolag. Kraven avgörs av det aktuella underlaget."
        )
      ]
    }
  ),
  "essay-foretagsplattform-beteende": r(
    "essay-foretagsplattform-beteende",
    [vision, mission, vardering, beteende, kundnytta],
    ["vision", "mission", "vardering", "beteende"],
    ["kundnytta"],
    "Plattformen måste synas i hur bolaget agerar.",
    ["Transparens blir konkret genom tydlig offert, riskdialog och att säga nej till otydligt scope."]
  ),
  "essay-mal-kpi-bsc": r(
    "essay-mal-kpi-bsc",
    [bsc, mal, kpi, perspektiv, bscEkonomi, bscKund, bscProcess, bscLarande, beslut],
    ["bsc", "mal", "kpi", "bscPerspectiveMix"],
    ["perspektiv", "beslut"],
    "Bra KPI:er visar framdrift mot målet från minst två perspektiv.",
    ["Täckningsbidrag, återköpsgrad, leverans i tid och certifieringar täcker flera perspektiv."],
    [bscPerspectiveMix]
  ),
  "essay-ekonomisk-halsokoll": r(
    "essay-ekonomisk-halsokoll",
    [resultat, balans, likviditet, soliditet, kassaflode, slutsats],
    ["economyMix", "slutsats"],
    ["resultat", "balans", "likviditet", "soliditet", "kassaflode"],
    "Läs flera ekonomiska signaler tillsammans innan du bedömer bolaget.",
    ["Vinst räcker inte om likviditet och kassaflöde visar att betalningsförmågan är pressad."],
    [economyMix]
  ),
  "essay-resultat-kassaflode-likviditet": r(
    "essay-resultat-kassaflode-likviditet",
    [resultat, kassaflode, likviditet, ar, slutsats],
    ["resultat", "kassaflode", "likviditet"],
    ["arsredovisning", "slutsats"],
    "Vinst är inte samma sak som pengar att betala med.",
    ["Fakturering kan ge resultat nu men betalning senare, vilket skapar likviditetsproblem."]
  ),
  "essay-halso-essiq-jamforelse": r(
    "essay-halso-essiq-jamforelse",
    [jamforelse, ar, resultat, likviditet, soliditet, forvaltning, slutsats],
    ["jamforelse", "economyMix", "forvaltning", "slutsats"],
    ["arsredovisning"],
    "Jämför flera mått och dra försiktig slutsats.",
    ["Ett bolag kan ha starkare resultat men ändå behöva bedömas ihop med likviditet, soliditet och verksamhetens läge."],
    [economyMix]
  ),
  "essay-konsultbudget-scenario": r(
    "essay-konsultbudget-scenario",
    [budget, prognos, scenario, belaggning, pris, likviditet],
    ["budget", "scenario", "belaggning", "likviditet"],
    ["prognos", "pris"],
    "Budget blir användbar när antaganden testas i scenarier.",
    ["85 procent debiteringsgrad kan bära kalkylen, men 65 procent och sen betalning pressar likviditeten."]
  ),
  "essay-medarbetarkostnad-overhead": r(
    "essay-medarbetarkostnad-overhead",
    [lon, sociala, overhead, belaggning, pris, lonsamhet],
    ["lon", "sociala", "overhead"],
    ["belaggning", "pris", "lonsamhet"],
    "En konsult kostar mer än lönen och måste bära oddebiterad tid.",
    ["Timpriset behöver täcka lön, sociala avgifter, säljtid, dator och administration."]
  ),
  "essay-debiteringsgrad-pris-tb": r(
    "essay-debiteringsgrad-pris-tb",
    [belaggning, pris, tb, lonsamhet, kostnader],
    ["belaggning", "pris", "tackningsbidrag"],
    ["lonsamhet", "kostnader"],
    "Lönsamhet i konsultaffär styrs av pris, debiterbar tid och kostnader.",
    ["Högt pris hjälper inte om låg debiteringsgrad gör att fasta kostnader inte täcks."]
  ),
  "essay-affarsmodell-intakter": r(
    "essay-affarsmodell-intakter",
    [affarsmodell, intakter, kundnytta, risk, support, bmc],
    ["affarsmodell", "intakter", "kundnytta", "risk"],
    ["support", "bmc"],
    "Intäktsmodell ska passa kundens köpbeslut och bolagets leveransrisk.",
    ["Fast startprojekt plus support kan ge tydlig kundkostnad och återkommande intäkt om scope och supportnivå är avgränsade."]
  ),
  "essay-fastpris-timpris-risk": r(
    "essay-fastpris-timpris-risk",
    [fastpris, timpris, scope, risk, lonsamhet],
    ["fastpris", "timpris", "scope", "risk"],
    ["lonsamhet"],
    "Fastpris kräver tydligt scope; timpris passar bättre vid osäkerhet.",
    ["Fastpris kan ge trygghet men scope creep kan förstöra marginalen."]
  ),
  "essay-avtalskarta-it": r(
    "essay-avtalskarta-it",
    [avtal, scope, ansvar, sekretess, gdpr, dpa, bitradesroll, sla, risk],
    ["avtal", "scope", "ansvar", "riskAgreementMix"],
    ["sekretess", "gdpr", "dpa", "bitradesroll", "sla", "risk"],
    "Avtal ska minska oklarhet om scope, ansvar, pris, data och support.",
    ["Uppdragsavtal, NDA, DPA och SLA kan behövas beroende på projektets scope, dataflöden och supportlöften."],
    [riskAgreementMix],
    {
      misconceptions: [
        m(
          "dpa-som-standardbilaga",
          "DPA som standardbilaga utan rollanalys",
          ["dpa behövs alltid", "alltid dpa", "dpa i alla projekt", "gdpr kräver alltid dpa"],
          "DPA behövs när leverantören behandlar personuppgifter för kundens räkning. Börja med roll- och dataflödesanalys innan du väljer avtalsbilaga."
        )
      ]
    }
  ),
  "essay-gdpr-data-ansvar": r(
    "essay-gdpr-data-ansvar",
    [gdpr, ansvarig, bitradesroll, dpa, sakerhet, avtal, risk, trov],
    ["gdpr", "ansvarig", "bitradesroll", "risk"],
    ["dpa", "sakerhet", "avtal", "trovardighet"],
    "GDPR är affärsrisk: ansvar, dataflöden och säkerhet måste vara tydliga.",
    ["Om konsulten behandlar kundregister på kundens instruktion behövs DPA, åtkomststyrning och incidentrutiner."],
    [],
    {
      misconceptions: [
        m(
          "dpa-alltid",
          "DPA behövs alltid",
          ["dpa behövs alltid", "alltid dpa", "dpa i alla gdpr projekt", "lagkrav i alla gdpr projekt"],
          "Personuppgiftsbiträdesavtal behövs när det finns ett biträdesförhållande, inte bara för att GDPR nämns."
        )
      ]
    }
  ),
  "essay-sla-support-efterleverans": r(
    "essay-sla-support-efterleverans",
    [sla, support, kundnytta, aterkommande, avtal, ansvar, kapacitet],
    ["sla", "support", "kundnytta", "kapacitet"],
    ["aterkommande", "avtal", "ansvar"],
    "SLA skapar värde först när servicenivån går att bemanna och följa upp.",
    ["Support med svarstid, ansvar, eskalering och realistisk bemanning gör leveransen tryggare och kan säljas månadsvis."],
    [],
    {
      misconceptions: [
        m(
          "sla-bara-intakt",
          "SLA som intäkt utan leveranskapacitet",
          ["bara återkommande intäkt", "bara intäkt", "garantera allt", "lovar snabb support utan bemanning"],
          "Ett SLA är inte bara en intäktsmodell. Löftet måste matcha bemanning, eskalering, uppföljning och ansvar."
        )
      ]
    }
  ),
  "essay-rebr-kallkritik": r(
    "essay-rebr-kallkritik",
    [rebr, kallkritik, beslut, extern, slutsats],
    ["rebr", "kallkritik", "beslut"],
    ["extern", "slutsats"],
    "Källor stödjer antaganden, men de bevisar inte hela affären.",
    ["En trendrapport kan motivera pilot, men inte bevisa att just vår tjänst säljer."]
  ),
  "essay-lagkonjunktur-paketering": r(
    "essay-lagkonjunktur-paketering",
    [lagkonjunktur, paketering, besparing, baseline, kundnytta, risk],
    ["lagkonjunktur", "paketering", "besparing", "baseline"],
    ["kundnytta", "risk"],
    "I lågkonjunktur måste erbjudandet kännas nödvändigt och bygga på kundens nuläge.",
    ["Sälj en avgränsad effektiviseringspilot med nulägesmätning, inte allmän digital transformation eller osäkrad procentsiffra."],
    [],
    {
      misconceptions: [
        m(
          "roi-utan-underlag",
          "ROI eller besparing utan baseline",
          ["sänker med 20", "garanterad besparing", "garanterar roi", "utan att mäta", "utan underlag"],
          "Besparingar behöver kundens nuläge, pilot eller annan mätning. Annars blir säljargumentet för tvärsäkert."
        )
      ]
    }
  ),
  "essay-sticka-ut": r(
    "essay-sticka-ut",
    [differentiering, kundnytta, bevis, konkurrent, trov],
    ["differentiering", "kundnytta", "bevis"],
    ["konkurrent", "trovardighet"],
    "Differentiering utan bevis blir bara reklamord.",
    ["En smal nisch plus pilotmätning är starkare än att säga att bolaget är bäst."]
  ),
  "essay-matbar-effekt": r(
    "essay-matbar-effekt",
    [matbar, kpi, kundnytta, roi, beslut],
    ["matbar", "kpi", "kundnytta"],
    ["roi", "beslut"],
    "Mät före och efter så nyttan blir kontrollerbar.",
    ["Mät handläggningstid före och efter automation och räkna sparad tid."]
  ),
  "essay-kopa-nu": r(
    "essay-kopa-nu",
    [bradska, alternativkostnad, baseline, kundnytta, risk, beslut],
    ["bradska", "alternativkostnad", "baseline", "kundnytta"],
    ["risk", "beslut"],
    "Köp nu-argumentet ska bygga på kundens kostnad eller risk med att vänta.",
    ["Om nuläget visar 30 timmar spilltid per månad blir ett avgränsat startprojekt lättare att motivera."],
    [],
    {
      misconceptions: [
        m(
          "hardsalj-utan-data",
          "hårdsälj utan kunddata",
          ["måste köpa nu", "alltid dyrare att vänta", "ofta överstiger", "köp direkt"],
          "Alternativkostnad blir stark först när den kopplas till kundens egna data, risker eller mätbara väntkostnad."
        )
      ]
    }
  ),
  "essay-trovardighet-nystartat": r(
    "essay-trovardighet-nystartat",
    [trov, pilot, bevis, scope, riskreducering, avtal],
    ["trovardighet", "pilot", "riskreducering"],
    ["bevis", "scope", "avtal"],
    "Nystartade bolag måste aktivt minska kundens upplevda risk.",
    ["Pilot, tydlig scope, demo och transparent avtal kan ersätta saknade referenser."]
  ),
  "essay-kundens-riskfragor": r(
    "essay-kundens-riskfragor",
    [fragor, risk, avtal, kpi, gdpr, scope, ansvar],
    ["fragor", "risk", "riskAgreementMix"],
    ["kpi", "gdpr", "scope", "ansvar"],
    "Tänk som kunden: pris, ansvar, data, effekt och vad som händer när något ändras.",
    ["Kunden bör fråga vad som ingår, hur effekt mäts, hur data hanteras och vad som händer vid scopeändring."],
    [riskAgreementMix]
  ),
  "essay-hallbar-affar": r(
    "essay-hallbar-affar",
    [hallbar, bada, kundnytta, lonsamhet, risk, trov],
    ["hallbar", "bada", "kundnytta"],
    ["lonsamhet", "risk", "trovardighet"],
    "En bra affär håller för både kunden och bolaget.",
    ["För lågt fastpris kan skada bolagets marginal och därmed kvaliteten för kunden."]
  ),
  "essay-presentation-roda-traden": r(
    "essay-presentation-roda-traden",
    [rodTrad, problem, kundnytta, analys, intakter, avtal, matbar],
    ["rodtrad", "problem", "kundnytta", "matbar"],
    ["analys", "intakter", "avtal"],
    "En stark presentation går från kundens problem till effekt, ekonomi och riskhantering.",
    ["Dagens manuella kostnad, automationslösning, mätbar effekt, projektpris, scope och DPA/SLA vid behov ger röd tråd."]
  ),
  "essay-helhetscase": r(
    "essay-helhetscase",
    [kund, problem, kundnytta, analys, affarsmodell, intakter, budget, avtal, kpi, risk],
    ["kundnytta", "analys", "affarsmodell", "budget", "riskAgreementMix"],
    ["kund", "problem", "intakter", "kpi"],
    "Helhetscase = kundproblem, analys, affärsmodell, ekonomi, avtal och effekt.",
    ["Ett M365-bolag löser onboarding, motiverar valet med analys, säljer projekt plus support, räknar på debitering/overhead, hanterar DPA/scope och mäter sparad tid."],
    [riskAgreementMix]
  )
};
