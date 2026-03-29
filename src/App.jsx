import { useState, useEffect, useRef, useCallback } from "react";

const APP = "Rooster";
const TAGLINE = "JAMB UTME Exam Simulator";
const UTME_SECS = 105 * 60;
const MARKS_TOTAL = 400;
const SC = { Biology:"#22c55e", Physics:"#4f7cff", Chemistry:"#f59e0b", "Use of English":"#a855f7" };
const YEARS = Array.from({length:16},(_,i)=>2010+i);
const MIXED = {"Use of English":60,Biology:40,Chemistry:40,Physics:40};
const SKEY = "rooster_v1";

const QB = [
  // Biology Questions (b001-b125)
  {id:"b001",s:"Biology",y:2010,t:"Cell Biology",d:"Easy",q:"The powerhouse of the cell is the",o:{"A":"Nucleus","B":"Ribosome","C":"Mitochondrion","D":"Golgi body"},a:"C",e:"Mitochondria produce ATP via cellular respiration — the energy currency of the cell."},
  {id:"b002",s:"Biology",y:2011,t:"Cell Biology",d:"Easy",q:"Which organelle is the site of protein synthesis?",o:{"A":"Mitochondrion","B":"Ribosome","C":"Lysosome","D":"Vacuole"},a:"B",e:"Ribosomes translate mRNA into polypeptide chains. Found free in cytoplasm or on rough ER."},
  {id:"b003",s:"Biology",y:2012,t:"Cell Biology",d:"Easy",q:"Plant cell walls are mainly composed of",o:{"A":"Chitin","B":"Pectin","C":"Cellulose","D":"Lignin"},a:"C",e:"Cellulose microfibrils form the structural scaffold of plant cell walls. Chitin is in fungal walls."},
  {id:"b004",s:"Biology",y:2013,t:"Cell Biology",d:"Medium",q:"Which is NOT found in a prokaryotic cell?",o:{"A":"Cell wall","B":"Ribosome","C":"Mitochondrion","D":"Cell membrane"},a:"C",e:"Prokaryotes lack membrane-bound organelles including mitochondria."},
  {id:"b005",s:"Biology",y:2014,t:"Cell Biology",d:"Medium",q:"Engulfment of large solid particles by a cell is called",o:{"A":"Pinocytosis","B":"Phagocytosis","C":"Osmosis","D":"Exocytosis"},a:"B",e:"Phagocytosis (cell eating) ingests solids like bacteria. Pinocytosis ingests liquid droplets."},
  {id:"b006",s:"Biology",y:2015,t:"Cell Biology",d:"Easy",q:"Which organelle modifies, packages, and secretes proteins?",o:{"A":"Ribosome","B":"Mitochondrion","C":"Golgi apparatus","D":"Lysosome"},a:"C",e:"The Golgi apparatus receives proteins from ER, processes them, and dispatches them to destinations."},
  {id:"b007",s:"Biology",y:2016,t:"Cell Biology",d:"Medium",q:"The fluid-mosaic model describes the structure of the",o:{"A":"Cell wall","B":"Nucleus","C":"Cell membrane","D":"Cytoskeleton"},a:"C",e:"Singer and Nicolson (1972): cell membrane is a fluid phospholipid bilayer with embedded proteins."},
  {id:"b008",s:"Biology",y:2017,t:"Cell Biology",d:"Medium",q:"Lysosomes contain",o:{"A":"Photosynthetic pigments","B":"Hydrolytic enzymes","C":"Genetic material","D":"Contractile proteins"},a:"B",e:"Lysosomes hold hydrolytic enzymes for digesting waste, worn-out organelles, and foreign particles."},
  {id:"b009",s:"Biology",y:2018,t:"Cell Biology",d:"Hard",q:"Smooth endoplasmic reticulum is mainly responsible for",o:{"A":"Protein synthesis","B":"Lipid synthesis and detoxification","C":"ATP production","D":"DNA replication"},a:"B",e:"Smooth ER synthesises lipids, steroids, and detoxifies drugs. Has no ribosomes."},
  {id:"b010",s:"Biology",y:2019,t:"Cell Biology",d:"Hard",q:"The tonoplast surrounds the",o:{"A":"Nucleus","B":"Mitochondrion","C":"Central vacuole","D":"Chloroplast"},a:"C",e:"The tonoplast is the selective membrane bounding the central vacuole in plant cells."},
  {id:"b011",s:"Biology",y:2020,t:"Cell Biology",d:"Hard",q:"Cristae in mitochondria are",o:{"A":"Outer membrane folds","B":"Infoldings of the inner membrane","C":"Matrix granules","D":"Ribosomes"},a:"B",e:"Cristae increase inner membrane surface area for oxidative phosphorylation and ATP synthesis."},
  {id:"b012",s:"Biology",y:2021,t:"Cell Biology",d:"Easy",q:"A cell lacking a true membrane-bound nucleus is",o:{"A":"Eukaryotic","B":"Prokaryotic","C":"Diploid","D":"Haploid"},a:"B",e:"Prokaryotes (bacteria, archaea) lack a nucleus. DNA lies in the nucleoid region."},
  {id:"b013",s:"Biology",y:2022,t:"Cell Biology",d:"Easy",q:"Chloroplasts are found in",o:{"A":"All living cells","B":"Animal cells only","C":"Plant cells and some protists","D":"Bacteria only"},a:"C",e:"Chloroplasts are in plant cells and algae. They contain chlorophyll and are sites of photosynthesis."},
  {id:"b014",s:"Biology",y:2023,t:"Cell Biology",d:"Medium",q:"Active transport differs from diffusion because active transport",o:{"A":"Moves substances down gradient","B":"Requires energy (ATP)","C":"Only moves water","D":"Needs no membrane"},a:"B",e:"Active transport uses carrier proteins and ATP to move substances against their concentration gradient."},
  {id:"b015",s:"Biology",y:2024,t:"Cell Biology",d:"Medium",q:"Osmosis is water movement from",o:{"A":"Low to high water potential","B":"High to low water potential across a selectively permeable membrane","C":"High solute to low solute","D":"Any region to any region"},a:"B",e:"Water moves from high water potential (dilute) to low water potential (concentrated) across a selectively permeable membrane."},
  {id:"b016",s:"Biology",y:2010,t:"Cell Biology",d:"Hard",q:"The sodium-potassium pump moves",o:{"A":"Na+ in and K+ in","B":"3 Na+ out and 2 K+ in per ATP","C":"Na+ out only","D":"Both ions out"},a:"B",e:"Na+/K+ ATPase pumps 3 Na+ out and 2 K+ in per ATP, maintaining the electrochemical gradient essential for nerve impulses."},
  {id:"b017",s:"Biology",y:2011,t:"Cell Biology",d:"Medium",q:"The cell membrane is described as",o:{"A":"Fully permeable","B":"Selectively permeable","C":"Impermeable to all","D":"Made of cellulose"},a:"B",e:"The cell membrane is selectively permeable, controlling passage of substances into and out of the cell."},
  {id:"b018",s:"Biology",y:2012,t:"Cell Biology",d:"Medium",q:"Endocytosis and exocytosis are forms of",o:{"A":"Passive transport","B":"Osmosis","C":"Bulk transport requiring energy","D":"Facilitated diffusion"},a:"C",e:"Both endocytosis (intake) and exocytosis (secretion) require energy (ATP) and form membrane vesicles."},
  {id:"b019",s:"Biology",y:2013,t:"Cell Biology",d:"Easy",q:"Diffusion is movement of molecules from",o:{"A":"Low to high concentration","B":"High to low concentration","C":"Across a membrane only","D":"Against concentration gradient"},a:"B",e:"Diffusion is passive movement down a concentration gradient — no energy required."},
  {id:"b020",s:"Biology",y:2014,t:"Cell Biology",d:"Hard",q:"The nucleolus is responsible for",o:{"A":"DNA replication","B":"mRNA synthesis","C":"rRNA synthesis and ribosome assembly","D":"Protein modification"},a:"C",e:"The nucleolus synthesises ribosomal RNA (rRNA) and assembles ribosomal subunits exported to cytoplasm."},
  {id:"b021",s:"Biology",y:2015,t:"Genetics",d:"Easy",q:"The basic unit of heredity is the",o:{"A":"Chromosome","B":"Gene","C":"Allele","D":"Nucleotide"},a:"B",e:"A gene is a DNA segment coding for a specific protein or functional RNA — the fundamental hereditary unit."},
  {id:"b022",s:"Biology",y:2016,t:"Genetics",d:"Medium",q:"Phenotypic ratio from Aa x Aa cross is",o:{"A":"1:2:1","B":"3:1","C":"1:1","D":"9:3:3:1"},a:"B",e:"AA and Aa show dominant phenotype; aa shows recessive. Ratio 3 dominant : 1 recessive."},
  {id:"b023",s:"Biology",y:2017,t:"Genetics",d:"Medium",q:"Blood group AB is an example of",o:{"A":"Incomplete dominance","B":"Codominance","C":"Epistasis","D":"Sex linkage"},a:"B",e:"In AB blood type, both I^A and I^B alleles are fully and simultaneously expressed — codominance."},
  {id:"b024",s:"Biology",y:2018,t:"Genetics",d:"Medium",q:"A testcross uses a homozygous recessive to",o:{"A":"Test for sex linkage","B":"Reveal whether unknown is TT or Tt","C":"Guarantee dominant offspring","D":"Prevent crossing over"},a:"B",e:"Testcross (unknown x tt): if any recessive offspring appear, the unknown must be Tt."},
  {id:"b025",s:"Biology",y:2019,t:"Genetics",d:"Medium",q:"Most sex-linked traits in humans are on the",o:{"A":"Autosomes","B":"Y chromosome","C":"X chromosome","D":"Mitochondrial DNA"},a:"C",e:"X-linked traits: males (XY) have one X so express any X-linked allele. Females can be carriers."},
  {id:"b026",s:"Biology",y:2020,t:"Genetics",d:"Hard",q:"Blood group O woman (ii) x blood group AB man (I^A I^B). Children can be",o:{"A":"O only","B":"AB only","C":"A or B only","D":"A, B, or AB"},a:"C",e:"Cross ii x I^AI^B gives I^Ai (group A) and I^Bi (group B) only."},
  {id:"b027",s:"Biology",y:2021,t:"Genetics",d:"Medium",q:"Down syndrome results from",o:{"A":"Deletion of chromosome 21","B":"Trisomy 21","C":"Monosomy X","D":"Inversion of chromosome 21"},a:"B",e:"Trisomy 21: three copies of chromosome 21 due to non-disjunction. 47 chromosomes total."},
  {id:"b028",s:"Biology",y:2022,t:"Genetics",d:"Medium",q:"A mutation is a heritable change in",o:{"A":"Normal variation","B":"DNA sequence","C":"Natural selection","D":"Crossing over"},a:"B",e:"Mutation: permanent heritable change in nucleotide sequence. Germline mutations are passed to offspring."},
  {id:"b029",s:"Biology",y:2023,t:"Genetics",d:"Medium",q:"Haemophilia is",o:{"A":"Autosomal dominant","B":"Autosomal recessive","C":"X-linked recessive","D":"X-linked dominant"},a:"C",e:"Haemophilia A is X-linked recessive. Males (X^h Y) express the disease; females need X^h X^h."},
  {id:"b030",s:"Biology",y:2024,t:"Genetics",d:"Easy",q:"Probability of aa offspring from Aa x Aa is",o:{"A":"0%","B":"25%","C":"50%","D":"75%"},a:"B",e:"Aa x Aa: 25% AA, 50% Aa, 25% aa. Probability of homozygous recessive = 25%."},
  {id:"b031",s:"Biology",y:2010,t:"Genetics",d:"Hard",q:"Sickle cell anaemia substitutes glutamic acid with",o:{"A":"Alanine","B":"Valine","C":"Glycine","D":"Proline"},a:"B",e:"Point mutation: glutamic acid at position 6 of beta-globin replaced by valine → HbS polymerises when deoxygenated."},
  {id:"b032",s:"Biology",y:2011,t:"Genetics",d:"Hard",q:"Continuous variation is controlled by",o:{"A":"One gene with two alleles","B":"Multiple genes plus environment","C":"Environment alone","D":"Sex-linked genes only"},a:"B",e:"Polygenic inheritance plus environmental factors produces normal distribution — continuous variation."},
  {id:"b033",s:"Biology",y:2012,t:"Genetics",d:"Hard",q:"Crossing over between homologous chromosomes occurs during",o:{"A":"Prophase of mitosis","B":"Prophase I of meiosis","C":"Anaphase II","D":"Interphase"},a:"B",e:"Crossing over at chiasmata during Prophase I increases genetic variation in gametes."},
  {id:"b034",s:"Biology",y:2013,t:"Genetics",d:"Hard",q:"Hardy-Weinberg equilibrium requires ALL EXCEPT",o:{"A":"Large population","B":"Random mating","C":"Frequent mutation","D":"No net migration"},a:"C",e:"H-W requires: large population, random mating, no mutation, no migration, no selection. Mutation disrupts it."},
  {id:"b035",s:"Biology",y:2014,t:"Genetics",d:"Medium",q:"Phenotype is determined by",o:{"A":"Genotype only","B":"Environment only","C":"Both genotype and environment","D":"Neither"},a:"C",e:"Phenotype = interaction of genotype and environment. Height depends on genes AND nutrition."},
  {id:"b036",s:"Biology",y:2015,t:"Genetics",d:"Easy",q:"A heterozygous organism has",o:{"A":"Two identical alleles","B":"Two different alleles for a trait","C":"No alleles","D":"One dominant allele only"},a:"B",e:"Heterozygous: two different alleles (e.g., Aa). Homozygous: two identical alleles (AA or aa)."},
  {id:"b037",s:"Biology",y:2016,t:"Genetics",d:"Hard",q:"Genotype I^Ai produces blood group",o:{"A":"AB","B":"B","C":"A","D":"O"},a:"C",e:"I^A is dominant over i. I^Ai makes only A antigens → blood group A."},
  {id:"b038",s:"Biology",y:2017,t:"Genetics",d:"Medium",q:"Gene linkage means two genes are",o:{"A":"Coding for same protein","B":"On the same chromosome","C":"Having same alleles","D":"Always inherited together"},a:"B",e:"Linked genes are on the same chromosome. Tend to be inherited together unless separated by crossing over."},
  {id:"b039",s:"Biology",y:2018,t:"Genetics",d:"Hard",q:"Colour-blind woman (X^c X^c) x normal man (X Y). Proportion of colour-blind sons is",o:{"A":"0%","B":"50%","C":"100%","D":"25%"},a:"C",e:"All sons receive X^c from mother and Y from father → X^c Y. All sons are colour blind (100%)."},
  {id:"b040",s:"Biology",y:2019,t:"Genetics",d:"Medium",q:"Multiple alleles means a gene has",o:{"A":"Two alleles only","B":"More than two alleles in the population","C":"No alleles","D":"Alleles on different chromosomes"},a:"B",e:"Multiple alleles: >2 allelic forms in the population at one locus. ABO blood groups: I^A, I^B, i."},
  {id:"b041",s:"Biology",y:2020,t:"Ecology",d:"Easy",q:"An ecosystem includes",o:{"A":"Only living organisms","B":"Only physical environment","C":"All organisms and their physical environment","D":"Only plants"},a:"C",e:"Ecosystem = all biotic and abiotic components interacting in an area."},
  {id:"b042",s:"Biology",y:2021,t:"Ecology",d:"Easy",q:"Producers in an ecosystem",o:{"A":"Feed on plants","B":"Synthesise organic compounds from inorganic materials","C":"Are decomposers","D":"Are top carnivores"},a:"B",e:"Producers (autotrophs) convert inorganic substances to organic compounds using light or chemical energy."},
  {id:"b043",s:"Biology",y:2022,t:"Ecology",d:"Medium",q:"Commensalism: one organism benefits, the other is",o:{"A":"Harmed","B":"Also benefited","C":"Neither helped nor harmed","D":"Eliminated"},a:"C",e:"Commensalism (+/0): one benefits, other unaffected. Example: remora fish on shark."},
  {id:"b044",s:"Biology",y:2023,t:"Ecology",d:"Easy",q:"Energy transferred between trophic levels is approximately",o:{"A":"1%","B":"10%","C":"50%","D":"90%"},a:"B",e:"10% rule: about 10% of energy at one trophic level passes to the next."},
  {id:"b045",s:"Biology",y:2024,t:"Ecology",d:"Medium",q:"Denitrifying bacteria convert",o:{"A":"N2 to ammonium","B":"Nitrates to N2 gas","C":"Ammonium to nitrite","D":"N2 to protein"},a:"B",e:"Denitrifying bacteria reduce nitrates → N2 gas, completing the nitrogen cycle."},
  {id:"b046",s:"Biology",y:2010,t:"Ecology",d:"Medium",q:"Eutrophication is caused by",o:{"A":"Excess CO2","B":"Excessive nitrates and phosphates from runoff","C":"Low temperatures","D":"Predatory fish introduction"},a:"B",e:"Excess nutrients → algal blooms → decomposition depletes oxygen → aquatic life dies."},
  {id:"b047",s:"Biology",y:2011,t:"Ecology",d:"Medium",q:"Population at carrying capacity shows",o:{"A":"J-shaped growth","B":"Stable zero net growth","C":"Rapid decline","D":"Oscillating growth"},a:"B",e:"At K: births = deaths → net growth = 0. Logistic (S-shaped) growth curve levels off at K."},
  {id:"b048",s:"Biology",y:2012,t:"Ecology",d:"Medium",q:"Ozone depletion is primarily caused by",o:{"A":"Carbon dioxide","B":"CFCs","C":"Methane","D":"Sulphur dioxide"},a:"B",e:"CFCs release Cl radicals in stratosphere that catalytically destroy O3."},
  {id:"b049",s:"Biology",y:2013,t:"Ecology",d:"Hard",q:"Secondary succession begins where",o:{"A":"Bare rock exists","B":"Soil and some organisms already exist","C":"Volcanic activity occurred","D":"No water exists"},a:"B",e:"Secondary succession follows disturbance of existing community where soil remains."},
  {id:"b050",s:"Biology",y:2014,t:"Ecology",d:"Easy",q:"Decomposers",o:{"A":"Feed on living plants","B":"Are top carnivores","C":"Break down dead organic matter recycling nutrients","D":"Produce their own food"},a:"C",e:"Decomposers (bacteria, fungi) break down dead matter, returning nutrients to ecosystem."},
  {id:"b051",s:"Biology",y:2015,t:"Ecology",d:"Easy",q:"Which is an abiotic factor?",o:{"A":"Predation","B":"Competition","C":"Temperature","D":"Parasitism"},a:"C",e:"Abiotic = non-living: temperature, light, pH, humidity, water. Biotic = living organism interactions."},
  {id:"b052",s:"Biology",y:2016,t:"Ecology",d:"Medium",q:"Mutualism: both organisms",o:{"A":"One benefits, other harmed","B":"Benefit (+/+)","C":"One benefits, other unaffected","D":"Both harmed"},a:"B",e:"Mutualism (+/+): both benefit. Example: Rhizobium in legume root nodules."},
  {id:"b053",s:"Biology",y:2017,t:"Ecology",d:"Hard",q:"Greenhouse effect is caused by gases that",o:{"A":"Destroy ozone","B":"Trap heat (infrared) radiation in the atmosphere","C":"Produce acid rain","D":"Reduce oxygen"},a:"B",e:"CO2, CH4, H2O vapour absorb outgoing infrared radiation and re-emit it back to Earth."},
  {id:"b054",s:"Biology",y:2018,t:"Ecology",d:"Hard",q:"Acid rain is mainly caused by",o:{"A":"CO2 and CH4","B":"SO2 and NOx reacting with water","C":"CFCs and ozone","D":"CO only"},a:"B",e:"SO2 and NOx from burning fossil fuels react with water → H2SO4 and HNO3 = acid rain."},
  {id:"b055",s:"Biology",y:2019,t:"Ecology",d:"Medium",q:"An ecological niche is",o:{"A":"Habitat of an organism","B":"Role and function of organism in ecosystem","C":"Food organism eats","D":"Geographic range"},a:"B",e:"Niche = ecological role: position in food web, habitat requirements, all interactions."},
  {id:"b056",s:"Biology",y:2020,t:"Nutrition",d:"Easy",q:"Pepsin acts on proteins in the",o:{"A":"Mouth","B":"Stomach","C":"Small intestine","D":"Large intestine"},a:"B",e:"Pepsin is a protease active at pH 1.5-2.0 in the stomach."},
  {id:"b057",s:"Biology",y:2021,t:"Nutrition",d:"Easy",q:"Bile is stored in the",o:{"A":"Pancreas","B":"Stomach","C":"Gallbladder","D":"Duodenum"},a:"C",e:"Bile is made in the liver, stored in gallbladder, released into duodenum to emulsify fats."},
  {id:"b058",s:"Biology",y:2022,t:"Nutrition",d:"Easy",q:"Main site of nutrient absorption is the",o:{"A":"Stomach","B":"Large intestine","C":"Small intestine","D":"Oesophagus"},a:"C",e:"Villi and microvilli in the small intestine provide enormous surface area for absorption."},
  {id:"b059",s:"Biology",y:2023,t:"Nutrition",d:"Easy",q:"Vitamin C deficiency causes",o:{"A":"Rickets","B":"Scurvy","C":"Pellagra","D":"Anaemia"},a:"B",e:"Scurvy: vitamin C deficiency impairs collagen synthesis → bleeding gums, slow wound healing."},
  {id:"b060",s:"Biology",y:2024,t:"Nutrition",d:"Medium",q:"Salivary amylase converts starch into",o:{"A":"Glucose","B":"Maltose","C":"Sucrose","D":"Fructose"},a:"B",e:"Salivary amylase hydrolyses starch → maltose in the mouth (pH optimum ~7)."},
  {id:"b061",s:"Biology",y:2010,t:"Nutrition",d:"Easy",q:"Kwashiorkor is caused by deficiency of",o:{"A":"Carbohydrates","B":"Fats","C":"Proteins","D":"Vitamins"},a:"C",e:"Kwashiorkor: severe protein deficiency. Oedema (pot belly), skin depigmentation, poor growth."},
  {id:"b062",s:"Biology",y:2011,t:"Nutrition",d:"Medium",q:"Which is NOT a function of the large intestine?",o:{"A":"Water absorption","B":"Mineral absorption","C":"Protein digestion","D":"Faeces formation"},a:"C",e:"Protein digestion is completed in the small intestine. Large intestine absorbs water and forms faeces."},
  {id:"b063",s:"Biology",y:2012,t:"Nutrition",d:"Easy",q:"Vitamin D deficiency causes",o:{"A":"Scurvy","B":"Rickets","C":"Pellagra","D":"Beri-beri"},a:"B",e:"Rickets: vitamin D deficiency → impaired Ca absorption → soft, weak bones in children."},
  {id:"b064",s:"Biology",y:2013,t:"Nutrition",d:"Medium",q:"Fats are emulsified by",o:{"A":"Lipase","B":"Bile salts","C":"Pepsin","D":"Trypsin"},a:"B",e:"Bile salts (not enzymes) emulsify large fat globules → tiny droplets, increasing lipase surface area."},
  {id:"b065",s:"Biology",y:2014,t:"Nutrition",d:"Easy",q:"Iron is essential for",o:{"A":"Bone formation","B":"Blood clotting","C":"Formation of haemoglobin","D":"Nerve function"},a:"C",e:"Iron is a core component of haem group in haemoglobin. Deficiency causes anaemia."},
  {id:"b066",s:"Biology",y:2015,t:"Nutrition",d:"Medium",q:"Trypsin is produced by the",o:{"A":"Stomach","B":"Liver","C":"Pancreas","D":"Salivary glands"},a:"C",e:"Trypsin (protease) is produced by the exocrine pancreas, secreted as inactive trypsinogen into duodenum."},
  {id:"b067",s:"Biology",y:2016,t:"Nutrition",d:"Hard",q:"Villi in the small intestine increase",o:{"A":"Intestine length","B":"Enzyme volume","C":"Surface area for absorption","D":"Peristalsis rate"},a:"C",e:"Villi and microvilli (brush border) provide enormous surface area for amino acid and glucose absorption."},
  {id:"b068",s:"Biology",y:2017,t:"Nutrition",d:"Hard",q:"Which nutrient yields the most energy per gram?",o:{"A":"Carbohydrates","B":"Proteins","C":"Fats","D":"Vitamins"},a:"C",e:"Fats ~37 kJ/g; carbohydrates ~16 kJ/g; proteins ~17 kJ/g. Fats are most energy-dense."},
  {id:"b069",s:"Biology",y:2018,t:"Nutrition",d:"Medium",q:"Enzyme that hydrolyses maltose to glucose is",o:{"A":"Amylase","B":"Maltase","C":"Sucrase","D":"Lactase"},a:"B",e:"Maltase (brush border) hydrolyses maltose → 2 glucose molecules."},
  {id:"b070",s:"Biology",y:2019,t:"Nutrition",d:"Hard",q:"Which process moves glucose from intestinal lumen to intestinal cells against concentration gradient?",o:{"A":"Simple diffusion","B":"Osmosis","C":"Sodium-glucose co-transport (active)","D":"Facilitated diffusion only"},a:"C",e:"SGLT1: Na+ moves down its gradient bringing glucose against its gradient — secondary active transport."},
  {id:"b071",s:"Biology",y:2020,t:"Transport",d:"Easy",q:"Pulmonary vein carries",o:{"A":"Deoxygenated blood from heart to lungs","B":"Oxygenated blood from lungs to left atrium","C":"Oxygenated blood to body","D":"Deoxygenated blood from body"},a:"B",e:"Pulmonary vein: oxygenated blood from lungs to left atrium. Only vein carrying oxygenated blood."},
  {id:"b072",s:"Biology",y:2021,t:"Transport",d:"Easy",q:"Liquid component of blood is",o:{"A":"Serum","B":"Plasma","C":"Lymph","D":"Cytoplasm"},a:"B",e:"Plasma (~55% blood volume): yellowish liquid carrying nutrients, hormones, antibodies, waste."},
  {id:"b073",s:"Biology",y:2022,t:"Transport",d:"Medium",q:"Arteries have thicker walls than veins because",o:{"A":"They carry deoxygenated blood","B":"They withstand higher pressure from the heart","C":"They have valves","D":"They are smaller"},a:"B",e:"Arteries receive blood at high pressure from ventricles. Thick muscular elastic walls absorb pressure surges."},
  {id:"b074",s:"Biology",y:2023,t:"Transport",d:"Hard",q:"SA node (pacemaker) is located in the",o:{"A":"Left ventricle","B":"Right atrium","C":"Left atrium","D":"Bundle of His"},a:"B",e:"SA node in right atrium wall generates electrical impulse initiating each heartbeat at ~72/min."},
  {id:"b075",s:"Biology",y:2024,t:"Transport",d:"Easy",q:"Transpiration is the",o:{"A":"Uptake of water by roots","B":"Water transport through xylem","C":"Loss of water vapour from aerial plant parts","D":"Absorption of minerals"},a:"C",e:"Transpiration: evaporation of water through stomata. Drives the transpiration stream."},
  {id:"b076",s:"Biology",y:2010,t:"Transport",d:"Hard",q:"Water rises up tall trees mainly due to",o:{"A":"Root pressure alone","B":"Transpiration pull and cohesion-tension mechanism","C":"Active transport","D":"Osmosis through phloem"},a:"B",e:"Cohesion-tension: transpiration creates negative pressure (tension); water cohesion pulls column up."},
  {id:"b077",s:"Biology",y:2011,t:"Transport",d:"Medium",q:"Phloem transports",o:{"A":"Water and minerals upward only","B":"Organic solutes bidirectionally","C":"Hormones downward only","D":"Oxygen from leaves"},a:"B",e:"Phloem transports sucrose from sources (leaves) to sinks (roots, fruits) in both directions."},
  {id:"b078",s:"Biology",y:2012,t:"Transport",d:"Medium",q:"Blood pressure is highest in",o:{"A":"Veins","B":"Capillaries","C":"Arteries","D":"Venules"},a:"C",e:"Arteries receive blood directly from ventricles at high pressure. Pressure decreases progressively."},
  {id:"b079",s:"Biology",y:2013,t:"Transport",d:"Easy",q:"Red blood cells are called",o:{"A":"Leucocytes","B":"Thrombocytes","C":"Erythrocytes","D":"Lymphocytes"},a:"C",e:"Erythrocytes: biconcave discs containing haemoglobin. No nucleus in mature form."},
  {id:"b080",s:"Biology",y:2014,t:"Transport",d:"Medium",q:"Heart valves prevent",o:{"A":"Blood from entering heart","B":"Backflow of blood","C":"Electrical impulses","D":"Oxygen entering blood"},a:"B",e:"Heart valves (tricuspid, bicuspid, semilunar) ensure one-way blood flow."},
  {id:"b081",s:"Biology",y:2015,t:"Respiration",d:"Hard",q:"Net ATP gain from glycolysis is",o:{"A":"38","B":"4","C":"2","D":"36"},a:"C",e:"Glycolysis: 4 ATP produced minus 2 ATP used = net 2 ATP."},
  {id:"b082",s:"Biology",y:2016,t:"Respiration",d:"Easy",q:"Products of complete aerobic respiration are",o:{"A":"Ethanol and CO2","B":"Lactic acid and water","C":"CO2, water, and ATP","D":"CO2 and ATP only"},a:"C",e:"Aerobic respiration: C6H12O6 + 6O2 → 6CO2 + 6H2O + ~38 ATP."},
  {id:"b083",s:"Biology",y:2017,t:"Respiration",d:"Medium",q:"Lactic acid fermentation occurs when",o:{"A":"Oxygen is in excess","B":"Oxygen supply is insufficient","C":"Temperature is very high","D":"Glucose is absent"},a:"B",e:"During intense exercise, insufficient O2 → pyruvate converted to lactic acid anaerobically."},
  {id:"b084",s:"Biology",y:2018,t:"Respiration",d:"Hard",q:"Krebs cycle occurs in the",o:{"A":"Cytoplasm","B":"Nucleus","C":"Mitochondrial matrix","D":"Thylakoid"},a:"C",e:"Krebs cycle in mitochondrial matrix oxidises acetyl-CoA, releasing CO2 and generating NADH, FADH2."},
  {id:"b085",s:"Biology",y:2019,t:"Respiration",d:"Hard",q:"Greatest ATP produced per glucose molecule is by",o:{"A":"Glycolysis","B":"Krebs cycle","C":"Oxidative phosphorylation","D":"Beta-oxidation"},a:"C",e:"Oxidative phosphorylation (ETC) produces ~32-34 ATP — majority of total 36-38 ATP per glucose."},
  {id:"b086",s:"Biology",y:2020,t:"Respiration",d:"Medium",q:"Anaerobic respiration in yeast produces",o:{"A":"Lactic acid","B":"Ethanol, CO2, and ATP","C":"CO2, water, ATP","D":"Only pyruvate"},a:"B",e:"Yeast fermentation: C6H12O6 → 2C2H5OH + 2CO2 + 2 ATP."},
  {id:"b087",s:"Biology",y:2021,t:"Excretion",d:"Easy",q:"Functional unit of the kidney is the",o:{"A":"Glomerulus","B":"Nephron","C":"Ureter","D":"Renal pelvis"},a:"B",e:"Nephron: complete structural and functional unit. ~1 million per kidney."},
  {id:"b088",s:"Biology",y:2022,t:"Excretion",d:"Hard",q:"Urea is formed by the",o:{"A":"Krebs cycle","B":"Ornithine (urea) cycle","C":"Glycolysis","D":"ETC"},a:"B",e:"Ornithine cycle in liver converts toxic ammonia → urea for kidney excretion."},
  {id:"b089",s:"Biology",y:2023,t:"Excretion",d:"Hard",q:"ADH increases water reabsorption in the",o:{"A":"Glomerulus","B":"Bowman's capsule","C":"Collecting duct","D":"Loop of Henle"},a:"C",e:"ADH inserts aquaporin channels in collecting duct → more water reabsorption → concentrated urine."},
  {id:"b090",s:"Biology",y:2024,t:"Excretion",d:"Medium",q:"Which is NOT a nitrogenous waste?",o:{"A":"Urea","B":"Uric acid","C":"Ammonia","D":"Carbon dioxide"},a:"D",e:"CO2 is from respiration, not nitrogen-containing. Urea, uric acid, ammonia all contain N."},
  {id:"b091",s:"Biology",y:2010,t:"Reproduction",d:"Easy",q:"Meiosis produces cells that are",o:{"A":"Diploid and identical","B":"Haploid and genetically varied","C":"Diploid and varied","D":"Haploid and identical"},a:"B",e:"Meiosis: 4 haploid cells, each genetically unique due to crossing over and independent assortment."},
  {id:"b092",s:"Biology",y:2011,t:"Reproduction",d:"Easy",q:"Female gamete in flowering plants is in the",o:{"A":"Anther","B":"Pollen grain","C":"Ovule","D":"Style"},a:"C",e:"Ovule contains the embryo sac housing the egg cell. After fertilisation → seed."},
  {id:"b093",s:"Biology",y:2012,t:"Reproduction",d:"Hard",q:"Double fertilisation is unique to",o:{"A":"Mosses","B":"Ferns","C":"Gymnosperms","D":"Angiosperms"},a:"D",e:"Angiosperms: one sperm + egg → zygote; second sperm + polar nuclei → endosperm."},
  {id:"b094",s:"Biology",y:2013,t:"Reproduction",d:"Easy",q:"Placenta functions to",o:{"A":"Produce eggs","B":"Exchange nutrients and waste between mother and foetus","C":"Store amniotic fluid","D":"Produce sperm"},a:"B",e:"Placenta: diffusion of O2, nutrients from mother; CO2, waste from foetus without blood mixing."},
  {id:"b095",s:"Biology",y:2014,t:"Reproduction",d:"Hard",q:"Hormone maintaining uterine lining during pregnancy is",o:{"A":"FSH","B":"LH","C":"Progesterone","D":"Oestrogen"},a:"C",e:"Progesterone (corpus luteum then placenta) maintains endometrium and prevents menstruation."},
  {id:"b096",s:"Biology",y:2015,t:"Nervous System",d:"Easy",q:"Basic unit of the nervous system is the",o:{"A":"Synapse","B":"Neuron","C":"Myelin sheath","D":"Dendrite"},a:"B",e:"Neuron: structural and functional unit of nervous system."},
  {id:"b097",s:"Biology",y:2016,t:"Nervous System",d:"Easy",q:"Which brain part controls balance and coordination?",o:{"A":"Cerebrum","B":"Medulla oblongata","C":"Hypothalamus","D":"Cerebellum"},a:"D",e:"Cerebellum: coordinates voluntary movements, maintains balance and posture."},
  {id:"b098",s:"Biology",y:2017,t:"Nervous System",d:"Easy",q:"A reflex action is",o:{"A":"Voluntary","B":"Rapid, automatic, involuntary response to stimulus","C":"Brain-controlled","D":"Learned"},a:"B",e:"Reflex arc: receptor → sensory neuron → relay neuron (spinal cord) → motor neuron → effector."},
  {id:"b099",s:"Biology",y:2018,t:"Nervous System",d:"Medium",q:"Myelin sheath functions to",o:{"A":"Produce neurotransmitters","B":"Insulate axons and speed impulse transmission","C":"Connect neurons","D":"Detect stimuli"},a:"B",e:"Myelin causes saltatory conduction (impulse jumps between nodes of Ranvier) — greatly increases speed."},
  {id:"b100",s:"Biology",y:2019,t:"Nervous System",d:"Medium",q:"Neurotransmitters are",o:{"A":"Electrical impulses","B":"Chemical messengers released at synapses","C":"Structural proteins","D":"Membrane depolarisers"},a:"B",e:"Neurotransmitters (acetylcholine, dopamine) released from presynaptic terminals bind postsynaptic receptors."},
  {id:"b101",s:"Biology",y:2020,t:"Evolution",d:"Easy",q:"Natural selection was proposed by",o:{"A":"Mendel","B":"Lamarck","C":"Darwin","D":"Pasteur"},a:"C",e:"Darwin (and Wallace) proposed natural selection in 1858/1859."},
  {id:"b102",s:"Biology",y:2021,t:"Evolution",d:"Medium",q:"Fossil records provide which evidence?",o:{"A":"Indirect","B":"Direct","C":"Circumstantial","D":"None"},a:"B",e:"Fossils: direct physical evidence of past organisms."},
  {id:"b103",s:"Biology",y:2022,t:"Evolution",d:"Hard",q:"Analogous structures have",o:{"A":"Same evolutionary origin","B":"Same function but different origins","C":"Found only in vertebrates","D":"Identical appearance"},a:"B",e:"Analogous structures perform similar functions but evolved independently — convergent evolution."},
  {id:"b104",s:"Biology",y:2023,t:"Evolution",d:"Medium",q:"Lamarck's theory rejected because",o:{"A":"Species change over time","B":"Acquired characteristics are not inherited","C":"Too early","D":"Agreed with Darwin"},a:"B",e:"Genetics disproves inheritance of acquired characteristics."},
  {id:"b105",s:"Biology",y:2024,t:"Evolution",d:"Medium",q:"Speciation is",o:{"A":"Extinction","B":"Formation of new species from existing populations","C":"Change within single population","D":"Migration"},a:"B",e:"Speciation: new species arise through reproductive isolation + divergent evolution."},
  {id:"b106",s:"Biology",y:2010,t:"Plant Biology",d:"Easy",q:"Guard cells control the opening of",o:{"A":"Root hair cells","B":"Stomata","C":"Lenticels","D":"Phloem tubes"},a:"B",e:"Guard cells regulate stomatal aperture. Turgid → open; flaccid → close."},
  {id:"b107",s:"Biology",y:2011,t:"Plant Biology",d:"Easy",q:"Xylem transports",o:{"A":"Organic solutes downward","B":"Water and mineral salts upward","C":"Hormones bidirectionally","D":"Oxygen from leaves"},a:"B",e:"Xylem: dead hollow vessels transporting water upward via transpiration stream."},
  {id:"b108",s:"Biology",y:2012,t:"Plant Biology",d:"Easy",q:"Overall equation for photosynthesis is",o:{"A":"C6H12O6 + 6O2 → 6CO2 + 6H2O","B":"6CO2 + 6H2O → C6H12O6 + 6O2","C":"C6H12O6 → 2C2H5OH + 2CO2","D":"2H2O → 4H + O2"},a:"B",e:"6CO2 + 6H2O + light energy → C6H12O6 + 6O2."},
  {id:"b109",s:"Biology",y:2013,t:"Plant Biology",d:"Hard",q:"Light reactions of photosynthesis occur in the",o:{"A":"Stroma","B":"Thylakoid membranes","C":"Mitochondria","D":"Cytoplasm"},a:"B",e:"Light reactions on thylakoid membranes: produce ATP, NADPH, O2 (from water photolysis)."},
  {id:"b110",s:"Biology",y:2014,t:"Plant Biology",d:"Easy",q:"Geotropism is response to",o:{"A":"Light","B":"Water","C":"Gravity","D":"Touch"},a:"C",e:"Geotropism: roots positive (toward gravity); shoots negative (away from gravity). Controlled by auxin."},
  {id:"b111",s:"Biology",y:2015,t:"Hormones",d:"Easy",q:"Insulin is produced by the",o:{"A":"Liver","B":"Adrenal gland","C":"Pancreatic beta cells","D":"Thyroid"},a:"C",e:"Beta cells of islets of Langerhans (pancreas) secrete insulin to lower blood glucose."},
  {id:"b112",s:"Biology",y:2016,t:"Hormones",d:"Medium",q:"Glucagon raises blood glucose by",o:{"A":"Promoting glucose uptake","B":"Stimulating glycogen breakdown in liver","C":"Inhibiting insulin","D":"Increasing food absorption"},a:"B",e:"Glucagon from pancreatic alpha cells stimulates hepatic glycogenolysis → glucose release."},
  {id:"b113",s:"Biology",y:2017,t:"Hormones",d:"Medium",q:"Adrenaline is produced by the",o:{"A":"Thyroid","B":"Anterior pituitary","C":"Adrenal medulla","D":"Pancreas"},a:"C",e:"Adrenal medulla secretes adrenaline (epinephrine) — fight-or-flight hormone."},
  {id:"b114",s:"Biology",y:2018,t:"Hormones",d:"Easy",q:"Thyroxine mainly controls",o:{"A":"Blood glucose","B":"Water balance","C":"Metabolic rate","D":"Blood calcium"},a:"C",e:"Thyroxine (T4/T3) from thyroid gland regulates basal metabolic rate, growth, development."},
  {id:"b115",s:"Biology",y:2019,t:"Hormones",d:"Easy",q:"Oestrogen stimulates",o:{"A":"Male secondary sexual characteristics","B":"Female secondary sexual characteristics","C":"Muscle growth","D":"Bone density in males"},a:"B",e:"Oestrogen from ovaries promotes breast development, hip widening, pubic hair at puberty."},
  {id:"b116",s:"Biology",y:2020,t:"Classification",d:"Medium",q:"Taxonomic order from largest to smallest is",o:{"A":"Kingdom Phylum Class Order Family Genus Species","B":"Species Genus Family Order Class Phylum Kingdom","C":"Kingdom Class Phylum Order Family Genus Species","D":"Phylum Kingdom Class Family Order Genus Species"},a:"A",e:"King Philip Came Over For Good Spaghetti."},
  {id:"b117",s:"Biology",y:2021,t:"Classification",d:"Easy",q:"Fungi differ from plants because fungi",o:{"A":"Have cell walls","B":"Cannot photosynthesise","C":"Are eukaryotic","D":"Reproduce by spores"},a:"B",e:"Fungi are heterotrophic absorbers. Cell walls contain chitin, not cellulose."},
  {id:"b118",s:"Biology",y:2022,t:"Classification",d:"Easy",q:"Which is NOT a mammal characteristic?",o:{"A":"Warm-blooded","B":"Suckle young with milk","C":"Have scales","D":"Have a diaphragm"},a:"C",e:"Scales are features of reptiles and fish. Mammals have hair/fur."},
  {id:"b119",s:"Biology",y:2023,t:"Classification",d:"Medium",q:"Viruses are not classified as living because they",o:{"A":"Are very small","B":"Cannot replicate outside a host cell","C":"Are made of nucleic acid","D":"Cause disease"},a:"B",e:"Viruses cannot perform any life processes independently — only replicate inside host cells."},
  {id:"b120",s:"Biology",y:2024,t:"Classification",d:"Easy",q:"Binomial nomenclature was introduced by",o:{"A":"Darwin","B":"Mendel","C":"Linnaeus","D":"Pasteur"},a:"C",e:"Linnaeus (1758): two-part Latin naming system — Genus + species (e.g., Homo sapiens)."},
  {id:"b121",s:"Biology",y:2010,t:"Cell Division",d:"Medium",q:"In mitosis, chromatids are pulled to opposite poles during",o:{"A":"Prophase","B":"Metaphase","C":"Anaphase","D":"Telophase"},a:"C",e:"Anaphase: centromeres split, spindle fibres pull sister chromatids to opposite poles."},
  {id:"b122",s:"Biology",y:2011,t:"Cell Division",d:"Hard",q:"Crossing over increases variation by",o:{"A":"Duplicating chromosomes","B":"Exchanging segments between non-sister chromatids","C":"Increasing chromosome number","D":"Reducing genes"},a:"B",e:"Crossing over at chiasmata (Prophase I) creates new allele combinations on chromosomes."},
  {id:"b123",s:"Biology",y:2012,t:"Cell Division",d:"Easy",q:"Human somatic cell chromosome number is",o:{"A":"23","B":"46","C":"48","D":"22"},a:"B",e:"46 chromosomes (23 pairs) in diploid human somatic cells. Gametes: 23 (haploid)."},
  {id:"b124",s:"Biology",y:2013,t:"Cell Division",d:"Medium",q:"Mitosis is important for",o:{"A":"Gamete production","B":"Growth, repair, and asexual reproduction","C":"Genetic variation","D":"Reducing chromosome number"},a:"B",e:"Mitosis produces genetically identical diploid cells for growth, repair, and replacement."},
  {id:"b125",s:"Biology",y:2014,t:"Cell Division",d:"Hard",q:"Non-disjunction leads to",o:{"A":"Normal gametes","B":"Gametes with abnormal chromosome numbers","C":"Identical twins","D":"Increased recombination"},a:"B",e:"Non-disjunction: chromosomes fail to separate → gametes with n+1 or n-1 chromosomes → aneuploidy."},

  // Physics Questions (p001-p125)
  {id:"p001",s:"Physics",y:2010,t:"Mechanics",d:"Easy",q:"A body with uniform velocity has",o:{"A":"Zero acceleration","B":"Constant acceleration","C":"Increasing speed","D":"Decreasing momentum"},a:"A",e:"Uniform velocity means constant speed and direction. No change in velocity → zero acceleration."},
  {id:"p002",s:"Physics",y:2011,t:"Waves",d:"Medium",q:"Wave frequency 50 Hz, wavelength 4 m. Speed is",o:{"A":"12.5 m/s","B":"54 m/s","C":"200 m/s","D":"46 m/s"},a:"C",e:"v = fλ = 50 × 4 = 200 m/s."},
  {id:"p003",s:"Physics",y:2012,t:"Electricity",d:"Hard",q:"Three 6-ohm resistors in parallel. Equivalent resistance is",o:{"A":"18 Ω","B":"6 Ω","C":"3 Ω","D":"2 Ω"},a:"D",e:"1/R = 1/6 + 1/6 + 1/6 = 3/6 = 1/2 → R = 2 Ω."},
  {id:"p004",s:"Physics",y:2013,t:"Optics",d:"Medium",q:"The sky appears blue because of",o:{"A":"Reflection","B":"Refraction","C":"Rayleigh scattering","D":"Diffraction"},a:"C",e:"Blue light (shorter wavelength) is scattered more by atmospheric particles — sky appears blue."},
  {id:"p005",s:"Physics",y:2014,t:"Thermodynamics",d:"Medium",q:"Heat cannot spontaneously flow from cold to hot. This is the",o:{"A":"Zeroth law","B":"First law","C":"Second law","D":"Third law"},a:"C",e:"Second Law of Thermodynamics. Heat flows spontaneously only from hot to cold."},
  {id:"p006",s:"Physics",y:2015,t:"Mechanics",d:"Medium",q:"A 5 kg body acted on by 20 N. Acceleration is",o:{"A":"0.25 m/s²","B":"4 m/s²","C":"100 m/s²","D":"2.5 m/s²"},a:"B",e:"F = ma → a = 20/5 = 4 m/s²."},
  {id:"p007",s:"Physics",y:2016,t:"Waves",d:"Easy",q:"Sound cannot travel through",o:{"A":"Water","B":"Steel","C":"A vacuum","D":"Air"},a:"C",e:"Sound is a mechanical wave requiring particles to vibrate. No particles in vacuum → cannot propagate."},
  {id:"p008",s:"Physics",y:2017,t:"Electricity",d:"Hard",q:"Resistors 2 Ω, 3 Ω, 6 Ω in parallel. Equivalent resistance is",o:{"A":"11 Ω","B":"3 Ω","C":"1 Ω","D":"0.5 Ω"},a:"C",e:"1/R = 1/2 + 1/3 + 1/6 = 6/6 = 1 → R = 1 Ω."},
  {id:"p009",s:"Physics",y:2018,t:"Optics",d:"Medium",q:"Concave mirror f=10 cm, object at 30 cm. Image distance is",o:{"A":"15 cm in front","B":"15 cm behind","C":"20 cm in front","D":"60 cm in front"},a:"A",e:"1/10 = 1/v + 1/30 → 1/v = 2/30 → v = 15 cm (real image in front)."},
  {id:"p010",s:"Physics",y:2019,t:"Thermodynamics",d:"Medium",q:"Which is NOT an assumption of kinetic theory of ideal gases?",o:{"A":"Molecules have negligible volume","B":"Collisions are elastic","C":"Molecules attract each other","D":"Molecules move randomly"},a:"C",e:"Ideal gas assumes NO intermolecular forces between molecules."},
  {id:"p011",s:"Physics",y:2020,t:"Nuclear Physics",d:"Hard",q:"U-238 undergoes alpha decay. Daughter nucleus is",o:{"A":"234-90-Th","B":"234-92-U","C":"238-90-Th","D":"236-91-Pa"},a:"A",e:"Alpha decay: A decreases by 4, Z by 2. 238-4=234, 92-2=90 → Thorium-234."},
  {id:"p012",s:"Physics",y:2021,t:"Mechanics",d:"Easy",q:"Ball dropped from 20 m (g=10). Time to reach ground is",o:{"A":"1 s","B":"2 s","C":"4 s","D":"√2 s"},a:"B",e:"h = ½gt² → 20 = 5t² → t² = 4 → t = 2 s."},
  {id:"p013",s:"Physics",y:2022,t:"Electricity",d:"Easy",q:"One ohm equals",o:{"A":"1 V/A","B":"1 A/V","C":"1 W/A","D":"1 VA"},a:"A",e:"R = V/I → 1 Ω = 1 V/A."},
  {id:"p014",s:"Physics",y:2023,t:"Waves",d:"Medium",q:"Distance between two consecutive troughs is the",o:{"A":"Amplitude","B":"Wavelength","C":"Frequency","D":"Period"},a:"B",e:"Wavelength = distance between adjacent points in phase (trough to trough, crest to crest)."},
  {id:"p015",s:"Physics",y:2024,t:"Mechanics",d:"Hard",q:"Stone thrown up at 20 m/s (g=10). Max height is",o:{"A":"10 m","B":"20 m","C":"40 m","D":"80 m"},a:"B",e:"v² = u² - 2gh: 0 = 400 - 20h → h = 20 m."},
  {id:"p016",s:"Physics",y:2010,t:"Magnetism",d:"Medium",q:"SI unit of magnetic flux density is the",o:{"A":"Weber","B":"Tesla","C":"Henry","D":"Farad"},a:"B",e:"Magnetic flux density B measured in Tesla (T). 1 T = 1 Wb/m²."},
  {id:"p017",s:"Physics",y:2011,t:"Optics",d:"Easy",q:"Convex lens corrects",o:{"A":"Myopia","B":"Hypermetropia","C":"Astigmatism","D":"Colour blindness"},a:"B",e:"Hypermetropia: eyeball too short. Convex lens converges rays onto retina."},
  {id:"p018",s:"Physics",y:2012,t:"Electricity",d:"Medium",q:"Energy of 60 W bulb in 2 hours is",o:{"A":"30 J","B":"120 J","C":"432000 J","D":"720 J"},a:"C",e:"E = Pt = 60 × 7200 = 432000 J."},
  {id:"p019",s:"Physics",y:2013,t:"Mechanics",d:"Hard",q:"Mass 2 kg, radius 3 m, speed 4 m/s. Centripetal force is",o:{"A":"8 N","B":"10.67 N","C":"32 N","D":"96 N"},a:"B",e:"F = mv²/r = 2×16/3 = 10.67 N."},
  {id:"p020",s:"Physics",y:2014,t:"Thermodynamics",d:"Medium",q:"At absolute zero, molecular motion is",o:{"A":"Maximum","B":"Virtually zero","C":"Unchanged","D":"Vigorous"},a:"B",e:"At 0 K, molecular kinetic energy is at theoretical minimum."},
  {id:"p021",s:"Physics",y:2015,t:"Nuclear Physics",d:"Medium",q:"Greatest penetrating power is possessed by",o:{"A":"Alpha","B":"Beta","C":"Gamma rays","D":"Neutrons"},a:"C",e:"Gamma rays: high-energy EM radiation, penetrate centimetres of lead."},
  {id:"p022",s:"Physics",y:2016,t:"Mechanics",d:"Medium",q:"Moment of a force depends on",o:{"A":"Force only","B":"Distance only","C":"Both force and perpendicular distance","D":"Mass"},a:"C",e:"Torque = Force × perpendicular distance from pivot."},
  {id:"p023",s:"Physics",y:2017,t:"Optics",d:"Hard",q:"Glass n=1.5 to air. Critical angle is approximately",o:{"A":"30°","B":"42°","C":"48°","D":"62°"},a:"B",e:"sin c = 1/1.5 = 0.667 → c ≈ 42°."},
  {id:"p024",s:"Physics",y:2018,t:"Electricity",d:"Medium",q:"Charge 4 C in 2 s. Current is",o:{"A":"0.5 A","B":"2 A","C":"6 A","D":"8 A"},a:"B",e:"I = Q/t = 4/2 = 2 A."},
  {id:"p025",s:"Physics",y:2019,t:"Mechanics",d:"Medium",q:"Object weighing 400 N (g=10). Mass is",o:{"A":"4 kg","B":"40 kg","C":"400 kg","D":"4000 kg"},a:"B",e:"W = mg → m = 400/10 = 40 kg."},
  {id:"p026",s:"Physics",y:2020,t:"Waves",d:"Medium",q:"Diffraction is most pronounced when wavelength is",o:{"A":"Much larger than gap","B":"Much smaller than gap","C":"Comparable to gap size","D":"Zero"},a:"C",e:"Diffraction maximum when λ ≈ gap size."},
  {id:"p027",s:"Physics",y:2021,t:"Thermodynamics",d:"Easy",q:"Best conductor of heat is",o:{"A":"Glass","B":"Wood","C":"Copper","D":"Rubber"},a:"C",e:"Copper has free electrons that efficiently transfer thermal energy."},
  {id:"p028",s:"Physics",y:2022,t:"Nuclear Physics",d:"Hard",q:"Half-life 4 years. Fraction remaining after 12 years is",o:{"A":"1/2","B":"1/4","C":"1/8","D":"1/16"},a:"C",e:"3 half-lives: (1/2)³ = 1/8."},
  {id:"p029",s:"Physics",y:2023,t:"Mechanics",d:"Medium",q:"Conservation of momentum holds when",o:{"A":"Only elastic collisions","B":"No net external force acts","C":"Objects move in straight lines","D":"Temperature is constant"},a:"B",e:"Total momentum of closed system constant if no net external force."},
  {id:"p030",s:"Physics",y:2024,t:"Electricity",d:"Hard",q:"Transformer turns ratio Ns:Np = 1:10, Vp=240 V. Vs is",o:{"A":"2400 V","B":"24 V","C":"240 V","D":"0.24 V"},a:"B",e:"Vs = Vp × Ns/Np = 240 × 1/10 = 24 V."},
  {id:"p031",s:"Physics",y:2010,t:"Optics",d:"Medium",q:"Highest frequency visible light is",o:{"A":"Red","B":"Orange","C":"Yellow","D":"Violet"},a:"D",e:"Violet has shortest wavelength (~400 nm) and highest frequency in visible spectrum."},
  {id:"p032",s:"Physics",y:2011,t:"Mechanics",d:"Hard",q:"10 kg block, frictionless 30° incline, F=60 N up slope (g=10). Acceleration is",o:{"A":"1 m/s²","B":"6 m/s²","C":"11 m/s²","D":"16 m/s²"},a:"A",e:"Net force = 60 - mg sin30° = 60-50 = 10 N. a = 10/10 = 1 m/s²."},
  {id:"p033",s:"Physics",y:2012,t:"Magnetism",d:"Medium",q:"Fleming's left-hand rule gives direction of",o:{"A":"Induced EMF","B":"Force on current-carrying conductor in magnetic field","C":"Magnetic pole","D":"Electron flow"},a:"B",e:"Motor rule: thumb=force, index=field, middle=conventional current."},
  {id:"p034",s:"Physics",y:2013,t:"Electricity",d:"Easy",q:"Voltmeter is connected",o:{"A":"In series","B":"In parallel","C":"Either way","D":"Across battery only"},a:"B",e:"Voltmeter in parallel. Must have very HIGH resistance."},
  {id:"p035",s:"Physics",y:2014,t:"Waves",d:"Medium",q:"Bending of waves around obstacles is called",o:{"A":"Reflection","B":"Refraction","C":"Diffraction","D":"Dispersion"},a:"C",e:"Diffraction: waves spread out when passing through opening or around obstacle."},
  {id:"p036",s:"Physics",y:2015,t:"Thermodynamics",d:"Medium",q:"Gas compressed isothermally. Pressure",o:{"A":"Decreases","B":"Increases","C":"Stays constant","D":"Becomes zero"},a:"B",e:"Boyle's Law: PV = constant. If V decreases, P increases."},
  {id:"p037",s:"Physics",y:2016,t:"Nuclear Physics",d:"Easy",q:"Alpha particle consists of",o:{"A":"2 protons and 2 neutrons","B":"1 proton and 1 neutron","C":"2 protons and 1 neutron","D":"2 electrons"},a:"A",e:"Alpha particle = helium-4 nucleus: 2 protons + 2 neutrons."},
  {id:"p038",s:"Physics",y:2017,t:"Mechanics",d:"Medium",q:"Rate of change of displacement is",o:{"A":"Speed","B":"Acceleration","C":"Velocity","D":"Momentum"},a:"C",e:"Velocity = Δdisplacement/Δtime (vector). Speed = distance/time (scalar)."},
  {id:"p039",s:"Physics",y:2018,t:"Electricity",d:"Hard",q:"Power in 4 Ω resistor with 3 A current is",o:{"A":"12 W","B":"36 W","C":"0.75 W","D":"48 W"},a:"B",e:"P = I²R = 9 × 4 = 36 W."},
  {id:"p040",s:"Physics",y:2019,t:"Optics",d:"Medium",q:"Total internal reflection requires light from",o:{"A":"Less dense to more dense","B":"More dense to less dense above critical angle","C":"Air into glass","D":"Any medium"},a:"B",e:"TIR: light in denser medium hits boundary with less dense medium at angle > critical angle."},
  {id:"p041",s:"Physics",y:2020,t:"Mechanics",d:"Medium",q:"Work done equals",o:{"A":"Mass × velocity","B":"Force × distance in direction of force","C":"Mass × acceleration","D":"Energy / time"},a:"B",e:"W = Fd cosθ. Unit: Joule."},
  {id:"p042",s:"Physics",y:2021,t:"Mechanics",d:"Easy",q:"SI unit of force is the",o:{"A":"Watt","B":"Joule","C":"Newton","D":"Pascal"},a:"C",e:"Force measured in Newtons. 1 N = 1 kg·m/s²."},
  {id:"p043",s:"Physics",y:2022,t:"Mechanics",d:"Medium",q:"Newton's First Law: body at rest stays at rest unless",o:{"A":"Gravity alone","B":"Net external force acts","C":"Friction","D":"Air resistance"},a:"B",e:"Law of Inertia: body remains at rest or in uniform motion unless net external force acts."},
  {id:"p044",s:"Physics",y:2023,t:"Thermodynamics",d:"Medium",q:"Specific heat capacity is heat to raise",o:{"A":"1 kg by 1 K","B":"1 g by 100 K","C":"Any mass by any temp","D":"1 mol by 1 K"},a:"A",e:"Q = mcΔT. Unit: J/(kg·K)."},
  {id:"p045",s:"Physics",y:2024,t:"Electricity",d:"Medium",q:"Ohm's Law states (constant temperature)",o:{"A":"V = I + R","B":"V = IR","C":"I = VR","D":"R = V + I"},a:"B",e:"V = IR (voltage = current × resistance)."},
  {id:"p046",s:"Physics",y:2010,t:"Mechanics",d:"Hard",q:"Car 1000 kg, 0 to 20 m/s in 10 s. Net force is",o:{"A":"100 N","B":"2000 N","C":"200 N","D":"1000 N"},a:"B",e:"a = 2 m/s². F = 1000 × 2 = 2000 N."},
  {id:"p047",s:"Physics",y:2011,t:"Waves",d:"Medium",q:"Speed of light in vacuum is approximately",o:{"A":"3×10⁶ m/s","B":"3×10⁸ m/s","C":"3×10¹⁰ m/s","D":"3×10⁴ m/s"},a:"B",e:"c ≈ 3×10⁸ m/s."},
  {id:"p048",s:"Physics",y:2012,t:"Optics",d:"Easy",q:"When light passes from air into glass it",o:{"A":"Speeds up","B":"Slows down and bends toward normal","C":"Changes colour","D":"Is absorbed"},a:"B",e:"Glass denser than air. Light slows and refracts toward normal."},
  {id:"p049",s:"Physics",y:2013,t:"Electricity",d:"Medium",q:"12 V battery, 4 Ω resistor. Current is",o:{"A":"48 A","B":"3 A","C":"0.33 A","D":"16 A"},a:"B",e:"I = V/R = 12/4 = 3 A."},
  {id:"p050",s:"Physics",y:2014,t:"Nuclear Physics",d:"Medium",q:"Beta-minus decay emits",o:{"A":"Helium nucleus","B":"Electron and antineutrino","C":"Positron","D":"Gamma ray"},a:"B",e:"β⁻: neutron → proton + electron + antineutrino. A unchanged, Z increases by 1."},
  {id:"p051",s:"Physics",y:2015,t:"Mechanics",d:"Medium",q:"Kinetic energy formula is",o:{"A":"mv","B":"mv²","C":"½mv²","D":"2mv²"},a:"C",e:"KE = ½mv²."},
  {id:"p052",s:"Physics",y:2016,t:"Mechanics",d:"Medium",q:"Gravitational potential energy formula is",o:{"A":"½mv²","B":"mgh","C":"mv","D":"Fd"},a:"B",e:"GPE = mgh."},
  {id:"p053",s:"Physics",y:2017,t:"Thermodynamics",d:"Hard",q:"Ideal gas at constant volume: pressure is proportional to",o:{"A":"1/Temperature","B":"Temperature (Kelvin)","C":"Volume","D":"1/Volume"},a:"B",e:"Gay-Lussac: P/T = constant → P ∝ T (absolute)."},
  {id:"p054",s:"Physics",y:2018,t:"Waves",d:"Hard",q:"Superposition principle states resultant displacement equals",o:{"A":"Larger displacement","B":"Algebraic sum of individual displacements","C":"Zero always","D":"Average"},a:"B",e:"When waves meet, resultant = algebraic sum of individual displacements."},
  {id:"p055",s:"Physics",y:2019,t:"Magnetism",d:"Medium",q:"Electromagnet is made by",o:{"A":"Heating iron bar","B":"Passing current through solenoid around iron core","C":"Stroking iron with magnet","D":"Cooling permanent magnet"},a:"B",e:"Current through solenoid → magnetic field; iron core concentrates it."},
  {id:"p056",s:"Physics",y:2020,t:"Mechanics",d:"Easy",q:"Pressure is",o:{"A":"Force × Area","B":"Force ÷ Area","C":"Mass ÷ Volume","D":"Weight × Height"},a:"B",e:"P = F/A. Unit: Pascal = N/m²."},
  {id:"p057",s:"Physics",y:2021,t:"Optics",d:"Medium",q:"Concave (diverging) lens has a _____ focal length",o:{"A":"Positive","B":"Negative","C":"Zero","D":"Infinite"},a:"B",e:"Diverging lenses have negative focal length by convention."},
  {id:"p058",s:"Physics",y:2022,t:"Nuclear Physics",d:"Hard",q:"Nuclear fission involves",o:{"A":"Combining small nuclei","B":"Splitting heavy nucleus releasing energy","C":"Proton converting to neutron","D":"Electron emission"},a:"B",e:"Fission: heavy nucleus (e.g. U-235) splits → smaller nuclei + energy (E=mc²)."},
  {id:"p059",s:"Physics",y:2023,t:"Electricity",d:"Hard",q:"Filament bulb is non-ohmic because",o:{"A":"It follows Ohm's Law","B":"Resistance increases with temperature making V-I graph non-linear","C":"It has zero resistance","D":"It conducts one direction"},a:"B",e:"As filament heats, resistance increases → non-linear V-I graph → non-ohmic."},
  {id:"p060",s:"Physics",y:2024,t:"Mechanics",d:"Medium",q:"Impulse equals",o:{"A":"Mass × velocity","B":"Force × time = change in momentum","C":"Work done","D":"Kinetic energy"},a:"B",e:"Impulse = Ft = Δ(mv). Unit: N·s."},
  {id:"p061",s:"Physics",y:2010,t:"Waves",d:"Medium",q:"Which is a longitudinal wave?",o:{"A":"Light","B":"Sound","C":"Radio waves","D":"Water ripples"},a:"B",e:"Longitudinal: particles vibrate parallel to propagation. Sound in air is longitudinal."},
  {id:"p062",s:"Physics",y:2011,t:"Thermodynamics",d:"Medium",q:"Heat transfer through vacuum occurs by",o:{"A":"Conduction","B":"Convection","C":"Radiation","D":"Evaporation"},a:"C",e:"Radiation: EM waves (infrared). Does not require medium — travels through vacuum."},
  {id:"p063",s:"Physics",y:2012,t:"Electricity",d:"Medium",q:"Ammeter is connected",o:{"A":"In parallel","B":"In series","C":"Either way","D":"Across battery"},a:"B",e:"Ammeter in series. Must have very LOW resistance."},
  {id:"p064",s:"Physics",y:2013,t:"Mechanics",d:"Easy",q:"Velocity is a",o:{"A":"Scalar","B":"Vector","C":"Base unit","D":"Derived unit"},a:"B",e:"Velocity: vector (magnitude + direction). Speed: scalar."},
  {id:"p065",s:"Physics",y:2014,t:"Optics",d:"Medium",q:"Splitting of white light by prism is called",o:{"A":"Reflection","B":"Total internal reflection","C":"Dispersion","D":"Diffraction"},a:"C",e:"Dispersion: different wavelengths refract at different angles → spectrum."},
  {id:"p066",s:"Physics",y:2015,t:"Magnetism",d:"Easy",q:"Like poles of magnets",o:{"A":"Attract","B":"Repel","C":"Have no effect","D":"Create current"},a:"B",e:"Like poles (N-N, S-S) repel. Unlike poles (N-S) attract."},
  {id:"p067",s:"Physics",y:2016,t:"Electricity",d:"Hard",q:"10 Ω and 5 Ω in series, 30 V supply. Voltage across 10 Ω is",o:{"A":"10 V","B":"20 V","C":"15 V","D":"30 V"},a:"B",e:"I = 30/15 = 2 A. V = 2 × 10 = 20 V."},
  {id:"p068",s:"Physics",y:2017,t:"Mechanics",d:"Medium",q:"At maximum height of projectile, vertical velocity is",o:{"A":"Maximum","B":"Zero","C":"Equal to initial","D":"Equal to g"},a:"B",e:"At maximum height, vertical component of velocity = 0."},
  {id:"p069",s:"Physics",y:2018,t:"Thermodynamics",d:"Hard",q:"Theoretically gas occupies zero volume at",o:{"A":"0°C","B":"-100°C","C":"-273.15°C (0 K)","D":"+273.15°C"},a:"C",e:"Absolute zero = -273.15°C = 0 K defines the Kelvin temperature scale."},
  {id:"p070",s:"Physics",y:2019,t:"Nuclear Physics",d:"Medium",q:"Nuclear fusion involves",o:{"A":"Splitting heavy nuclei","B":"Combining light nuclei with energy release","C":"Radioactive decay","D":"Electron emission"},a:"B",e:"Fusion: light nuclei combine → heavier nucleus + energy. Powers the sun."},
  {id:"p071",s:"Physics",y:2020,t:"Waves",d:"Medium",q:"Resonance occurs when",o:{"A":"Wave is reflected","B":"Object driven at its natural frequency → maximum amplitude","C":"Waves cancel","D":"Wave absorbed"},a:"B",e:"Resonance: driving frequency matches natural frequency → maximum amplitude."},
  {id:"p072",s:"Physics",y:2021,t:"Electricity",d:"Medium",q:"A capacitor stores",o:{"A":"Charge and electrical potential energy","B":"Current","C":"Magnetic energy","D":"Gravitational energy"},a:"A",e:"Capacitor: stores charge on plates and electric potential energy in field between them."},
  {id:"p073",s:"Physics",y:2022,t:"Mechanics",d:"Hard",q:"Perfectly elastic collision conserves",o:{"A":"Momentum only","B":"Both momentum and kinetic energy","C":"KE only","D":"Neither"},a:"B",e:"Elastic collision: both momentum AND kinetic energy conserved."},
  {id:"p074",s:"Physics",y:2023,t:"Optics",d:"Hard",q:"Interference patterns require two sources to be",o:{"A":"Far apart","B":"Coherent (same frequency, constant phase difference)","C":"Different wavelengths","D":"Moving"},a:"B",e:"Coherence required for stable interference. Laser light is coherent."},
  {id:"p075",s:"Physics",y:2024,t:"Mechanics",d:"Medium",q:"Conservation of energy states energy",o:{"A":"Can be created","B":"Cannot be created or destroyed, only transformed","C":"Is always kinetic","D":"Equals KE always"},a:"B",e:"Energy cannot be created or destroyed — only converted between forms."},
  {id:"p076",s:"Physics",y:2010,t:"Waves",d:"Easy",q:"Amplitude of a wave is the",o:{"A":"Distance between crests","B":"Waves per second","C":"Maximum displacement from equilibrium","D":"Wave speed"},a:"C",e:"Amplitude = maximum displacement of particle from equilibrium position."},
  {id:"p077",s:"Physics",y:2011,t:"Electricity",d:"Easy",q:"Electric current is",o:{"A":"Flow of voltage","B":"Rate of flow of charge (Q/t)","C":"Resistance per time","D":"Power per area"},a:"B",e:"I = Q/t. Unit: Ampere = Coulombs per second."},
  {id:"p078",s:"Physics",y:2012,t:"Mechanics",d:"Hard",q:"Escape velocity from Earth (g=10, R=6.4×10⁶ m) is approximately",o:{"A":"8 km/s","B":"11.2 km/s","C":"16 km/s","D":"3 km/s"},a:"B",e:"v = √(2gR) = √(1.28×10⁸) ≈ 11,314 m/s ≈ 11.3 km/s."},
  {id:"p079",s:"Physics",y:2013,t:"Optics",d:"Easy",q:"Plane mirror produces image that is",o:{"A":"Real, inverted, same size","B":"Virtual, upright, same size","C":"Real, upright, enlarged","D":"Virtual, inverted, smaller"},a:"B",e:"Plane mirror: virtual, upright, same size, same distance behind mirror as object in front."},
  {id:"p080",s:"Physics",y:2014,t:"Thermodynamics",d:"Medium",q:"Specific latent heat of fusion is heat to",o:{"A":"Vaporise unit mass","B":"Melt unit mass at constant temperature","C":"Raise 1 kg by 1 K","D":"Cool gas to liquid"},a:"B",e:"Q = mL. Heat absorbed melting solid → liquid with no temperature change."},
  {id:"p081",s:"Physics",y:2015,t:"Nuclear Physics",d:"Easy",q:"Alpha emission decreases mass number by",o:{"A":"1","B":"2","C":"4","D":"8"},a:"C",e:"Alpha particle = ⁴He: mass number decreases by 4, atomic number by 2."},
  {id:"p082",s:"Physics",y:2016,t:"Waves",d:"Hard",q:"Nodes in standing wave are points of",o:{"A":"Maximum vibration","B":"Zero displacement at all times","C":"Maximum wavelength","D":"Maximum amplitude"},a:"B",e:"Nodes: zero displacement always. Antinodes: maximum amplitude."},
  {id:"p083",s:"Physics",y:2017,t:"Mechanics",d:"Hard",q:"Satellite in circular orbit is maintained by",o:{"A":"Zero gravity","B":"Gravity providing centripetal force","C":"No force","D":"Maximum weight"},a:"B",e:"Gravity = centripetal force keeping satellite in orbit. Satellite is in free fall."},
  {id:"p084",s:"Physics",y:2018,t:"Electricity",d:"Medium",q:"Highest resistance wire is",o:{"A":"Thick copper","B":"Thin copper","C":"Thick nichrome","D":"Thin nichrome"},a:"D",e:"R = ρL/A. Thin wire: small A. Nichrome: high resistivity. Thin nichrome = highest R."},
  {id:"p085",s:"Physics",y:2019,t:"Thermodynamics",d:"Medium",q:"Evaporation cools because",o:{"A":"Warm air rises","B":"Most energetic molecules escape, lowering average KE","C":"Water absorbs heat","D":"Convection forms"},a:"B",e:"Molecules with above-average KE escape → average KE of remaining liquid falls → cooling."},
  {id:"p086",s:"Physics",y:2020,t:"Optics",d:"Medium",q:"Myopia is corrected by",o:{"A":"Convex lens","B":"Concave (diverging) lens","C":"Bifocal only","D":"Cylindrical lens"},a:"B",e:"Myopia: eyeball too long. Concave lens diverges rays before entering eye."},
  {id:"p087",s:"Physics",y:2021,t:"Mechanics",d:"Medium",q:"Force 100 N on area 2 m². Pressure is",o:{"A":"200 Pa","B":"50 Pa","C":"102 Pa","D":"98 Pa"},a:"B",e:"P = F/A = 100/2 = 50 Pa."},
  {id:"p088",s:"Physics",y:2022,t:"Magnetism",d:"Hard",q:"Faraday's law: induced EMF is proportional to",o:{"A":"Strength of magnet","B":"Rate of change of magnetic flux","C":"Resistance","D":"Length of conductor"},a:"B",e:"EMF = -dΦ/dt. Faster flux change → greater induced EMF."},
  {id:"p089",s:"Physics",y:2023,t:"Electricity",d:"Medium",q:"In parallel circuit, all components share the same",o:{"A":"Current","B":"Resistance","C":"Potential difference","D":"Power"},a:"C",e:"Parallel: all components connected between same two nodes → same voltage."},
  {id:"p090",s:"Physics",y:2024,t:"Waves",d:"Medium",q:"Doppler effect explains why approaching sound source seems",o:{"A":"Quieter","B":"Higher pitch","C":"Lower pitch","D":"Slower"},a:"B",e:"Approaching: wavefronts compressed → higher frequency → higher pitch."},
  {id:"p091",s:"Physics",y:2010,t:"Mechanics",d:"Medium",q:"Body in translational equilibrium when",o:{"A":"At rest only","B":"Net force = zero","C":"Net torque = zero","D":"Moving at any speed"},a:"B",e:"Translational equilibrium: ΣF = 0. Body at rest or uniform linear motion."},
  {id:"p092",s:"Physics",y:2011,t:"Thermodynamics",d:"Hard",q:"Triple point of water is at",o:{"A":"100°C, 1 atm","B":"0°C, 1 atm","C":"273.16 K, 611.7 Pa","D":"373.15 K, 1 atm"},a:"C",e:"Triple point: all three phases coexist at 273.16 K, 611.7 Pa."},
  {id:"p093",s:"Physics",y:2012,t:"Electricity",d:"Hard",q:"Eddy currents in transformer cores reduced by",o:{"A":"More turns","B":"Laminated core","C":"Higher frequency","D":"Reducing load"},a:"B",e:"Lamination: thin insulated sheets restrict eddy current paths → less heat loss."},
  {id:"p094",s:"Physics",y:2013,t:"Nuclear Physics",d:"Hard",q:"Binding energy per nucleon greatest for",o:{"A":"Hydrogen","B":"Uranium","C":"Iron-56","D":"Carbon-12"},a:"C",e:"Iron-56 is most stable nucleus (~8.8 MeV/nucleon). Fission and fusion release energy moving toward iron."},
  {id:"p095",s:"Physics",y:2014,t:"Mechanics",d:"Medium",q:"Machine: VR=5, efficiency=80%. Mechanical advantage is",o:{"A":"4","B":"5","C":"6.25","D":"1"},a:"A",e:"Efficiency = MA/VR × 100. 80 = MA/5 × 100 → MA = 4."},
  {id:"p096",s:"Physics",y:2015,t:"Waves",d:"Medium",q:"Polarisation can only occur in",o:{"A":"Longitudinal waves","B":"Transverse waves","C":"Both","D":"Sound waves"},a:"B",e:"Polarisation restricts oscillation to one plane — only possible for transverse waves."},
  {id:"p097",s:"Physics",y:2016,t:"Mechanics",d:"Hard",q:"2 kg ball dropped from 5 m (g=10). Speed at impact is",o:{"A":"5 m/s","B":"10 m/s","C":"20 m/s","D":"50 m/s"},a:"B",e:"Energy: mgh = ½mv² → 10×5 = ½v² → v² = 100 → v = 10 m/s."},
  {id:"p098",s:"Physics",y:2017,t:"Optics",d:"Hard",q:"Glass n=1.5. Speed of light in glass is",o:{"A":"4.5×10⁸ m/s","B":"2×10⁸ m/s","C":"1.5×10⁸ m/s","D":"3×10⁸ m/s"},a:"B",e:"v = c/n = 3×10⁸/1.5 = 2×10⁸ m/s."},
  {id:"p099",s:"Physics",y:2018,t:"Electricity",d:"Medium",q:"SI unit of electrical power is",o:{"A":"Volt","B":"Ampere","C":"Watt","D":"Ohm"},a:"C",e:"P = IV = I²R = V²/R. Unit: Watt = J/s."},
  {id:"p100",s:"Physics",y:2019,t:"Nuclear Physics",d:"Easy",q:"Gamma rays are",o:{"A":"Fast electrons","B":"Helium nuclei","C":"High-energy EM radiation","D":"Neutrons"},a:"C",e:"Gamma rays: EM radiation, very high frequency, no charge, no mass. Most penetrating."},
  {id:"p101",s:"Physics",y:2020,t:"Mechanics",d:"Medium",q:"Torque = force multiplied by",o:{"A":"Mass","B":"Velocity","C":"Perpendicular distance from pivot","D":"Acceleration"},a:"C",e:"Torque τ = F × d⊥. Unit: N·m."},
  {id:"p102",s:"Physics",y:2021,t:"Thermodynamics",d:"Easy",q:"Absolute zero in Celsius is",o:{"A":"0°C","B":"-100°C","C":"-273.15°C","D":"-373.15°C"},a:"C",e:"0 K = -273.15°C. T(K) = T(°C) + 273.15."},
  {id:"p103",s:"Physics",y:2022,t:"Optics",d:"Medium",q:"Virtual image cannot be",o:{"A":"Seen by eye","B":"Projected onto a screen","C":"Formed by concave mirror","D":"Larger than object"},a:"B",e:"Virtual image: rays only appear to diverge from that point — cannot be projected on screen."},
  {id:"p104",s:"Physics",y:2023,t:"Mechanics",d:"Hard",q:"Simple harmonic motion: restoring force is",o:{"A":"Constant","B":"Proportional to and directed toward equilibrium","C":"Proportional to velocity","D":"In direction of displacement"},a:"B",e:"SHM: F = -kx. Restoring force proportional to displacement, directed toward equilibrium."},
  {id:"p105",s:"Physics",y:2024,t:"Electricity",d:"Hard",q:"RMS voltage relates to peak voltage by",o:{"A":"Vrms = Vpeak","B":"Vrms = Vpeak/√2","C":"Vrms = 2×Vpeak","D":"Vrms = Vpeak/2"},a:"B",e:"Vrms = Vpeak/√2 ≈ 0.707 × Vpeak."},
  {id:"p106",s:"Physics",y:2010,t:"Mechanics",d:"Hard",q:"Force 50 N at 60° to horizontal. Horizontal component is",o:{"A":"50 N","B":"43.3 N","C":"25 N","D":"28.9 N"},a:"C",e:"Fx = F cos60° = 50 × 0.5 = 25 N."},
  {id:"p107",s:"Physics",y:2011,t:"Electricity",d:"Hard",q:"Kirchhoff's Current Law states",o:{"A":"Voltage around loop sums to zero","B":"Sum of currents entering node equals sum leaving","C":"Resistance increases with temperature","D":"P = I²R"},a:"B",e:"KCL: ΣI_in = ΣI_out. Conservation of charge at a junction."},
  {id:"p108",s:"Physics",y:2012,t:"Mechanics",d:"Medium",q:"Newton's Third Law: every action has",o:{"A":"Equal force in same direction","B":"Equal and opposite reaction force","C":"No reaction","D":"Doubled reaction"},a:"B",e:"For every force (action), equal and opposite force (reaction) acts on different object."},
  {id:"p109",s:"Physics",y:2013,t:"Waves",d:"Easy",q:"EM spectrum increasing frequency order is",o:{"A":"Gamma, X-ray, UV, visible, IR, microwave, radio","B":"Radio, microwave, IR, visible, UV, X-ray, gamma","C":"Visible, UV, gamma, X-ray, microwave, radio, IR","D":"X-ray, visible, UV, IR, microwave, radio"},a:"B",e:"Radio (lowest freq) → microwave → IR → visible → UV → X-ray → gamma (highest)."},
  {id:"p110",s:"Physics",y:2014,t:"Electricity",d:"Medium",q:"AC to DC conversion device is a",o:{"A":"Transformer","B":"Rectifier","C":"Capacitor","D":"Inductor"},a:"B",e:"Rectifier (diodes): converts AC → DC."},
  {id:"p111",s:"Physics",y:2015,t:"Mechanics",d:"Medium",q:"Terminal velocity occurs when",o:{"A":"Acceleration is maximum","B":"Drag force = driving/weight force (net force = 0)","C":"Object momentarily at rest","D":"Gravity absent"},a:"B",e:"Terminal velocity: drag = weight → net force = 0 → acceleration = 0 → constant velocity."},
  {id:"p112",s:"Physics",y:2016,t:"Optics",d:"Easy",q:"Law of reflection: angle of incidence",o:{"A":"Greater than reflection","B":"Equals angle of reflection","C":"Less than reflection","D":"Always 90°"},a:"B",e:"θ_i = θ_r (measured from normal). Applies to all reflecting surfaces."},
  {id:"p113",s:"Physics",y:2017,t:"Mechanics",d:"Medium",q:"Horizontal projectile from height h. Time to reach ground is",o:{"A":"t = h/g","B":"t = √(2h/g)","C":"t = √(h/g)","D":"t = 2h/g"},a:"B",e:"Vertical free fall: h = ½gt² → t = √(2h/g)."},
  {id:"p114",s:"Physics",y:2018,t:"Thermodynamics",d:"Easy",q:"During boiling, temperature stays constant because",o:{"A":"Heat lost to surroundings","B":"Latent heat absorbed to overcome intermolecular forces","C":"Water reflects heat","D":"Pressure drops"},a:"B",e:"Latent heat of vaporisation converts liquid → gas without temperature change."},
  {id:"p115",s:"Physics",y:2019,t:"Nuclear Physics",d:"Medium",q:"Which is NOT ionising radiation?",o:{"A":"Alpha","B":"Beta","C":"Gamma","D":"Visible light"},a:"D",e:"Visible light lacks energy to ionise atoms. Alpha, beta, gamma are ionising."},
  {id:"p116",s:"Physics",y:2020,t:"Waves",d:"Easy",q:"T = 1/f. If f = 10 Hz, T is",o:{"A":"10 s","B":"0.1 s","C":"100 s","D":"0.01 s"},a:"B",e:"T = 1/f = 1/10 = 0.1 s."},
  {id:"p117",s:"Physics",y:2021,t:"Electricity",d:"Medium",q:"Electric field lines around positive charge point",o:{"A":"Toward charge","B":"Radially away from charge","C":"In circles","D":"Nowhere"},a:"B",e:"Field lines: outward from positive, inward toward negative charges."},
  {id:"p118",s:"Physics",y:2022,t:"Mechanics",d:"Hard",q:"In projectile motion (no air resistance), horizontal velocity",o:{"A":"Increases","B":"Decreases","C":"Remains constant","D":"Is zero"},a:"C",e:"No horizontal force → horizontal velocity constant throughout flight."},
  {id:"p119",s:"Physics",y:2023,t:"Optics",d:"Medium",q:"Object at focal point of convex lens produces",o:{"A":"Real inverted same-size image","B":"Virtual upright enlarged","C":"Parallel refracted rays (image at infinity)","D":"Diminished image"},a:"C",e:"Object at F: refracted rays parallel → image at infinity. Used in searchlights."},
  {id:"p120",s:"Physics",y:2024,t:"Thermodynamics",d:"Hard",q:"In spontaneous processes, entropy of isolated system",o:{"A":"Decreases","B":"Stays constant","C":"Always increases","D":"Varies randomly"},a:"C",e:"Second Law: entropy always increases in spontaneous processes in isolated system."},
  {id:"p121",s:"Physics",y:2010,t:"Electricity",d:"Medium",q:"EMF of battery is",o:{"A":"Always equal to terminal voltage","B":"Work done per unit charge through complete circuit","C":"Voltage drop across internal resistance","D":"Force on electrons"},a:"B",e:"EMF = W/Q. EMF = terminal voltage + voltage drop across internal resistance (ε = V + Ir)."},
  {id:"p122",s:"Physics",y:2011,t:"Mechanics",d:"Medium",q:"Hooke's Law: within elastic limit",o:{"A":"F ∝ extension²","B":"Extension independent of force","C":"F = kx","D":"Extension equals spring constant"},a:"C",e:"F = kx. k = spring constant (N/m). Valid within elastic (proportional) limit."},
  {id:"p123",s:"Physics",y:2012,t:"Nuclear Physics",d:"Medium",q:"Radioactive decay is",o:{"A":"Chemical reaction","B":"Random, spontaneous, unaffected by temperature","C":"Triggered by temperature","D":"Controlled by pressure"},a:"B",e:"Radioactive decay: random, spontaneous, independent of physical/chemical conditions."},
  {id:"p124",s:"Physics",y:2013,t:"Thermodynamics",d:"Hard",q:"Adiabatic compression causes temperature to",o:{"A":"Decrease","B":"Stay same","C":"Increase","D":"Reach absolute zero"},a:"C",e:"Adiabatic: Q=0. Work done on gas → increases internal energy → temperature rises."},
  {id:"p125",s:"Physics",y:2014,t:"Waves",d:"Hard",q:"Constructive interference when path difference equals",o:{"A":"λ/2","B":"Odd multiples of λ/2","C":"Integer multiples of λ","D":"Quarter wavelength"},a:"C",e:"Constructive: path diff = nλ (n=0,1,2...) — waves in phase. Max amplitude."},

  // Chemistry Questions (c001-c100)
  {id:"c001",s:"Chemistry",y:2010,t:"Atomic Structure",d:"Easy",q:"Number of protons determines",o:{"A":"Mass number","B":"Atomic number","C":"Number of neutrons","D":"Isotope type"},a:"B",e:"Atomic number Z = proton count. Unique for each element."},
  {id:"c002",s:"Chemistry",y:2011,t:"Chemical Bonding",d:"Medium",q:"Which has a dative (coordinate) covalent bond?",o:{"A":"NaCl","B":"H2O","C":"NH4+","D":"CO2"},a:"C",e:"In NH4+, N donates both electrons for one N-H bond from its lone pair."},
  {id:"c003",s:"Chemistry",y:2012,t:"Stoichiometry",d:"Hard",q:"40 g NaOH + excess HCl → NaCl formed (Na=23,Cl=35.5)?",o:{"A":"58.5 g","B":"40 g","C":"29.25 g","D":"117 g"},a:"A",e:"40 g NaOH = 1 mol → 1 mol NaCl. Mass = 58.5 g."},
  {id:"c004",s:"Chemistry",y:2013,t:"Redox",d:"Medium",q:"In 2Mg + O2 → 2MgO, Mg is",o:{"A":"Reduced","B":"Oxidised","C":"A catalyst","D":"Oxidising agent"},a:"B",e:"Mg → Mg2+ + 2e-. Loss of electrons = oxidation (OIL RIG)."},
  {id:"c005",s:"Chemistry",y:2014,t:"Gas Laws",d:"Hard",q:"Gas at 27°C occupies 200 cm³. At 127°C (same P) volume is",o:{"A":"266.7 cm³","B":"400 cm³","C":"100 cm³","D":"150 cm³"},a:"A",e:"Charles: V1/T1 = V2/T2. V2 = 200 × 400/300 = 266.7 cm³."},
  {id:"c006",s:"Chemistry",y:2015,t:"Atomic Structure",d:"Medium",q:"Cl: Z=17, A=35. Neutrons =",o:{"A":"17","B":"18","C":"35","D":"52"},a:"B",e:"n = A - Z = 35 - 17 = 18."},
  {id:"c007",s:"Chemistry",y:2016,t:"Chemical Bonding",d:"Easy",q:"NaCl contains",o:{"A":"Covalent bonds","B":"Ionic bonds","C":"Metallic bonds","D":"Hydrogen bonds"},a:"B",e:"Na transfers electron to Cl → Na+ and Cl- held by electrostatic attraction."},
  {id:"c008",s:"Chemistry",y:2017,t:"Stoichiometry",d:"Hard",q:"100 g CaCO3 decomposes at STP. Volume CO2 is",o:{"A":"22.4 L","B":"44.8 L","C":"11.2 L","D":"2.24 L"},a:"A",e:"1 mol CaCO3 → 1 mol CO2 = 22.4 L at STP."},
  {id:"c009",s:"Chemistry",y:2018,t:"Equilibrium",d:"Hard",q:"N2+3H2=2NH3. Increasing pressure shifts equilibrium",o:{"A":"Left","B":"Right","C":"Neither","D":"Both"},a:"B",e:"Left: 4 mol gas; right: 2 mol. Higher P favours fewer moles → right."},
  {id:"c010",s:"Chemistry",y:2019,t:"Electrochemistry",d:"Medium",q:"Gas at cathode during electrolysis of dilute H2SO4 is",o:{"A":"Oxygen","B":"Hydrogen","C":"SO2","D":"CO2"},a:"B",e:"Cathode: 2H+ + 2e- → H2. Reduction at negative electrode."},
  {id:"c011",s:"Chemistry",y:2020,t:"Organic Chemistry",d:"Medium",q:"IUPAC name of CH3CH2CH2OH is",o:{"A":"Ethanol","B":"Propan-1-ol","C":"Propan-2-ol","D":"Butan-1-ol"},a:"B",e:"3C (prop-), OH on C1 (-an-1-ol) = propan-1-ol."},
  {id:"c012",s:"Chemistry",y:2021,t:"Acids and Bases",d:"Easy",q:"BF3 is a Lewis acid because it",o:{"A":"Donates H+","B":"Accepts H+","C":"Accepts an electron pair","D":"Donates electrons"},a:"C",e:"Lewis acid: electron pair acceptor. BF3 has incomplete octet."},
  {id:"c013",s:"Chemistry",y:2022,t:"Periodic Table",d:"Medium",q:"Across Period 3, which INCREASES?",o:{"A":"Atomic radius","B":"Metallic character","C":"Electronegativity","D":"Electron shells"},a:"C",e:"Increasing Z across period → stronger nuclear attraction → higher electronegativity."},
  {id:"c014",s:"Chemistry",y:2023,t:"Redox",d:"Medium",q:"In CuO + H2 → Cu + H2O, substance OXIDISED is",o:{"A":"CuO","B":"H2","C":"Cu","D":"H2O"},a:"B",e:"H2 → H2+ in H2O: hydrogen loses electrons → oxidised."},
  {id:"c015",s:"Chemistry",y:2024,t:"Organic Chemistry",d:"Hard",q:"Cold dilute KMnO4 converts alkenes to",o:{"A":"Alkanes","B":"Diols","C":"Carboxylic acids","D":"Ketones"},a:"B",e:"Cold dilute KMnO4 (Baeyer's): alkene → diol. Purple → colourless."},
  {id:"c016",s:"Chemistry",y:2010,t:"Acids and Bases",d:"Easy",q:"pH = 2 indicates solution is",o:{"A":"Weakly acidic","B":"Neutral","C":"Strongly acidic","D":"Alkaline"},a:"C",e:"pH 2 → [H+] = 0.01 mol/L — strongly acidic."},
  {id:"c017",s:"Chemistry",y:2011,t:"Thermochemistry",d:"Medium",q:"Exothermic reaction",o:{"A":"Absorbs heat","B":"Releases heat (ΔH < 0)","C":"No energy change","D":"Only at high T"},a:"B",e:"Exothermic: ΔH negative. Heat released to surroundings."},
  {id:"c018",s:"Chemistry",y:2012,t:"Kinetics",d:"Medium",q:"Increasing temperature speeds reactions because",o:{"A":"Concentration increases","B":"Activation energy decreases","C":"More particles exceed activation energy","D":"Pressure increases"},a:"C",e:"Higher T → more molecules with KE ≥ Ea → more successful collisions."},
  {id:"c019",s:"Chemistry",y:2013,t:"Periodic Table",d:"Easy",q:"Elements in same group have same",o:{"A":"Atomic mass","B":"Shells","C":"Valence electrons","D":"Melting point"},a:"C",e:"Same group = same number of valence electrons → similar chemical properties."},
  {id:"c020",s:"Chemistry",y:2014,t:"Organic Chemistry",d:"Medium",q:"Fermentation of glucose produces",o:{"A":"Ethanol and CO2","B":"Methanol and water","C":"Lactic acid","D":"Ethanoic acid"},a:"A",e:"Yeast fermentation: C6H12O6 → 2C2H5OH + 2CO2."},
  {id:"c021",s:"Chemistry",y:2015,t:"Electrochemistry",d:"Hard",q:"Product at anode during brine electrolysis is",o:{"A":"Sodium","B":"Hydrogen","C":"Chlorine","D":"Oxygen"},a:"C",e:"Anode: 2Cl- → Cl2 + 2e-. Concentrated brine gives Cl2."},
  {id:"c022",s:"Chemistry",y:2016,t:"Stoichiometry",d:"Medium",q:"Moles of Al in 27 g (Ar=27) is",o:{"A":"0.5","B":"1","C":"2","D":"27"},a:"B",e:"n = 27/27 = 1 mol."},
  {id:"c023",s:"Chemistry",y:2017,t:"Chemical Bonding",d:"Hard",q:"Highest melting point among NaCl, CCl4, ice, diamond is",o:{"A":"NaCl","B":"CCl4","C":"Ice","D":"Diamond"},a:"D",e:"Diamond: giant covalent lattice with strong C-C bonds throughout → highest melting point."},
  {id:"c024",s:"Chemistry",y:2018,t:"Acids and Bases",d:"Medium",q:"For strong acid/strong base titration, suitable indicator is",o:{"A":"Phenolphthalein only","B":"Methyl orange only","C":"Either","D":"Universal only"},a:"C",e:"Steep pH curve 3-11. Both phenolphthalein and methyl orange work."},
  {id:"c025",s:"Chemistry",y:2019,t:"Organic Chemistry",d:"Medium",q:"General formula of alkenes is",o:{"A":"CnH2n+2","B":"CnH2n","C":"CnH2n-2","D":"CnHn"},a:"B",e:"Alkenes with one C=C: CnH2n."},
  {id:"c026",s:"Chemistry",y:2020,t:"Kinetics",d:"Hard",q:"Catalyst increases rate by",o:{"A":"Increasing concentration","B":"Raising temperature","C":"Providing alternative pathway with lower activation energy","D":"Increasing pressure"},a:"C",e:"Catalyst lowers Ea → more molecules react → faster rate. Not consumed."},
  {id:"c027",s:"Chemistry",y:2021,t:"Atomic Structure",d:"Medium",q:"Isotopes have same",o:{"A":"Mass number","B":"Neutrons","C":"Protons (atomic number)","D":"Density"},a:"C",e:"Isotopes: same Z, different A (different neutron count)."},
  {id:"c028",s:"Chemistry",y:2022,t:"Thermochemistry",d:"Hard",q:"Standard enthalpy of formation is energy when",o:{"A":"1 mol burns","B":"1 mol compound forms from elements in standard states","C":"1 mol neutralised","D":"1 mol dissolves"},a:"B",e:"ΔHf°: energy change forming 1 mol compound from elements in standard states at 298 K."},
  {id:"c029",s:"Chemistry",y:2023,t:"Electrochemistry",d:"Medium",q:"During copper electroplating, object to be plated is the",o:{"A":"Anode","B":"Cathode","C":"Electrolyte","D":"Salt bridge"},a:"B",e:"Cathode: Cu2+ + 2e- → Cu (deposits on object)."},
  {id:"c030",s:"Chemistry",y:2024,t:"Organic Chemistry",d:"Medium",q:"Which is a primary alcohol?",o:{"A":"Propan-2-ol","B":"2-methylpropan-2-ol","C":"Butan-1-ol","D":"Cyclohexanol"},a:"C",e:"Primary: -OH on C bonded to only one other C. Butan-1-ol satisfies this."},
  {id:"c031",s:"Chemistry",y:2010,t:"Periodic Table",d:"Medium",q:"Noble gases are in Group",o:{"A":"I","B":"IV","C":"VII","D":"0 (18)"},a:"D",e:"Noble gases: He, Ne, Ar, Kr, Xe, Rn — Group 0 or 18."},
  {id:"c032",s:"Chemistry",y:2011,t:"Redox",d:"Medium",q:"In CuO + H2 → Cu + H2O, CuO is",o:{"A":"Oxidised","B":"Reduced","C":"Catalyst","D":"Unchanged"},a:"B",e:"Cu2+ → Cu0: gains electrons → reduced. CuO is oxidising agent."},
  {id:"c033",s:"Chemistry",y:2012,t:"Acids and Bases",d:"Easy",q:"Water is amphoteric because it",o:{"A":"Is neutral","B":"Can act as both acid and base","C":"Has high boiling point","D":"Forms H-bonds"},a:"B",e:"H2O: can donate H+ (acid) or accept H+ (base)."},
  {id:"c034",s:"Chemistry",y:2013,t:"Organic Chemistry",d:"Hard",q:"Ethanol + ethanoic acid with conc H2SO4 produces",o:{"A":"Ester","B":"Alkene","C":"Ether","D":"Ketone"},a:"A",e:"Esterification: CH3COOH + C2H5OH → CH3COOC2H5 + H2O."},
  {id:"c035",s:"Chemistry",y:2014,t:"Chemical Bonding",d:"Medium",q:"Shape of H2O molecule is",o:{"A":"Linear","B":"Trigonal planar","C":"Bent (~104.5°)","D":"Tetrahedral"},a:"C",e:"VSEPR: 2 bond pairs + 2 lone pairs → bent/V-shaped, 104.5°."},
  {id:"c036",s:"Chemistry",y:2015,t:"Stoichiometry",d:"Medium",q:"0.5 mol gas at STP occupies",o:{"A":"11.2 L","B":"22.4 L","C":"44.8 L","D":"5.6 L"},a:"A",e:"0.5 × 22.4 = 11.2 L."},
  {id:"c037",s:"Chemistry",y:2016,t:"Kinetics",d:"Easy",q:"Which does NOT increase reaction rate?",o:{"A":"Higher temperature","B":"Catalyst","C":"Higher pressure for gases","D":"Lower reactant concentration"},a:"D",e:"Lower concentration → fewer collisions → slower rate."},
  {id:"c038",s:"Chemistry",y:2017,t:"Equilibrium",d:"Medium",q:"Which shifts N2+3H2=2NH3 equilibrium to right?",o:{"A":"Removing NH3","B":"Reducing pressure","C":"Adding inert gas at constant V","D":"Removing N2"},a:"A",e:"Removing product decreases [NH3] → equilibrium shifts right to restore it."},
  {id:"c039",s:"Chemistry",y:2018,t:"Organic Chemistry",d:"Medium",q:"Carboxylic acid functional group is",o:{"A":"-OH","B":"-COOH","C":"-CHO","D":"-CO-"},a:"B",e:"-COOH (carboxyl group): carbonyl + hydroxyl on same carbon."},
  {id:"c040",s:"Chemistry",y:2019,t:"Thermochemistry",d:"Hard",q:"Which is ENDOTHERMIC?",o:{"A":"Methane combustion","B":"Neutralisation","C":"Decomposition of limestone","D":"Rusting of iron"},a:"C",e:"CaCO3 → CaO + CO2: ΔH = +179 kJ/mol. Requires heat."},
  {id:"c041",s:"Chemistry",y:2020,t:"Atomic Structure",d:"Medium",q:"Maximum electrons in third shell is",o:{"A":"2","B":"8","C":"18","D":"32"},a:"C",e:"2n² = 2×9 = 18. Third shell holds up to 18 electrons."},
  {id:"c042",s:"Chemistry",y:2021,t:"Periodic Table",d:"Easy",q:"Which is a halogen?",o:{"A":"Sodium","B":"Oxygen","C":"Chlorine","D":"Neon"},a:"C",e:"Halogens (Group 17): F, Cl, Br, I, At. Chlorine is a halogen."},
  {id:"c043",s:"Chemistry",y:2022,t:"Chemical Bonding",d:"Medium",q:"Metallic bonding involves",o:{"A":"Electron transfer between atoms","B":"Electron sharing between pairs","C":"Delocalised electrons in lattice of positive ions","D":"Van der Waals only"},a:"C",e:"Metallic bond: sea of delocalised electrons around positive metal ions."},
  {id:"c044",s:"Chemistry",y:2023,t:"Organic Chemistry",d:"Medium",q:"Alkanes are saturated because they",o:{"A":"Have C=C bonds","B":"Have only C-C and C-H single bonds","C":"Dissolve in water","D":"Have high boiling points"},a:"B",e:"Saturated: all single bonds. Maximum H atoms per carbon."},
  {id:"c045",s:"Chemistry",y:2024,t:"Electrochemistry",d:"Hard",q:"Standard hydrogen electrode conditions are",o:{"A":"H2 at 2 atm, [H+]=2","B":"H2 at 1 atm, [H+]=1 mol/L, 298 K","C":"H2 at 0.5 atm, [H+]=0.5","D":"Any conditions"},a:"B",e:"SHE: H2 at 1 atm, [H+]=1 mol/L, 298 K. E° = 0.00 V by definition."},
  {id:"c046",s:"Chemistry",y:2010,t:"Kinetics",d:"Medium",q:"Activation energy is minimum energy for",o:{"A":"Products to be stable","B":"Reactant molecules to successfully react","C":"Equilibrium to be reached","D":"Reverse reaction"},a:"B",e:"Ea: minimum KE needed for collision to lead to reaction."},
  {id:"c047",s:"Chemistry",y:2011,t:"Acids and Bases",d:"Medium",q:"Strong acids fully",o:{"A":"Dissolve metals","B":"Dissociate in water","C":"React with bases","D":"Produce precipitates"},a:"B",e:"Strong acids (HCl, H2SO4, HNO3): completely dissociate in aqueous solution."},
  {id:"c048",s:"Chemistry",y:2012,t:"Organic Chemistry",d:"Hard",q:"Alkenes react with bromine by",o:{"A":"Free radical substitution","B":"Electrophilic addition","C":"Nucleophilic substitution","D":"Elimination"},a:"B",e:"C=C is nucleophilic. Br2 (electrophile) adds across double bond → dibromo compound."},
  {id:"c049",s:"Chemistry",y:2013,t:"Thermochemistry",d:"Medium",q:"Hess's Law states total enthalpy change",o:{"A":"Depends on conditions","B":"Same regardless of route taken","C":"Always exothermic","D":"Changed by catalysts"},a:"B",e:"Hess's Law: ΔH depends only on initial and final states, not pathway. Conservation of energy."},
  {id:"c050",s:"Chemistry",y:2014,t:"Equilibrium",d:"Hard",q:"Equilibrium constant K changes only when",o:{"A":"Concentration changes","B":"Pressure changes","C":"Temperature changes","D":"Catalyst added"},a:"C",e:"K depends only on temperature. Concentration, pressure, catalyst do NOT change K."},
  {id:"c051",s:"Chemistry",y:2015,t:"Atomic Structure",d:"Hard",q:"Bohr model proposed electrons orbit in",o:{"A":"Random paths","B":"Fixed quantised energy levels","C":"Positive sphere","D":"Free paths"},a:"B",e:"Bohr (1913): fixed energy levels n=1,2,3... Electrons emit photons when falling to lower levels."},
  {id:"c052",s:"Chemistry",y:2016,t:"Redox",d:"Hard",q:"Oxidation number of Cr in K2Cr2O7 is",o:{"A":"+2","B":"+3","C":"+6","D":"+7"},a:"C",e:"K=+1(×2=+2), O=-2(×7=-14). +2 + 2Cr - 14 = 0 → Cr = +6."},
  {id:"c053",s:"Chemistry",y:2017,t:"Chemical Bonding",d:"Medium",q:"Hydrogen bonding occurs when H is bonded to",o:{"A":"Any electronegative atom","B":"N, O, or F — interacting with lone pair on N, O, or F","C":"Carbon only","D":"Two H atoms"},a:"B",e:"H-bond: H on N/O/F (δ+) attracted to lone pair on N/O/F. Strong intermolecular force."},
  {id:"c054",s:"Chemistry",y:2018,t:"Organic Chemistry",d:"Medium",q:"Addition polymerisation uses monomers with",o:{"A":"-OH groups","B":"C=C double bonds","C":"Ionic bonds","D":"Peptide bonds"},a:"B",e:"Monomers with C=C add together, chain growing by opening double bonds."},
  {id:"c055",s:"Chemistry",y:2019,t:"Stoichiometry",d:"Medium",q:"Mr of H2SO4 (H=1,S=32,O=16) is",o:{"A":"49","B":"98","C":"64","D":"80"},a:"B",e:"2(1) + 32 + 4(16) = 2 + 32 + 64 = 98 g/mol."},
  {id:"c056",s:"Chemistry",y:2020,t:"Acids and Bases",d:"Medium",q:"Conjugate base of H2SO4 is",o:{"A":"H3SO4+","B":"HSO4-","C":"SO42-","D":"H2SO3"},a:"B",e:"H2SO4 - H+ = HSO4- (hydrogensulphate ion)."},
  {id:"c057",s:"Chemistry",y:2021,t:"Periodic Table",d:"Medium",q:"Alkali metals more reactive down group because",o:{"A":"Radius decreases","B":"Outer electron further from nucleus, lower IE, easier to lose","C":"Electronegativity increases","D":"More protons"},a:"B",e:"Down Group I: larger atom, more shielding → lower IE → easier to lose electron → more reactive."},
  {id:"c058",s:"Chemistry",y:2022,t:"Kinetics",d:"Hard",q:"Rate measured by",o:{"A":"Temperature only","B":"Change in concentration over time","C":"Enthalpy change","D":"Bonds broken"},a:"B",e:"Rate = Δ[concentration]/Δtime. Measured by colour, gas volume, mass loss, titration."},
  {id:"c059",s:"Chemistry",y:2023,t:"Organic Chemistry",d:"Hard",q:"Condensation polymerisation releases",o:{"A":"No by-products","B":"Small molecule (H2O or HCl) each bond","C":"Forms no polymer","D":"Only rubber"},a:"B",e:"Condensation: each bond releases H2O (polyester, nylon) or HCl. Examples: proteins, polyester."},
  {id:"c060",s:"Chemistry",y:2024,t:"Thermochemistry",d:"Medium",q:"Q = mcΔT. 2 kg water, 5 K rise (c=4200). Q is",o:{"A":"21000 J","B":"42000 J","C":"840 J","D":"8400 J"},a:"B",e:"Q = 2 × 4200 × 5 = 42000 J."},
  {id:"c061",s:"Chemistry",y:2010,t:"Organic Chemistry",d:"Easy",q:"Functional group of alcohols is",o:{"A":"-COOH","B":"-OH","C":"-CHO","D":"-NH2"},a:"B",e:"Hydroxyl group (-OH) defines alcohols."},
  {id:"c062",s:"Chemistry",y:2011,t:"Chemical Bonding",d:"Easy",q:"Cl2 contains a",o:{"A":"Polar covalent bond","B":"Non-polar covalent bond","C":"Ionic bond","D":"Metallic bond"},a:"B",e:"Cl2: identical atoms → equal electron sharing → non-polar covalent."},
  {id:"c063",s:"Chemistry",y:2012,t:"Stoichiometry",d:"Medium",q:"Avogadro's constant is approximately",o:{"A":"6.02×10²²","B":"6.02×10²³","C":"6.02×10²⁴","D":"1.66×10⁻²⁷"},a:"B",e:"Na = 6.02×10²³ mol⁻¹."},
  {id:"c064",s:"Chemistry",y:2013,t:"Equilibrium",d:"Medium",q:"Haber process uses conditions of approximately",o:{"A":"Low T, low P, no catalyst","B":"~450°C, ~200 atm, iron catalyst","C":"Very high T >1000°C","D":"Room temperature"},a:"B",e:"Compromise conditions: ~450°C (rate vs yield), ~200 atm, Fe catalyst."},
  {id:"c065",s:"Chemistry",y:2014,t:"Electrochemistry",d:"Medium",q:"Electrolysis of molten NaCl produces",o:{"A":"Na and Cl2","B":"H2 and Cl2","C":"Na and O2","D":"NaOH and Cl2"},a:"A",e:"Cathode: Na+ + e- → Na. Anode: 2Cl- → Cl2 + 2e-."},
  {id:"c066",s:"Chemistry",y:2015,t:"Atomic Structure",d:"Medium",q:"Ion with 18 electrons and charge 2+ has atomic number",o:{"A":"16","B":"18","C":"20","D":"22"},a:"C",e:"2+ ion lost 2 electrons. Original Z = 18 + 2 = 20 (Calcium)."},
  {id:"c067",s:"Chemistry",y:2016,t:"Organic Chemistry",d:"Medium",q:"Complete combustion of propane (C3H8) produces",o:{"A":"CO and H2O","B":"CO2 and H2O","C":"C and H2O","D":"CO2 and H2"},a:"B",e:"C3H8 + 5O2 → 3CO2 + 4H2O."},
  {id:"c068",s:"Chemistry",y:2017,t:"Periodic Table",d:"Hard",q:"First ionisation energy increases across Period 3 because",o:{"A":"Radius increases","B":"Shells increase","C":"Nuclear charge increases, same shielding → stronger attraction for outer electron","D":"Metallic character increases"},a:"C",e:"More protons across period, same shielding → greater attraction → higher IE."},
  {id:"c069",s:"Chemistry",y:2018,t:"Organic Chemistry",d:"Medium",q:"Which is an aldehyde?",o:{"A":"CH3OH","B":"CH3COCH3","C":"HCHO","D":"CH3COOH"},a:"C",e:"HCHO (methanal): -CHO group at end of chain. Aldehyde."},
  {id:"c070",s:"Chemistry",y:2019,t:"Redox",d:"Medium",q:"Strongest reducing agent among F, Na, Au, Pt is",o:{"A":"Fluorine","B":"Sodium","C":"Gold","D":"Platinum"},a:"B",e:"Na: lowest E° = -2.71 V → strongest tendency to lose electrons → strongest reducing agent."},
  {id:"c071",s:"Chemistry",y:2020,t:"Gas Laws",d:"Medium",q:"Boyle's Law states (constant T)",o:{"A":"V ∝ T","B":"PV = constant","C":"P/T = constant","D":"V/T = constant"},a:"B",e:"Boyle's: PV = k at constant T. P and V inversely proportional."},
  {id:"c072",s:"Chemistry",y:2021,t:"Acids and Bases",d:"Hard",q:"Buffer solution contains",o:{"A":"Strong acid and strong base","B":"Weak acid and its conjugate base","C":"Distilled water only","D":"Neutral salt"},a:"B",e:"Buffer resists pH change: weak acid HA + conjugate base A-. Absorbs both added acid and base."},
  {id:"c073",s:"Chemistry",y:2022,t:"Chemical Bonding",d:"Medium",q:"London dispersion forces are",o:{"A":"Strong permanent dipoles","B":"Temporary induced dipoles in ALL molecules","C":"Only in polar molecules","D":"Hydrogen bonds"},a:"B",e:"London forces: temporary dipoles in all molecules. Increase with molecular size/Mr."},
  {id:"c074",s:"Chemistry",y:2023,t:"Stoichiometry",d:"Hard",q:"5.85 g NaCl (Mr=58.5) in 500 cm³. Concentration is",o:{"A":"0.1 mol/L","B":"0.2 mol/L","C":"1.0 mol/L","D":"2.0 mol/L"},a:"B",e:"n = 5.85/58.5 = 0.1 mol. c = 0.1/0.5 = 0.2 mol/L."},
  {id:"c075",s:"Chemistry",y:2024,t:"Organic Chemistry",d:"Hard",q:"Cracking long-chain hydrocarbons produces",o:{"A":"Longer chains","B":"Shorter alkanes and alkenes","C":"Removes sulphur","D":"Converts alkenes to alkanes"},a:"B",e:"Cracking: breaks long alkanes → shorter alkanes + alkenes (for plastics/fuel)."},
  {id:"c076",s:"Chemistry",y:2010,t:"Electrochemistry",d:"Medium",q:"At anode in electrolysis",o:{"A":"Reduction occurs","B":"Oxidation occurs","C":"Cations discharged","D":"Negative electrode"},a:"B",e:"Anode (+): anions lose electrons → oxidation occurs. AN OX."},
  {id:"c077",s:"Chemistry",y:2011,t:"Periodic Table",d:"Medium",q:"Halogens less reactive down Group 17 because",o:{"A":"Become smaller","B":"Incoming electron further from nucleus, more shielding → harder to gain","C":"Electronegativity increases","D":"Fewer protons"},a:"B",e:"Down Group 17: larger atom, more shielding → weaker attraction for incoming electron."},
  {id:"c078",s:"Chemistry",y:2012,t:"Organic Chemistry",d:"Medium",q:"Catalytic cracking uses",o:{"A":"Very high T, no catalyst","B":"Zeolite catalyst at ~500°C","C":"Low pressure only","D":"Biological enzymes"},a:"B",e:"Catalytic cracking: zeolite catalyst, ~500°C. More efficient than thermal cracking."},
  {id:"c079",s:"Chemistry",y:2013,t:"Stoichiometry",d:"Hard",q:"2HCl + Na2CO3 → 2NaCl + H2O + CO2. From 10.6 g Na2CO3 (Mr=106), CO2 at STP is",o:{"A":"2.24 L","B":"22.4 L","C":"11.2 L","D":"1.12 L"},a:"A",e:"n(Na2CO3) = 0.1 mol → 0.1 mol CO2. V = 0.1 × 22.4 = 2.24 L."},
  {id:"c080",s:"Chemistry",y:2014,t:"Equilibrium",d:"Medium",q:"Le Chatelier: equilibrium responds to disturbance by",o:{"A":"Increasing disturbance","B":"Minimising effect of disturbance","C":"Changing K","D":"Stopping reaction"},a:"B",e:"System shifts direction that partially opposes the imposed change."},
  {id:"c081",s:"Chemistry",y:2015,t:"Atomic Structure",d:"Medium",q:"Emission spectrum produced when electrons",o:{"A":"Absorb energy, jump up","B":"Fall from higher to lower levels, emitting photons","C":"Are removed from atoms","D":"Are shared"},a:"B",e:"Falling electrons emit photons of specific energy → characteristic line spectrum."},
  {id:"c082",s:"Chemistry",y:2016,t:"Organic Chemistry",d:"Medium",q:"Which is a ketone?",o:{"A":"HCHO","B":"CH3CHO","C":"CH3COCH3","D":"CH3COOH"},a:"C",e:"Ketone: C=O flanked by two C groups. CH3COCH3 (propanone/acetone)."},
  {id:"c083",s:"Chemistry",y:2017,t:"Redox",d:"Hard",q:"Test for C=C double bond uses",o:{"A":"Universal indicator","B":"Bromine water (orange → colourless)","C":"Fehling's solution","D":"Biuret reagent"},a:"B",e:"Br2 (orange) reacts with C=C → dibromoalkane (colourless). Positive test."},
  {id:"c084",s:"Chemistry",y:2018,t:"Thermochemistry",d:"Hard",q:"ΔHc(ethanol)=-1368 kJ/mol, Mr=46. Energy from 46 g is",o:{"A":"684 kJ","B":"1368 kJ","C":"2736 kJ","D":"29.7 kJ"},a:"B",e:"46 g = 1 mol. Energy = 1368 kJ."},
  {id:"c085",s:"Chemistry",y:2019,t:"Chemical Bonding",d:"Hard",q:"Which molecule is LINEAR?",o:{"A":"H2O","B":"NH3","C":"CO2","D":"CH4"},a:"C",e:"CO2: 2 double bonds, no lone pairs on C → 180° → linear."},
  {id:"c086",s:"Chemistry",y:2020,t:"Electrochemistry",d:"Hard",q:"Standard electrode potential measures",o:{"A":"Tendency to lose protons","B":"Tendency to be reduced vs SHE","C":"Reactivity with water","D":"Acid-base strength"},a:"B",e:"E°: more positive → greater tendency to gain electrons (be reduced) vs SHE (0.00 V)."},
  {id:"c087",s:"Chemistry",y:2021,t:"Organic Chemistry",d:"Medium",q:"Saponification is",o:{"A":"Acid hydrolysis of proteins","B":"Alkaline hydrolysis of fats producing glycerol and soap","C":"Enzymatic digestion","D":"Hydration of alkenes"},a:"B",e:"Saponification: fat + NaOH → glycerol + fatty acid salts (soap)."},
  {id:"c088",s:"Chemistry",y:2022,t:"Kinetics",d:"Medium",q:"Second-order reaction: doubling [A] increases rate by",o:{"A":"2×","B":"4×","C":"0.5×","D":"1× (unchanged)"},a:"B",e:"rate = k[A]². Double A: rate = k(2A)² = 4kA². Quadruples."},
  {id:"c089",s:"Chemistry",y:2023,t:"Acids and Bases",d:"Medium",q:"Highest pH solution among these is",o:{"A":"0.1 mol/L HCl","B":"0.1 mol/L NaCl","C":"0.1 mol/L NaOH","D":"Pure water"},a:"C",e:"NaOH: pOH = 1 → pH = 13. Highest."},
  {id:"c090",s:"Chemistry",y:2024,t:"Organic Chemistry",d:"Hard",q:"Chlorination of alkanes by Cl2 in UV light is",o:{"A":"Ionic substitution","B":"Free radical substitution","C":"Electrophilic addition","D":"Nucleophilic substitution"},a:"B",e:"UV light initiates Cl• radicals → chain reaction: Cl• + CH4 → CH3• + HCl."},
  {id:"c091",s:"Chemistry",y:2010,t:"Gas Laws",d:"Medium",q:"Ideal gas equation is",o:{"A":"PV = nRT","B":"PV = RT","C":"PV = nR","D":"P = nRT/V²"},a:"A",e:"PV = nRT. R = 8.314 J/(mol·K)."},
  {id:"c092",s:"Chemistry",y:2011,t:"Stoichiometry",d:"Hard",q:"Percentage yield =",o:{"A":"actual/theoretical × 100","B":"theoretical/actual × 100","C":"moles product/reactant × 100","D":"mass product/reactant × 100"},a:"A",e:"% yield = (actual/theoretical) × 100."},
  {id:"c093",s:"Chemistry",y:2012,t:"Electrochemistry",d:"Hard",q:"E°cell = ",o:{"A":"E°cathode - E°anode","B":"E°anode - E°cathode","C":"E°cathode + E°anode","D":"E°cathode × E°anode"},a:"A",e:"E°cell = E°cathode(reduction) - E°anode(oxidation). Positive = spontaneous."},
  {id:"c094",s:"Chemistry",y:2013,t:"Organic Chemistry",d:"Medium",q:"Markovnikov's rule: H+ adds to",o:{"A":"More substituted carbon","B":"Carbon with more H atoms","C":"Both randomly","D":"Only ionic"},a:"B",e:"H+ adds to C of C=C with more H atoms (less substituted) → more stable carbocation."},
  {id:"c095",s:"Chemistry",y:2014,t:"Chemical Bonding",d:"Hard",q:"Bond angle of NH3 is approximately",o:{"A":"90°","B":"104.5°","C":"107°","D":"120°"},a:"C",e:"VSEPR: 3 bond pairs + 1 lone pair → trigonal pyramidal → ~107°."},
  {id:"c096",s:"Chemistry",y:2015,t:"Acids and Bases",d:"Easy",q:"Litmus is red in acid and _____ in alkali",o:{"A":"Yellow","B":"Green","C":"Blue","D":"Pink"},a:"C",e:"Litmus: red (acid), purple (neutral), blue (alkali)."},
  {id:"c097",s:"Chemistry",y:2016,t:"Stoichiometry",d:"Medium",q:"Empirical formula of 40%C, 6.7%H, 53.3%O is",o:{"A":"CH2O","B":"C2H4O2","C":"CHO","D":"C2H2O"},a:"A",e:"C:H:O = 3.33:6.7:3.33 = 1:2:1 → CH2O."},
  {id:"c098",s:"Chemistry",y:2017,t:"Equilibrium",d:"Hard",q:"Large K means",o:{"A":"Reactants favoured","B":"Products strongly favoured","C":"Reaction fast","D":"Endothermic"},a:"B",e:"K = [products]/[reactants]. Large K → mostly products at equilibrium."},
  {id:"c099",s:"Chemistry",y:2018,t:"Organic Chemistry",d:"Medium",q:"Ethene CH2=CH2 is an",o:{"A":"Saturated hydrocarbon","B":"Unsaturated hydrocarbon (alkene)","C":"Cyclic hydrocarbon","D":"Aromatic hydrocarbon"},a:"B",e:"C=C bond → unsaturated → alkene."},
  {id:"c100",s:"Chemistry",y:2019,t:"Atomic Structure",d:"Hard",q:"Heisenberg uncertainty principle: impossible to know simultaneously",o:{"A":"Charge and mass","B":"Position AND momentum of electron","C":"Protons and neutrons","D":"Energy and charge"},a:"B",e:"ΔxΔp ≥ ℏ/2. Fundamental quantum limit."},

  // Use of English Questions (e001-e060)
  {id:"e001",s:"Use of English",y:2010,t:"Lexis and Structure",d:"Easy",q:"Word nearest in meaning to ABSCOND is",o:{"A":"Arrive","B":"Confess","C":"Flee secretly","D":"Surrender"},a:"C",e:"Abscond: to leave hurriedly and secretly to escape custody."},
  {id:"e002",s:"Use of English",y:2011,t:"Oral English",d:"Medium",q:"Stress on second syllable in",o:{"A":"PREsent (noun)","B":"preSENT (verb)","C":"REcord (noun)","D":"PROtest (noun)"},a:"B",e:"Present (verb): preSENT. Present (noun/adj): PREsent."},
  {id:"e003",s:"Use of English",y:2012,t:"Comprehension",d:"Medium",q:"Sardonic tone means writer is",o:{"A":"Warm","B":"Grimly mocking or cynical","C":"Enthusiastic","D":"Neutral"},a:"B",e:"Sardonic: grimly mocking, cynical, bitterly scornful."},
  {id:"e004",s:"Use of English",y:2013,t:"Lexis and Structure",d:"Easy",q:"The students were _______ by the exam difficulty.",o:{"A":"overran","B":"overturned","C":"overwhelmed","D":"overrode"},a:"C",e:"Overwhelmed: overcome or submerged by something difficult."},
  {id:"e005",s:"Use of English",y:2014,t:"Oral English",d:"Medium",q:"Which word has vowel sound as in feet?",o:{"A":"Bit","B":"Bet","C":"Beat","D":"Bat"},a:"C",e:"Beat: /iː/ (long e). Bit: /ɪ/, Bet: /e/, Bat: /æ/."},
  {id:"e006",s:"Use of English",y:2015,t:"Lexis and Structure",d:"Medium",q:"Despite rain, athletes _______ to complete race.",o:{"A":"managed","B":"achieved","C":"succeeded","D":"accomplished"},a:"A",e:"Managed to + infinitive: correct collocation for success despite difficulty."},
  {id:"e007",s:"Use of English",y:2016,t:"Novel - In Dependence",d:"Hard",q:"In In Dependence, Tayo's relationship with Vanessa represents",o:{"A":"Successful intercultural marriage","B":"African identity vs Western aspiration","C":"Academic rivalry","D":"Colonial exploitation"},a:"B",e:"Their relationship dramatises tension between Tayo's Nigerian roots and pull of British life."},
  {id:"e008",s:"Use of English",y:2017,t:"Comprehension",d:"Medium",q:"Didactic writing aims to",o:{"A":"Entertain","B":"Persuade through emotion","C":"Teach or instruct","D":"Describe vividly"},a:"C",e:"Didactic: primarily aims to teach, instruct, or convey moral lessons."},
  {id:"e009",s:"Use of English",y:2018,t:"Novel - In Dependence",d:"Medium",q:"In Dependence is set primarily in",o:{"A":"Nigeria and USA","B":"Nigeria and Britain","C":"Ghana and France","D":"South Africa and Britain"},a:"B",e:"Novel follows Tayo from Nigeria to Oxford and back over several decades."},
  {id:"e010",s:"Use of English",y:2019,t:"Novel - Sweet Sixteen",d:"Medium",q:"In Sweet Sixteen, Aliya's father is",o:{"A":"Authoritarian","B":"Absent","C":"Progressive, warm, and communicative","D":"Religiously strict"},a:"C",e:"Aliya's father engages her in thoughtful coming-of-age conversations."},
  {id:"e011",s:"Use of English",y:2020,t:"Cloze Test",d:"Medium",q:"The minister's speech was full of _______ that impressed no one.",o:{"A":"bombast","B":"humility","C":"precision","D":"candour"},a:"A",e:"Bombast: inflated, high-sounding language with little meaning."},
  {id:"e012",s:"Use of English",y:2021,t:"Novel - The Life Changer",d:"Medium",q:"In The Life Changer, which character illustrates dangers of drug abuse?",o:{"A":"Salma","B":"Talle","C":"Ummi","D":"Omar"},a:"B",e:"Talle's descent into drug abuse and criminality is the cautionary tale."},
  {id:"e013",s:"Use of English",y:2022,t:"Novel - The Life Changer",d:"Hard",q:"The Life Changer title primarily refers to",o:{"A":"University campus","B":"Education as transformation","C":"Protagonist's mother","D":"Drug that ruins Talle"},a:"B",e:"Central theme: university education as life changer — for better or worse."},
  {id:"e014",s:"Use of English",y:2023,t:"Oral English",d:"Hard",q:"Which are minimal pairs based on vowel contrast?",o:{"A":"bit / bat","B":"cut / cup","C":"sing / ring","D":"ship / chip"},a:"A",e:"Bit /bɪt/ and bat /bæt/ differ only in vowel → minimal pair."},
  {id:"e015",s:"Use of English",y:2024,t:"Lexis and Structure",d:"Medium",q:"He was found guilty _______ murder.",o:{"A":"for","B":"about","C":"of","D":"with"},a:"C",e:"Fixed collocation: guilty of. Standard legal English."},
  {id:"e016",s:"Use of English",y:2010,t:"Comprehension",d:"Easy",q:"Narrator using I is using",o:{"A":"Third person omniscient","B":"Second person","C":"First person","D":"Third person limited"},a:"C",e:"First-person narration: uses I and we. Personal, subjective perspective."},
  {id:"e017",s:"Use of English",y:2011,t:"Lexis and Structure",d:"Medium",q:"Antonym of VERBOSE is",o:{"A":"Talkative","B":"Concise","C":"Fluent","D":"Eloquent"},a:"B",e:"Verbose: too wordy. Antonym: concise (brief and to the point)."},
  {id:"e018",s:"Use of English",y:2012,t:"Novel - The Potter's Wheel",d:"Medium",q:"Central theme of The Potter's Wheel is",o:{"A":"Political corruption","B":"A boy's journey toward maturity through discipline","C":"War","D":"Religious conversion"},a:"B",e:"Chukwuemeka Ike: Obu's difficult boarding school experience — bildungsroman."},
  {id:"e019",s:"Use of English",y:2013,t:"Oral English",d:"Medium",q:"Photograph is stressed on",o:{"A":"First syllable PHO-to-graph","B":"Second: pho-TO-graph","C":"Third: pho-to-GRAPH","D":"All equal"},a:"A",e:"PHO-to-graph: primary stress on first syllable."},
  {id:"e020",s:"Use of English",y:2014,t:"Lexis and Structure",d:"Hard",q:"Correct sentence with subject-verb agreement is",o:{"A":"Neither of the students have submitted","B":"Neither of the students has submitted his work","C":"Neither student have submitted","D":"Neither students has submitted"},a:"B",e:"Neither takes singular verb (has). Formally: his for singular indefinite subject."},
  {id:"e021",s:"Use of English",y:2015,t:"Comprehension",d:"Medium",q:"Giving human qualities to abstract ideas is",o:{"A":"Simile","B":"Metaphor","C":"Personification","D":"Hyperbole"},a:"C",e:"Personification: the wind whispered, justice is blind."},
  {id:"e022",s:"Use of English",y:2016,t:"Oral English",d:"Hard",q:"Which word has a silent consonant?",o:{"A":"Bright","B":"Knife","C":"Bread","D":"Trust"},a:"B",e:"Knife: k is silent. Pronounced /naɪf/."},
  {id:"e023",s:"Use of English",y:2017,t:"Lexis and Structure",d:"Medium",q:"Correct collocation: He made a _______ decision.",o:{"A":"rash","B":"quick-minded","C":"hasty-minded","D":"fast"},a:"A",e:"Rash decision: standard collocation meaning hasty, poorly considered."},
  {id:"e024",s:"Use of English",y:2018,t:"Novel - In Dependence",d:"Hard",q:"Literary technique in In Dependence is",o:{"A":"Stream of consciousness","B":"Epistolary form (letters)","C":"Magical realism","D":"Dramatic monologue"},a:"B",e:"Manyika uses letters to convey emotional distance and longing across continents."},
  {id:"e025",s:"Use of English",y:2019,t:"Novel - Sweet Sixteen",d:"Hard",q:"Sweet Sixteen is best described as",o:{"A":"Political satire","B":"Coming-of-age novel (bildungsroman)","C":"Historical fiction","D":"Tragic romance"},a:"B",e:"Bolaji Abdullahi: Aliya's 16th birthday conversations — coming-of-age."},
  {id:"e026",s:"Use of English",y:2020,t:"Lexis and Structure",d:"Easy",q:"Synonym of DILIGENT is",o:{"A":"Lazy","B":"Hardworking","C":"Clever","D":"Dishonest"},a:"B",e:"Diligent: careful and persistent. Synonym: hardworking, industrious."},
  {id:"e027",s:"Use of English",y:2021,t:"Comprehension",d:"Medium",q:"Irony involves",o:{"A":"Saying exactly what you mean","B":"Exaggerating for effect","C":"Saying opposite of what you mean for effect","D":"Comparing two unlike things"},a:"C",e:"Verbal irony: saying opposite of what is meant. Situational: events contrary to expectation."},
  {id:"e028",s:"Use of English",y:2022,t:"Novel - The Life Changer",d:"Medium",q:"Ummi in The Life Changer represents",o:{"A":"A villain","B":"Positive role model succeeding through hard work","C":"A drug addict","D":"Insignificant character"},a:"B",e:"Ummi: focused, disciplined, morally grounded — contrasts with Talle."},
  {id:"e029",s:"Use of English",y:2023,t:"Oral English",d:"Medium",q:"Economics is stressed as",o:{"A":"E-CO-no-mics","B":"e-co-NO-mics","C":"ec-o-NOM-ics","D":"EC-o-nom-ics"},a:"C",e:"Economics: stress on third syllable — ec-o-NOM-ics."},
  {id:"e030",s:"Use of English",y:2024,t:"Novel - The Lekki Headmaster",d:"Medium",q:"The Lekki Headmaster is set in",o:{"A":"Rural northern village","B":"Lagos suburban school","C":"Abuja office","D":"British university"},a:"B",e:"Rotimi Ogundimu: Lekki area of Lagos, exploring school administration and community."},
  {id:"e031",s:"Use of English",y:2010,t:"Lexis and Structure",d:"Hard",q:"Correct sentence: The committee _______ reached its decision.",o:{"A":"have","B":"has","C":"are","D":"were"},a:"B",e:"Committee: collective noun takes singular verb (has) in formal English."},
  {id:"e032",s:"Use of English",y:2011,t:"Comprehension",d:"Medium",q:"A passage arguing for and against a proposition is",o:{"A":"Narrative","B":"Expository","C":"Argumentative/Discursive","D":"Descriptive"},a:"C",e:"Discursive essay: presents multiple perspectives before reaching conclusion."},
  {id:"e033",s:"Use of English",y:2012,t:"Novel - The Potter's Wheel",d:"Hard",q:"Potter's Wheel as title metaphorically represents",o:{"A":"Industrial production","B":"School shaping students like clay","C":"Obu's father's job","D":"Traditional craft"},a:"B",e:"Potter shapes clay → school shapes/moulds students, sometimes painfully."},
  {id:"e034",s:"Use of English",y:2013,t:"Oral English",d:"Easy",q:"Syllables in international are",o:{"A":"4","B":"5","C":"6","D":"3"},a:"B",e:"in-ter-na-tion-al = 5 syllables."},
  {id:"e035",s:"Use of English",y:2014,t:"Lexis and Structure",d:"Medium",q:"Medicine should be taken _______ meals.",o:{"A":"at","B":"in","C":"after","D":"by"},a:"C",e:"After meals: correct medical instruction collocation."},
  {id:"e036",s:"Use of English",y:2015,t:"Oral English",d:"Medium",q:"Homophone of knight is",o:{"A":"Night","B":"Knit","C":"Bright","D":"Right"},a:"A",e:"Knight /naɪt/ and night /naɪt/ are homophones."},
  {id:"e037",s:"Use of English",y:2016,t:"Lexis and Structure",d:"Medium",q:"I would rather _______ than lie.",o:{"A":"to stay silent","B":"staying silent","C":"stay silent","D":"have stayed silent"},a:"C",e:"Would rather + base form (no to): I would rather stay silent."},
  {id:"e038",s:"Use of English",y:2017,t:"Novel - In Dependence",d:"Medium",q:"Nigeria gained independence in",o:{"A":"1957","B":"1960","C":"1963","D":"1966"},a:"B",e:"Nigeria: independence 1 October 1960 — pivotal backdrop of In Dependence."},
  {id:"e039",s:"Use of English",y:2018,t:"Novel - Sweet Sixteen",d:"Medium",q:"Main narrative device in Sweet Sixteen is",o:{"A":"Flashback","B":"Father-daughter conversations","C":"Letters between friends","D":"Dream sequence"},a:"B",e:"Structure: series of conversations between Aliya and her father on her 16th birthday."},
  {id:"e040",s:"Use of English",y:2019,t:"Lexis and Structure",d:"Medium",q:"Odd one out: huge, enormous, gigantic, tiny",o:{"A":"Huge","B":"Enormous","C":"Tiny","D":"Gigantic"},a:"C",e:"Huge, enormous, gigantic = very large. Tiny = very small — odd one out."},
  {id:"e041",s:"Use of English",y:2020,t:"Oral English",d:"Hard",q:"gh is silent in",o:{"A":"Ghost","B":"Cough","C":"Though","D":"Rough"},a:"C",e:"Though: /ðoʊ/ — gh completely silent. Ghost: g silent. Cough/rough: gh = /f/."},
  {id:"e042",s:"Use of English",y:2021,t:"Comprehension",d:"Medium",q:"Alliteration repeats",o:{"A":"Vowel sounds","B":"Initial consonant sounds in connected words","C":"Entire phrases","D":"Rhyming end words"},a:"B",e:"Alliteration: repeated initial consonant sounds — Peter Piper picked..."},
  {id:"e043",s:"Use of English",y:2022,t:"Lexis and Structure",d:"Medium",q:"Correctly spelt word is",o:{"A":"Accomodation","B":"Accommadation","C":"Accommodation","D":"Acommodation"},a:"C",e:"Accommodation: double c, double m."},
  {id:"e044",s:"Use of English",y:2023,t:"Novel - The Life Changer",d:"Medium",q:"The Life Changer was authored by",o:{"A":"Wole Soyinka","B":"Khadija Abubakar Jalli","C":"Chimamanda Ngozi Adichie","D":"Chinua Achebe"},a:"B",e:"Khadija Abubakar Jalli wrote The Life Changer — prescribed for JAMB 2021-2024."},
  {id:"e045",s:"Use of English",y:2024,t:"Lexis and Structure",d:"Medium",q:"Word nearest in meaning to OBSTINATE is",o:{"A":"Flexible","B":"Stubborn","C":"Obedient","D":"Timid"},a:"B",e:"Obstinate means stubbornly refusing to change — synonym: stubborn, headstrong."},
  {id:"e046",s:"Use of English",y:2010,t:"Oral English",d:"Medium",q:"In which word is stress on FIRST syllable?",o:{"A":"comPUTE","B":"PHOtograph","C":"econOMICS","D":"adoLEScent"},a:"B",e:"PHO-to-graph: primary stress on first syllable."},
  {id:"e047",s:"Use of English",y:2011,t:"Comprehension",d:"Easy",q:"A simile compares two things using",o:{"A":"is or are","B":"like or as","C":"No connective","D":"Apostrophe"},a:"B",e:"Simile: She is like a rose. He ran as fast as the wind."},
  {id:"e048",s:"Use of English",y:2012,t:"Lexis and Structure",d:"Medium",q:"EPHEMERAL means",o:{"A":"Permanent","B":"Lasting only a short time","C":"Enormous","D":"Mysterious"},a:"B",e:"Ephemeral: lasting for a very short time. e.g., ephemeral beauty of morning dew."},
  {id:"e049",s:"Use of English",y:2013,t:"Novel - The Potter's Wheel",d:"Medium",q:"Author of The Potter's Wheel is",o:{"A":"Wole Soyinka","B":"Chinua Achebe","C":"T.M. Aluko","D":"Chukwuemeka Ike"},a:"D",e:"Chukwuemeka Ike wrote The Potter's Wheel. Prescribed for JAMB 2010-2012."},
  {id:"e050",s:"Use of English",y:2014,t:"Oral English",d:"Hard",q:"Which pair are homophones?",o:{"A":"Fair / fare","B":"Bit / beat","C":"Sit / set","D":"Cot / coat"},a:"A",e:"Fair /fɛː/ and fare /fɛː/ are homophones — same sound, different meaning/spelling."},
  {id:"e051",s:"Use of English",y:2015,t:"Lexis and Structure",d:"Medium",q:"LOQUACIOUS means",o:{"A":"Silent","B":"Talkative","C":"Angry","D":"Clever"},a:"B",e:"Loquacious: tending to talk a great deal — garrulous, verbose."},
  {id:"e052",s:"Use of English",y:2016,t:"Comprehension",d:"Medium",q:"Hyperbole is",o:{"A":"Saying opposite of what you mean","B":"Gross exaggeration for effect","C":"Comparison using like or as","D":"Giving human qualities to objects"},a:"B",e:"Hyperbole: I have told you a million times! Exaggeration for emphasis."},
  {id:"e053",s:"Use of English",y:2017,t:"Lexis and Structure",d:"Medium",q:"TACITURN means",o:{"A":"Talkative","B":"Reserved, saying little","C":"Aggressive","D":"Happy"},a:"B",e:"Taciturn: reserved, not inclined to talk. Opposite of loquacious."},
  {id:"e054",s:"Use of English",y:2018,t:"Novel - Sweet Sixteen",d:"Medium",q:"Sweet Sixteen was written by",o:{"A":"Khadija Jalli","B":"Sarah Ladipo Manyika","C":"Bolaji Abdullahi","D":"Chukwuemeka Ike"},a:"C",e:"Bolaji Abdullahi wrote Sweet Sixteen. Prescribed for JAMB 2019-2020."},
  {id:"e055",s:"Use of English",y:2019,t:"Oral English",d:"Medium",q:"INCESSANT means",o:{"A":"Occasional","B":"Continuous and uninterrupted","C":"Silent","D":"Brief"},a:"B",e:"Incessant: never stopping — incessant rain, incessant noise."},
  {id:"e056",s:"Use of English",y:2020,t:"Lexis and Structure",d:"Hard",q:"Which sentence has correct pronoun-antecedent agreement?",o:{"A":"Everyone must bring their own lunch","B":"Everyone must bring his or her own lunch","C":"Everyone must bring its own lunch","D":"Everyone must bring our own lunch"},a:"B",e:"Everyone is singular. His or her is the formal correct agreement."},
  {id:"e057",s:"Use of English",y:2021,t:"Comprehension",d:"Medium",q:"Onomatopoeia refers to words that",o:{"A":"Rhyme with each other","B":"Sound like what they describe","C":"Are repeated for emphasis","D":"Have opposite meanings"},a:"B",e:"Onomatopoeia: buzz, hiss, crash, bang — words that imitate the sounds they describe."},
  {id:"e058",s:"Use of English",y:2022,t:"Oral English",d:"Medium",q:"Word with stress on second syllable from this group is",o:{"A":"TAble","B":"PENcil","C":"beCAUSE","D":"REcord (noun)"},a:"C",e:"Because: be-CAUSE — stress on second syllable."},
  {id:"e059",s:"Use of English",y:2023,t:"Lexis and Structure",d:"Medium",q:"PERNICIOUS means",o:{"A":"Beneficial","B":"Harmful in a subtle or gradual way","C":"Obvious","D":"Temporary"},a:"B",e:"Pernicious: having a harmful effect, especially in a gradual and subtle way."},
  {id:"e060",s:"Use of English",y:2024,t:"Novel - The Lekki Headmaster",d:"Medium",q:"Author of The Lekki Headmaster is",o:{"A":"Wole Soyinka","B":"Khadija Jalli","C":"Rotimi Ogundimu","D":"Chinua Achebe"},a:"C",e:"Rotimi Ogundimu wrote The Lekki Headmaster — prescribed for JAMB 2025."}
];

// ============ FIXED STORAGE FUNCTIONS - Uses localStorage that works in APK ============
const initStore = () => ({ 
  sessions: [], 
  subjectStats: {}, 
  topicStats: {}, 
  totalQ: 0, 
  totalC: 0 
});

async function loadStore() {
  try {
    const saved = localStorage.getItem(SKEY);
    console.log('Loading data from localStorage:', saved ? 'found' : 'none');
    return saved ? JSON.parse(saved) : initStore();
  } catch (e) {
    console.error('Load store error:', e);
    return initStore();
  }
}

async function saveStore(s) {
  try {
    localStorage.setItem(SKEY, JSON.stringify(s));
    console.log('Data saved to localStorage successfully');
    return true;
  } catch (e) {
    console.error('Save store error:', e);
    return false;
  }
}

async function clearStore() {
  try {
    localStorage.removeItem(SKEY);
    console.log('Data cleared from localStorage');
  } catch (e) {
    console.error('Clear store error:', e);
  }
}
// ============ END FIXED STORAGE FUNCTIONS ============

async function recordSession(session){
  const s = await loadStore();
  s.sessions = [session, ...s.sessions].slice(0, 100);
  s.totalQ += session.total;
  s.totalC += session.correct;
  
  Object.entries(session.bySubject).forEach(([sub, d]) => {
    if(!s.subjectStats[sub]) s.subjectStats[sub] = { correct: 0, total: 0, sessions: 0 };
    s.subjectStats[sub].correct += d.correct;
    s.subjectStats[sub].total += d.total;
    s.subjectStats[sub].sessions += 1;
  });
  
  session.topicResults.forEach(t => {
    const k = `${t.subject}__${t.topic}`;
    if(!s.topicStats[k]) s.topicStats[k] = { subject: t.subject, topic: t.topic, correct: 0, total: 0 };
    s.topicStats[k].correct += t.correct;
    s.topicStats[k].total += t.total;
  });
  
  await saveStore(s);
  return s;
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
function shuffle(a){ const b=[...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b; }
function fmtDate(iso){ try{return new Date(iso).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});}catch{return "";} }
function fmtSecs(s){ const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60; if(h>0)return`${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`; return`${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`; }
function getScore(correct,total){ return total?Math.round((correct/total)*(MARKS_TOTAL)):0; }
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
    const order=["Use of English","Biology","Chemistry","Physics"];
    const perSubject=cfg.perSubject||10;
    let out=[];
    order.forEach(sub=>{ out=out.concat(shuffle([...bank].filter(q=>q.s===sub)).slice(0,perSubject)); });
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
  };
  return icons[n]||null;
}

// ─── CSS ──────────────────────────────────────────────────────────────────
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

// ─── MAIN APP COMPONENT ─────────────────────────────────────────────────────────────────
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

  useEffect(()=>{
    loadStore().then(s=>{
      setStore(s);
      setLoaded(true);
      console.log('App loaded with', s.sessions.length, 'sessions saved');
    });
  },[]);

  const timer=useTimer(UTME_SECS,()=>doSubmit(true));

  function goTab(t){
    setTab(t);
    const m={home:"home",practice:"select",stats:"stats",settings:"settings"};
    setScreen(m[t]||"home");
  }

  function startExam(cfg){
    const qs=buildExam(cfg.mode,cfg,QB);
    if(!qs.length) return;
    setQuestions(qs); setCurrentQ(0); setAnswers({}); setFlagged(new Set()); setRevealed({});
    setResult(null); setExamCfg(cfg);
    const dur=cfg.mode==="mixed"?UTME_SECS:Math.max(qs.length*90,600);
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
      subject:examCfg.subject,year:examCfg.year,correct,total:questions.length,
      score:getScore(correct,questions.length),pct:pct(correct,questions.length),
      bySubject,topicResults:tr,auto};
    setResult({correct,total:questions.length,bySubject,score:session.score,pct:session.pct});
    const updated=await recordSession(session);
    setStore(updated); setScreen("result");
  }

  const cls=dark?"app":"app light";

  return(
    <>
      <style>{CSS}</style>
      <div className={cls}>
        {screen==="landing"  && <Landing onStart={()=>setScreen("home")} dark={dark}/>}
        {screen==="home"     && <HomeScreen store={store} loaded={loaded} setScreen={setScreen}/>}
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

// ─── LANDING SCREEN ──────────────────────────────────────────────────────────────────
function Landing({onStart,dark}){
  return(
    <div style={{width:48,height:48,borderRadius:"var(--r)",background:"linear-gradient(135deg,var(--blue),var(--purple))",
  display:"flex",alignItems:"center",justifyContent:"center"}}>
  <img src="/icon-192.png" alt="Rooster" style={{width:40,height:40,borderRadius:12}}/>
</div>
        <div style={{fontSize:52,fontWeight:900,letterSpacing:-2,lineHeight:1,marginBottom:8,
          background:"linear-gradient(135deg,var(--text) 40%,var(--blue))",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
          {APP}
        </div>
        <div style={{fontSize:14,fontWeight:600,color:"var(--text3)",letterSpacing:.5,marginBottom:48}}>
          {TAGLINE}
        </div>
        <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:8,marginBottom:48,maxWidth:320}}>
          {["2010 – 2025","4 Subjects","400+ Questions","Offline","Timed Exam","Full Review"].map(f=>(
            <span key={f} style={{padding:"6px 14px",borderRadius:999,background:"var(--bg3)",
              border:"1px solid var(--border2)",fontSize:12,fontWeight:700,color:"var(--text2)"}}>
              {f}
            </span>
          ))}
        </div>
        <div style={{display:"flex",gap:12,marginBottom:48}}>
          {Object.entries(SC).map(([s,c])=>(
            <div key={s} style={{width:10,height:10,borderRadius:"50%",background:c,
              boxShadow:`0 0 8px ${c}88`}}/>
          ))}
        </div>
        <button className="btn bp" style={{maxWidth:280,borderRadius:999,fontSize:16,
          padding:"16px 40px",boxShadow:"0 8px 24px rgba(79,124,255,.35)"}}
          onClick={onStart}>
          <I n="play" sz={18} c="#fff"/> Start Practising
        </button>
        <div style={{marginTop:48,fontSize:11,color:"var(--text3)",fontWeight:600,letterSpacing:.3}}>
          Rooster by frNtcOda
        </div>
      </div>
    </div>
  );
}

// ─── HOME SCREEN ──────────────────────────────────────────────────────────────────
function HomeScreen({store,loaded,setScreen}){
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
            {APP} <span style={{color:"var(--blue)"}}>CBT</span>
          </div>
        </div>
<div style={{width:80,height:80,borderRadius:24,
  display:"flex",alignItems:"center",justifyContent:"center",marginBottom:28,
  boxShadow:"0 8px 32px rgba(79,124,255,.35)"}}>
  <img src="/icon-192.png" alt="Rooster CBT" style={{width:80,height:80,borderRadius:24}}/>
</div>
        </div>
      </div>

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
                <div style={{fontSize:11,color:"var(--text3)",fontWeight:600,marginBottom:2}}>Attempts</div>
                <div style={{fontSize:28,fontWeight:800,fontFamily:"var(--mono)"}}>{totalQ}</div>
              </div>
            </div>
            <div className="prog"><div className="pf" style={{width:`${avg}%`,background:"linear-gradient(90deg,var(--blue),var(--purple))"}}/></div>
            <div style={{fontSize:11,color:"var(--text3)",marginTop:6}}>{sessions.length} session{sessions.length!==1?"s":""} · {totalC} correct from {totalQ} questions</div>
          </>
        ):(
          <div style={{fontSize:13,color:"var(--text3)",textAlign:"center",lineHeight:1.7}}>
            No sessions yet. Start practising to track your progress.
          </div>
        )}
      </div>

      {Object.keys(subjStats).length>0&&(
        <>
          <div className="lbl">Subject Performance</div>
          <div className="sgrid" style={{marginBottom:20}}>
            {["Biology","Physics","Chemistry","Use of English"].filter(s=>subjStats[s]).map(s=>{
              const d=subjStats[s]; const p=pct(d.correct,d.total);
              return(
                <div key={s} className="card" style={{padding:"14px"}}>
                  <div style={{fontSize:11,fontWeight:700,color:SC[s],marginBottom:6}}>{s.replace("Use of ","Eng.")}</div>
                  <div style={{fontSize:22,fontWeight:800,fontFamily:"var(--mono)",marginBottom:6,color:p>=50?"var(--text)":"var(--red)"}}>{p}%</div>
                  <div className="prog"><div className="pf" style={{width:`${p}%`,background:SC[s]}}/></div>
                  <div style={{fontSize:10,color:"var(--text3)",marginTop:4,fontWeight:600}}>{d.correct}/{d.total}</div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="lbl">Start Practising</div>
      {[
        {l:"By Subject",sub:"Pick a subject and year",n:"book"},
        {l:"By Year",sub:"All subjects from one year",n:"grid"},
        {l:"Mixed Practice",sub:"All 4 subjects · 10 each = 40 total",n:"chart"},
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
                  {s.mode==="mixed"?"Mixed":s.mode==="year"?`Year ${s.year}`:s.subject}{s.mode==="subject"&&s.year?` · ${s.year}`:""}
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

// ─── SELECT SCREEN ──────────────────────────────────────────────────────────────────
function SelectScreen({startExam,setScreen}){
  const [mode,setMode]=useState("subject");
  const [subject,setSubject]=useState("Biology");
  const [year,setYear]=useState(null);
  const [count,setCount]=useState(40);

  return(
    <div className="screen fade">
      <div className="row" style={{marginBottom:22}}>
        <div style={{fontSize:18,fontWeight:800}}>Configure Exam</div>
        <button className="btn bg bsm" onClick={()=>setScreen("home")}><I n="x" sz={14}/></button>
      </div>

      <div className="lbl">Mode</div>
      <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
        {[{id:"subject",l:"By Subject"},{id:"year",l:"By Year"},{id:"mixed",l:"Mixed"}].map(m=>(
          <button key={m.id} className={`chip ${mode===m.id?"on":""}`} onClick={()=>setMode(m.id)}>{m.l}</button>
        ))}
      </div>

      {mode==="mixed"&&(
        <div className="card-acc" style={{marginBottom:20}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:8}}>Mixed Practice</div>
          <div style={{fontSize:13,color:"var(--text3)",lineHeight:1.9}}>
            Questions from all 4 subjects in order:<br/>
            Use of English → Biology → Chemistry → Physics<br/>
            10 questions per subject = 40 total · 105 minutes
          </div>
        </div>
      )}

      {mode==="subject"&&(
        <>
          <div className="lbl">Subject</div>
          <div className="sgrid">
            {Object.keys(SC).map(s=>(
              <div key={s} className="sc" style={{background:`${SC[s]}10`,border:`2px solid ${subject===s?SC[s]:SC[s]+"22"}`}}
                onClick={()=>setSubject(s)}>
                <div style={{fontSize:12,fontWeight:700,marginBottom:4,color:subject===s?SC[s]:"var(--text)"}}>{s}</div>
                <div style={{fontSize:11,color:"var(--text3)"}}>{QB.filter(q=>q.s===s).length} questions</div>
              </div>
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

      <button className="btn bp" onClick={()=>startExam({mode,subject,year,count,perSubject:10})}>
        <I n="play" sz={15} c="#fff"/> Begin Exam
      </button>
    </div>
  );
}

// ─── EXAM SCREEN ──────────────────────────────────────────────────────────────────
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
          {examCfg.mode==="mixed"?
            ["Use of English","Biology","Chemistry","Physics"].map(sub=>{
              const idxs=questions.reduce((acc,q_,i)=>q_.s===sub?[...acc,i]:acc,[]);
              if(!idxs.length) return null;
              return(
                <div key={sub} style={{marginBottom:12}}>
                  <div style={{fontSize:10,fontWeight:700,color:SC[sub],letterSpacing:.5,textTransform:"uppercase",marginBottom:6}}>{sub}</div>
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
          <span style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:999,color:SC[q.s],background:SC[q.s]+"14"}}>{q.s}</span>
          <span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:999,color:"var(--text3)",background:"var(--bg3)"}}>{q.t}</span>
          <span className={`bdg ${diffCls}`}>{q.d}</span>
          <span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:999,color:"var(--text3)",background:"var(--bg3)",fontFamily:"var(--mono)"}}>{q.y}</span>
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"14px 16px 0"}}>
        {isNewSubj&&(
          <div className="sub-break" style={{background:SC[q.s]+"12",border:`1px solid ${SC[q.s]}30`}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:SC[q.s],flexShrink:0}}/>
            <div>
              <div style={{fontSize:10,color:"var(--text3)",fontWeight:600}}>Now starting</div>
              <div style={{fontSize:14,fontWeight:700,color:SC[q.s]}}>{q.s}</div>
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

// ─── RESULT SCREEN ──────────────────────────────────────────────────────────────────
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
          <div style={{fontSize:10,color:"var(--text3)",fontWeight:700}}>out of {MARKS_TOTAL}</div>
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
                  <div style={{fontSize:13,fontWeight:800,color:SC[sub],fontFamily:"var(--mono)"}}>{sp}%</div>
                </div>
                <div className="prog"><div className="pf" style={{width:`${sp}%`,background:SC[sub]}}/></div>
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

// ─── REVIEW SCREEN ──────────────────────────────────────────────────────────────────
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

// ─── STATS SCREEN ──────────────────────────────────────────────────────────────────
function StatsScreen({store,loaded}){
  if(!loaded) return <div className="screen"><div className="empty"><p>Loading...</p></div></div>;
  const sessions=store?.sessions||[];
  const topicStats=store?.topicStats||{};
  const subjStats=store?.subjectStats||{};
  const totalQ=store?.totalQ||0; const totalC=store?.totalC||0;

  if(!sessions.length) return(
    <div className="screen fade">
      <div style={{fontSize:18,fontWeight:800,marginBottom:24}}>Statistics</div>
      <div className="empty"><I n="chart" sz={34} c="var(--text3)"/><p>No data yet. Complete a session to see your performance statistics.</p></div>
    </div>
  );

  const avg=totalQ?pct(totalC,totalQ):0;
  const avgScore=totalQ?getScore(totalC,totalQ):0;
  const weak=Object.values(topicStats).filter(t=>t.total>=2)
    .map(t=>({...t,score:pct(t.correct,t.total)})).sort((a,b)=>a.score-b.score).slice(0,5);

  return(
    <div className="screen fade">
      <div style={{fontSize:18,fontWeight:800,marginBottom:20}}>Statistics</div>
      <div className="card-acc" style={{marginBottom:20,textAlign:"center"}}>
        <div className="lbl" style={{marginBottom:4}}>Overall Average</div>
        <div style={{fontSize:44,fontWeight:800,color:avg>=50?"var(--blue)":"var(--red)",fontFamily:"var(--mono)"}}>{avgScore}<span style={{fontSize:16,color:"var(--text3)",fontWeight:600}}>/400</span></div>
        <div style={{fontSize:12,color:"var(--text3)",marginTop:4}}>{totalC} correct from {totalQ} questions · {sessions.length} session{sessions.length>1?"s":""}</div>
      </div>

      {Object.keys(subjStats).length>0&&(
        <>
          <div className="lbl">Subject Performance</div>
          {["Biology","Physics","Chemistry","Use of English"].filter(s=>subjStats[s]).map(s=>{
            const d=subjStats[s]; const sp=pct(d.correct,d.total);
            const status=sp>=70?"Strong":sp>=50?"Improving":"Needs Focus";
            return(
              <div key={s} className="card" style={{marginBottom:10}}>
                <div className="row" style={{marginBottom:8}}>
                  <div style={{fontWeight:700,fontSize:14}}>{s}</div>
                  <span style={{fontFamily:"var(--mono)",fontWeight:800,color:SC[s],fontSize:15}}>{sp}%</span>
                </div>
                <div className="prog"><div className="pf" style={{width:`${sp}%`,background:SC[s]}}/></div>
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
              {s.mode==="mixed"?"Mixed":s.mode==="year"?`Year ${s.year}`:s.subject}{s.mode==="subject"&&s.year?` · ${s.year}`:""}
            </div>
            <div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>{s.correct}/{s.total} correct · {fmtDate(s.date)}</div>
          </div>
          <span className={`bdg ${s.pct>=50?"bok":"bfail"}`}>{s.pct>=70?"Pass":s.pct>=50?"Fair":"Fail"}</span>
        </div>
      ))}
    </div>
  );
}

// ─── SETTINGS SCREEN ──────────────────────────────────────────────────────────────────
function SettingsScreen({store,setStore,dark,setDark}){
  const [clearing,setClearing]=useState(false);
  const [done,setDone]=useState(false);
  const count=(store?.sessions||[]).length;

  async function handleClear(){
    setClearing(true); 
    await clearStore(); 
    setStore(initStore()); 
    setClearing(false);
    setDone(true); 
    setTimeout(()=>setDone(false),3000);
  }

  const rows=[
    {l:"App",v:`${APP} — ${TAGLINE}`},
    {l:"Years Covered",v:"2010 – 2025"},
    {l:"Subjects",v:"Biology, Physics, Chemistry, Use of English"},
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
          Your session history and performance data are stored locally in your browser. No data is sent to any server.
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
        {APP} by frNtcOda
      </div>
    </div>
  );
}
