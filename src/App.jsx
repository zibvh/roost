import { useState, useEffect, useRef, useCallback } from "react";

const APP = "Rooster";
const TAGLINE = "JAMB UTME Exam Simulator";
const VERSION = "2.0.0";
const GITHUB_REPO = "your-username/rooster"; // ← replace with your actual repo
const UTME_SECS = 105 * 60;
const MARKS_TOTAL = 400;
const SKEY = "rooster_v2";
const YEARS = Array.from({length:16},(_,i)=>2010+i);

// Subject colours
const SC = {
  "Use of English":   "#a855f7",
  "Mathematics":      "#06b6d4",
  "Biology":          "#22c55e",
  "Physics":          "#4f7cff",
  "Chemistry":        "#f59e0b",
  "Economics":        "#f97316",
  "Government":       "#ec4899",
  "Literature":       "#8b5cf6",
  "Geography":        "#14b8a6",
  "CRS":              "#eab308",
  "IRS":              "#84cc16",
  "Agricultural Science": "#10b981",
  "Commerce":         "#fb923c",
  "Accounting":       "#60a5fa",
};

// Cluster definitions
const CLUSTERS = {
  Science:     ["Use of English","Mathematics","Biology","Physics","Chemistry","Agricultural Science"],
  "Commercial":["Use of English","Mathematics","Economics","Commerce","Accounting","Government"],
  Arts:        ["Use of English","Literature","Government","Economics","Geography","CRS","IRS"],
};

const ALL_SUBJECTS = Object.keys(SC);

// ─── QUESTION BANK ────────────────────────────────────────────────────────────
const QB = [
  // ── USE OF ENGLISH ──
  {id:"e001",s:"Use of English",y:2010,t:"Lexis",d:"Easy",q:"Word nearest in meaning to ABSCOND is",o:{A:"Arrive",B:"Confess",C:"Flee secretly",D:"Surrender"},a:"C",e:"Abscond: to leave hurriedly and secretly to escape custody."},
  {id:"e002",s:"Use of English",y:2011,t:"Oral English",d:"Medium",q:"Stress on second syllable in",o:{A:"PREsent (noun)",B:"preSENT (verb)",C:"REcord (noun)",D:"PROtest (noun)"},a:"B",e:"Present (verb): preSENT. Present (noun/adj): PREsent."},
  {id:"e003",s:"Use of English",y:2012,t:"Comprehension",d:"Medium",q:"Sardonic tone means the writer is",o:{A:"Warm",B:"Grimly mocking or cynical",C:"Enthusiastic",D:"Neutral"},a:"B",e:"Sardonic: grimly mocking, cynical, bitterly scornful."},
  {id:"e004",s:"Use of English",y:2013,t:"Lexis",d:"Easy",q:"The students were _______ by the exam difficulty.",o:{A:"overran",B:"overturned",C:"overwhelmed",D:"overrode"},a:"C",e:"Overwhelmed: overcome or submerged by something difficult."},
  {id:"e005",s:"Use of English",y:2014,t:"Oral English",d:"Medium",q:"Which word has the vowel sound as in 'feet'?",o:{A:"Bit",B:"Bet",C:"Beat",D:"Bat"},a:"C",e:"Beat: /iː/ (long e). Bit: /ɪ/, Bet: /e/, Bat: /æ/."},
  {id:"e006",s:"Use of English",y:2015,t:"Lexis",d:"Medium",q:"Despite the rain, the athletes _______ to complete the race.",o:{A:"managed",B:"achieved",C:"succeeded",D:"accomplished"},a:"A",e:"Managed to + infinitive: correct collocation for success despite difficulty."},
  {id:"e007",s:"Use of English",y:2016,t:"Novel",d:"Hard",q:"In 'In Dependence', Tayo's relationship with Vanessa represents",o:{A:"Successful intercultural marriage",B:"African identity vs Western aspiration",C:"Academic rivalry",D:"Colonial exploitation"},a:"B",e:"Their relationship dramatises tension between Tayo's Nigerian roots and pull of British life."},
  {id:"e008",s:"Use of English",y:2017,t:"Comprehension",d:"Medium",q:"Didactic writing aims to",o:{A:"Entertain",B:"Persuade through emotion",C:"Teach or instruct",D:"Describe vividly"},a:"C",e:"Didactic: primarily aims to teach, instruct, or convey moral lessons."},
  {id:"e009",s:"Use of English",y:2018,t:"Novel",d:"Medium",q:"'In Dependence' is set primarily in",o:{A:"Nigeria and USA",B:"Nigeria and Britain",C:"Ghana and France",D:"South Africa and Britain"},a:"B",e:"Novel follows Tayo from Nigeria to Oxford and back over several decades."},
  {id:"e010",s:"Use of English",y:2019,t:"Novel",d:"Medium",q:"In 'Sweet Sixteen', Aliya's father is",o:{A:"Authoritarian",B:"Absent",C:"Progressive, warm, and communicative",D:"Religiously strict"},a:"C",e:"Aliya's father engages her in thoughtful coming-of-age conversations."},
  {id:"e011",s:"Use of English",y:2020,t:"Cloze",d:"Medium",q:"The minister's speech was full of _______ that impressed no one.",o:{A:"bombast",B:"humility",C:"precision",D:"candour"},a:"A",e:"Bombast: inflated, high-sounding language with little meaning."},
  {id:"e012",s:"Use of English",y:2021,t:"Novel",d:"Medium",q:"In 'The Life Changer', which character illustrates the dangers of drug abuse?",o:{A:"Salma",B:"Talle",C:"Ummi",D:"Omar"},a:"B",e:"Talle's descent into drug abuse and criminality is the cautionary tale."},
  {id:"e013",s:"Use of English",y:2022,t:"Novel",d:"Hard",q:"'The Life Changer' title primarily refers to",o:{A:"University campus",B:"Education as transformation",C:"Protagonist's mother",D:"Drug that ruins Talle"},a:"B",e:"Central theme: university education as life changer — for better or worse."},
  {id:"e014",s:"Use of English",y:2023,t:"Oral English",d:"Hard",q:"Which are minimal pairs based on vowel contrast?",o:{A:"bit / bat",B:"cut / cup",C:"sing / ring",D:"ship / chip"},a:"A",e:"Bit /bɪt/ and bat /bæt/ differ only in vowel → minimal pair."},
  {id:"e015",s:"Use of English",y:2024,t:"Lexis",d:"Medium",q:"He was found guilty _______ murder.",o:{A:"for",B:"about",C:"of",D:"with"},a:"C",e:"Fixed collocation: guilty of. Standard legal English."},
  {id:"e016",s:"Use of English",y:2010,t:"Comprehension",d:"Easy",q:"A narrator using 'I' is using",o:{A:"Third person omniscient",B:"Second person",C:"First person",D:"Third person limited"},a:"C",e:"First-person narration: uses I and we. Personal, subjective perspective."},
  {id:"e017",s:"Use of English",y:2011,t:"Lexis",d:"Medium",q:"Antonym of VERBOSE is",o:{A:"Talkative",B:"Concise",C:"Fluent",D:"Eloquent"},a:"B",e:"Verbose: too wordy. Antonym: concise (brief and to the point)."},
  {id:"e018",s:"Use of English",y:2012,t:"Novel",d:"Medium",q:"Central theme of 'The Potter's Wheel' is",o:{A:"Political corruption",B:"A boy's journey toward maturity through discipline",C:"War",D:"Religious conversion"},a:"B",e:"Chukwuemeka Ike: Obu's difficult boarding school experience — bildungsroman."},
  {id:"e019",s:"Use of English",y:2013,t:"Oral English",d:"Medium",q:"'Photograph' is stressed on",o:{A:"First syllable PHO-to-graph",B:"Second: pho-TO-graph",C:"Third: pho-to-GRAPH",D:"All equal"},a:"A",e:"PHO-to-graph: primary stress on first syllable."},
  {id:"e020",s:"Use of English",y:2014,t:"Lexis",d:"Hard",q:"Correct sentence with subject-verb agreement:",o:{A:"Neither of the students have submitted",B:"Neither of the students has submitted his work",C:"Neither student have submitted",D:"Neither students has submitted"},a:"B",e:"Neither takes singular verb (has). Formally: his for singular indefinite subject."},
  {id:"e021",s:"Use of English",y:2015,t:"Comprehension",d:"Medium",q:"Giving human qualities to abstract ideas is",o:{A:"Simile",B:"Metaphor",C:"Personification",D:"Hyperbole"},a:"C",e:"Personification: the wind whispered, justice is blind."},
  {id:"e022",s:"Use of English",y:2016,t:"Oral English",d:"Hard",q:"Which word has a silent consonant?",o:{A:"Bright",B:"Knife",C:"Bread",D:"Trust"},a:"B",e:"Knife: k is silent. Pronounced /naɪf/."},
  {id:"e023",s:"Use of English",y:2017,t:"Lexis",d:"Medium",q:"Correct collocation: He made a _______ decision.",o:{A:"rash",B:"quick-minded",C:"hasty-minded",D:"fast"},a:"A",e:"Rash decision: standard collocation meaning hasty, poorly considered."},
  {id:"e024",s:"Use of English",y:2018,t:"Novel",d:"Hard",q:"Key literary technique in 'In Dependence' is",o:{A:"Stream of consciousness",B:"Epistolary form (letters)",C:"Magical realism",D:"Dramatic monologue"},a:"B",e:"Manyika uses letters to convey emotional distance and longing across continents."},
  {id:"e025",s:"Use of English",y:2019,t:"Novel",d:"Hard",q:"'Sweet Sixteen' is best described as",o:{A:"Political satire",B:"Coming-of-age novel (bildungsroman)",C:"Historical fiction",D:"Tragic romance"},a:"B",e:"Bolaji Abdullahi: Aliya's 16th birthday conversations — coming-of-age."},
  {id:"e026",s:"Use of English",y:2020,t:"Lexis",d:"Easy",q:"Synonym of DILIGENT is",o:{A:"Lazy",B:"Hardworking",C:"Clever",D:"Dishonest"},a:"B",e:"Diligent: careful and persistent. Synonym: hardworking, industrious."},
  {id:"e027",s:"Use of English",y:2021,t:"Comprehension",d:"Medium",q:"Irony involves",o:{A:"Saying exactly what you mean",B:"Exaggerating for effect",C:"Saying the opposite of what you mean for effect",D:"Comparing two unlike things"},a:"C",e:"Verbal irony: saying opposite of what is meant."},
  {id:"e028",s:"Use of English",y:2022,t:"Novel",d:"Medium",q:"Ummi in 'The Life Changer' represents",o:{A:"A villain",B:"Positive role model succeeding through hard work",C:"A drug addict",D:"An insignificant character"},a:"B",e:"Ummi: focused, disciplined, morally grounded — contrasts with Talle."},
  {id:"e029",s:"Use of English",y:2023,t:"Oral English",d:"Medium",q:"'Economics' is stressed as",o:{A:"E-CO-no-mics",B:"e-co-NO-mics",C:"ec-o-NOM-ics",D:"EC-o-nom-ics"},a:"C",e:"Economics: stress on third syllable — ec-o-NOM-ics."},
  {id:"e030",s:"Use of English",y:2024,t:"Novel",d:"Medium",q:"'The Lekki Headmaster' is set in",o:{A:"Rural northern village",B:"Lagos suburban school",C:"Abuja office",D:"British university"},a:"B",e:"Rotimi Ogundimu: Lekki area of Lagos, exploring school administration and community."},
  {id:"e031",s:"Use of English",y:2010,t:"Lexis",d:"Hard",q:"Correct sentence: The committee _______ reached its decision.",o:{A:"have",B:"has",C:"are",D:"were"},a:"B",e:"Committee: collective noun takes singular verb (has) in formal English."},
  {id:"e032",s:"Use of English",y:2011,t:"Comprehension",d:"Medium",q:"A passage arguing for and against a proposition is",o:{A:"Narrative",B:"Expository",C:"Argumentative/Discursive",D:"Descriptive"},a:"C",e:"Discursive essay: presents multiple perspectives before reaching conclusion."},
  {id:"e033",s:"Use of English",y:2012,t:"Novel",d:"Hard",q:"The Potter's Wheel as title metaphorically represents",o:{A:"Industrial production",B:"School shaping students like clay",C:"Obu's father's job",D:"Traditional craft"},a:"B",e:"Potter shapes clay → school shapes/moulds students, sometimes painfully."},
  {id:"e034",s:"Use of English",y:2013,t:"Oral English",d:"Easy",q:"Number of syllables in 'international'",o:{A:"4",B:"5",C:"6",D:"3"},a:"B",e:"in-ter-na-tion-al = 5 syllables."},
  {id:"e035",s:"Use of English",y:2014,t:"Lexis",d:"Medium",q:"Medicine should be taken _______ meals.",o:{A:"at",B:"in",C:"after",D:"by"},a:"C",e:"After meals: correct medical instruction collocation."},
  {id:"e036",s:"Use of English",y:2015,t:"Oral English",d:"Medium",q:"Homophone of 'knight' is",o:{A:"Night",B:"Knit",C:"Bright",D:"Right"},a:"A",e:"Knight /naɪt/ and night /naɪt/ are homophones."},
  {id:"e037",s:"Use of English",y:2016,t:"Lexis",d:"Medium",q:"I would rather _______ than lie.",o:{A:"to stay silent",B:"staying silent",C:"stay silent",D:"have stayed silent"},a:"C",e:"Would rather + base form (no to): I would rather stay silent."},
  {id:"e038",s:"Use of English",y:2017,t:"Novel",d:"Medium",q:"Nigeria gained independence in",o:{A:"1957",B:"1960",C:"1963",D:"1966"},a:"B",e:"Nigeria: independence 1 October 1960 — pivotal backdrop of In Dependence."},
  {id:"e039",s:"Use of English",y:2018,t:"Novel",d:"Medium",q:"Main narrative device in 'Sweet Sixteen' is",o:{A:"Flashback",B:"Father-daughter conversations",C:"Letters between friends",D:"Dream sequence"},a:"B",e:"Structure: series of conversations between Aliya and her father on her 16th birthday."},
  {id:"e040",s:"Use of English",y:2019,t:"Lexis",d:"Medium",q:"Odd one out: huge, enormous, gigantic, tiny",o:{A:"Huge",B:"Enormous",C:"Tiny",D:"Gigantic"},a:"C",e:"Huge, enormous, gigantic = very large. Tiny = very small — odd one out."},
  {id:"e041",s:"Use of English",y:2020,t:"Oral English",d:"Hard",q:"'gh' is completely silent in",o:{A:"Ghost",B:"Cough",C:"Though",D:"Rough"},a:"C",e:"Though: /ðoʊ/ — gh completely silent. Cough/rough: gh = /f/."},
  {id:"e042",s:"Use of English",y:2021,t:"Comprehension",d:"Medium",q:"Alliteration repeats",o:{A:"Vowel sounds",B:"Initial consonant sounds in connected words",C:"Entire phrases",D:"Rhyming end words"},a:"B",e:"Alliteration: repeated initial consonant sounds — Peter Piper picked..."},
  {id:"e043",s:"Use of English",y:2022,t:"Lexis",d:"Medium",q:"Correctly spelt word is",o:{A:"Accomodation",B:"Accommadation",C:"Accommodation",D:"Acommodation"},a:"C",e:"Accommodation: double c, double m."},
  {id:"e044",s:"Use of English",y:2023,t:"Novel",d:"Medium",q:"'The Life Changer' was authored by",o:{A:"Wole Soyinka",B:"Khadija Abubakar Jalli",C:"Chimamanda Ngozi Adichie",D:"Chinua Achebe"},a:"B",e:"Khadija Abubakar Jalli wrote The Life Changer."},
  {id:"e045",s:"Use of English",y:2024,t:"Lexis",d:"Medium",q:"Word nearest in meaning to OBSTINATE is",o:{A:"Flexible",B:"Stubborn",C:"Obedient",D:"Timid"},a:"B",e:"Obstinate means stubbornly refusing to change — synonym: stubborn."},
  {id:"e046",s:"Use of English",y:2010,t:"Oral English",d:"Medium",q:"In which word is stress on FIRST syllable?",o:{A:"comPUTE",B:"PHOtograph",C:"econOMICS",D:"adoLEScent"},a:"B",e:"PHO-to-graph: primary stress on first syllable."},
  {id:"e047",s:"Use of English",y:2011,t:"Comprehension",d:"Easy",q:"A simile compares two things using",o:{A:"is or are",B:"like or as",C:"No connective",D:"Apostrophe"},a:"B",e:"Simile: She is like a rose. He ran as fast as the wind."},
  {id:"e048",s:"Use of English",y:2012,t:"Lexis",d:"Medium",q:"EPHEMERAL means",o:{A:"Permanent",B:"Lasting only a short time",C:"Enormous",D:"Mysterious"},a:"B",e:"Ephemeral: lasting for a very short time."},
  {id:"e049",s:"Use of English",y:2013,t:"Novel",d:"Medium",q:"Author of 'The Potter's Wheel' is",o:{A:"Wole Soyinka",B:"Chinua Achebe",C:"T.M. Aluko",D:"Chukwuemeka Ike"},a:"D",e:"Chukwuemeka Ike wrote The Potter's Wheel."},
  {id:"e050",s:"Use of English",y:2014,t:"Oral English",d:"Hard",q:"Which pair are homophones?",o:{A:"Fair / fare",B:"Bit / beat",C:"Sit / set",D:"Cot / coat"},a:"A",e:"Fair /fɛː/ and fare /fɛː/ are homophones — same sound, different meaning."},

  // ── MATHEMATICS ──
  {id:"m001",s:"Mathematics",y:2010,t:"Algebra",d:"Easy",q:"Simplify: 3x + 5x − 2x",o:{A:"6x",B:"8x",C:"10x",D:"4x"},a:"A",e:"3x+5x−2x = 6x. Collect like terms."},
  {id:"m002",s:"Mathematics",y:2011,t:"Number Theory",d:"Medium",q:"Find the HCF of 36 and 48",o:{A:"6",B:"12",C:"18",D:"24"},a:"B",e:"36=4×9, 48=4×12. HCF=12."},
  {id:"m003",s:"Mathematics",y:2012,t:"Geometry",d:"Medium",q:"Area of a circle with radius 7 cm (π=22/7)",o:{A:"44 cm²",B:"154 cm²",C:"22 cm²",D:"308 cm²"},a:"B",e:"A=πr²=(22/7)×49=154 cm²."},
  {id:"m004",s:"Mathematics",y:2013,t:"Algebra",d:"Hard",q:"Solve: 2x² − 5x + 2 = 0",o:{A:"x=2 or x=½",B:"x=1 or x=2",C:"x=−2 or x=½",D:"x=2 or x=−½"},a:"A",e:"Factor: (2x−1)(x−2)=0 → x=½ or x=2."},
  {id:"m005",s:"Mathematics",y:2014,t:"Statistics",d:"Medium",q:"Mean of 4, 7, 9, 10, 15 is",o:{A:"8",B:"9",C:"10",D:"11"},a:"B",e:"Sum=45, n=5, mean=45/5=9."},
  {id:"m006",s:"Mathematics",y:2015,t:"Trigonometry",d:"Medium",q:"sin 30° =",o:{A:"√3/2",B:"1/2",C:"1/√2",D:"√3"},a:"B",e:"sin 30°=0.5=1/2."},
  {id:"m007",s:"Mathematics",y:2016,t:"Number Theory",d:"Easy",q:"Express 0.000045 in standard form",o:{A:"4.5×10⁻⁵",B:"4.5×10⁻⁴",C:"45×10⁻⁶",D:"4.5×10⁵"},a:"A",e:"Move decimal 5 places right → 4.5×10⁻⁵."},
  {id:"m008",s:"Mathematics",y:2017,t:"Algebra",d:"Hard",q:"If log₂8 = x, find x",o:{A:"2",B:"3",C:"4",D:"6"},a:"B",e:"2^x=8=2³ → x=3."},
  {id:"m009",s:"Mathematics",y:2018,t:"Geometry",d:"Medium",q:"Sum of interior angles of a hexagon",o:{A:"540°",B:"720°",C:"900°",D:"360°"},a:"B",e:"(n−2)×180=(6−2)×180=720°."},
  {id:"m010",s:"Mathematics",y:2019,t:"Algebra",d:"Medium",q:"Factorise completely: x² − 9",o:{A:"(x−3)²",B:"(x+3)(x−3)",C:"(x+9)(x−1)",D:"x(x−9)"},a:"B",e:"Difference of two squares: x²−9=(x+3)(x−3)."},
  {id:"m011",s:"Mathematics",y:2020,t:"Statistics",d:"Medium",q:"Median of 3, 5, 7, 9, 11, 13 is",o:{A:"7",B:"8",C:"9",D:"10"},a:"B",e:"Even number: median=(7+9)/2=8."},
  {id:"m012",s:"Mathematics",y:2021,t:"Trigonometry",d:"Hard",q:"cos 60° + sin 30° =",o:{A:"0",B:"½",C:"1",D:"√3"},a:"C",e:"cos60°=½, sin30°=½. Sum=1."},
  {id:"m013",s:"Mathematics",y:2022,t:"Number Theory",d:"Easy",q:"Convert 1011₂ to decimal",o:{A:"9",B:"10",C:"11",D:"12"},a:"C",e:"1×8+0×4+1×2+1×1=11."},
  {id:"m014",s:"Mathematics",y:2023,t:"Algebra",d:"Hard",q:"If 3^(x+1) = 81, find x",o:{A:"2",B:"3",C:"4",D:"5"},a:"B",e:"81=3⁴ → x+1=4 → x=3."},
  {id:"m015",s:"Mathematics",y:2024,t:"Geometry",d:"Medium",q:"Volume of a cylinder r=3, h=10 (π≈3.14)",o:{A:"282.6",B:"188.4",C:"94.2",D:"565.2"},a:"A",e:"V=πr²h=3.14×9×10=282.6 cm³."},
  {id:"m016",s:"Mathematics",y:2010,t:"Algebra",d:"Medium",q:"Solve: 5(x−2) = 3(x+4)",o:{A:"x=11",B:"x=13",C:"x=7",D:"x=9"},a:"A",e:"5x−10=3x+12 → 2x=22 → x=11."},
  {id:"m017",s:"Mathematics",y:2011,t:"Statistics",d:"Easy",q:"Mode of: 3, 5, 3, 7, 3, 9, 5",o:{A:"5",B:"3",C:"7",D:"9"},a:"B",e:"3 appears most often (3 times) → mode=3."},
  {id:"m018",s:"Mathematics",y:2012,t:"Number Theory",d:"Medium",q:"LCM of 12 and 18",o:{A:"6",B:"24",C:"36",D:"72"},a:"C",e:"12=2²×3, 18=2×3². LCM=2²×3²=36."},
  {id:"m019",s:"Mathematics",y:2013,t:"Geometry",d:"Easy",q:"Angles of a triangle sum to",o:{A:"90°",B:"180°",C:"270°",D:"360°"},a:"B",e:"Sum of interior angles of any triangle=180°."},
  {id:"m020",s:"Mathematics",y:2014,t:"Algebra",d:"Hard",q:"Expand (2x+3)²",o:{A:"4x²+9",B:"4x²+6x+9",C:"4x²+12x+9",D:"2x²+12x+9"},a:"C",e:"(2x+3)²=4x²+2(2x)(3)+9=4x²+12x+9."},
  {id:"m021",s:"Mathematics",y:2015,t:"Trigonometry",d:"Medium",q:"tan 45° =",o:{A:"0",B:"1",C:"√2",D:"√3"},a:"B",e:"tan45°=sin45°/cos45°=1."},
  {id:"m022",s:"Mathematics",y:2016,t:"Statistics",d:"Hard",q:"Standard deviation measures",o:{A:"Central tendency",B:"Spread/dispersion around the mean",C:"Highest value",D:"Frequency"},a:"B",e:"Standard deviation: how much values deviate from the mean on average."},
  {id:"m023",s:"Mathematics",y:2017,t:"Number Theory",d:"Medium",q:"Evaluate: 3! + 4!",o:{A:"18",B:"30",C:"36",D:"42"},a:"B",e:"3!=6, 4!=24. Sum=30."},
  {id:"m024",s:"Mathematics",y:2018,t:"Algebra",d:"Medium",q:"If f(x)=2x²−3, find f(−2)",o:{A:"5",B:"−5",C:"1",D:"−1"},a:"A",e:"f(−2)=2(4)−3=8−3=5."},
  {id:"m025",s:"Mathematics",y:2019,t:"Geometry",d:"Hard",q:"Pythagoras: hypotenuse with legs 5 and 12",o:{A:"13",B:"15",C:"17",D:"7"},a:"A",e:"h=√(25+144)=√169=13."},
  {id:"m026",s:"Mathematics",y:2020,t:"Algebra",d:"Medium",q:"Solve: |2x−3|=7",o:{A:"x=5 or x=−2",B:"x=5 or x=2",C:"x=−5 or x=2",D:"x=5 only"},a:"A",e:"2x−3=7→x=5 or 2x−3=−7→x=−2."},
  {id:"m027",s:"Mathematics",y:2021,t:"Statistics",d:"Easy",q:"Probability of rolling a 4 on a fair die",o:{A:"1/2",B:"1/4",C:"1/6",D:"1/3"},a:"C",e:"6 equally likely outcomes; only one is 4. P=1/6."},
  {id:"m028",s:"Mathematics",y:2022,t:"Number Theory",d:"Hard",q:"Simplify: (2³×3²)/(2×3⁰)",o:{A:"12",B:"36",C:"24",D:"18"},a:"A",e:"=8×9/(2×1)=72/6=12."},
  {id:"m029",s:"Mathematics",y:2023,t:"Algebra",d:"Medium",q:"If x:y = 3:5 and x+y=40, find x",o:{A:"12",B:"15",C:"20",D:"25"},a:"B",e:"x=3k, y=5k, 8k=40 → k=5, x=15."},
  {id:"m030",s:"Mathematics",y:2024,t:"Geometry",d:"Hard",q:"Area of triangle with base 8 cm, height 5 cm",o:{A:"13 cm²",B:"40 cm²",C:"20 cm²",D:"80 cm²"},a:"C",e:"A=½bh=½×8×5=20 cm²."},

  // ── BIOLOGY ──
  {id:"b001",s:"Biology",y:2010,t:"Cell Biology",d:"Easy",q:"The powerhouse of the cell is the",o:{A:"Nucleus",B:"Ribosome",C:"Mitochondrion",D:"Golgi body"},a:"C",e:"Mitochondria produce ATP via cellular respiration — the energy currency of the cell."},
  {id:"b002",s:"Biology",y:2011,t:"Cell Biology",d:"Easy",q:"Which organelle is the site of protein synthesis?",o:{A:"Mitochondrion",B:"Ribosome",C:"Lysosome",D:"Vacuole"},a:"B",e:"Ribosomes translate mRNA into polypeptide chains."},
  {id:"b003",s:"Biology",y:2012,t:"Cell Biology",d:"Easy",q:"Plant cell walls are mainly composed of",o:{A:"Chitin",B:"Pectin",C:"Cellulose",D:"Lignin"},a:"C",e:"Cellulose microfibrils form the structural scaffold of plant cell walls."},
  {id:"b004",s:"Biology",y:2013,t:"Cell Biology",d:"Medium",q:"Which is NOT found in a prokaryotic cell?",o:{A:"Cell wall",B:"Ribosome",C:"Mitochondrion",D:"Cell membrane"},a:"C",e:"Prokaryotes lack membrane-bound organelles including mitochondria."},
  {id:"b005",s:"Biology",y:2014,t:"Cell Biology",d:"Medium",q:"Engulfment of large solid particles by a cell is called",o:{A:"Pinocytosis",B:"Phagocytosis",C:"Osmosis",D:"Exocytosis"},a:"B",e:"Phagocytosis (cell eating) ingests solids like bacteria."},
  {id:"b006",s:"Biology",y:2015,t:"Genetics",d:"Easy",q:"The basic unit of heredity is the",o:{A:"Chromosome",B:"Gene",C:"Allele",D:"Nucleotide"},a:"B",e:"A gene is a DNA segment coding for a specific protein — the fundamental hereditary unit."},
  {id:"b007",s:"Biology",y:2016,t:"Genetics",d:"Medium",q:"Phenotypic ratio from Aa × Aa cross is",o:{A:"1:2:1",B:"3:1",C:"1:1",D:"9:3:3:1"},a:"B",e:"AA and Aa show dominant phenotype; aa shows recessive. Ratio 3 dominant : 1 recessive."},
  {id:"b008",s:"Biology",y:2017,t:"Ecology",d:"Easy",q:"An ecosystem includes",o:{A:"Only living organisms",B:"Only physical environment",C:"All organisms and their physical environment",D:"Only plants"},a:"C",e:"Ecosystem = all biotic and abiotic components interacting in an area."},
  {id:"b009",s:"Biology",y:2018,t:"Nutrition",d:"Easy",q:"Pepsin acts on proteins in the",o:{A:"Mouth",B:"Stomach",C:"Small intestine",D:"Large intestine"},a:"B",e:"Pepsin is a protease active at pH 1.5–2.0 in the stomach."},
  {id:"b010",s:"Biology",y:2019,t:"Transport",d:"Easy",q:"Pulmonary vein carries",o:{A:"Deoxygenated blood from heart to lungs",B:"Oxygenated blood from lungs to left atrium",C:"Oxygenated blood to body",D:"Deoxygenated blood from body"},a:"B",e:"Pulmonary vein: oxygenated blood from lungs to left atrium."},
  {id:"b011",s:"Biology",y:2020,t:"Respiration",d:"Medium",q:"Net ATP gain from glycolysis is",o:{A:"38",B:"4",C:"2",D:"36"},a:"C",e:"Glycolysis: 4 ATP produced minus 2 ATP used = net 2 ATP."},
  {id:"b012",s:"Biology",y:2021,t:"Excretion",d:"Easy",q:"Functional unit of the kidney is the",o:{A:"Glomerulus",B:"Nephron",C:"Ureter",D:"Renal pelvis"},a:"B",e:"Nephron: complete structural and functional unit. ~1 million per kidney."},
  {id:"b013",s:"Biology",y:2022,t:"Reproduction",d:"Easy",q:"Meiosis produces cells that are",o:{A:"Diploid and identical",B:"Haploid and genetically varied",C:"Diploid and varied",D:"Haploid and identical"},a:"B",e:"Meiosis: 4 haploid cells, each genetically unique."},
  {id:"b014",s:"Biology",y:2023,t:"Nervous System",d:"Easy",q:"Basic unit of the nervous system is the",o:{A:"Synapse",B:"Neuron",C:"Myelin sheath",D:"Dendrite"},a:"B",e:"Neuron: structural and functional unit of nervous system."},
  {id:"b015",s:"Biology",y:2024,t:"Evolution",d:"Easy",q:"Natural selection was proposed by",o:{A:"Mendel",B:"Lamarck",C:"Darwin",D:"Pasteur"},a:"C",e:"Darwin (and Wallace) proposed natural selection in 1858/1859."},
  {id:"b016",s:"Biology",y:2010,t:"Plant Biology",d:"Easy",q:"Guard cells control the opening of",o:{A:"Root hair cells",B:"Stomata",C:"Lenticels",D:"Phloem tubes"},a:"B",e:"Guard cells regulate stomatal aperture. Turgid → open; flaccid → close."},
  {id:"b017",s:"Biology",y:2011,t:"Ecology",d:"Medium",q:"Energy transferred between trophic levels is approximately",o:{A:"1%",B:"10%",C:"50%",D:"90%"},a:"B",e:"10% rule: about 10% of energy at one trophic level passes to the next."},
  {id:"b018",s:"Biology",y:2012,t:"Cell Biology",d:"Hard",q:"Smooth endoplasmic reticulum is mainly responsible for",o:{A:"Protein synthesis",B:"Lipid synthesis and detoxification",C:"ATP production",D:"DNA replication"},a:"B",e:"Smooth ER synthesises lipids, steroids, and detoxifies drugs."},
  {id:"b019",s:"Biology",y:2013,t:"Genetics",d:"Hard",q:"Sickle cell anaemia substitutes glutamic acid with",o:{A:"Alanine",B:"Valine",C:"Glycine",D:"Proline"},a:"B",e:"Point mutation: glutamic acid at position 6 of beta-globin replaced by valine."},
  {id:"b020",s:"Biology",y:2014,t:"Ecology",d:"Medium",q:"Mutualism: both organisms",o:{A:"One benefits, other harmed",B:"Benefit (+/+)",C:"One benefits, other unaffected",D:"Both harmed"},a:"B",e:"Mutualism (+/+): both benefit. Example: Rhizobium in legume root nodules."},
  {id:"b021",s:"Biology",y:2015,t:"Transport",d:"Hard",q:"Water rises up tall trees mainly due to",o:{A:"Root pressure alone",B:"Transpiration pull and cohesion-tension",C:"Active transport",D:"Osmosis through phloem"},a:"B",e:"Cohesion-tension: transpiration creates negative pressure; water cohesion pulls column up."},
  {id:"b022",s:"Biology",y:2016,t:"Respiration",d:"Hard",q:"Krebs cycle occurs in the",o:{A:"Cytoplasm",B:"Nucleus",C:"Mitochondrial matrix",D:"Thylakoid"},a:"C",e:"Krebs cycle in mitochondrial matrix oxidises acetyl-CoA, releasing CO₂ and NADH."},
  {id:"b023",s:"Biology",y:2017,t:"Plant Biology",d:"Easy",q:"Overall equation for photosynthesis is",o:{A:"C₆H₁₂O₆+6O₂→6CO₂+6H₂O",B:"6CO₂+6H₂O→C₆H₁₂O₆+6O₂",C:"C₆H₁₂O₆→2C₂H₅OH+2CO₂",D:"2H₂O→4H+O₂"},a:"B",e:"6CO₂+6H₂O+light → C₆H₁₂O₆+6O₂."},
  {id:"b024",s:"Biology",y:2018,t:"Classification",d:"Easy",q:"Binomial nomenclature was introduced by",o:{A:"Darwin",B:"Mendel",C:"Linnaeus",D:"Pasteur"},a:"C",e:"Linnaeus (1758): two-part Latin naming system — Genus + species."},
  {id:"b025",s:"Biology",y:2019,t:"Nutrition",d:"Easy",q:"Main site of nutrient absorption is the",o:{A:"Stomach",B:"Large intestine",C:"Small intestine",D:"Oesophagus"},a:"C",e:"Villi and microvilli in the small intestine provide enormous surface area for absorption."},
  {id:"b026",s:"Biology",y:2020,t:"Genetics",d:"Medium",q:"Down syndrome results from",o:{A:"Deletion of chromosome 21",B:"Trisomy 21",C:"Monosomy X",D:"Inversion of chromosome 21"},a:"B",e:"Trisomy 21: three copies of chromosome 21 due to non-disjunction."},
  {id:"b027",s:"Biology",y:2021,t:"Cell Division",d:"Medium",q:"In mitosis, chromatids are pulled to opposite poles during",o:{A:"Prophase",B:"Metaphase",C:"Anaphase",D:"Telophase"},a:"C",e:"Anaphase: centromeres split, spindle fibres pull sister chromatids to opposite poles."},
  {id:"b028",s:"Biology",y:2022,t:"Hormones",d:"Easy",q:"Insulin is produced by the",o:{A:"Liver",B:"Adrenal gland",C:"Pancreatic beta cells",D:"Thyroid"},a:"C",e:"Beta cells of islets of Langerhans (pancreas) secrete insulin to lower blood glucose."},
  {id:"b029",s:"Biology",y:2023,t:"Excretion",d:"Hard",q:"Urea is formed by the",o:{A:"Krebs cycle",B:"Ornithine (urea) cycle",C:"Glycolysis",D:"ETC"},a:"B",e:"Ornithine cycle in liver converts toxic ammonia → urea for kidney excretion."},
  {id:"b030",s:"Biology",y:2024,t:"Transport",d:"Easy",q:"Transpiration is the",o:{A:"Uptake of water by roots",B:"Water transport through xylem",C:"Loss of water vapour from aerial plant parts",D:"Absorption of minerals"},a:"C",e:"Transpiration: evaporation of water through stomata. Drives the transpiration stream."},

  // ── PHYSICS ──
  {id:"p001",s:"Physics",y:2010,t:"Mechanics",d:"Easy",q:"A body with uniform velocity has",o:{A:"Zero acceleration",B:"Constant acceleration",C:"Increasing speed",D:"Decreasing momentum"},a:"A",e:"Uniform velocity means constant speed and direction. No change in velocity → zero acceleration."},
  {id:"p002",s:"Physics",y:2011,t:"Waves",d:"Medium",q:"Wave frequency 50 Hz, wavelength 4 m. Speed is",o:{A:"12.5 m/s",B:"54 m/s",C:"200 m/s",D:"46 m/s"},a:"C",e:"v=fλ=50×4=200 m/s."},
  {id:"p003",s:"Physics",y:2012,t:"Electricity",d:"Hard",q:"Three 6-ohm resistors in parallel. Equivalent resistance is",o:{A:"18 Ω",B:"6 Ω",C:"3 Ω",D:"2 Ω"},a:"D",e:"1/R=1/6+1/6+1/6=3/6=1/2 → R=2 Ω."},
  {id:"p004",s:"Physics",y:2013,t:"Optics",d:"Medium",q:"The sky appears blue because of",o:{A:"Reflection",B:"Refraction",C:"Rayleigh scattering",D:"Diffraction"},a:"C",e:"Blue light (shorter wavelength) is scattered more by atmospheric particles."},
  {id:"p005",s:"Physics",y:2014,t:"Thermodynamics",d:"Medium",q:"Heat cannot spontaneously flow from cold to hot. This is the",o:{A:"Zeroth law",B:"First law",C:"Second law",D:"Third law"},a:"C",e:"Second Law of Thermodynamics. Heat flows spontaneously only from hot to cold."},
  {id:"p006",s:"Physics",y:2015,t:"Mechanics",d:"Medium",q:"A 5 kg body acted on by 20 N. Acceleration is",o:{A:"0.25 m/s²",B:"4 m/s²",C:"100 m/s²",D:"2.5 m/s²"},a:"B",e:"F=ma → a=20/5=4 m/s²."},
  {id:"p007",s:"Physics",y:2016,t:"Waves",d:"Easy",q:"Sound cannot travel through",o:{A:"Water",B:"Steel",C:"A vacuum",D:"Air"},a:"C",e:"Sound is a mechanical wave requiring particles to vibrate. No particles in vacuum."},
  {id:"p008",s:"Physics",y:2017,t:"Nuclear Physics",d:"Hard",q:"U-238 undergoes alpha decay. Daughter nucleus is",o:{A:"234-90-Th",B:"234-92-U",C:"238-90-Th",D:"236-91-Pa"},a:"A",e:"Alpha decay: A decreases by 4, Z by 2. 238−4=234, 92−2=90 → Thorium-234."},
  {id:"p009",s:"Physics",y:2018,t:"Electricity",d:"Hard",q:"Power in 4 Ω resistor with 3 A current is",o:{A:"12 W",B:"36 W",C:"0.75 W",D:"48 W"},a:"B",e:"P=I²R=9×4=36 W."},
  {id:"p010",s:"Physics",y:2019,t:"Mechanics",d:"Medium",q:"Ball dropped from 20 m (g=10). Time to reach ground is",o:{A:"1 s",B:"2 s",C:"4 s",D:"√2 s"},a:"B",e:"h=½gt² → 20=5t² → t²=4 → t=2 s."},
  {id:"p011",s:"Physics",y:2020,t:"Optics",d:"Medium",q:"Concave mirror f=10 cm, object at 30 cm. Image distance is",o:{A:"15 cm in front",B:"15 cm behind",C:"20 cm in front",D:"60 cm in front"},a:"A",e:"1/10=1/v+1/30 → 1/v=2/30 → v=15 cm."},
  {id:"p012",s:"Physics",y:2021,t:"Mechanics",d:"Easy",q:"SI unit of force is the",o:{A:"Watt",B:"Joule",C:"Newton",D:"Pascal"},a:"C",e:"Force measured in Newtons. 1 N = 1 kg·m/s²."},
  {id:"p013",s:"Physics",y:2022,t:"Electricity",d:"Easy",q:"Ohm's Law states (constant temperature)",o:{A:"V=I+R",B:"V=IR",C:"I=VR",D:"R=V+I"},a:"B",e:"V=IR (voltage=current×resistance)."},
  {id:"p014",s:"Physics",y:2023,t:"Nuclear Physics",d:"Hard",q:"Half-life 4 years. Fraction remaining after 12 years is",o:{A:"1/2",B:"1/4",C:"1/8",D:"1/16"},a:"C",e:"3 half-lives: (1/2)³=1/8."},
  {id:"p015",s:"Physics",y:2024,t:"Mechanics",d:"Hard",q:"Stone thrown up at 20 m/s (g=10). Max height is",o:{A:"10 m",B:"20 m",C:"40 m",D:"80 m"},a:"B",e:"v²=u²−2gh: 0=400−20h → h=20 m."},
  {id:"p016",s:"Physics",y:2010,t:"Waves",d:"Easy",q:"Amplitude of a wave is the",o:{A:"Distance between crests",B:"Waves per second",C:"Maximum displacement from equilibrium",D:"Wave speed"},a:"C",e:"Amplitude=maximum displacement of particle from equilibrium position."},
  {id:"p017",s:"Physics",y:2011,t:"Thermodynamics",d:"Easy",q:"Best conductor of heat is",o:{A:"Glass",B:"Wood",C:"Copper",D:"Rubber"},a:"C",e:"Copper has free electrons that efficiently transfer thermal energy."},
  {id:"p018",s:"Physics",y:2012,t:"Electricity",d:"Medium",q:"Energy of 60 W bulb in 2 hours is",o:{A:"30 J",B:"120 J",C:"432000 J",D:"720 J"},a:"C",e:"E=Pt=60×7200=432000 J."},
  {id:"p019",s:"Physics",y:2013,t:"Magnetism",d:"Medium",q:"Fleming's left-hand rule gives direction of",o:{A:"Induced EMF",B:"Force on current-carrying conductor in field",C:"Magnetic pole",D:"Electron flow"},a:"B",e:"Motor rule: thumb=force, index=field, middle=conventional current."},
  {id:"p020",s:"Physics",y:2014,t:"Mechanics",d:"Medium",q:"Kinetic energy formula is",o:{A:"mv",B:"mv²",C:"½mv²",D:"2mv²"},a:"C",e:"KE=½mv²."},
  {id:"p021",s:"Physics",y:2015,t:"Mechanics",d:"Medium",q:"Pressure is",o:{A:"Force×Area",B:"Force÷Area",C:"Mass÷Volume",D:"Weight×Height"},a:"B",e:"P=F/A. Unit: Pascal=N/m²."},
  {id:"p022",s:"Physics",y:2016,t:"Thermodynamics",d:"Medium",q:"Gas compressed isothermally. Pressure",o:{A:"Decreases",B:"Increases",C:"Stays constant",D:"Becomes zero"},a:"B",e:"Boyle's Law: PV=constant. If V decreases, P increases."},
  {id:"p023",s:"Physics",y:2017,t:"Waves",d:"Hard",q:"Constructive interference when path difference equals",o:{A:"λ/2",B:"Odd multiples of λ/2",C:"Integer multiples of λ",D:"Quarter wavelength"},a:"C",e:"Constructive: path diff=nλ (n=0,1,2...) — waves in phase."},
  {id:"p024",s:"Physics",y:2018,t:"Optics",d:"Easy",q:"Law of reflection: angle of incidence",o:{A:"Greater than reflection",B:"Equals angle of reflection",C:"Less than reflection",D:"Always 90°"},a:"B",e:"θᵢ=θᵣ (measured from normal). Applies to all reflecting surfaces."},
  {id:"p025",s:"Physics",y:2019,t:"Mechanics",d:"Easy",q:"Conservation of energy states energy",o:{A:"Can be created",B:"Cannot be created or destroyed, only transformed",C:"Is always kinetic",D:"Equals KE always"},a:"B",e:"Energy cannot be created or destroyed — only converted between forms."},
  {id:"p026",s:"Physics",y:2020,t:"Nuclear Physics",d:"Easy",q:"Gamma rays are",o:{A:"Fast electrons",B:"Helium nuclei",C:"High-energy EM radiation",D:"Neutrons"},a:"C",e:"Gamma rays: EM radiation, very high frequency, no charge, no mass."},
  {id:"p027",s:"Physics",y:2021,t:"Electricity",d:"Medium",q:"In parallel circuit, all components share the same",o:{A:"Current",B:"Resistance",C:"Potential difference",D:"Power"},a:"C",e:"Parallel: all components connected between same two nodes → same voltage."},
  {id:"p028",s:"Physics",y:2022,t:"Mechanics",d:"Medium",q:"Newton's First Law: body at rest stays at rest unless",o:{A:"Gravity alone",B:"Net external force acts",C:"Friction",D:"Air resistance"},a:"B",e:"Law of Inertia: body remains at rest or in uniform motion unless net external force acts."},
  {id:"p029",s:"Physics",y:2023,t:"Optics",d:"Medium",q:"Convex lens corrects",o:{A:"Myopia",B:"Hypermetropia",C:"Astigmatism",D:"Colour blindness"},a:"B",e:"Hypermetropia: eyeball too short. Convex lens converges rays onto retina."},
  {id:"p030",s:"Physics",y:2024,t:"Electricity",d:"Hard",q:"Transformer turns ratio Ns:Np=1:10, Vp=240 V. Vs is",o:{A:"2400 V",B:"24 V",C:"240 V",D:"0.24 V"},a:"B",e:"Vs=Vp×Ns/Np=240×1/10=24 V."},

  // ── CHEMISTRY ──
  {id:"c001",s:"Chemistry",y:2010,t:"Atomic Structure",d:"Easy",q:"Number of protons determines",o:{A:"Mass number",B:"Atomic number",C:"Number of neutrons",D:"Isotope type"},a:"B",e:"Atomic number Z=proton count. Unique for each element."},
  {id:"c002",s:"Chemistry",y:2011,t:"Chemical Bonding",d:"Medium",q:"Which has a dative (coordinate) covalent bond?",o:{A:"NaCl",B:"H₂O",C:"NH₄⁺",D:"CO₂"},a:"C",e:"In NH₄⁺, N donates both electrons for one N-H bond from its lone pair."},
  {id:"c003",s:"Chemistry",y:2012,t:"Stoichiometry",d:"Hard",q:"40 g NaOH + excess HCl → NaCl formed (Na=23,Cl=35.5)?",o:{A:"58.5 g",B:"40 g",C:"29.25 g",D:"117 g"},a:"A",e:"40 g NaOH=1 mol → 1 mol NaCl. Mass=58.5 g."},
  {id:"c004",s:"Chemistry",y:2013,t:"Redox",d:"Medium",q:"In 2Mg+O₂→2MgO, Mg is",o:{A:"Reduced",B:"Oxidised",C:"A catalyst",D:"Oxidising agent"},a:"B",e:"Mg→Mg²⁺+2e⁻. Loss of electrons=oxidation (OIL RIG)."},
  {id:"c005",s:"Chemistry",y:2014,t:"Gas Laws",d:"Hard",q:"Gas at 27°C occupies 200 cm³. At 127°C (same P) volume is",o:{A:"266.7 cm³",B:"400 cm³",C:"100 cm³",D:"150 cm³"},a:"A",e:"Charles: V1/T1=V2/T2. V2=200×400/300=266.7 cm³."},
  {id:"c006",s:"Chemistry",y:2015,t:"Periodic Table",d:"Medium",q:"Across Period 3, which INCREASES?",o:{A:"Atomic radius",B:"Metallic character",C:"Electronegativity",D:"Electron shells"},a:"C",e:"Increasing Z across period → stronger nuclear attraction → higher electronegativity."},
  {id:"c007",s:"Chemistry",y:2016,t:"Organic Chemistry",d:"Medium",q:"IUPAC name of CH₃CH₂CH₂OH is",o:{A:"Ethanol",B:"Propan-1-ol",C:"Propan-2-ol",D:"Butan-1-ol"},a:"B",e:"3C (prop-), OH on C1 (-an-1-ol)=propan-1-ol."},
  {id:"c008",s:"Chemistry",y:2017,t:"Equilibrium",d:"Hard",q:"N₂+3H₂⇌2NH₃. Increasing pressure shifts equilibrium",o:{A:"Left",B:"Right",C:"Neither",D:"Both"},a:"B",e:"Left: 4 mol gas; right: 2 mol. Higher P favours fewer moles → right."},
  {id:"c009",s:"Chemistry",y:2018,t:"Electrochemistry",d:"Medium",q:"Gas at cathode during electrolysis of dilute H₂SO₄ is",o:{A:"Oxygen",B:"Hydrogen",C:"SO₂",D:"CO₂"},a:"B",e:"Cathode: 2H⁺+2e⁻→H₂. Reduction at negative electrode."},
  {id:"c010",s:"Chemistry",y:2019,t:"Acids and Bases",d:"Easy",q:"pH=2 indicates solution is",o:{A:"Weakly acidic",B:"Neutral",C:"Strongly acidic",D:"Alkaline"},a:"C",e:"pH 2 → [H⁺]=0.01 mol/L — strongly acidic."},
  {id:"c011",s:"Chemistry",y:2020,t:"Kinetics",d:"Medium",q:"Catalyst increases rate by",o:{A:"Increasing concentration",B:"Raising temperature",C:"Providing alternative pathway with lower activation energy",D:"Increasing pressure"},a:"C",e:"Catalyst lowers Ea → more molecules react → faster rate. Not consumed."},
  {id:"c012",s:"Chemistry",y:2021,t:"Organic Chemistry",d:"Medium",q:"Fermentation of glucose produces",o:{A:"Ethanol and CO₂",B:"Methanol and water",C:"Lactic acid",D:"Ethanoic acid"},a:"A",e:"Yeast fermentation: C₆H₁₂O₆→2C₂H₅OH+2CO₂."},
  {id:"c013",s:"Chemistry",y:2022,t:"Thermochemistry",d:"Medium",q:"Exothermic reaction",o:{A:"Absorbs heat",B:"Releases heat (ΔH<0)",C:"No energy change",D:"Only at high T"},a:"B",e:"Exothermic: ΔH negative. Heat released to surroundings."},
  {id:"c014",s:"Chemistry",y:2023,t:"Stoichiometry",d:"Medium",q:"Moles of Al in 27 g (Ar=27) is",o:{A:"0.5",B:"1",C:"2",D:"27"},a:"B",e:"n=27/27=1 mol."},
  {id:"c015",s:"Chemistry",y:2024,t:"Chemical Bonding",d:"Medium",q:"Shape of H₂O molecule is",o:{A:"Linear",B:"Trigonal planar",C:"Bent (~104.5°)",D:"Tetrahedral"},a:"C",e:"VSEPR: 2 bond pairs+2 lone pairs → bent, 104.5°."},
  {id:"c016",s:"Chemistry",y:2010,t:"Redox",d:"Hard",q:"Oxidation number of Cr in K₂Cr₂O₇ is",o:{A:"+2",B:"+3",C:"+6",D:"+7"},a:"C",e:"K=+1(×2=+2), O=−2(×7=−14). +2+2Cr−14=0 → Cr=+6."},
  {id:"c017",s:"Chemistry",y:2011,t:"Organic Chemistry",d:"Hard",q:"Cold dilute KMnO₄ converts alkenes to",o:{A:"Alkanes",B:"Diols",C:"Carboxylic acids",D:"Ketones"},a:"B",e:"Cold dilute KMnO₄ (Baeyer's): alkene→diol. Purple→colourless."},
  {id:"c018",s:"Chemistry",y:2012,t:"Stoichiometry",d:"Medium",q:"Mr of H₂SO₄ (H=1,S=32,O=16) is",o:{A:"49",B:"98",C:"64",D:"80"},a:"B",e:"2(1)+32+4(16)=2+32+64=98 g/mol."},
  {id:"c019",s:"Chemistry",y:2013,t:"Electrochemistry",d:"Medium",q:"Product at anode during brine electrolysis is",o:{A:"Sodium",B:"Hydrogen",C:"Chlorine",D:"Oxygen"},a:"C",e:"Anode: 2Cl⁻→Cl₂+2e⁻. Concentrated brine gives Cl₂."},
  {id:"c020",s:"Chemistry",y:2014,t:"Equilibrium",d:"Hard",q:"Equilibrium constant K changes only when",o:{A:"Concentration changes",B:"Pressure changes",C:"Temperature changes",D:"Catalyst added"},a:"C",e:"K depends only on temperature. Concentration, pressure, catalyst do NOT change K."},
  {id:"c021",s:"Chemistry",y:2015,t:"Organic Chemistry",d:"Medium",q:"General formula of alkenes is",o:{A:"CₙH₂ₙ₊₂",B:"CₙH₂ₙ",C:"CₙH₂ₙ₋₂",D:"CₙHₙ"},a:"B",e:"Alkenes with one C=C: CₙH₂ₙ."},
  {id:"c022",s:"Chemistry",y:2016,t:"Atomic Structure",d:"Medium",q:"Isotopes have same",o:{A:"Mass number",B:"Neutrons",C:"Protons (atomic number)",D:"Density"},a:"C",e:"Isotopes: same Z, different A (different neutron count)."},
  {id:"c023",s:"Chemistry",y:2017,t:"Chemical Bonding",d:"Hard",q:"Highest melting point among NaCl, CCl₄, ice, diamond is",o:{A:"NaCl",B:"CCl₄",C:"Ice",D:"Diamond"},a:"D",e:"Diamond: giant covalent lattice with strong C-C bonds → highest melting point."},
  {id:"c024",s:"Chemistry",y:2018,t:"Organic Chemistry",d:"Medium",q:"Alkenes react with bromine by",o:{A:"Free radical substitution",B:"Electrophilic addition",C:"Nucleophilic substitution",D:"Elimination"},a:"B",e:"C=C is nucleophilic. Br₂ (electrophile) adds across double bond."},
  {id:"c025",s:"Chemistry",y:2019,t:"Thermochemistry",d:"Hard",q:"Which is ENDOTHERMIC?",o:{A:"Methane combustion",B:"Neutralisation",C:"Decomposition of limestone",D:"Rusting of iron"},a:"C",e:"CaCO₃→CaO+CO₂: ΔH=+179 kJ/mol. Requires heat."},
  {id:"c026",s:"Chemistry",y:2020,t:"Acids and Bases",d:"Medium",q:"Buffer solution contains",o:{A:"Strong acid and strong base",B:"Weak acid and its conjugate base",C:"Distilled water only",D:"Neutral salt"},a:"B",e:"Buffer resists pH change: weak acid HA + conjugate base A⁻."},
  {id:"c027",s:"Chemistry",y:2021,t:"Gas Laws",d:"Medium",q:"Boyle's Law states (constant T)",o:{A:"V∝T",B:"PV=constant",C:"P/T=constant",D:"V/T=constant"},a:"B",e:"Boyle's: PV=k at constant T. P and V inversely proportional."},
  {id:"c028",s:"Chemistry",y:2022,t:"Organic Chemistry",d:"Medium",q:"Carboxylic acid functional group is",o:{A:"−OH",B:"−COOH",C:"−CHO",D:"−CO−"},a:"B",e:"−COOH (carboxyl group): carbonyl+hydroxyl on same carbon."},
  {id:"c029",s:"Chemistry",y:2023,t:"Stoichiometry",d:"Hard",q:"5.85 g NaCl (Mr=58.5) in 500 cm³. Concentration is",o:{A:"0.1 mol/L",B:"0.2 mol/L",C:"1.0 mol/L",D:"2.0 mol/L"},a:"B",e:"n=5.85/58.5=0.1 mol. c=0.1/0.5=0.2 mol/L."},
  {id:"c030",s:"Chemistry",y:2024,t:"Periodic Table",d:"Medium",q:"Alkali metals more reactive down group because",o:{A:"Radius decreases",B:"Outer electron further from nucleus, lower IE, easier to lose",C:"Electronegativity increases",D:"More protons"},a:"B",e:"Down Group I: larger atom, more shielding → lower IE → easier to lose electron."},

  // ── ECONOMICS ──
  {id:"ec001",s:"Economics",y:2010,t:"Microeconomics",d:"Easy",q:"The law of demand states that, all things equal, as price rises",o:{A:"Quantity demanded rises",B:"Quantity demanded falls",C:"Supply rises",D:"Income rises"},a:"B",e:"Inverse relationship between price and quantity demanded — demand curve slopes downward."},
  {id:"ec002",s:"Economics",y:2011,t:"Macroeconomics",d:"Medium",q:"GDP measures",o:{A:"Total household income",B:"Total value of goods and services produced in a country in a year",C:"Government revenue",D:"Trade balance"},a:"B",e:"GDP=Gross Domestic Product: total monetary value of all final goods and services."},
  {id:"ec003",s:"Economics",y:2012,t:"Microeconomics",d:"Medium",q:"Price elasticity of demand measures",o:{A:"Change in supply to price",B:"Responsiveness of quantity demanded to price change",C:"Income sensitivity",D:"Cross-price relationship"},a:"B",e:"PED=(%ΔQd)/(%ΔP). Elastic >1, inelastic <1."},
  {id:"ec004",s:"Economics",y:2013,t:"Macroeconomics",d:"Hard",q:"Inflation is best controlled by",o:{A:"Reducing interest rates",B:"Increasing money supply",C:"Raising interest rates and reducing money supply",D:"Reducing taxes"},a:"C",e:"Contractionary monetary policy: higher rates → less borrowing → less spending → lower inflation."},
  {id:"ec005",s:"Economics",y:2014,t:"Microeconomics",d:"Medium",q:"A perfectly competitive market has",o:{A:"One seller",B:"Many sellers, homogeneous products, free entry/exit",C:"Differentiated products",D:"Price-setting power"},a:"B",e:"Perfect competition: many firms, identical products, price takers, free entry."},
  {id:"ec006",s:"Economics",y:2015,t:"Macroeconomics",d:"Easy",q:"Unemployment caused by economic recession is called",o:{A:"Frictional",B:"Structural",C:"Cyclical",D:"Seasonal"},a:"C",e:"Cyclical unemployment: caused by economic downturns/recessions."},
  {id:"ec007",s:"Economics",y:2016,t:"Microeconomics",d:"Hard",q:"Monopoly leads to",o:{A:"Lower prices and more output",B:"Higher prices and lower output than perfect competition",C:"Zero profit in long run",D:"Homogeneous products"},a:"B",e:"Monopolist restricts output to raise price above marginal cost → deadweight loss."},
  {id:"ec008",s:"Economics",y:2017,t:"International Trade",d:"Medium",q:"Comparative advantage means a country should produce goods it",o:{A:"Produces at lowest absolute cost",B:"Has lower opportunity cost in producing",C:"Exports most",D:"Has the most resources for"},a:"B",e:"Comparative advantage: specialise where opportunity cost is lowest, even if not most efficient overall."},
  {id:"ec009",s:"Economics",y:2018,t:"Macroeconomics",d:"Medium",q:"The multiplier effect refers to",o:{A:"Population growth",B:"How initial spending leads to larger total increase in income",C:"Compound interest",D:"Trade volume"},a:"B",e:"Multiplier=1/(1−MPC). Initial injection creates rounds of spending amplifying income."},
  {id:"ec010",s:"Economics",y:2019,t:"Microeconomics",d:"Easy",q:"When marginal cost equals average cost, average cost is at its",o:{A:"Maximum",B:"Minimum",C:"Zero point",D:"Inflection"},a:"B",e:"MC=AC at the minimum of the average cost curve."},
  {id:"ec011",s:"Economics",y:2020,t:"Macroeconomics",d:"Medium",q:"Fiscal policy refers to government use of",o:{A:"Interest rates",B:"Money supply",C:"Taxation and spending",D:"Exchange rates"},a:"C",e:"Fiscal policy: government adjusts tax and spending to influence economy."},
  {id:"ec012",s:"Economics",y:2021,t:"Microeconomics",d:"Hard",q:"Consumer surplus is the difference between",o:{A:"Price and profit",B:"Willingness to pay and actual price paid",C:"Cost and revenue",D:"Income and expenditure"},a:"B",e:"Consumer surplus=area above price line below demand curve."},
  {id:"ec013",s:"Economics",y:2022,t:"Macroeconomics",d:"Medium",q:"Balance of payments records",o:{A:"Government budget",B:"All economic transactions between a country and rest of world",C:"Money supply changes",D:"GDP growth"},a:"B",e:"BOP: current account + capital account + financial account."},
  {id:"ec014",s:"Economics",y:2023,t:"Microeconomics",d:"Medium",q:"An inferior good is one whose demand",o:{A:"Rises as income rises",B:"Falls as income rises",C:"Is unaffected by income",D:"Always falls with price"},a:"B",e:"Inferior good: negative income elasticity. E.g. cheap staple foods."},
  {id:"ec015",s:"Economics",y:2024,t:"Macroeconomics",d:"Hard",q:"The Nigerian apex bank responsible for monetary policy is",o:{A:"NDIC",B:"CBN",C:"SEC",D:"AMCON"},a:"B",e:"Central Bank of Nigeria (CBN) controls monetary policy, money supply, and interest rates."},

  // ── GOVERNMENT ──
  {id:"g001",s:"Government",y:2010,t:"Governance",d:"Easy",q:"The highest law of the Federal Republic of Nigeria is the",o:{A:"Criminal Code",B:"1999 Constitution",C:"Electoral Act",D:"Penal Code"},a:"B",e:"The 1999 Constitution (as amended) is the supreme law of Nigeria."},
  {id:"g002",s:"Government",y:2011,t:"Political Concepts",d:"Medium",q:"Separation of powers was advocated by",o:{A:"Karl Marx",B:"Jean-Jacques Rousseau",C:"Montesquieu",D:"John Locke"},a:"C",e:"Montesquieu's 'The Spirit of the Laws' (1748) proposed separation of executive, legislative, and judicial powers."},
  {id:"g003",s:"Government",y:2012,t:"Nigerian Government",d:"Medium",q:"Nigeria operates a _______ system of government",o:{A:"Unitary",B:"Confederate",C:"Federal",D:"Parliamentary"},a:"C",e:"Nigeria practices federalism with power shared between federal and state governments."},
  {id:"g004",s:"Government",y:2013,t:"International Relations",d:"Medium",q:"The United Nations was established in",o:{A:"1944",B:"1945",C:"1948",D:"1950"},a:"B",e:"The UN was founded on 24 October 1945 after WWII."},
  {id:"g005",s:"Government",y:2014,t:"Political Concepts",d:"Easy",q:"Democracy literally means",o:{A:"Rule by the rich",B:"Rule by the people",C:"Rule by the military",D:"Rule by the elite"},a:"B",e:"Democracy: from Greek 'demos' (people) + 'kratos' (rule)."},
  {id:"g006",s:"Government",y:2015,t:"Nigerian Government",d:"Hard",q:"The Nigerian Senate consists of",o:{A:"240 members",B:"360 members",C:"109 members",D:"120 members"},a:"C",e:"Senate: 109 senators — 3 per state (36 states×3=108) + 1 for FCT."},
  {id:"g007",s:"Government",y:2016,t:"Governance",d:"Medium",q:"Judicial review gives courts power to",o:{A:"Make laws",B:"Declare laws unconstitutional",C:"Execute policies",D:"Impeach president"},a:"B",e:"Judicial review: courts can invalidate laws that violate the constitution."},
  {id:"g008",s:"Government",y:2017,t:"Political Concepts",d:"Medium",q:"Pressure groups differ from political parties because they",o:{A:"Contest elections",B:"Do not seek to control government directly",C:"Have more members",D:"Are international"},a:"B",e:"Pressure groups influence policy without contesting elections; parties seek power directly."},
  {id:"g009",s:"Government",y:2018,t:"Nigerian Government",d:"Hard",q:"Nigeria became a republic in",o:{A:"1960",B:"1963",C:"1966",D:"1979"},a:"B",e:"Nigeria became a republic on 1 October 1963, replacing the Queen as head of state."},
  {id:"g010",s:"Government",y:2019,t:"International Relations",d:"Medium",q:"ECOWAS headquarters is in",o:{A:"Lagos",B:"Accra",C:"Abuja",D:"Abidjan"},a:"C",e:"ECOWAS secretariat moved to Abuja, Nigeria in 1977."},
  {id:"g011",s:"Government",y:2020,t:"Governance",d:"Easy",q:"Bicameral legislature means",o:{A:"One chamber",B:"Two chambers",C:"Three chambers",D:"No legislature"},a:"B",e:"Bicameral: two legislative chambers (e.g. Senate and House of Representatives in Nigeria)."},
  {id:"g012",s:"Government",y:2021,t:"Political Concepts",d:"Medium",q:"Sovereignty means a state has",o:{A:"Large army",B:"Supreme, independent authority over its territory",C:"Elected government",D:"Written constitution"},a:"B",e:"Sovereignty: supreme authority not subject to external control."},
  {id:"g013",s:"Government",y:2022,t:"Nigerian Government",d:"Hard",q:"The Independent National Electoral Commission (INEC) was established by",o:{A:"Decree 6 of 1979",B:"Section 153 of 1999 Constitution",C:"Electoral Act 2010",D:"Military Decree 1993"},a:"B",e:"INEC established under Section 153 of the 1999 Constitution."},
  {id:"g014",s:"Government",y:2023,t:"International Relations",d:"Medium",q:"The African Union replaced the OAU in",o:{A:"1999",B:"2001",C:"2002",D:"2005"},a:"C",e:"African Union officially launched on 9 July 2002 replacing the OAU."},
  {id:"g015",s:"Government",y:2024,t:"Governance",d:"Easy",q:"Rule of law means",o:{A:"Military controls courts",B:"No one is above the law",C:"Parliament makes all decisions",D:"Judges are elected"},a:"B",e:"Rule of law: equality before law, legal certainty, no arbitrary power."},

  // ── LITERATURE ──
  {id:"l001",s:"Literature",y:2010,t:"Poetry",d:"Medium",q:"A sonnet has",o:{A:"8 lines",B:"12 lines",C:"14 lines",D:"16 lines"},a:"C",e:"A sonnet: 14 lines, typically iambic pentameter (Petrarchan or Shakespearean)."},
  {id:"l002",s:"Literature",y:2011,t:"Drama",d:"Easy",q:"A soliloquy is",o:{A:"A dialogue between two characters",B:"A speech revealing inner thoughts to audience",C:"A stage direction",D:"An aside to another character"},a:"B",e:"Soliloquy: character speaks private thoughts aloud; audience hears but other characters do not."},
  {id:"l003",s:"Literature",y:2012,t:"Prose",d:"Medium",q:"An omniscient narrator",o:{A:"Knows only their own thoughts",B:"Knows thoughts and feelings of all characters",C:"Is unreliable",D:"Speaks in second person"},a:"B",e:"Third-person omniscient: narrator has complete knowledge of all characters and events."},
  {id:"l004",s:"Literature",y:2013,t:"Poetry",d:"Hard",q:"Iambic pentameter has __ feet per line",o:{A:"4",B:"5",C:"6",D:"8"},a:"B",e:"Iambic pentameter: 5 iambs (unstressed-STRESSED) per line=10 syllables."},
  {id:"l005",s:"Literature",y:2014,t:"Drama",d:"Medium",q:"A tragedy ends with",o:{A:"Marriage",B:"Reconciliation",C:"Death or catastrophe for the protagonist",D:"Victory"},a:"C",e:"Tragedy: protagonist falls from prosperity to suffering, often ending in death."},
  {id:"l006",s:"Literature",y:2015,t:"Prose",d:"Easy",q:"Setting in a novel refers to",o:{A:"The plot",B:"The time, place, and environment of the story",C:"Character development",D:"Theme"},a:"B",e:"Setting: temporal and spatial context — where and when the story takes place."},
  {id:"l007",s:"Literature",y:2016,t:"Poetry",d:"Medium",q:"A couplet is",o:{A:"Two stanzas",B:"Two consecutive rhyming lines",C:"Two characters",D:"A pair of metaphors"},a:"B",e:"Couplet: pair of successive lines that rhyme and have the same metre."},
  {id:"l008",s:"Literature",y:2017,t:"Prose",d:"Hard",q:"Stream of consciousness technique records",o:{A:"External events chronologically",B:"Direct, unfiltered flow of a character's thoughts",C:"Dialogue only",D:"Historical events"},a:"B",e:"Stream of consciousness: mimics the continuous flow of thought (Joyce, Woolf)."},
  {id:"l009",s:"Literature",y:2018,t:"Drama",d:"Medium",q:"The protagonist of a play is the",o:{A:"Villain",B:"Main character driving the action",C:"Narrator",D:"Comic relief"},a:"B",e:"Protagonist: central character whose goals drive the narrative forward."},
  {id:"l010",s:"Literature",y:2019,t:"Poetry",d:"Easy",q:"Rhyme scheme ABAB means",o:{A:"Lines 1&2 rhyme, 3&4 rhyme",B:"Lines 1&3 rhyme, 2&4 rhyme",C:"All lines rhyme",D:"No lines rhyme"},a:"B",e:"ABAB: alternating rhyme — lines 1&3 share one rhyme, 2&4 another."},
  {id:"l011",s:"Literature",y:2020,t:"Prose",d:"Medium",q:"Flashback is a narrative device that",o:{A:"Speeds up time",B:"Interrupts present action to show earlier events",C:"Predicts future",D:"Summarises plot"},a:"B",e:"Flashback (analepsis): narrative moves back in time to reveal past events."},
  {id:"l012",s:"Literature",y:2021,t:"Drama",d:"Hard",q:"Dramatic irony occurs when",o:{A:"Characters say what they mean",B:"Audience knows more than characters on stage",C:"The ending is tragic",D:"Two characters argue"},a:"B",e:"Dramatic irony: audience has information characters lack — creates tension."},
  {id:"l013",s:"Literature",y:2022,t:"Poetry",d:"Medium",q:"Free verse poetry has",o:{A:"Regular rhyme scheme",B:"Fixed metre",C:"No fixed rhyme or metre",D:"Exactly 14 lines"},a:"C",e:"Free verse: no regular rhyme, rhythm, or line length — liberated poetic form."},
  {id:"l014",s:"Literature",y:2023,t:"Prose",d:"Medium",q:"A foil character serves to",o:{A:"Provide comic relief",B:"Contrast with and highlight the protagonist's qualities",C:"Replace the protagonist",D:"Narrate the story"},a:"B",e:"Foil: character whose contrasting traits highlight the qualities of another."},
  {id:"l015",s:"Literature",y:2024,t:"Drama",d:"Easy",q:"An epilogue appears",o:{A:"Before the play begins",B:"In the middle of the play",C:"At the end of the play",D:"At the beginning of Act 2"},a:"C",e:"Epilogue: speech/scene at the very end, addressing audience or wrapping up the story."},

  // ── GEOGRAPHY ──
  {id:"geo001",s:"Geography",y:2010,t:"Physical Geography",d:"Easy",q:"The longest river in the world is the",o:{A:"Amazon",B:"Congo",C:"Nile",D:"Mississippi"},a:"C",e:"The Nile (~6,650 km) is the longest river in the world."},
  {id:"geo002",s:"Geography",y:2011,t:"Climatology",d:"Medium",q:"The equatorial climate is characterised by",o:{A:"Cold dry winters",B:"Hot, wet conditions throughout the year",C:"Distinct wet and dry seasons",D:"Cool summers and mild winters"},a:"B",e:"Equatorial climate: high temperatures ~27°C, heavy rainfall >2000mm, no dry season."},
  {id:"geo003",s:"Geography",y:2012,t:"Physical Geography",d:"Medium",q:"An oxbow lake is formed by",o:{A:"Volcanic activity",B:"River meander cut off from main channel",C:"Glacial erosion",D:"Coastal deposition"},a:"B",e:"Oxbow lake: formed when a meander loop is cut off as a river straightens."},
  {id:"geo004",s:"Geography",y:2013,t:"Human Geography",d:"Easy",q:"The largest continent by area is",o:{A:"Africa",B:"North America",C:"Asia",D:"Europe"},a:"C",e:"Asia covers ~44.6 million km² — largest continent."},
  {id:"geo005",s:"Geography",y:2014,t:"Climatology",d:"Medium",q:"The Sahara Desert is located in",o:{A:"Southern Africa",B:"North Africa",C:"West Africa",D:"East Africa"},a:"B",e:"The Sahara, world's largest hot desert, spans North Africa."},
  {id:"geo006",s:"Geography",y:2015,t:"Physical Geography",d:"Hard",q:"Fold mountains are formed by",o:{A:"Volcanic eruptions",B:"Collision of tectonic plates compressing rock layers",C:"Glacial deposition",D:"River erosion"},a:"B",e:"Fold mountains (Alps, Himalayas): formed by convergent plate boundaries compressing sedimentary rock."},
  {id:"geo007",s:"Geography",y:2016,t:"Human Geography",d:"Medium",q:"Population density is calculated as",o:{A:"Population × Area",B:"Population ÷ Area",C:"Births − Deaths",D:"Imports ÷ Exports"},a:"B",e:"Population density=total population/land area (persons per km²)."},
  {id:"geo008",s:"Geography",y:2017,t:"Climatology",d:"Easy",q:"The Tropic of Cancer is at latitude",o:{A:"0°",B:"23.5°N",C:"66.5°N",D:"23.5°S"},a:"B",e:"Tropic of Cancer: 23.5°N — northernmost latitude where sun is directly overhead."},
  {id:"geo009",s:"Geography",y:2018,t:"Physical Geography",d:"Medium",q:"A delta is formed at the",o:{A:"Source of a river",B:"Mouth of a river where it meets the sea",C:"Point of waterfalls",D:"Confluence of rivers"},a:"B",e:"River delta: deposition of sediment at river mouth forming fan-shaped landform."},
  {id:"geo010",s:"Geography",y:2019,t:"Human Geography",d:"Medium",q:"The largest city in Nigeria by population is",o:{A:"Abuja",B:"Kano",C:"Lagos",D:"Ibadan"},a:"C",e:"Lagos is Nigeria's most populous city with over 15 million people."},
  {id:"geo011",s:"Geography",y:2020,t:"Climatology",d:"Hard",q:"Trade winds blow from",o:{A:"Equator toward poles",B:"Subtropical high-pressure belts toward the equator",C:"Poles toward equator",D:"West to east globally"},a:"B",e:"Trade winds: from subtropical highs (~30°) toward equatorial low. NE in N. hemisphere, SE in S."},
  {id:"geo012",s:"Geography",y:2021,t:"Physical Geography",d:"Medium",q:"An earthquake's intensity is measured using the",o:{A:"Beaufort Scale",B:"Richter Scale",C:"Mercalli Scale",D:"Fujita Scale"},a:"B",e:"Richter Scale: measures magnitude (energy) of earthquakes logarithmically."},
  {id:"geo013",s:"Geography",y:2022,t:"Human Geography",d:"Easy",q:"Natural population increase equals",o:{A:"Immigration − Emigration",B:"Birth rate − Death rate",C:"Total births − emigration",D:"Total population ÷ area"},a:"B",e:"Natural increase rate=birth rate minus death rate (per 1000)."},
  {id:"geo014",s:"Geography",y:2023,t:"Physical Geography",d:"Medium",q:"Limestone landscape with sinkholes and caves is called",o:{A:"Alluvial plain",B:"Karst topography",C:"Glacial moraine",D:"Aeolian landscape"},a:"B",e:"Karst: limestone dissolved by carbonic acid creating caves, sinkholes, and springs."},
  {id:"geo015",s:"Geography",y:2024,t:"Climatology",d:"Easy",q:"The greenhouse effect is primarily caused by",o:{A:"Ozone layer",B:"Accumulation of CO₂ and other gases trapping heat",C:"Solar flares",D:"Ocean currents"},a:"B",e:"Greenhouse gases (CO₂, CH₄, N₂O) absorb and re-emit infrared radiation, warming Earth."},

  // ── CRS ──
  {id:"crs001",s:"CRS",y:2010,t:"Old Testament",d:"Easy",q:"The first book of the Bible is",o:{A:"Exodus",B:"Genesis",C:"Leviticus",D:"Numbers"},a:"B",e:"Genesis is the first book, describing creation, the fall, and early patriarchs."},
  {id:"crs002",s:"CRS",y:2011,t:"New Testament",d:"Easy",q:"Jesus was born in",o:{A:"Nazareth",B:"Jerusalem",C:"Bethlehem",D:"Jericho"},a:"C",e:"Jesus was born in Bethlehem of Judea (Matthew 2:1, Luke 2:4-7)."},
  {id:"crs003",s:"CRS",y:2012,t:"Old Testament",d:"Medium",q:"The Ten Commandments were given to Moses on",o:{A:"Mount Hermon",B:"Mount Zion",C:"Mount Sinai",D:"Mount Carmel"},a:"C",e:"God gave the Ten Commandments to Moses on Mount Sinai (Exodus 20)."},
  {id:"crs004",s:"CRS",y:2013,t:"New Testament",d:"Medium",q:"The Sermon on the Mount is found in",o:{A:"Mark 5",B:"Matthew 5-7",C:"Luke 6",D:"John 3"},a:"B",e:"The Sermon on the Mount is recorded in Matthew chapters 5-7."},
  {id:"crs005",s:"CRS",y:2014,t:"Old Testament",d:"Medium",q:"David killed Goliath using",o:{A:"A sword",B:"A spear",C:"A sling and stone",D:"An arrow"},a:"C",e:"David killed the Philistine giant Goliath with a sling and stone (1 Samuel 17)."},
  {id:"crs006",s:"CRS",y:2015,t:"New Testament",d:"Hard",q:"Paul's letter to the Romans emphasises",o:{A:"Church order",B:"Justification by faith alone",C:"Spiritual gifts",D:"End times"},a:"B",e:"Romans: Paul's systematic theology of salvation by grace through faith, not works."},
  {id:"crs007",s:"CRS",y:2016,t:"Old Testament",d:"Easy",q:"Noah built an ark to survive",o:{A:"Drought",B:"Plague",C:"The flood",D:"War"},a:"C",e:"God commanded Noah to build an ark before the great flood (Genesis 6-9)."},
  {id:"crs008",s:"CRS",y:2017,t:"New Testament",d:"Medium",q:"The Holy Spirit descended on the disciples at",o:{A:"Christmas",B:"Easter",C:"Pentecost",D:"Epiphany"},a:"C",e:"Pentecost (Acts 2): Holy Spirit descended as tongues of fire on the disciples."},
  {id:"crs009",s:"CRS",y:2018,t:"Old Testament",d:"Medium",q:"Joseph was sold into slavery by his brothers for",o:{A:"10 pieces of silver",B:"20 pieces of silver",C:"30 pieces of silver",D:"50 pieces of silver"},a:"B",e:"Joseph was sold to Ishmaelite traders for 20 pieces of silver (Genesis 37:28)."},
  {id:"crs010",s:"CRS",y:2019,t:"Church History",d:"Hard",q:"The Council of Nicaea (325 AD) was called to address",o:{A:"Bible translation",B:"The Arian controversy about Christ's nature",C:"Church governance",D:"Missionary work"},a:"B",e:"Council of Nicaea: addressed Arianism (denied Christ's full divinity), affirmed the Nicene Creed."},
  {id:"crs011",s:"CRS",y:2020,t:"New Testament",d:"Easy",q:"The miracle of feeding 5,000 used",o:{A:"5 loaves and 2 fish",B:"7 loaves and 3 fish",C:"12 loaves and 5 fish",D:"3 loaves and 1 fish"},a:"A",e:"Jesus fed 5,000 with 5 loaves and 2 fish (John 6:1-14)."},
  {id:"crs012",s:"CRS",y:2021,t:"Old Testament",d:"Medium",q:"The book of Psalms is mainly attributed to",o:{A:"Moses",B:"Solomon",C:"David",D:"Isaiah"},a:"C",e:"About half the Psalms are attributed to King David, Israel's beloved poet-king."},
  {id:"crs013",s:"CRS",y:2022,t:"New Testament",d:"Medium",q:"The Beatitudes begin with 'Blessed are the'",o:{A:"Righteous",B:"Rich",C:"Poor in spirit",D:"Peacemakers"},a:"C",e:"Matthew 5:3: 'Blessed are the poor in spirit, for theirs is the kingdom of heaven.'"},
  {id:"crs014",s:"CRS",y:2023,t:"Old Testament",d:"Hard",q:"The prophet who confronted King Ahab about Naboth's vineyard was",o:{A:"Isaiah",B:"Elisha",C:"Elijah",D:"Amos"},a:"C",e:"Elijah confronted Ahab after Jezebel arranged Naboth's murder (1 Kings 21)."},
  {id:"crs015",s:"CRS",y:2024,t:"New Testament",d:"Easy",q:"Jesus' first miracle was at",o:{A:"Jerusalem",B:"Capernaum",C:"Cana",D:"Bethany"},a:"C",e:"Jesus turned water into wine at the wedding in Cana (John 2:1-11) — his first miracle."},

  // ── IRS ──
  {id:"irs001",s:"IRS",y:2010,t:"Quran",d:"Easy",q:"The first chapter (Surah) of the Quran is",o:{A:"Al-Baqarah",B:"Al-Fatiha",C:"Al-Ikhlas",D:"Al-Nas"},a:"B",e:"Al-Fatiha ('The Opening') is the first surah and is recited in every prayer."},
  {id:"irs002",s:"IRS",y:2011,t:"Pillars of Islam",d:"Easy",q:"The number of pillars of Islam is",o:{A:"3",B:"4",C:"5",D:"6"},a:"C",e:"Five Pillars: Shahada, Salat, Zakat, Sawm, Hajj."},
  {id:"irs003",s:"IRS",y:2012,t:"Hadith",d:"Medium",q:"Hadith refers to",o:{A:"The Holy Quran",B:"Sayings and actions of Prophet Muhammad",C:"Islamic law",D:"Prayer times"},a:"B",e:"Hadith: recorded sayings, actions, and approvals of Prophet Muhammad (SAW)."},
  {id:"irs004",s:"IRS",y:2013,t:"Pillars of Islam",d:"Medium",q:"Zakat is",o:{A:"Daily prayer",B:"Fasting in Ramadan",C:"Obligatory almsgiving (2.5% of savings)",D:"Pilgrimage to Mecca"},a:"C",e:"Zakat: obligatory charity — 2.5% of qualifying savings given to eligible recipients."},
  {id:"irs005",s:"IRS",y:2014,t:"Islamic History",d:"Medium",q:"The Hijra refers to",o:{A:"Battle of Badr",B:"Prophet Muhammad's migration from Mecca to Medina (622 CE)",C:"Revelation of the Quran",D:"Conquest of Mecca"},a:"B",e:"Hijra (622 CE): Prophet's migration to Medina — marks start of Islamic calendar."},
  {id:"irs006",s:"IRS",y:2015,t:"Quran",d:"Hard",q:"The Quran was revealed over approximately",o:{A:"10 years",B:"15 years",C:"23 years",D:"40 years"},a:"C",e:"Quranic revelation spanned 23 years (610–632 CE) of the Prophet's prophethood."},
  {id:"irs007",s:"IRS",y:2016,t:"Pillars of Islam",d:"Easy",q:"Salat (prayer) is performed how many times daily?",o:{A:"3",B:"4",C:"5",D:"7"},a:"C",e:"Muslims perform Salat 5 times: Fajr, Dhuhr, Asr, Maghrib, Isha."},
  {id:"irs008",s:"IRS",y:2017,t:"Islamic Law",d:"Medium",q:"Sharia refers to",o:{A:"Islamic tax",B:"Islamic sacred law derived from Quran and Sunnah",C:"A prayer rug",D:"Friday sermon"},a:"B",e:"Sharia: comprehensive Islamic law covering worship, ethics, family, commerce, and criminal law."},
  {id:"irs009",s:"IRS",y:2018,t:"Islamic History",d:"Hard",q:"The first caliph after Prophet Muhammad was",o:{A:"Umar ibn al-Khattab",B:"Uthman ibn Affan",C:"Abu Bakr al-Siddiq",D:"Ali ibn Abi Talib"},a:"C",e:"Abu Bakr became the first caliph (632 CE) after the Prophet's death."},
  {id:"irs010",s:"IRS",y:2019,t:"Quran",d:"Medium",q:"The longest surah in the Quran is",o:{A:"Al-Fatiha",B:"Al-Baqarah",C:"Al-Imran",D:"An-Nisa"},a:"B",e:"Al-Baqarah ('The Cow') is the longest surah with 286 verses."},
  {id:"irs011",s:"IRS",y:2020,t:"Pillars of Islam",d:"Medium",q:"Sawm (fasting) takes place during the month of",o:{A:"Shawwal",B:"Rajab",C:"Ramadan",D:"Muharram"},a:"C",e:"Sawm: obligatory fasting during Ramadan, the ninth month of the Islamic calendar."},
  {id:"irs012",s:"IRS",y:2021,t:"Islamic History",d:"Medium",q:"Islam was founded in the city of",o:{A:"Jerusalem",B:"Medina",C:"Mecca",D:"Baghdad"},a:"C",e:"Islam began in Mecca (present-day Saudi Arabia) with the Prophet Muhammad's first revelation in 610 CE."},
  {id:"irs013",s:"IRS",y:2022,t:"Quran",d:"Easy",q:"The Quran is written in",o:{A:"Urdu",B:"Persian",C:"Arabic",D:"Swahili"},a:"C",e:"The Quran was revealed in classical Arabic and is preserved in that language."},
  {id:"irs014",s:"IRS",y:2023,t:"Islamic Law",d:"Hard",q:"In Islamic inheritance law, a son receives __ the share of a daughter",o:{A:"Equal",B:"Half",C:"Double",D:"Triple"},a:"C",e:"Quran 4:11: male heir receives twice the share of a female heir in most circumstances."},
  {id:"irs015",s:"IRS",y:2024,t:"Pillars of Islam",d:"Medium",q:"Hajj must be performed at least once by every Muslim who is",o:{A:"Under 40",B:"Wealthy",C:"Physically and financially able",D:"Male only"},a:"C",e:"Hajj is obligatory once in a lifetime for every Muslim with physical and financial ability."},

  // ── AGRICULTURAL SCIENCE ──
  {id:"ag001",s:"Agricultural Science",y:2010,t:"Crop Production",d:"Easy",q:"Photosynthesis in plants converts",o:{A:"O₂ to CO₂",B:"CO₂ and H₂O to glucose using sunlight",C:"Glucose to starch only",D:"Minerals to vitamins"},a:"B",e:"Photosynthesis: 6CO₂+6H₂O+light→C₆H₁₂O₆+6O₂ in chlorophyll-containing cells."},
  {id:"ag002",s:"Agricultural Science",y:2011,t:"Soil Science",d:"Medium",q:"The most productive soil type is",o:{A:"Sandy",B:"Clay",C:"Loamy",D:"Peaty"},a:"C",e:"Loam: ideal mix of sand, silt, and clay — good drainage, water retention, and nutrients."},
  {id:"ag003",s:"Agricultural Science",y:2012,t:"Animal Husbandry",d:"Easy",q:"Ruminants are animals that",o:{A:"Lay eggs",B:"Chew cud (regurgitate and re-chew food)",C:"Are always carnivores",D:"Have one stomach"},a:"B",e:"Ruminants (cattle, sheep, goats): have multi-chambered stomachs, regurgitate and re-chew food."},
  {id:"ag004",s:"Agricultural Science",y:2013,t:"Crop Production",d:"Medium",q:"NPK fertiliser provides",o:{A:"Nitrogen, Phosphorus, Potassium",B:"Neon, Phosphorus, Krypton",C:"Nitrogen, Protein, Kalium",D:"Nutrients, Phosphate, Kelp"},a:"A",e:"NPK: the three primary macronutrients. N=leaf growth, P=roots, K=overall health."},
  {id:"ag005",s:"Agricultural Science",y:2014,t:"Soil Science",d:"Medium",q:"Soil erosion is best prevented by",o:{A:"Monoculture",B:"Overgrazing",C:"Cover cropping and contour ploughing",D:"Burning vegetation"},a:"C",e:"Cover crops protect soil surface; contour ploughing reduces runoff down slopes."},
  {id:"ag006",s:"Agricultural Science",y:2015,t:"Animal Husbandry",d:"Hard",q:"Gestation period of cattle is approximately",o:{A:"5 months",B:"7 months",C:"9 months",D:"12 months"},a:"C",e:"Cattle gestation: ~280-285 days (~9.5 months)."},
  {id:"ag007",s:"Agricultural Science",y:2016,t:"Crop Production",d:"Easy",q:"Leguminous plants improve soil fertility by",o:{A:"Absorbing nitrogen from soil",B:"Fixing atmospheric nitrogen through root nodule bacteria",C:"Releasing phosphorus",D:"Producing organic acid"},a:"B",e:"Rhizobium bacteria in legume root nodules fix atmospheric N₂→ammonia, enriching soil."},
  {id:"ag008",s:"Agricultural Science",y:2017,t:"Pest Control",d:"Medium",q:"Biological pest control involves",o:{A:"Applying chemical pesticides",B:"Using natural predators or parasites to control pests",C:"Burning infested crops",D:"Crop rotation alone"},a:"B",e:"Biological control: introducing natural enemies (ladybirds for aphids) — environmentally safe."},
  {id:"ag009",s:"Agricultural Science",y:2018,t:"Soil Science",d:"Hard",q:"Laterisation occurs in",o:{A:"Temperate regions",B:"Tropical regions with heavy rainfall",C:"Desert regions",D:"Polar regions"},a:"B",e:"Laterisation: heavy tropical rainfall leaches nutrients, leaving iron/aluminium oxides (laterite)."},
  {id:"ag010",s:"Agricultural Science",y:2019,t:"Animal Husbandry",d:"Medium",q:"Vaccination in livestock is used to",o:{A:"Increase growth rate",B:"Prevent infectious diseases",C:"Improve meat quality",D:"Increase milk production"},a:"B",e:"Vaccines stimulate immune response, preventing outbreaks of diseases like FMD, ND."},
  {id:"ag011",s:"Agricultural Science",y:2020,t:"Crop Production",d:"Medium",q:"Crop rotation helps to",o:{A:"Reduce soil fertility",B:"Break pest cycles and maintain soil nutrient balance",C:"Increase soil erosion",D:"Promote monoculture"},a:"B",e:"Rotation: alternating crops breaks pest/disease cycles and balances nutrient demands."},
  {id:"ag012",s:"Agricultural Science",y:2021,t:"Soil Science",d:"Easy",q:"Humus is",o:{A:"Mineral particles in soil",B:"Decomposed organic matter in soil",C:"Water in soil",D:"Sand particles"},a:"B",e:"Humus: dark, nutrient-rich organic material formed from decomposed plant and animal matter."},
  {id:"ag013",s:"Agricultural Science",y:2022,t:"Animal Husbandry",d:"Medium",q:"Broiler chickens are reared primarily for",o:{A:"Egg production",B:"Meat production",C:"Feathers",D:"Breeding only"},a:"B",e:"Broilers: fast-growing chickens bred and raised specifically for meat production."},
  {id:"ag014",s:"Agricultural Science",y:2023,t:"Crop Production",d:"Hard",q:"The C4 pathway of photosynthesis is more efficient in",o:{A:"Cold climates",B:"Hot, sunny climates with high CO₂",C:"Shaded environments",D:"Aquatic plants"},a:"B",e:"C4 plants (maize, sugarcane): efficiently fix CO₂ in hot sunny conditions, less photorespiration."},
  {id:"ag015",s:"Agricultural Science",y:2024,t:"Soil Science",d:"Medium",q:"Soil pH best for most crops is",o:{A:"4.0-5.0",B:"5.5-7.0",C:"7.5-9.0",D:"9.0-11.0"},a:"B",e:"Most crops grow best at pH 5.5-7.0 (slightly acidic to neutral) for nutrient availability."},

  // ── COMMERCE ──
  {id:"com001",s:"Commerce",y:2010,t:"Trade",d:"Easy",q:"Wholesale trade involves selling goods",o:{A:"To final consumers",B:"In small quantities",C:"In large quantities to retailers",D:"Abroad only"},a:"C",e:"Wholesalers buy in bulk from manufacturers and sell in smaller quantities to retailers."},
  {id:"com002",s:"Commerce",y:2011,t:"Banking",d:"Medium",q:"A cheque is",o:{A:"A form of currency",B:"A written order to a bank to pay a specified amount",C:"A savings certificate",D:"A loan agreement"},a:"B",e:"Cheque: written instruction to the drawer's bank to pay a specified sum to the payee."},
  {id:"com003",s:"Commerce",y:2012,t:"Insurance",d:"Medium",q:"The principle of indemnity in insurance means",o:{A:"Insured pays first",B:"Compensation restores insured to pre-loss position only",C:"Double payment for loss",D:"Insurer can refuse all claims"},a:"B",e:"Indemnity: policyholder restored to same financial position as before loss — no profit from claim."},
  {id:"com004",s:"Commerce",y:2013,t:"Trade",d:"Easy",q:"An invoice is",o:{A:"A receipt of payment",B:"A document showing details of goods supplied and amount owed",C:"A credit note",D:"A bill of lading"},a:"B",e:"Invoice: document from seller listing goods/services and amount owed by buyer."},
  {id:"com005",s:"Commerce",y:2014,t:"Banking",d:"Hard",q:"Central bank functions include",o:{A:"Granting consumer loans",B:"Accepting retail deposits",C:"Acting as lender of last resort and controlling money supply",D:"Running supermarkets"},a:"C",e:"Central bank: monetary policy, currency issue, banker's bank, lender of last resort."},
  {id:"com006",s:"Commerce",y:2015,t:"Business Organisation",d:"Medium",q:"A limited liability company means shareholders",o:{A:"Are personally liable for all debts",B:"Are only liable up to the value of their shares",C:"Cannot lose any money",D:"Must manage the company"},a:"B",e:"Limited liability: shareholders' loss is limited to their investment — personal assets protected."},
  {id:"com007",s:"Commerce",y:2016,t:"Trade",d:"Medium",q:"Entrepôt trade involves",o:{A:"Domestic trade only",B:"Importing goods to re-export with or without processing",C:"Barter exchange",D:"Retail trade"},a:"B",e:"Entrepôt: goods imported, possibly processed, then re-exported — e.g. Singapore, Dubai."},
  {id:"com008",s:"Commerce",y:2017,t:"Insurance",d:"Medium",q:"Subrogation in insurance allows the insurer to",o:{A:"Cancel the policy",B:"Take over rights to claim against third parties after paying the insured",C:"Double the premium",D:"Refuse payment"},a:"B",e:"Subrogation: after paying claim, insurer steps into insured's shoes to recover from liable third party."},
  {id:"com009",s:"Commerce",y:2018,t:"Banking",d:"Easy",q:"A savings account earns",o:{A:"No interest",B:"Interest on deposits",C:"Dividends",D:"Capital gains"},a:"B",e:"Savings accounts pay interest on deposited funds, encouraging saving."},
  {id:"com010",s:"Commerce",y:2019,t:"Trade",d:"Hard",q:"A bill of lading is used in",o:{A:"Domestic retail trade",B:"International sea freight as receipt and document of title",C:"Air cargo only",D:"Insurance claims"},a:"B",e:"Bill of lading: contract between shipper and carrier; receipt for goods; document of title."},
  {id:"com011",s:"Commerce",y:2020,t:"Business Organisation",d:"Medium",q:"A cooperative society is owned by",o:{A:"Government",B:"A single entrepreneur",C:"Its members who share profits",D:"Foreign investors"},a:"C",e:"Cooperative: voluntary, member-owned enterprise — profits shared as dividends on purchases/shares."},
  {id:"com012",s:"Commerce",y:2021,t:"Trade",d:"Easy",q:"Retail trade involves selling goods",o:{A:"In bulk to businesses",B:"To final consumers in small quantities",C:"Internationally only",D:"To government only"},a:"B",e:"Retailers sell small quantities directly to end consumers."},
  {id:"com013",s:"Commerce",y:2022,t:"Insurance",d:"Hard",q:"Insurable interest means",o:{A:"The insured likes insurance",B:"The insured would suffer financial loss if insured event occurs",C:"The policy is interesting",D:"High premium rates"},a:"B",e:"Insurable interest: policyholder must have financial stake — can't insure something with no stake in."},
  {id:"com014",s:"Commerce",y:2023,t:"Banking",d:"Medium",q:"Overdraft is when",o:{A:"Account has surplus funds",B:"Customer withdraws more than their account balance",C:"Bank pays interest",D:"Cheque bounces"},a:"B",e:"Overdraft: short-term borrowing where withdrawals exceed account balance — bank charges interest."},
  {id:"com015",s:"Commerce",y:2024,t:"Trade",d:"Medium",q:"Warehousing serves to",o:{A:"Transport goods",B:"Store goods and create time utility",C:"Advertise products",D:"Manufacture goods"},a:"B",e:"Warehouses store goods between production and sale, creating time utility when demand varies."},

  // ── ACCOUNTING ──
  {id:"acc001",s:"Accounting",y:2010,t:"Principles",d:"Easy",q:"The accounting equation is",o:{A:"Assets=Liabilities+Capital",B:"Assets=Liabilities−Capital",C:"Capital=Assets+Liabilities",D:"Liabilities=Assets+Capital"},a:"A",e:"Fundamental accounting equation: Assets=Liabilities+Owner's Equity (Capital)."},
  {id:"acc002",s:"Accounting",y:2011,t:"Financial Statements",d:"Medium",q:"The balance sheet shows a business's",o:{A:"Profit for the period",B:"Cash flows",C:"Financial position at a specific date",D:"Revenue over a year"},a:"C",e:"Balance sheet (Statement of Financial Position): snapshot of assets, liabilities, and equity at a point in time."},
  {id:"acc003",s:"Accounting",y:2012,t:"Principles",d:"Medium",q:"Double entry means each transaction",o:{A:"Is recorded once",B:"Is recorded in two accounts — debit and credit",C:"Is entered in the bank statement",D:"Is verified by two people"},a:"B",e:"Double entry: every debit has an equal corresponding credit — ensures books balance."},
  {id:"acc004",s:"Accounting",y:2013,t:"Financial Statements",d:"Hard",q:"Gross profit is calculated as",o:{A:"Revenue − All expenses",B:"Revenue − Cost of goods sold",C:"Net profit + Expenses",D:"Sales − Tax"},a:"B",e:"Gross profit=Sales revenue minus Cost of Goods Sold (COGS)."},
  {id:"acc005",s:"Accounting",y:2014,t:"Principles",d:"Easy",q:"Depreciation is",o:{A:"Appreciation of asset value",B:"Allocation of asset cost over its useful life",C:"Cash set aside for replacement",D:"Profit on sale of asset"},a:"B",e:"Depreciation: systematic allocation of fixed asset cost over its estimated useful life."},
  {id:"acc006",s:"Accounting",y:2015,t:"Bookkeeping",d:"Medium",q:"A trial balance is used to",o:{A:"Prepare tax returns",B:"Check that total debits equal total credits",C:"Record daily cash",D:"Audit the business"},a:"B",e:"Trial balance: lists all ledger account balances to verify debit total=credit total."},
  {id:"acc007",s:"Accounting",y:2016,t:"Financial Statements",d:"Medium",q:"Working capital is calculated as",o:{A:"Fixed assets − Long-term liabilities",B:"Current assets − Current liabilities",C:"Total assets − Total liabilities",D:"Revenue − Expenses"},a:"B",e:"Working capital=Current assets−Current liabilities. Measures short-term liquidity."},
  {id:"acc008",s:"Accounting",y:2017,t:"Bookkeeping",d:"Hard",q:"The cash book records",o:{A:"Credit transactions only",B:"All cash and bank receipts and payments",C:"Inventory movements",D:"Fixed asset purchases only"},a:"B",e:"Cash book: records all money received and paid, serving as both journal and ledger."},
  {id:"acc009",s:"Accounting",y:2018,t:"Principles",d:"Medium",q:"Going concern principle assumes",o:{A:"Business will close soon",B:"Business will continue operating for the foreseeable future",C:"Assets are sold immediately",D:"Profits are distributed"},a:"B",e:"Going concern: accounts prepared assuming business will continue operating — assets not liquidated."},
  {id:"acc010",s:"Accounting",y:2019,t:"Financial Statements",d:"Hard",q:"Net profit equals",o:{A:"Gross profit − Operating expenses",B:"Revenue only",C:"Sales − Purchases",D:"Gross profit + Expenses"},a:"A",e:"Net profit=Gross profit minus all operating expenses (wages, rent, depreciation, etc.)."},
  {id:"acc011",s:"Accounting",y:2020,t:"Bookkeeping",d:"Easy",q:"A debit entry increases",o:{A:"Liabilities",B:"Assets and expenses",C:"Capital",D:"Revenue"},a:"B",e:"Debit increases assets, expenses, and drawings. Credit increases liabilities, capital, and revenue."},
  {id:"acc012",s:"Accounting",y:2021,t:"Principles",d:"Medium",q:"Accruals (matching) principle states",o:{A:"Record only cash transactions",B:"Match revenues and expenses to the period they relate to",C:"Record assets at market value",D:"Depreciate all assets equally"},a:"B",e:"Accruals principle: recognise income when earned and expenses when incurred, not when cash moves."},
  {id:"acc013",s:"Accounting",y:2022,t:"Financial Statements",d:"Medium",q:"Liquidity refers to",o:{A:"Profitability",B:"Ability to meet short-term obligations with current assets",C:"Long-term solvency",D:"Stock turnover"},a:"B",e:"Liquidity: how quickly assets can be converted to cash to meet immediate liabilities."},
  {id:"acc014",s:"Accounting",y:2023,t:"Bookkeeping",d:"Hard",q:"Bank reconciliation is prepared to",o:{A:"Calculate profit",B:"Reconcile differences between cash book and bank statement",C:"Calculate depreciation",D:"Record purchases"},a:"B",e:"Bank reconciliation: explains differences between company cash book and bank's statement balance."},
  {id:"acc015",s:"Accounting",y:2024,t:"Principles",d:"Easy",q:"Assets are resources",o:{A:"Owed to creditors",B:"Owned or controlled by the business with future economic benefit",C:"Equal to liabilities",D:"Cash only"},a:"B",e:"Assets: resources controlled by entity as result of past events from which future economic benefits expected."},
];

// ─── STORAGE ──────────────────────────────────────────────────────────────────
const initStore = () => ({ sessions:[], subjectStats:{}, topicStats:{}, totalQ:0, totalC:0 });

async function loadStore(){
  try{ const s=localStorage.getItem(SKEY); return s?JSON.parse(s):initStore(); }
  catch(e){ return initStore(); }
}
async function saveStore(s){
  try{ localStorage.setItem(SKEY,JSON.stringify(s)); return true; }
  catch(e){ return false; }
}
async function clearStore(){
  try{ localStorage.removeItem(SKEY); }catch(e){}
}

async function recordSession(session){
  const s=await loadStore();
  s.sessions=[session,...s.sessions].slice(0,100);
  s.totalQ+=session.total; s.totalC+=session.correct;
  Object.entries(session.bySubject).forEach(([sub,d])=>{
    if(!s.subjectStats[sub]) s.subjectStats[sub]={correct:0,total:0,sessions:0};
    s.subjectStats[sub].correct+=d.correct;
    s.subjectStats[sub].total+=d.total;
    s.subjectStats[sub].sessions+=1;
  });
  session.topicResults.forEach(t=>{
    const k=`${t.subject}__${t.topic}`;
    if(!s.topicStats[k]) s.topicStats[k]={subject:t.subject,topic:t.topic,correct:0,total:0};
    s.topicStats[k].correct+=t.correct;
    s.topicStats[k].total+=t.total;
  });
  await saveStore(s); return s;
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
function shuffle(a){ const b=[...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b; }
function fmtDate(iso){ try{return new Date(iso).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});}catch{return "";} }
function fmtSecs(s){ const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60; if(h>0)return`${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`; return`${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`; }
function getScore(correct,total){ return total?Math.round((correct/total)*400):0; }
function pct(correct,total){ return total?Math.round(correct/total*100):0; }

function buildExam(mode,cfg,bank){
  if(mode==="subject"){
    let p=[...bank].filter(q=>q.s===cfg.subject);
    if(cfg.year) p=p.filter(q=>q.y===cfg.year);
    return shuffle(p).slice(0,cfg.count||40);
  }
  if(mode==="year"){
    return shuffle([...bank].filter(q=>q.y===cfg.year)).slice(0,cfg.count||40);
  }
  if(mode==="mixed"){
    const subs=cfg.subjects||["Use of English","Biology","Chemistry","Physics"];
    const perSubject=Math.floor(40/subs.length);
    let out=[];
    subs.forEach(sub=>{ out=out.concat(shuffle([...bank].filter(q=>q.s===sub)).slice(0,perSubject)); });
    return out;
  }
  return [];
}

function topicResults(questions,answers){
  const m={};
  questions.forEach(q=>{
    const k=`${q.s}__${q.t}`;
    if(!m[k]) m[k]={subject:q.s,topic:q.t,correct:0,total:0};
    m[k].total++;
    if(answers[q.id]===q.a) m[k].correct++;
  });
  return Object.values(m);
}

// ─── UPDATE CHECK ─────────────────────────────────────────────────────────────
async function checkForUpdate(){
  try{
    const res=await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
      {headers:{"Accept":"application/vnd.github.v3+json"}});
    if(!res.ok) return null;
    const data=await res.json();
    const latest=data.tag_name?.replace(/^v/,"");
    if(latest&&latest!==VERSION){
      return{ version:latest, url:data.html_url };
    }
    return null;
  }catch(e){ return null; }
}

// ─── TIMER ────────────────────────────────────────────────────────────────────
function useTimer(init,onExpire){
  const [secs,setSecs]=useState(init);
  const runRef=useRef(false);
  const ivRef=useRef(null);
  const stop=useCallback(()=>{ runRef.current=false; clearInterval(ivRef.current); },[]);
  const start=useCallback(()=>{
    if(runRef.current) return;
    runRef.current=true;
    ivRef.current=setInterval(()=>{
      setSecs(s=>{ if(s<=1){stop();onExpire?.();return 0;} return s-1; });
    },1000);
  },[stop]);
  const reset=useCallback(t=>{ stop(); setSecs(t); },[stop]);
  useEffect(()=>()=>clearInterval(ivRef.current),[]);
  return {secs,start,stop,reset,fmt:()=>fmtSecs(secs)};
}

// ─── ICONS ────────────────────────────────────────────────────────────────────
function I({n,sz=20,c="currentColor"}){
  const p={width:sz,height:sz,viewBox:"0 0 24 24",fill:"none",stroke:c,strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"};
  const icons={
    home:<svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
    book:<svg {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    chart:<svg {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    cog:<svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    clock:<svg {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    flag:<svg {...p}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
    check:<svg {...p} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    x:<svg {...p} strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    left:<svg {...p} strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
    right:<svg {...p} strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    grid:<svg {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
    play:<svg width={sz} height={sz} viewBox="0 0 24 24" fill={c}><polygon points="5 3 19 12 5 21 5 3"/></svg>,
    trash:<svg {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>,
    sun:<svg {...p}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
    moon:<svg {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
    download:<svg {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  };
  return icons[n]||null;
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
:root{--bg:#07090e;--bg2:#0d1018;--bg3:#141820;--bg4:#1b2030;--blue:#4f7cff;--purple:#8b5cf6;--green:#22c55e;--amber:#f59e0b;--red:#ef4444;--text:#edf0ff;--text2:#8b93b8;--text3:#4a5270;--border:#1b2030;--border2:#262f48;--r:16px;--r2:12px;--r3:8px;--font:'Sora',sans-serif;--mono:'JetBrains Mono',monospace;--cbg:var(--bg2);--cbo:var(--border2);--obg:var(--bg2);--obo:var(--border2);--navbg:rgba(7,9,14,0.97);}
.light{--bg:#f4f6fb;--bg2:#ffffff;--bg3:#eef0f7;--bg4:#e2e6f0;--text:#0f1320;--text2:#4a5270;--text3:#8b93b8;--border:#dde2f0;--border2:#c8cfdf;--cbg:#fff;--cbo:var(--border2);--obg:#fff;--obo:var(--border2);--navbg:rgba(244,246,251,0.97);}
body{background:var(--bg);color:var(--text);font-family:var(--font);min-height:100vh;transition:background .2s,color .2s;}
.app{max-width:430px;margin:0 auto;min-height:100vh;background:var(--bg);display:flex;flex-direction:column;position:relative;}
.screen{flex:1;padding:24px 16px 96px;overflow-y:auto;}
.nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:var(--navbg);backdrop-filter:blur(20px);border-top:1px solid var(--border2);display:flex;justify-content:space-around;padding:10px 0 20px;z-index:100;}
.nb{display:flex;flex-direction:column;align-items:center;gap:3px;background:none;border:none;color:var(--text3);cursor:pointer;transition:color .15s;padding:4px 18px;}
.nb.on{color:var(--blue);}
.nb span{font-size:10px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;}
.card{background:var(--cbg);border:1px solid var(--cbo);border-radius:var(--r);padding:16px;}
.card-acc{background:linear-gradient(135deg,rgba(79,124,255,.07),rgba(139,92,246,.04));border:1px solid rgba(79,124,255,.2);border-radius:var(--r);padding:18px;}
.update-banner{background:linear-gradient(135deg,rgba(34,197,94,.12),rgba(79,124,255,.08));border:1px solid rgba(34,197,94,.3);border-radius:var(--r2);padding:12px 14px;margin-bottom:16px;display:flex;align-items:center;gap:10px;}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:14px 20px;border-radius:var(--r2);border:none;font-family:var(--font);font-weight:600;font-size:15px;cursor:pointer;transition:all .12s;width:100%;}
.btn:disabled{opacity:.35;cursor:not-allowed;}
.bp{background:var(--blue);color:#fff;}
.bp:active:not(:disabled){background:#3a67e0;transform:scale(.98);}
.bg{background:transparent;color:var(--text2);border:1px solid var(--border2);}
.bg:active{background:var(--bg3);}
.bd{background:rgba(239,68,68,.1);color:var(--red);border:1px solid rgba(239,68,68,.22);}
.bsm{padding:8px 14px;font-size:13px;border-radius:var(--r3);width:auto;}
.bdg{display:inline-flex;align-items:center;padding:3px 9px;border-radius:999px;font-size:11px;font-weight:700;}
.deasy{background:rgba(34,197,94,.12);color:var(--green);}
.dmed{background:rgba(245,158,11,.12);color:var(--amber);}
.dhard{background:rgba(239,68,68,.12);color:var(--red);}
.bok{background:rgba(34,197,94,.12);color:var(--green);}
.bfail{background:rgba(239,68,68,.12);color:var(--red);}
.prog{height:4px;border-radius:999px;background:var(--bg4);overflow:hidden;}
.pf{height:100%;border-radius:999px;transition:width .3s;}
.tmr{display:inline-flex;align-items:center;gap:6px;background:var(--bg3);border:1px solid var(--border2);border-radius:999px;padding:6px 14px;font-family:var(--mono);font-weight:700;font-size:14px;}
.tw{border-color:rgba(245,158,11,.4);color:var(--amber);}
.tc{border-color:rgba(239,68,68,.4);color:var(--red);animation:pulse 1s infinite;}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
.opt{display:flex;align-items:flex-start;gap:12px;padding:14px;border-radius:var(--r2);border:1.5px solid var(--obo);background:var(--obg);cursor:pointer;transition:all .12s;margin-bottom:10px;}
.opt:active{transform:scale(.99);}
.osel{border-color:var(--blue)!important;background:rgba(79,124,255,.07)!important;}
.ocor{border-color:var(--green)!important;background:rgba(34,197,94,.07)!important;}
.owrng{border-color:var(--red)!important;background:rgba(239,68,68,.07)!important;}
.okey{width:28px;height:28px;border-radius:50%;border:1.5px solid var(--border2);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;flex-shrink:0;color:var(--text2);transition:all .12s;}
.osel .okey{border-color:var(--blue);background:var(--blue);color:#fff;}
.ocor .okey{border-color:var(--green);background:var(--green);color:#fff;}
.owrng .okey{border-color:var(--red);background:var(--red);color:#fff;}
.pg{display:grid;grid-template-columns:repeat(8,1fr);gap:5px;margin:10px 0;}
.pb{aspect-ratio:1;border-radius:6px;border:none;font-size:11px;font-weight:700;cursor:pointer;transition:all .1s;background:var(--bg3);color:var(--text3);}
.pb.pa{background:rgba(79,124,255,.18);color:var(--blue);}
.pb.pf2{background:rgba(245,158,11,.18);color:var(--amber);}
.pb.pc{outline:2px solid var(--blue);outline-offset:1px;color:var(--text);}
.chip{background:var(--bg3);border:1px solid var(--border2);border-radius:999px;padding:6px 14px;font-size:13px;font-weight:600;color:var(--text2);cursor:pointer;transition:all .12s;white-space:nowrap;}
.chip.on{background:rgba(79,124,255,.14);border-color:rgba(79,124,255,.35);color:var(--blue);}
.chip:active{transform:scale(.95);}
.tabs{display:flex;background:var(--bg3);border-radius:var(--r2);padding:4px;gap:4px;margin-bottom:20px;}
.tab{flex:1;padding:10px 4px;border:none;background:none;color:var(--text3);font-family:var(--font);font-size:13px;font-weight:600;border-radius:var(--r3);cursor:pointer;transition:all .18s;}
.tab.on{background:var(--cbg);color:var(--text);box-shadow:0 2px 8px rgba(0,0,0,.15);}
.expl{background:rgba(79,124,255,.05);border:1px solid rgba(79,124,255,.18);border-radius:var(--r2);padding:14px;margin-top:12px;}
.yp{padding:7px 13px;border-radius:999px;border:1.5px solid var(--border2);background:var(--cbg);color:var(--text2);font-size:13px;font-weight:600;cursor:pointer;transition:all .12s;}
.yp.on{border-color:var(--blue);background:rgba(79,124,255,.1);color:var(--blue);}
.yp:active{transform:scale(.94);}
.sgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;}
.sc{border-radius:var(--r);padding:16px;cursor:pointer;border:2px solid transparent;transition:all .15s;}
.sc:active{transform:scale(.97);}
.sc.on{transform:scale(.98);}
.mc{background:var(--cbg);border:1px solid var(--cbo);border-radius:var(--r);padding:16px;cursor:pointer;transition:background .12s;display:flex;align-items:center;gap:14px;margin-bottom:10px;}
.mc:active{background:var(--bg3);}
.sub-break{border-radius:var(--r2);padding:10px 14px;margin-bottom:14px;display:flex;align-items:center;gap:10px;}
.overlay{position:absolute;inset:0;background:rgba(7,9,14,.94);z-index:200;display:flex;flex-direction:column;padding:20px;overflow-y:auto;}
.light .overlay{background:rgba(244,246,251,.96);}
.lbl{font-size:11px;font-weight:700;letter-spacing:.8px;color:var(--text3);text-transform:uppercase;margin-bottom:10px;}
.row{display:flex;justify-content:space-between;align-items:center;}
.empty{text-align:center;padding:56px 24px;color:var(--text3);}
.empty p{margin-top:10px;font-size:14px;line-height:1.7;}
.tgl{width:46px;height:24px;border-radius:999px;border:none;cursor:pointer;position:relative;transition:background .2s;flex-shrink:0;}
.tgl.on{background:var(--blue);}
.tgl.off{background:var(--border2);}
.tgl-dot{position:absolute;top:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:left .2s;}
.tgl.on .tgl-dot{left:25px;}
.tgl.off .tgl-dot{left:3px;}
.footer{text-align:center;padding:16px 16px 8px;font-size:11px;color:var(--text3);font-weight:600;letter-spacing:.3px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.fade{animation:fadeUp .22s ease forwards;}
@keyframes landIn{from{opacity:0;transform:scale(.94) translateY(24px)}to{opacity:1;transform:none}}
.land{animation:landIn .5s cubic-bezier(.22,1,.36,1) forwards;}
::-webkit-scrollbar{width:3px;}
::-webkit-scrollbar-thumb{background:var(--border2);border-radius:999px;}`;

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App(){
  const [screen,setScreen]=useState("landing");
  const [tab,setTab]=useState("home");
  const [dark,setDark]=useState(true);
  const [store,setStore]=useState(null);
  const [loaded,setLoaded]=useState(false);
  const [questions,setQuestions]=useState([]);
  const [currentQ,setCurrentQ]=useState(0);
  const [answers,setAnswers]=useState({});
  const [flagged,setFlagged]=useState(new Set());
  const [revealed,setRevealed]=useState({});
  const [examCfg,setExamCfg]=useState({});
  const [result,setResult]=useState(null);
  const [showPal,setShowPal]=useState(false);
  const [showConf,setShowConf]=useState(false);
  const [update,setUpdate]=useState(null);

  useEffect(()=>{
    loadStore().then(s=>{ setStore(s); setLoaded(true); });
    checkForUpdate().then(u=>{ if(u) setUpdate(u); });
  },[]);

  const timer=useTimer(105*60,()=>doSubmit(true));

  function goTab(t){
    setTab(t);
    setScreen({home:"home",practice:"select",stats:"stats",settings:"settings"}[t]||"home");
  }

  function startExam(cfg){
    const qs=buildExam(cfg.mode,cfg,QB);
    if(!qs.length) return;
    setQuestions(qs); setCurrentQ(0); setAnswers({}); setFlagged(new Set()); setRevealed({});
    setResult(null); setExamCfg(cfg);
    const dur=cfg.mode==="mixed"?105*60:Math.max(qs.length*90,600);
    timer.reset(dur); setScreen("exam"); setTimeout(()=>timer.start(),80);
  }

  async function doSubmit(auto=false){
    timer.stop(); setShowConf(false);
    const correct=questions.filter(q=>answers[q.id]===q.a).length;
    const bySubject={};
    questions.forEach(q=>{
      if(!bySubject[q.s]) bySubject[q.s]={correct:0,total:0};
      bySubject[q.s].total++;
      if(answers[q.id]===q.a) bySubject[q.s].correct++;
    });
    const tr=topicResults(questions,answers);
    const session={id:Date.now(),date:new Date().toISOString(),mode:examCfg.mode,
      subject:examCfg.subject,year:examCfg.year,subjects:examCfg.subjects,
      correct,total:questions.length,score:getScore(correct,questions.length),
      pct:pct(correct,questions.length),bySubject,topicResults:tr,auto};
    setResult({correct,total:questions.length,bySubject,score:session.score,pct:session.pct});
    const updated=await recordSession(session);
    setStore(updated); setScreen("result");
  }

  return(
    <>
      <style>{CSS}</style>
      <div className={dark?"app":"app light"}>
        {screen==="landing"  && <Landing onStart={()=>setScreen("home")} dark={dark}/>}
        {screen==="home"     && <HomeScreen store={store} loaded={loaded} setScreen={setScreen} update={update}/>}
        {screen==="select"   && <SelectScreen startExam={startExam} setScreen={setScreen}/>}
        {screen==="exam"     && questions.length>0 && (
          <ExamScreen questions={questions} currentQ={currentQ} setCurrentQ={setCurrentQ}
            answers={answers} setAnswers={setAnswers} flagged={flagged} setFlagged={setFlagged}
            revealed={revealed} setRevealed={setRevealed} examCfg={examCfg} timer={timer}
            showPal={showPal} setShowPal={setShowPal} showConf={showConf} setShowConf={setShowConf}
            onSubmit={doSubmit}/>
        )}
        {screen==="result"   && result && (
          <ResultScreen stats={result} questions={questions} answers={answers} setScreen={setScreen}/>
        )}
        {screen==="review"   && <ReviewScreen questions={questions} answers={answers} setScreen={setScreen}/>}
        {screen==="stats"    && <StatsScreen store={store} loaded={loaded}/>}
        {screen==="settings" && <SettingsScreen store={store} setStore={setStore} dark={dark} setDark={setDark}/>}

        {screen!=="exam" && screen!=="landing" && (
          <nav className="nav">
            {[{id:"home",n:"home",l:"Home"},{id:"practice",n:"book",l:"Practice"},
              {id:"stats",n:"chart",l:"Stats"},{id:"settings",n:"cog",l:"Settings"}].map(x=>(
              <button key={x.id} className={`nb ${tab===x.id?"on":""}`} onClick={()=>goTab(x.id)}>
                <I n={x.n} sz={20}/><span>{x.l}</span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </>
  );
}

// ─── LANDING ──────────────────────────────────────────────────────────────────
function Landing({onStart}){
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      minHeight:"100vh",padding:"32px 24px",textAlign:"center",background:"var(--bg)"}}>
      <div className="land" style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
        <img src="/icon-192.png" alt="Rooster" style={{width:80,height:80,borderRadius:24,marginBottom:28,boxShadow:"0 8px 32px rgba(79,124,255,.35)"}}/>
        <div style={{fontSize:52,fontWeight:900,letterSpacing:-2,lineHeight:1,marginBottom:8,
          background:"linear-gradient(135deg,var(--text) 40%,var(--blue))",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
          Rooster
        </div>
        <div style={{fontSize:14,fontWeight:600,color:"var(--text3)",letterSpacing:.5,marginBottom:40}}>
          JAMB UTME Exam Simulator
        </div>
        <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:8,marginBottom:40,maxWidth:320}}>
          {["14 Subjects","400+ Questions","2010–2025","Offline","Timed","Full Review"].map(f=>(
            <span key={f} style={{padding:"6px 14px",borderRadius:999,background:"var(--bg3)",
              border:"1px solid var(--border2)",fontSize:12,fontWeight:700,color:"var(--text2)"}}>
              {f}
            </span>
          ))}
        </div>
        <button className="btn bp" style={{maxWidth:280,borderRadius:999,fontSize:16,
          padding:"16px 40px",boxShadow:"0 8px 24px rgba(79,124,255,.35)"}}
          onClick={onStart}>
          <I n="play" sz={18} c="#fff"/> Start Practising
        </button>
        <div style={{marginTop:40,fontSize:11,color:"var(--text3)",fontWeight:600}}>
          v{VERSION} · Rooster by frNtcOda
        </div>
      </div>
    </div>
  );
}

// ─── HOME SCREEN ─────────────────────────────────────────────────────────────
function HomeScreen({store,loaded,setScreen,update}){
  const sessions=store?.sessions||[];
  const totalQ=store?.totalQ||0;
  const totalC=store?.totalC||0;
  const avg=totalQ?pct(totalC,totalQ):null;
  const recent=sessions.slice(0,3);
  const subjStats=store?.subjectStats||{};

  return(
    <div className="screen fade">
      <div className="row" style={{marginBottom:22}}>
        <div>
          <div className="lbl" style={{marginBottom:3}}>JAMB UTME</div>
          <div style={{fontSize:28,fontWeight:900,letterSpacing:-1}}>
            Rooster <span style={{color:"var(--blue)"}}>CBT</span>
          </div>
        </div>
        <div style={{width:48,height:48,borderRadius:"var(--r)",background:"linear-gradient(135deg,var(--blue),var(--purple))",
          display:"flex",alignItems:"center",justifyContent:"center"}}>
          <img src="/icon-192.png" alt="Rooster" style={{width:40,height:40,borderRadius:12}}/>
        </div>
      </div>

      {update && (
        <div className="update-banner">
          <I n="download" sz={18} c="var(--green)"/>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:"var(--green)"}}>Update available — v{update.version}</div>
            <div style={{fontSize:11,color:"var(--text2)",marginTop:2}}>Tap to download the latest APK</div>
          </div>
          <button className="btn bp bsm" style={{width:"auto",padding:"6px 14px",fontSize:12}}
            onClick={()=>{ if(typeof window!=="undefined") window.open(update.url,"_blank"); }}>
            Update
          </button>
        </div>
      )}

      <div className="card-acc" style={{marginBottom:22}}>
        {!loaded?(
          <div style={{fontSize:13,color:"var(--text3)",textAlign:"center"}}>Loading...</div>
        ):avg!==null?(
          <>
            <div className="row" style={{marginBottom:12}}>
              <div>
                <div style={{fontSize:11,color:"var(--text3)",fontWeight:600,marginBottom:2}}>Average Score</div>
                <div style={{fontSize:36,fontWeight:800,fontFamily:"var(--mono)",color:avg>=50?"var(--blue)":"var(--red)"}}>
                  {getScore(totalC,totalQ)}<span style={{fontSize:16,color:"var(--text3)",fontWeight:600}}>/400</span>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:11,color:"var(--text3)",fontWeight:600,marginBottom:2}}>Questions</div>
                <div style={{fontSize:28,fontWeight:800,fontFamily:"var(--mono)"}}>{totalQ}</div>
              </div>
            </div>
            <div className="prog"><div className="pf" style={{width:`${avg}%`,background:"linear-gradient(90deg,var(--blue),var(--purple))"}}/></div>
            <div style={{fontSize:11,color:"var(--text3)",marginTop:6}}>{sessions.length} session{sessions.length!==1?"s":""} · {totalC} correct</div>
          </>
        ):(
          <div style={{fontSize:13,color:"var(--text3)",textAlign:"center",lineHeight:1.7}}>
            No sessions yet. Start practising to track your progress.
          </div>
        )}
      </div>

      <div className="lbl">Quick Start</div>
      {[
        {l:"By Subject",sub:"Pick any subject and year",n:"book"},
        {l:"By Year",sub:"All subjects from one exam year",n:"grid"},
        {l:"Custom Mixed",sub:"Pick your 4 subjects · UTME style",n:"chart"},
      ].map((m,i)=>(
        <div key={i} className="mc" onClick={()=>setScreen("select")}>
          <div style={{width:44,height:44,borderRadius:"var(--r2)",background:"var(--bg4)",
            border:"1px solid var(--border2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <I n={m.n} sz={18} c="var(--blue)"/>
          </div>
          <div style={{flex:1}}><div style={{fontWeight:700,fontSize:15}}>{m.l}</div>
          <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>{m.sub}</div></div>
          <I n="right" sz={16} c="var(--text3)"/>
        </div>
      ))}

      {recent.length>0&&(
        <>
          <div className="lbl" style={{marginTop:22}}>Recent Sessions</div>
          {recent.map(s=>(
            <div key={s.id} className="card" style={{marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:44,height:44,borderRadius:"var(--r3)",flexShrink:0,
                background:s.pct>=50?"rgba(79,124,255,.1)":"rgba(239,68,68,.08)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontFamily:"var(--mono)",fontWeight:800,fontSize:13,
                color:s.pct>=50?"var(--blue)":"var(--red)"}}>
                {s.score}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                  {s.mode==="mixed"?`Mixed (${(s.subjects||[]).join(", ").slice(0,30)||"4 subjects"})`
                    :s.mode==="year"?`Year ${s.year}`:s.subject}
                  {s.mode==="subject"&&s.year?` · ${s.year}`:""}
                </div>
                <div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>{s.correct}/{s.total} correct · {fmtDate(s.date)}</div>
              </div>
              <span className={`bdg ${s.pct>=50?"bok":"bfail"}`}>{s.pct>=70?"Pass":s.pct>=50?"Fair":"Fail"}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ─── SELECT SCREEN ────────────────────────────────────────────────────────────
function SelectScreen({startExam,setScreen}){
  const [mode,setMode]=useState("subject");
  const [subject,setSubject]=useState("Biology");
  const [year,setYear]=useState(null);
  const [count,setCount]=useState(40);
  const [selectedSubs,setSelectedSubs]=useState(["Use of English","Biology","Chemistry","Physics"]);
  const [cluster,setCluster]=useState(null);

  function toggleSub(s){
    setSelectedSubs(prev=>{
      if(prev.includes(s)) return prev.length>1?prev.filter(x=>x!==s):prev;
      if(prev.length>=4) return [...prev.slice(1),s];
      return [...prev,s];
    });
    setCluster(null);
  }

  function pickCluster(c){
    setCluster(c);
    setSelectedSubs(CLUSTERS[c].slice(0,4));
  }

  return(
    <div className="screen fade">
      <div className="row" style={{marginBottom:22}}>
        <div style={{fontSize:18,fontWeight:800}}>Configure Exam</div>
        <button className="btn bg bsm" onClick={()=>setScreen("home")}><I n="x" sz={14}/></button>
      </div>

      <div className="lbl">Mode</div>
      <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
        {[{id:"subject",l:"By Subject"},{id:"year",l:"By Year"},{id:"mixed",l:"Mixed / UTME"}].map(m=>(
          <button key={m.id} className={`chip ${mode===m.id?"on":""}`} onClick={()=>setMode(m.id)}>{m.l}</button>
        ))}
      </div>

      {mode==="mixed"&&(
        <>
          <div className="lbl">Quick Cluster</div>
          <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
            {Object.keys(CLUSTERS).map(c=>(
              <button key={c} className={`chip ${cluster===c?"on":""}`} onClick={()=>pickCluster(c)}>{c}</button>
            ))}
          </div>
          <div className="lbl">Your 4 Subjects <span style={{color:"var(--blue)",fontWeight:800}}>{selectedSubs.length}/4</span></div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:8}}>
            {ALL_SUBJECTS.map(s=>{
              const on=selectedSubs.includes(s);
              return(
                <button key={s} onClick={()=>toggleSub(s)}
                  style={{padding:"7px 13px",borderRadius:999,border:`1.5px solid ${on?SC[s]:SC[s]+"44"}`,
                    background:on?SC[s]+"18":"var(--cbg)",color:on?SC[s]:"var(--text2)",
                    fontSize:12,fontWeight:700,cursor:"pointer",transition:"all .12s"}}>
                  {s}
                </button>
              );
            })}
          </div>
          <div style={{fontSize:11,color:"var(--text3)",marginBottom:20}}>Select exactly 4 · tap to toggle · max 4 auto-drops oldest</div>
          <div className="card-acc" style={{marginBottom:20}}>
            <div style={{fontSize:13,fontWeight:600,color:"var(--text2)",lineHeight:1.9}}>
              {selectedSubs.join(" → ")}<br/>
              10 questions each = 40 total · 105 minutes
            </div>
          </div>
        </>
      )}

      {mode==="subject"&&(
        <>
          <div className="lbl">Subject</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:20}}>
            {ALL_SUBJECTS.map(s=>(
              <button key={s} onClick={()=>setSubject(s)}
                style={{padding:"8px 14px",borderRadius:999,border:`1.5px solid ${subject===s?SC[s]:SC[s]+"44"}`,
                  background:subject===s?SC[s]+"18":"var(--cbg)",color:subject===s?SC[s]:"var(--text2)",
                  fontSize:12,fontWeight:700,cursor:"pointer",transition:"all .12s"}}>
                {s}
              </button>
            ))}
          </div>
        </>
      )}

      {(mode==="subject"||mode==="year")&&(
        <>
          <div className="lbl">{mode==="subject"?"Year (optional)":"Year"}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:24}}>
            {mode==="subject"&&<button className={`yp ${!year?"on":""}`} onClick={()=>setYear(null)}>All Years</button>}
            {YEARS.map(y=><button key={y} className={`yp ${year===y?"on":""}`} onClick={()=>setYear(y)}>{y}</button>)}
          </div>
        </>
      )}

      {mode!=="mixed"&&(
        <>
          <div className="lbl">Number of Questions</div>
          <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
            {[10,20,40,60].map(n=><button key={n} className={`chip ${count===n?"on":""}`} onClick={()=>setCount(n)}>{n}</button>)}
          </div>
        </>
      )}

      <button className="btn bp"
        onClick={()=>startExam({mode,subject,year,count,subjects:selectedSubs,perSubject:10})}
        disabled={mode==="mixed"&&selectedSubs.length<2}>
        <I n="play" sz={15} c="#fff"/> Begin Exam
      </button>
    </div>
  );
}

// ─── EXAM SCREEN ──────────────────────────────────────────────────────────────
function ExamScreen({questions,currentQ,setCurrentQ,answers,setAnswers,flagged,setFlagged,
  revealed,setRevealed,examCfg,timer,showPal,setShowPal,showConf,setShowConf,onSubmit}){
  const q=questions[currentQ];
  const chosen=answers[q.id];
  const isRev=revealed[q.id];
  const isPrac=examCfg.mode!=="full";
  const tc=timer.secs<300?"tc":timer.secs<600?"tw":"";
  const answered=Object.keys(answers).length;
  const prevSubj=currentQ>0?questions[currentQ-1].s:null;
  const isNewSubj=examCfg.mode==="mixed"&&q.s!==prevSubj;
  const diffCls={Easy:"deasy",Medium:"dmed",Hard:"dhard"}[q.d]||"";

  function pick(opt){
    if(revealed[q.id]) return;
    setAnswers(a=>({...a,[q.id]:opt}));
    if(isPrac) setRevealed(r=>({...r,[q.id]:true}));
  }
  function toggleFlag(){
    setFlagged(f=>{const n=new Set(f);n.has(q.id)?n.delete(q.id):n.add(q.id);return n;});
  }

  const subjList=[...new Set(questions.map(q=>q.s))];

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100vh",background:"var(--bg)"}}>
      {showPal&&(
        <div className="overlay">
          <div className="row" style={{marginBottom:14}}>
            <div style={{fontWeight:700,fontSize:16}}>Question Palette</div>
            <button className="btn bg bsm" onClick={()=>setShowPal(false)}><I n="x" sz={15}/></button>
          </div>
          <div style={{display:"flex",gap:16,marginBottom:12,fontSize:11,fontWeight:700}}>
            <span style={{color:"var(--blue)"}}>Answered</span>
            <span style={{color:"var(--amber)"}}>Flagged</span>
            <span style={{color:"var(--text3)"}}>Unanswered</span>
          </div>
          {subjList.length>1?
            subjList.map(sub=>{
              const idxs=questions.reduce((acc,q_,i)=>q_.s===sub?[...acc,i]:acc,[]);
              return(
                <div key={sub} style={{marginBottom:12}}>
                  <div style={{fontSize:10,fontWeight:700,color:SC[sub]||"var(--blue)",letterSpacing:.5,textTransform:"uppercase",marginBottom:6}}>{sub}</div>
                  <div className="pg">
                    {idxs.map(i=>(
                      <button key={i} className={`pb ${answers[questions[i].id]?"pa":""} ${flagged.has(questions[i].id)?"pf2":""} ${i===currentQ?"pc":""}`}
                        onClick={()=>{setCurrentQ(i);setShowPal(false);}}>
                        {i+1}
                      </button>
                    ))}
                  </div>
                </div>
              );
            }):(
            <div className="pg">
              {questions.map((q_,i)=>(
                <button key={q_.id} className={`pb ${answers[q_.id]?"pa":""} ${flagged.has(q_.id)?"pf2":""} ${i===currentQ?"pc":""}`}
                  onClick={()=>{setCurrentQ(i);setShowPal(false);}}>
                  {i+1}
                </button>
              ))}
            </div>
          )}
          <div style={{marginTop:"auto",paddingTop:16}}>
            <div className="row" style={{marginBottom:14,fontSize:12,color:"var(--text3)",fontWeight:600}}>
              <span>Answered: <strong style={{color:"var(--text)"}}>{answered}</strong></span>
              <span>Flagged: <strong style={{color:"var(--text)"}}>{flagged.size}</strong></span>
              <span>Left: <strong style={{color:"var(--text)"}}>{questions.length-answered}</strong></span>
            </div>
            <button className="btn bd" onClick={()=>{setShowPal(false);setShowConf(true);}}>Submit Exam</button>
          </div>
        </div>
      )}

      {showConf&&(
        <div className="overlay" style={{justifyContent:"center",alignItems:"center"}}>
          <div className="card" style={{width:"100%"}}>
            <div style={{fontWeight:700,fontSize:17,marginBottom:10}}>Submit Examination?</div>
            <div style={{color:"var(--text2)",fontSize:14,lineHeight:1.7,marginBottom:6}}>
              You have answered <strong>{answered}</strong> of <strong>{questions.length}</strong> questions.
            </div>
            {questions.length-answered>0&&(
              <div style={{fontSize:13,color:"var(--amber)",marginBottom:14}}>
                {questions.length-answered} question{questions.length-answered>1?"s":""} unanswered.
              </div>
            )}
            <div style={{display:"flex",gap:10,marginTop:4}}>
              <button className="btn bg" onClick={()=>setShowConf(false)}>Cancel</button>
              <button className="btn bp" onClick={()=>onSubmit(false)}>Submit</button>
            </div>
          </div>
        </div>
      )}

      <div style={{padding:"14px 16px 12px",borderBottom:"1px solid var(--border)"}}>
        <div className="row" style={{marginBottom:10}}>
          <div className={`tmr ${tc}`}><I n="clock" sz={13}/> {timer.fmt()}</div>
          <div style={{display:"flex",gap:8}}>
            <button className="btn bg bsm" onClick={toggleFlag}>
              <I n="flag" sz={14} c={flagged.has(q.id)?"var(--amber)":"currentColor"}/>
            </button>
            <button className="btn bg bsm" onClick={()=>setShowPal(true)}><I n="grid" sz={14}/></button>
          </div>
        </div>
        <div className="row" style={{marginBottom:8}}>
          <div className="prog" style={{flex:1,marginRight:10}}>
            <div className="pf" style={{width:`${((currentQ+1)/questions.length)*100}%`,background:"var(--blue)"}}/>
          </div>
          <div style={{fontSize:12,fontWeight:700,fontFamily:"var(--mono)",color:"var(--text2)",whiteSpace:"nowrap"}}>
            {currentQ+1} / {questions.length}
          </div>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          <span style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:999,color:SC[q.s]||"var(--blue)",background:(SC[q.s]||"#4f7cff")+"14"}}>{q.s}</span>
          <span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:999,color:"var(--text3)",background:"var(--bg3)"}}>{q.t}</span>
          <span className={`bdg ${diffCls}`}>{q.d}</span>
          <span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:999,color:"var(--text3)",background:"var(--bg3)",fontFamily:"var(--mono)"}}>{q.y}</span>
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"14px 16px 0"}}>
        {isNewSubj&&(
          <div className="sub-break" style={{background:(SC[q.s]||"#4f7cff")+"12",border:`1px solid ${SC[q.s]||"#4f7cff"}30`}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:SC[q.s]||"var(--blue)",flexShrink:0}}/>
            <div>
              <div style={{fontSize:10,color:"var(--text3)",fontWeight:600}}>Now starting</div>
              <div style={{fontSize:14,fontWeight:700,color:SC[q.s]||"var(--blue)"}}>{q.s}</div>
            </div>
          </div>
        )}
        <div className="card fade" style={{marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:"var(--text3)",fontFamily:"var(--mono)",marginBottom:8,letterSpacing:.4}}>
            QUESTION {currentQ+1}
          </div>
          <div style={{fontSize:15,fontWeight:500,lineHeight:1.8}}>{q.q}</div>
        </div>

        {Object.entries(q.o).map(([key,val])=>{
          let cls="";
          if(isRev){
            if(key===q.a) cls="ocor";
            else if(key===chosen&&chosen!==q.a) cls="owrng";
          } else if(chosen===key) cls="osel";
          return(
            <div key={key} className={`opt ${cls}`} onClick={()=>pick(key)}>
              <div className="okey">{key}</div>
              <div style={{fontSize:14,lineHeight:1.7,fontWeight:500,flex:1}}>{val}</div>
              {isRev&&key===q.a&&<div style={{marginLeft:"auto",flexShrink:0}}><I n="check" sz={16} c="var(--green)"/></div>}
              {isRev&&cls==="owrng"&&<div style={{marginLeft:"auto",flexShrink:0}}><I n="x" sz={16} c="var(--red)"/></div>}
            </div>
          );
        })}

        {isRev&&(
          <div className="expl fade">
            <div style={{fontSize:11,fontWeight:700,color:"var(--blue)",marginBottom:6,letterSpacing:.5,textTransform:"uppercase"}}>Explanation</div>
            <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.8}}>{q.e}</div>
          </div>
        )}
        <div style={{height:16}}/>
      </div>

      <div style={{padding:"12px 16px 26px",borderTop:"1px solid var(--border)"}}>
        <div style={{display:"flex",gap:10}}>
          <button className="btn bg" style={{flex:1}} onClick={()=>setCurrentQ(c=>Math.max(0,c-1))} disabled={currentQ===0}>
            <I n="left" sz={15}/> Prev
          </button>
          {currentQ<questions.length-1?(
            <button className="btn bp" style={{flex:1}} onClick={()=>setCurrentQ(c=>c+1)}>
              Next <I n="right" sz={15} c="#fff"/>
            </button>
          ):(
            <button className="btn bd" style={{flex:1}} onClick={()=>setShowConf(true)}>Submit</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── RESULT SCREEN ────────────────────────────────────────────────────────────
function ResultScreen({stats,questions,answers,setScreen}){
  const {correct,total,bySubject,score,pct:p}=stats;
  const grade=p>=70?"Excellent":p>=50?"Good":p>=40?"Fair":"Needs Work";
  const gc=p>=70?"var(--green)":p>=50?"var(--blue)":p>=40?"var(--amber)":"var(--red)";
  const r=52,C=2*Math.PI*r;

  return(
    <div className="screen fade">
      <div style={{textAlign:"center",marginBottom:24}}>
        <div className="lbl" style={{marginBottom:4}}>Exam Complete</div>
        <div style={{fontSize:22,fontWeight:800}}>Your Results</div>
      </div>

      <div style={{position:"relative",width:130,height:130,margin:"0 auto 24px"}}>
        <svg width="130" height="130" viewBox="0 0 130 130" style={{transform:"rotate(-90deg)"}}>
          <circle cx="65" cy="65" r={r} fill="none" stroke="var(--bg4)" strokeWidth="10"/>
          <circle cx="65" cy="65" r={r} fill="none" stroke={gc} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C*(1-p/100)} style={{transition:"stroke-dashoffset 1.2s ease"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <div style={{fontSize:28,fontWeight:800,color:gc,fontFamily:"var(--mono)"}}>{score}</div>
          <div style={{fontSize:10,color:"var(--text3)",fontWeight:700}}>out of 400</div>
          <div style={{fontSize:11,fontWeight:700,color:gc,marginTop:2}}>{grade}</div>
        </div>
      </div>

      <div style={{display:"flex",gap:10,marginBottom:20}}>
        {[{l:"Correct",v:correct,c:"var(--green)"},{l:"Wrong",v:total-correct,c:"var(--red)"},{l:"Total",v:total,c:"var(--blue)"}].map(s=>(
          <div key={s.l} className="card" style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:24,fontWeight:800,color:s.c,fontFamily:"var(--mono)"}}>{s.v}</div>
            <div style={{fontSize:11,color:"var(--text3)",fontWeight:600,marginTop:3}}>{s.l}</div>
          </div>
        ))}
      </div>

      {Object.keys(bySubject).length>1&&(
        <>
          <div className="lbl">By Subject</div>
          {Object.entries(bySubject).map(([sub,d])=>{
            const sp=pct(d.correct,d.total);
            return(
              <div key={sub} className="card" style={{marginBottom:10}}>
                <div className="row" style={{marginBottom:8}}>
                  <div style={{fontSize:13,fontWeight:700}}>{sub}</div>
                  <div style={{fontSize:13,fontWeight:800,color:SC[sub]||"var(--blue)",fontFamily:"var(--mono)"}}>{sp}%</div>
                </div>
                <div className="prog"><div className="pf" style={{width:`${sp}%`,background:SC[sub]||"var(--blue)"}}/></div>
                <div style={{fontSize:11,color:"var(--text3)",marginTop:6,fontWeight:600}}>{d.correct} of {d.total} correct</div>
              </div>
            );
          })}
        </>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:20}}>
        <button className="btn bp" onClick={()=>setScreen("review")}><I n="book" sz={15} c="#fff"/> Review Answers</button>
        <button className="btn bg" onClick={()=>setScreen("select")}>Try Again</button>
        <button className="btn bg" onClick={()=>setScreen("home")}><I n="home" sz={15}/> Home</button>
      </div>
    </div>
  );
}

// ─── REVIEW SCREEN ────────────────────────────────────────────────────────────
function ReviewScreen({questions,answers,setScreen}){
  const [filter,setFilter]=useState("all");
  const list=questions.filter(q=>{
    if(filter==="wrong") return answers[q.id]!==q.a;
    if(filter==="correct") return answers[q.id]===q.a;
    return true;
  });

  return(
    <div className="screen fade">
      <div className="row" style={{marginBottom:16}}>
        <div style={{fontSize:18,fontWeight:800}}>Review Answers</div>
        <button className="btn bg bsm" onClick={()=>setScreen("result")}><I n="left" sz={15}/></button>
      </div>
      <div className="tabs">
        {[{id:"all",l:"All"},{id:"wrong",l:"Wrong"},{id:"correct",l:"Correct"}].map(t=>(
          <button key={t.id} className={`tab ${filter===t.id?"on":""}`} onClick={()=>setFilter(t.id)}>{t.l}</button>
        ))}
      </div>
      {list.length===0&&<div className="empty"><I n="check" sz={30} c="var(--text3)"/><p>No questions in this category.</p></div>}
      {list.map(q=>{
        const chosen=answers[q.id],correct=chosen===q.a;
        return(
          <div key={q.id} className="card" style={{marginBottom:14}}>
            <div className="row" style={{marginBottom:8,gap:8,flexWrap:"wrap"}}>
              <span style={{fontSize:11,fontWeight:700,color:"var(--text3)",fontFamily:"var(--mono)"}}>{q.s} · {q.y} · {q.t}</span>
              <span className={`bdg ${correct?"bok":"bfail"}`}>{correct?"Correct":"Wrong"}</span>
            </div>
            <div style={{fontSize:14,lineHeight:1.75,marginBottom:12}}>{q.q}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {Object.entries(q.o).map(([k,v])=>{
                const isCor=k===q.a,isBad=k===chosen&&!correct;
                return(
                  <div key={k} style={{padding:"8px 10px",borderRadius:"var(--r3)",fontSize:12,fontWeight:600,
                    background:isCor?"rgba(34,197,94,.08)":isBad?"rgba(239,68,68,.07)":"var(--bg3)",
                    color:isCor?"var(--green)":isBad?"var(--red)":"var(--text3)"}}>
                    {k}. {v}
                  </div>
                );
              })}
            </div>
            <div className="expl" style={{marginTop:12}}>
              <div style={{fontSize:11,fontWeight:700,color:"var(--blue)",marginBottom:6,letterSpacing:.5,textTransform:"uppercase"}}>Explanation</div>
              <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.8}}>{q.e}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── STATS SCREEN ─────────────────────────────────────────────────────────────
function StatsScreen({store,loaded}){
  if(!loaded) return <div className="screen"><div className="empty"><p>Loading...</p></div></div>;
  const sessions=store?.sessions||[];
  const topicStats=store?.topicStats||{};
  const subjStats=store?.subjectStats||{};
  const totalQ=store?.totalQ||0; const totalC=store?.totalC||0;

  if(!sessions.length) return(
    <div className="screen fade">
      <div style={{fontSize:18,fontWeight:800,marginBottom:24}}>Statistics</div>
      <div className="empty"><I n="chart" sz={34} c="var(--text3)"/><p>No data yet. Complete a session to see your statistics.</p></div>
    </div>
  );

  const avg=totalQ?pct(totalC,totalQ):0;
  const weak=Object.values(topicStats).filter(t=>t.total>=2)
    .map(t=>({...t,score:pct(t.correct,t.total)})).sort((a,b)=>a.score-b.score).slice(0,5);

  return(
    <div className="screen fade">
      <div style={{fontSize:18,fontWeight:800,marginBottom:20}}>Statistics</div>
      <div className="card-acc" style={{marginBottom:20,textAlign:"center"}}>
        <div className="lbl" style={{marginBottom:4}}>Overall Average</div>
        <div style={{fontSize:44,fontWeight:800,color:avg>=50?"var(--blue)":"var(--red)",fontFamily:"var(--mono)"}}>
          {getScore(totalC,totalQ)}<span style={{fontSize:16,color:"var(--text3)",fontWeight:600}}>/400</span>
        </div>
        <div style={{fontSize:12,color:"var(--text3)",marginTop:4}}>{totalC} correct from {totalQ} questions · {sessions.length} session{sessions.length>1?"s":""}</div>
      </div>

      {Object.keys(subjStats).length>0&&(
        <>
          <div className="lbl">Subject Performance</div>
          {ALL_SUBJECTS.filter(s=>subjStats[s]).map(s=>{
            const d=subjStats[s]; const sp=pct(d.correct,d.total);
            const status=sp>=70?"Strong":sp>=50?"Improving":"Needs Focus";
            return(
              <div key={s} className="card" style={{marginBottom:10}}>
                <div className="row" style={{marginBottom:8}}>
                  <div style={{fontWeight:700,fontSize:14}}>{s}</div>
                  <span style={{fontFamily:"var(--mono)",fontWeight:800,color:SC[s]||"var(--blue)",fontSize:15}}>{sp}%</span>
                </div>
                <div className="prog"><div className="pf" style={{width:`${sp}%`,background:SC[s]||"var(--blue)"}}/></div>
                <div className="row" style={{marginTop:6}}>
                  <span style={{fontSize:11,color:"var(--text3)",fontWeight:600}}>{d.correct}/{d.total} correct · {d.sessions} session{d.sessions>1?"s":""}</span>
                  <span style={{fontSize:11,fontWeight:700,color:sp>=70?"var(--green)":sp>=50?"var(--amber)":"var(--red)"}}>{status}</span>
                </div>
              </div>
            );
          })}
        </>
      )}

      {weak.length>0&&(
        <>
          <div className="lbl" style={{marginTop:20}}>Topics to Improve</div>
          {weak.map(t=>(
            <div key={t.topic+t.subject} className="card" style={{marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:44,height:44,borderRadius:"var(--r3)",flexShrink:0,background:"rgba(239,68,68,.08)",
                display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--mono)",fontWeight:800,fontSize:13,color:"var(--red)"}}>
                {t.score}%
              </div>
              <div>
                <div style={{fontWeight:700,fontSize:14}}>{t.topic}</div>
                <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>{t.subject} · {t.total} attempt{t.total>1?"s":""}</div>
              </div>
            </div>
          ))}
        </>
      )}

      <div className="lbl" style={{marginTop:20}}>Session History</div>
      {sessions.map(s=>(
        <div key={s.id} className="card" style={{marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:44,height:44,borderRadius:"var(--r3)",flexShrink:0,
            background:s.pct>=50?"rgba(79,124,255,.09)":"rgba(239,68,68,.07)",
            display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--mono)",fontWeight:800,fontSize:13,
            color:s.pct>=50?"var(--blue)":"var(--red)"}}>
            {s.score}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
              {s.mode==="mixed"?`Mixed`
                :s.mode==="year"?`Year ${s.year}`:s.subject}
              {s.mode==="subject"&&s.year?` · ${s.year}`:""}
            </div>
            <div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>{s.correct}/{s.total} correct · {fmtDate(s.date)}</div>
          </div>
          <span className={`bdg ${s.pct>=50?"bok":"bfail"}`}>{s.pct>=70?"Pass":s.pct>=50?"Fair":"Fail"}</span>
        </div>
      ))}
    </div>
  );
}

// ─── SETTINGS SCREEN ──────────────────────────────────────────────────────────
function SettingsScreen({store,setStore,dark,setDark}){
  const [clearing,setClearing]=useState(false);
  const [done,setDone]=useState(false);
  const count=(store?.sessions||[]).length;

  async function handleClear(){
    setClearing(true);
    await clearStore();
    setStore(initStore());
    setClearing(false); setDone(true);
    setTimeout(()=>setDone(false),3000);
  }

  const rows=[
    {l:"App",v:`Rooster — JAMB UTME Simulator`},
    {l:"Version",v:VERSION},
    {l:"Years Covered",v:"2010 – 2025"},
    {l:"Subjects",v:`${ALL_SUBJECTS.length} subjects`},
    {l:"Question Bank",v:`${QB.length} questions (fully offline)`},
    {l:"Exam Duration",v:"105 minutes (official UTME)"},
    {l:"Scoring",v:"Scaled to 400 marks"},
    {l:"Sessions Stored",v:String(count)},
  ];

  return(
    <div className="screen fade">
      <div style={{fontSize:18,fontWeight:800,marginBottom:24}}>Settings</div>

      <div className="lbl">Appearance</div>
      <div className="card" style={{marginBottom:20}}>
        <div className="row">
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <I n={dark?"moon":"sun"} sz={18} c="var(--text2)"/>
            <div>
              <div style={{fontWeight:700,fontSize:14}}>{dark?"Dark Mode":"Light Mode"}</div>
              <div style={{fontSize:12,color:"var(--text3)",marginTop:1}}>{dark?"Switch to light":"Switch to dark"}</div>
            </div>
          </div>
          <button className={`tgl ${dark?"on":"off"}`} onClick={()=>setDark(d=>!d)}>
            <div className="tgl-dot"/>
          </button>
        </div>
      </div>

      <div className="lbl">App Info</div>
      <div className="card" style={{marginBottom:20}}>
        {rows.map((row,i)=>(
          <div key={row.l} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",
            padding:"11px 0",borderBottom:i<rows.length-1?"1px solid var(--border)":"none"}}>
            <div style={{fontSize:13,color:"var(--text3)",fontWeight:600,flexShrink:0,marginRight:12}}>{row.l}</div>
            <div style={{fontSize:13,fontWeight:600,textAlign:"right",color:"var(--text2)",maxWidth:"58%"}}>{row.v}</div>
          </div>
        ))}
      </div>

      <div className="lbl">Data</div>
      <div className="card">
        <div style={{fontSize:14,color:"var(--text2)",lineHeight:1.75,marginBottom:16}}>
          All session history is stored locally on your device. No data is sent to any server.
        </div>
        {done?(
          <div style={{padding:14,borderRadius:"var(--r3)",background:"rgba(34,197,94,.07)",
            color:"var(--green)",fontSize:14,fontWeight:600,textAlign:"center",border:"1px solid rgba(34,197,94,.18)"}}>
            All history cleared.
          </div>
        ):(
          <button className="btn bd" onClick={handleClear} disabled={clearing||count===0}>
            <I n="trash" sz={15} c="var(--red)"/>
            {clearing?"Clearing...":count===0?"No Data to Clear":"Clear All History"}
          </button>
        )}
      </div>

      <div className="footer" style={{marginTop:32}}>
        Rooster v{VERSION} by frNtcOda
      </div>
    </div>
  );
}
