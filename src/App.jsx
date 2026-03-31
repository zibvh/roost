import { useState, useEffect, useRef, useCallback } from "react";

const APP = "Rooster";
const TAGLINE = "JAMB UTME Exam Simulator";
const VERSION = "2.2.3";
const GITHUB_REPO = "zibvh/roost"; // ← replace with your actual repo
const UTME_SECS = 105 * 60;
const MARKS_TOTAL = 400;
const SKEY = "rooster_v2";
const YEARS = Array.from({length:16},(_,i)=>2010+i);

// Subject colours
const SC = {
  "Use of English":   "#a855f7",
  "Mathematics":      "#06b6d4",
  "Biology":          "#22c55e",
  "Physics":          "var(--accent)",
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
  {id:"ac001",s:"Accounting",y:2010,t:"Financial Accounting",d:"Easy",q:"The accounting equation is",o:{A:"Assets = Capital + Liabilities",B:"Liabilities = Assets + Capital",C:"Capital = Assets + Liabilities",D:"Assets = Capital - Liabilities"},a:"A",e:"Fundamental equation: Assets = Capital + Liabilities."},
  {id:"ac002",s:"Accounting",y:2011,t:"Financial Accounting",d:"Easy",q:"Depreciation is the",o:{A:"An increase in asset value",B:"Reduction in value of a fixed asset over time",C:"An expense for maintenance",D:"Profit from selling assets"},a:"B",e:"Depreciation: systematic allocation of asset cost over its useful life."},
  {id:"ac003",s:"Accounting",y:2012,t:"Financial Accounting",d:"Medium",q:"A trial balance checks",o:{A:"Profit and loss",B:"Cash flow only",C:"The arithmetic accuracy of the ledger (debits = credits)",D:"Asset values"},a:"C",e:"Trial balance: tests if total debits = total credits."},
  {id:"ac004",s:"Accounting",y:2013,t:"Financial Accounting",d:"Easy",q:"Gross profit is calculated as",o:{A:"Revenue - All expenses",B:"Revenue + Cost of goods sold",C:"Cost of goods sold - Revenue",D:"Revenue - Cost of goods sold"},a:"D",e:"Gross profit = Net sales - Cost of Goods Sold."},
  {id:"ac005",s:"Accounting",y:2014,t:"Financial Accounting",d:"Medium",q:"Which of these is a current asset?",o:{A:"Cash and debtors",B:"Buildings",C:"Machinery",D:"Land"},a:"A",e:"Current assets: cash, debtors, stock; convertible to cash within a year."},
  {id:"ac006",s:"Accounting",y:2015,t:"Financial Accounting",d:"Easy",q:"A balance sheet shows",o:{A:"Cash inflows and outflows",B:"Assets, liabilities, and capital at a point in time",C:"Income and expenditure",D:"Revenue and expenses"},a:"B",e:"Balance sheet: financial position at a specific date."},
  {id:"ac007",s:"Accounting",y:2016,t:"Financial Accounting",d:"Medium",q:"The going concern concept assumes",o:{A:"A business will liquidate soon",B:"Profits are guaranteed",C:"A business will continue to operate for the foreseeable future",D:"All debts will be paid"},a:"C",e:"Going concern: financial statements prepared assuming business continuity."},
  {id:"ac008",s:"Accounting",y:2017,t:"Financial Accounting",d:"Hard",q:"Assets of N500,000 and liabilities of N200,000. Capital is",o:{A:"N700,000",B:"N200,000",C:"N100,000",D:"N300,000"},a:"D",e:"Capital = Assets - Liabilities = 500,000 - 200,000 = N300,000."},
  {id:"ac009",s:"Accounting",y:2018,t:"Financial Accounting",d:"Easy",q:"A creditor is",o:{A:"A person to whom the business owes money",B:"A person who owes tax",C:"An employee",D:"A person owed money by the business"},a:"A",e:"Creditor: entity to whom the business owes money (liability)."},
  {id:"ac010",s:"Accounting",y:2019,t:"Financial Accounting",d:"Medium",q:"Carriage inwards is",o:{A:"An income account",B:"Part of cost of sales (direct expense added to purchases)",C:"A liability",D:"A distribution expense"},a:"B",e:"Carriage inwards: cost of bringing goods in; part of cost of goods sold."},
  {id:"ac011",s:"Accounting",y:2020,t:"Financial Accounting",d:"Easy",q:"A debtor is",o:{A:"Someone the business owes",B:"A bank",C:"Someone who owes money to the business",D:"A government agency"},a:"C",e:"Debtor: customer who bought on credit; a current asset."},
  {id:"ac012",s:"Accounting",y:2021,t:"Financial Accounting",d:"Hard",q:"The prudence (conservatism) concept means",o:{A:"Record highest possible profits",B:"Defer all expenses",C:"Anticipate profits early",D:"Recognise losses as soon as probable; recognise profits only when realised"},a:"D",e:"Prudence: do not overstate assets or profits; recognise losses early."},
  {id:"ac013",s:"Accounting",y:2022,t:"Financial Accounting",d:"Medium",q:"Bad debts are debts that are",o:{A:"Written off as irrecoverable",B:"Paid in instalments",C:"Partially recovered",D:"Paid late"},a:"A",e:"Bad debt: uncollectable amount written off as an expense."},
  {id:"ac014",s:"Accounting",y:2023,t:"Financial Accounting",d:"Medium",q:"Capital expenditure refers to",o:{A:"Buying office supplies",B:"Spending on long-term assets that generate future benefits",C:"Day-to-day expenses",D:"Paying salaries"},a:"B",e:"Capital expenditure: purchase of fixed assets."},
  {id:"ac015",s:"Accounting",y:2024,t:"Financial Accounting",d:"Hard",q:"Opening stock N30k, purchases N70k, closing stock N20k. COGS =",o:{A:"N90,000",B:"N120,000",C:"N80,000",D:"N50,000"},a:"C",e:"COGS = Opening stock + Purchases - Closing stock = 30+70-20 = N80,000."},
  {id:"ac016",s:"Accounting",y:2010,t:"Financial Accounting",d:"Easy",q:"A sole trader's capital account records",o:{A:"Business loans",B:"Tax paid",C:"Salary expenses",D:"The owner's investment and withdrawals from the business"},a:"D",e:"Capital account: net investment by owner = assets - liabilities."},
  {id:"ac017",s:"Accounting",y:2011,t:"Financial Accounting",d:"Medium",q:"Accrued expenses are",o:{A:"Expenses incurred but not yet paid",B:"Expenses not required",C:"Prepaid expenses",D:"Expenses paid in advance"},a:"A",e:"Accruals: expenses recognised in period incurred even if not yet paid."},
  {id:"ac018",s:"Accounting",y:2012,t:"Financial Accounting",d:"Easy",q:"Net profit is",o:{A:"Revenue only",B:"Gross profit minus all other operating expenses",C:"Total sales",D:"Revenue minus cost of sales"},a:"B",e:"Net profit = Gross profit - All overheads."},
  {id:"ac019",s:"Accounting",y:2013,t:"Financial Accounting",d:"Medium",q:"The reducing balance method of depreciation",o:{A:"Charges equal amounts each year",B:"Ignores residual value",C:"Charges higher depreciation in early years",D:"Increases charges over time"},a:"C",e:"Reducing balance: constant % on book value; higher charge when asset is newer."},
  {id:"ac020",s:"Accounting",y:2014,t:"Financial Accounting",d:"Easy",q:"Prepaid expenses are",o:{A:"Expenses paid after they are due",B:"Bad debts",C:"Liabilities",D:"Expenses paid in advance; a current asset"},a:"D",e:"Prepayment: payment before the benefit is received; current asset."},
  {id:"ac021",s:"Accounting",y:2015,t:"Financial Accounting",d:"Medium",q:"A bank reconciliation statement is prepared to",o:{A:"Reconcile the cash book balance with the bank statement balance",B:"Calculate depreciation",C:"Estimate tax liability",D:"Report profit and loss"},a:"A",e:"Bank rec: identifies timing differences between cash book and bank statement."},
  {id:"ac022",s:"Accounting",y:2016,t:"Financial Accounting",d:"Easy",q:"Stock (inventory) is classified as a",o:{A:"Long-term liability",B:"Current asset",C:"Fixed asset",D:"Non-current asset"},a:"B",e:"Stock/inventory: short-term asset; expected to be sold within a year."},
  {id:"ac023",s:"Accounting",y:2017,t:"Financial Accounting",d:"Hard",q:"The accruals (matching) concept requires",o:{A:"Expenses paid before recorded",B:"Revenue recognised only when cash received",C:"Revenue and expenses recognised in the period earned or incurred",D:"Cash flow to match profits"},a:"C",e:"Matching concept: revenues matched with expenses incurred to earn them."},
  {id:"ac024",s:"Accounting",y:2018,t:"Financial Accounting",d:"Medium",q:"Goodwill is",o:{A:"A type of debtor",B:"An expense",C:"A current asset",D:"An intangible fixed asset representing business reputation"},a:"D",e:"Goodwill: intangible asset; excess of purchase price over fair value of net assets."},
  {id:"ac025",s:"Accounting",y:2019,t:"Financial Accounting",d:"Easy",q:"The double-entry principle states",o:{A:"Every debit has a corresponding credit",B:"Debit and credit must be unequal",C:"Assets always exceed liabilities",D:"Every transaction affects only one account"},a:"A",e:"Double entry: every transaction has equal and opposite debit and credit."},
  {id:"ac026",s:"Accounting",y:2020,t:"Financial Accounting",d:"Medium",q:"Drawings by a sole trader are",o:{A:"Business expenses",B:"Money or goods taken by the owner for personal use; reduces capital",C:"Business income",D:"An asset of the business"},a:"B",e:"Drawings: owner withdrawals reduce capital; not a business expense."},
  {id:"ac027",s:"Accounting",y:2021,t:"Financial Accounting",d:"Hard",q:"Working capital is",o:{A:"Fixed assets minus liabilities",B:"Total assets minus total liabilities",C:"Current assets minus current liabilities",D:"Net profit of the business"},a:"C",e:"Working capital = Current assets - Current liabilities."},
  {id:"ac028",s:"Accounting",y:2022,t:"Financial Accounting",d:"Easy",q:"Cash flow refers to",o:{A:"Profit earned from investments",B:"The value of fixed assets",C:"Tax paid by a business",D:"The movement of money in and out of a business"},a:"D",e:"Cash flow: all receipts and payments."},
  {id:"ac029",s:"Accounting",y:2023,t:"Financial Accounting",d:"Medium",q:"Return on capital employed (ROCE) measures",o:{A:"Profitability relative to capital invested",B:"Asset value",C:"Debt level",D:"Liquidity"},a:"A",e:"ROCE = (Net profit / Capital employed) x 100."},
  {id:"ac030",s:"Accounting",y:2024,t:"Financial Accounting",d:"Hard",q:"If acid test ratio is 0.8, this means",o:{A:"Current assets exceed liabilities",B:"The firm may have liquidity problems (less than 1 is risky)",C:"Profits are high",D:"The firm has no stock"},a:"B",e:"Acid test < 1: insufficient liquid assets to cover current liabilities."},
  {id:"ac031",s:"Accounting",y:2010,t:"Financial Accounting",d:"Easy",q:"Revenue expenditure refers to",o:{A:"Purchasing machinery",B:"Building an extension",C:"Day-to-day operating expenses like wages and rent",D:"Buying land"},a:"C",e:"Revenue expenditure: expenses for running the business."},
  {id:"ac032",s:"Accounting",y:2011,t:"Financial Accounting",d:"Medium",q:"A provision for bad debts is",o:{A:"A confirmed loss",B:"A cash payment",C:"An asset of the business",D:"An estimate of debts likely to become irrecoverable"},a:"D",e:"Provision for doubtful debts: prudence-based adjustment to debtors."},
  {id:"ac033",s:"Accounting",y:2012,t:"Financial Accounting",d:"Easy",q:"The income statement covers",o:{A:"One financial year (a period)",B:"Only non-cash transactions",C:"A specific point in time",D:"Only cash transactions"},a:"A",e:"Profit and loss account: covers a trading period not a point in time."},
  {id:"ac034",s:"Accounting",y:2013,t:"Financial Accounting",d:"Medium",q:"Straight-line depreciation charges",o:{A:"More in later years",B:"Equal amounts each year",C:"More in early years",D:"Random amounts"},a:"B",e:"Straight-line: cost minus residual value / useful life = same annual charge."},
  {id:"ac035",s:"Accounting",y:2014,t:"Financial Accounting",d:"Easy",q:"The ledger is",o:{A:"A type of trial balance",B:"A tax record",C:"The book containing all accounts of a business",D:"A bank statement"},a:"C",e:"Ledger: collection of all T-accounts."},
  {id:"ac036",s:"Accounting",y:2015,t:"Financial Accounting",d:"Hard",q:"FIFO (First In First Out) assumes",o:{A:"Goods valued at average cost",B:"All goods have the same cost",C:"Newest stock is sold first",D:"Oldest stock is sold first"},a:"D",e:"FIFO: first units purchased are first to be sold."},
  {id:"ac037",s:"Accounting",y:2016,t:"Financial Accounting",d:"Easy",q:"A receipt is",o:{A:"A written acknowledgement of money received",B:"A type of ledger",C:"A budget document",D:"A tax form"},a:"A",e:"Receipt: evidence of payment received."},
  {id:"ac038",s:"Accounting",y:2017,t:"Financial Accounting",d:"Medium",q:"Intangible assets include",o:{A:"Motor vehicles",B:"Goodwill, patents, and trademarks",C:"Machinery",D:"Land"},a:"B",e:"Intangible assets: no physical form; identifiable long-term value."},
  {id:"ac039",s:"Accounting",y:2018,t:"Financial Accounting",d:"Easy",q:"A partnership is a business owned by",o:{A:"A public company",B:"The government",C:"Two or more people sharing profits and losses",D:"A single person"},a:"C",e:"Partnership: 2-20 partners."},
  {id:"ac040",s:"Accounting",y:2019,t:"Financial Accounting",d:"Medium",q:"Liquidity means",o:{A:"High profit levels",B:"Large number of assets",C:"Low debt levels",D:"The ability to pay debts as they fall due"},a:"D",e:"Liquidity: availability of liquid assets to meet obligations."},
  {id:"ac041",s:"Accounting",y:2020,t:"Financial Accounting",d:"Easy",q:"The purchase day book records",o:{A:"All credit purchases before posting to the ledger",B:"Credit purchases",C:"Cash purchases",D:"Cash sales"},a:"A",e:"Purchase day book: book of prime entry for credit purchases."},
  {id:"ac042",s:"Accounting",y:2021,t:"Financial Accounting",d:"Medium",q:"The current ratio measures",o:{A:"Debt to equity",B:"Short-term liquidity: current assets / current liabilities",C:"Profitability",D:"Asset quality"},a:"B",e:"Current ratio = CA/CL; >1 means more liquid assets than short-term liabilities."},
  {id:"ac043",s:"Accounting",y:2022,t:"Financial Accounting",d:"Hard",q:"Opening capital N100k, profit N30k, drawings N15k. Closing capital =",o:{A:"N85,000",B:"N145,000",C:"N115,000",D:"N115,000"},a:"C",e:"Closing capital = 100,000 + 30,000 - 15,000 = N115,000."},
  {id:"ac044",s:"Accounting",y:2023,t:"Financial Accounting",d:"Medium",q:"Audit is the examination of financial statements by",o:{A:"The managing director",B:"Bank officials",C:"Tax authorities",D:"An independent qualified accountant giving an opinion on truth and fairness"},a:"D",e:"Audit: independent examination of accounts."},
  {id:"ac045",s:"Accounting",y:2024,t:"Financial Accounting",d:"Hard",q:"The concept of materiality means",o:{A:"Only information significant enough to influence decisions needs full disclosure",B:"Depreciation is always straight-line",C:"Small items always capitalised",D:"All transactions recorded identically"},a:"A",e:"Materiality: immaterial items can be treated as revenue even if capital."},
  {id:"ac046",s:"Accounting",y:2010,t:"Financial Accounting",d:"Easy",q:"A cash book records",o:{A:"Only credit transactions",B:"All cash and bank receipts and payments",C:"Stock movements",D:"Expenses only"},a:"B",e:"Cash book: combined record of cash and bank transactions."},
  {id:"ac047",s:"Accounting",y:2011,t:"Financial Accounting",d:"Medium",q:"The consistency concept requires",o:{A:"Using most profitable method each year",B:"Changing methods to show best results",C:"Using the same accounting methods from year to year",D:"Using different methods each year"},a:"C",e:"Consistency: same methods each period; enables meaningful comparison."},
  {id:"ac048",s:"Accounting",y:2012,t:"Financial Accounting",d:"Easy",q:"Trade payables appear on the balance sheet as a",o:{A:"Non-current asset",B:"Fixed asset",C:"Revenue item",D:"Current liability"},a:"D",e:"Trade payables: amounts owed to suppliers; settled within a year."},
  {id:"ac049",s:"Accounting",y:2013,t:"Financial Accounting",d:"Medium",q:"The realisation concept states revenue should be recognised",o:{A:"When goods are delivered or services are performed",B:"When order is placed",C:"When goods are produced",D:"When cash is received"},a:"A",e:"Realisation: revenue recognised when earned not when cash received."},
  {id:"ac050",s:"Accounting",y:2014,t:"Financial Accounting",d:"Hard",q:"Gearing ratio measures",o:{A:"Asset turnover speed",B:"The proportion of a firm's finance from long-term debt",C:"Profitability of operations",D:"Management effectiveness"},a:"B",e:"Gearing = Long-term debt / Capital employed x 100."},
  {id:"ac051",s:"Accounting",y:2015,t:"Financial Accounting",d:"Easy",q:"Revenue is best described as",o:{A:"Cash received by business",B:"Tax paid to government",C:"Income earned from the sale of goods or services",D:"Capital invested by owner"},a:"C",e:"Revenue: turnover and sales income; top line of income statement."},
  {id:"ac052",s:"Accounting",y:2016,t:"Financial Accounting",d:"Medium",q:"Imprest system is used in",o:{A:"Payroll accounting",B:"Long-term debt management",C:"Stock control",D:"Managing petty cash at a fixed float"},a:"D",e:"Imprest: petty cash float restored to fixed amount each period."},
  {id:"ac053",s:"Accounting",y:2017,t:"Financial Accounting",d:"Easy",q:"Profit and loss appropriation account is used in",o:{A:"Partnerships to divide profit among partners",B:"Government accounts",C:"Public companies",D:"Sole traders"},a:"A",e:"P&L appropriation account: distributes partnership profit."},
  {id:"ac054",s:"Accounting",y:2018,t:"Financial Accounting",d:"Hard",q:"Debt-to-equity ratio with N400k debt and N200k equity is",o:{A:"0.5",B:"2",C:"0.25",D:"4"},a:"B",e:"D/E ratio = 400,000 / 200,000 = 2."},
  {id:"ac055",s:"Accounting",y:2019,t:"Financial Accounting",d:"Medium",q:"Amortisation is depreciation applied to",o:{A:"Current assets",B:"Land",C:"Intangible fixed assets",D:"Cash reserves"},a:"C",e:"Amortisation: systematic write-off of intangible asset cost."},
  {id:"ac056",s:"Accounting",y:2020,t:"Financial Accounting",d:"Easy",q:"Nominal accounts record",o:{A:"Real assets",B:"Personal transactions",C:"Cash flows",D:"Income, expenses, gains, and losses"},a:"D",e:"Nominal (temporary) accounts: closed at year-end to profit and loss."},
  {id:"ac057",s:"Accounting",y:2021,t:"Financial Accounting",d:"Medium",q:"The sales day book is a book of prime entry for",o:{A:"Credit sales before posting to the ledger",B:"Purchase returns",C:"Cash purchases",D:"Cash sales"},a:"A",e:"Sales day book: records all credit sales chronologically."},
  {id:"ac058",s:"Accounting",y:2022,t:"Financial Accounting",d:"Hard",q:"Revenue N500k, COGS N300k, overheads N100k. Net profit =",o:{A:"N200,000",B:"N100,000",C:"N300,000",D:"N400,000"},a:"B",e:"Net profit = 500,000 - 300,000 - 100,000 = N100,000."},
  {id:"ac059",s:"Accounting",y:2023,t:"Financial Accounting",d:"Easy",q:"Fixed assets are assets that are",o:{A:"Without value",B:"Held for short-term resale",C:"Held long-term for use in the business",D:"Intangible only"},a:"C",e:"Fixed (non-current) assets: land, buildings, machinery used over multiple years."},
  {id:"ac060",s:"Accounting",y:2024,t:"Financial Accounting",d:"Medium",q:"A debit note is issued by the buyer to",o:{A:"Accept goods in full",B:"Request a cash refund",C:"Apply for a loan",D:"Inform the seller of a return or overcharge"},a:"D",e:"Debit note: buyer notifies seller of returned goods or overcharge."},
  {id:"ac061",s:"Accounting",y:2010,t:"Financial Accounting",d:"Easy",q:"Cash discount is given for",o:{A:"Early payment of a debt",B:"Loyalty",C:"Advertising",D:"Bulk purchase"},a:"A",e:"Cash discount: incentive for prompt payment."},
  {id:"ac062",s:"Accounting",y:2011,t:"Financial Accounting",d:"Medium",q:"Reserves in a company's balance sheet represent",o:{A:"Long-term loans",B:"Retained profits and other equity not distributed as dividend",C:"Physical cash reserves",D:"Money owed to creditors"},a:"B",e:"Reserves: retained earnings and other comprehensive income."},
  {id:"ac063",s:"Accounting",y:2012,t:"Financial Accounting",d:"Easy",q:"A credit note is issued by a seller to",o:{A:"Demand payment",B:"Record a purchase",C:"Reduce the amount owed by a buyer for returns or overcharge",D:"Acknowledge a debt owed to them"},a:"C",e:"Credit note: reduces buyer's debt; cancels or adjusts an invoice."},
  {id:"ac064",s:"Accounting",y:2013,t:"Financial Accounting",d:"Hard",q:"Deferred tax arises from",o:{A:"Overstated revenue",B:"Fraudulent accounting",C:"Under-reported profits",D:"Timing differences between accounting profit and taxable profit"},a:"D",e:"Deferred tax: temporary timing differences between accounting and tax."},
  {id:"ac065",s:"Accounting",y:2014,t:"Financial Accounting",d:"Medium",q:"In club accounts, the excess of income over expenditure is called",o:{A:"Surplus",B:"Net profit",C:"Capital",D:"Gross profit"},a:"A",e:"Club accounts use surplus (income > expenditure) rather than profit."},
  {id:"ac066",s:"Accounting",y:2015,t:"Financial Accounting",d:"Easy",q:"Opening stock + Purchases - Closing stock =",o:{A:"Net profit",B:"Cost of goods sold",C:"Revenue",D:"Gross profit"},a:"B",e:"COGS = Opening stock + Purchases - Closing stock."},
  {id:"ac067",s:"Accounting",y:2016,t:"Financial Accounting",d:"Medium",q:"The purchase returns account records",o:{A:"Goods bought on credit",B:"Extra purchases",C:"Goods returned to suppliers",D:"Cash refunds received"},a:"C",e:"Purchase returns (returns outward): goods sent back to suppliers."},
  {id:"ac068",s:"Accounting",y:2017,t:"Financial Accounting",d:"Medium",q:"A fixed budget",o:{A:"Adjusts with actual output",B:"Is revised monthly",C:"Cannot be prepared in advance",D:"Does not change with changes in output level"},a:"D",e:"Fixed budget: prepared for a single activity level."},
  {id:"ac069",s:"Accounting",y:2018,t:"Financial Accounting",d:"Hard",q:"Activity-based costing (ABC) allocates overheads based on",o:{A:"Cost drivers (activities that cause costs)",B:"Time only",C:"Fixed rates per unit",D:"Number of employees"},a:"A",e:"ABC: assigns overhead to products based on activities consuming resources."},
  {id:"ac070",s:"Accounting",y:2019,t:"Financial Accounting",d:"Easy",q:"A journal entry records transactions",o:{A:"Only in banks",B:"Before they are posted to the ledger",C:"In stock records only",D:"Before paying tax"},a:"B",e:"Journal: book of prime entry; each entry has debit and credit with narration."},
  {id:"ac071",s:"Accounting",y:2020,t:"Financial Accounting",d:"Medium",q:"The acid test ratio excludes stock because",o:{A:"Stock can be sold easily",B:"Stock earns interest",C:"Stock may not be quickly convertible to cash",D:"Stock has no value"},a:"C",e:"Acid test = (CA - Stock) / CL; stock excluded as least liquid."},
  {id:"ac072",s:"Accounting",y:2021,t:"Financial Accounting",d:"Easy",q:"A limited company is owned by",o:{A:"One person",B:"The government only",C:"The bank",D:"Shareholders who have limited liability"},a:"D",e:"Limited company: shareholders' liability limited to paid-up share capital."},
  {id:"ac073",s:"Accounting",y:2022,t:"Financial Accounting",d:"Hard",q:"Earnings per share (EPS) =",o:{A:"Net profit / Number of shares",B:"Net profit / Number of employees",C:"Total dividends / Revenue",D:"Total profit / Total assets"},a:"A",e:"EPS = Profit after tax / Number of ordinary shares."},
  {id:"ac074",s:"Accounting",y:2023,t:"Financial Accounting",d:"Medium",q:"Carriage outwards is",o:{A:"An income item",B:"A selling expense paid by seller to deliver goods to customers",C:"A capital expense",D:"Part of cost of sales"},a:"B",e:"Carriage outwards: delivery cost to customers; shown below gross profit."},
  {id:"ac075",s:"Accounting",y:2024,t:"Financial Accounting",d:"Easy",q:"The sales returns account records",o:{A:"Sales made on credit",B:"Cash sales",C:"Goods returned by customers to the business",D:"Bad debts"},a:"C",e:"Sales returns (returns inward): goods returned by customers."},
  {id:"ac076",s:"Accounting",y:2010,t:"Financial Accounting",d:"Medium",q:"Profitability ratios measure",o:{A:"How quickly assets are used",B:"Ability to pay debts",C:"Market share",D:"The ability of a business to generate profit relative to sales or capital"},a:"D",e:"Profitability ratios: gross profit %, net profit %, ROCE."},
  {id:"ac077",s:"Accounting",y:2011,t:"Financial Accounting",d:"Easy",q:"An asset is",o:{A:"A resource owned by a business with economic value",B:"An expense incurred",C:"Money owed to the business",D:"A debt the business owes"},a:"A",e:"Asset: resource controlled by an entity that has future economic benefit."},
  {id:"ac078",s:"Accounting",y:2012,t:"Financial Accounting",d:"Hard",q:"The break-even point is where",o:{A:"Profit is maximised",B:"Total revenue equals total costs (no profit or loss)",C:"Revenue equals variable costs",D:"Fixed costs are zero"},a:"B",e:"Break-even: TR = TC; no profit or loss."},
  {id:"ac079",s:"Accounting",y:2013,t:"Financial Accounting",d:"Medium",q:"Share premium is",o:{A:"Profit from selling shares",B:"A tax on share sales",C:"The amount received for shares above their nominal (par) value",D:"Dividend payment"},a:"C",e:"Share premium: excess paid above face value on issue of shares."},
  {id:"ac080",s:"Accounting",y:2014,t:"Financial Accounting",d:"Easy",q:"A voucher is",o:{A:"A tax record",B:"A bank statement",C:"A ledger entry",D:"A document supporting a payment or transaction"},a:"D",e:"Voucher: source document authorising and evidencing a payment."},
  {id:"ac081",s:"Accounting",y:2015,t:"Financial Accounting",d:"Medium",q:"The LIFO stock valuation method assumes",o:{A:"Most recently purchased stock is sold first",B:"Average cost per unit",C:"Oldest stock is sold first",D:"Random order of sale"},a:"A",e:"LIFO: last-in, first-out."},
  {id:"ac082",s:"Accounting",y:2016,t:"Financial Accounting",d:"Easy",q:"A liability is",o:{A:"An asset of the business",B:"An obligation the business owes to others",C:"A capital investment",D:"An income earned"},a:"B",e:"Liability: debt or obligation."},
  {id:"ac083",s:"Accounting",y:2017,t:"Financial Accounting",d:"Hard",q:"Selling price N200, variable cost N120, fixed costs N40,000. Break-even units =",o:{A:"400",B:"1000",C:"500",D:"250"},a:"C",e:"Contribution = 200-120=80; BEP = 40,000/80 = 500 units."},
  {id:"ac084",s:"Accounting",y:2018,t:"Financial Accounting",d:"Medium",q:"Sinking fund is",o:{A:"A type of overdraft",B:"Cash flow reserve",C:"A personal savings account",D:"Money set aside regularly to repay a long-term liability or replace an asset"},a:"D",e:"Sinking fund: regular contributions to settle future obligations."},
  {id:"ac085",s:"Accounting",y:2019,t:"Financial Accounting",d:"Easy",q:"Equity is synonymous with",o:{A:"Capital or net worth (assets minus liabilities)",B:"Gross profit",C:"Total assets",D:"Total liabilities"},a:"A",e:"Equity = Assets - Liabilities; represents the owner's stake."},
  {id:"ac086",s:"Accounting",y:2020,t:"Financial Accounting",d:"Medium",q:"The objectivity concept requires",o:{A:"Recording only profits",B:"Accounts based on verifiable evidence not personal opinion",C:"Following management preference",D:"Using owner's estimates"},a:"B",e:"Objectivity: accounts based on evidence; auditable and free from bias."},
  {id:"ac087",s:"Accounting",y:2021,t:"Financial Accounting",d:"Easy",q:"A dividend is",o:{A:"Tax paid on profits",B:"A loan to the company",C:"A distribution of profit to shareholders",D:"Money borrowed by shareholders"},a:"C",e:"Dividend: portion of after-tax profit distributed to shareholders."},
  {id:"ac088",s:"Accounting",y:2022,t:"Financial Accounting",d:"Hard",q:"The AVCO method of stock valuation",o:{A:"Uses LIFO only",B:"Always matches FIFO",C:"Ignores closing stock",D:"Recalculates average cost after each purchase and uses it for issues"},a:"D",e:"AVCO: recalculates average cost after each purchase."},
  {id:"ac089",s:"Accounting",y:2023,t:"Financial Accounting",d:"Easy",q:"Book value of an asset is",o:{A:"Cost minus accumulated depreciation",B:"Its original purchase price only",C:"Its market value",D:"Its replacement cost"},a:"A",e:"Book value (carrying value): original cost - total depreciation to date."},
  {id:"ac090",s:"Accounting",y:2024,t:"Financial Accounting",d:"Medium",q:"Preference shares pay",o:{A:"Only when profits are very high",B:"A fixed dividend before ordinary shareholders",C:"Random dividends",D:"No dividends"},a:"B",e:"Preference shares: fixed dividend priority over ordinary shares."},
  {id:"ac091",s:"Accounting",y:2010,t:"Financial Accounting",d:"Easy",q:"The petty cash book records",o:{A:"Major bank transactions",B:"Fixed asset purchases",C:"Small day-to-day cash expenses",D:"Payroll payments"},a:"C",e:"Petty cash book: records minor cash payments."},
  {id:"ac092",s:"Accounting",y:2011,t:"Financial Accounting",d:"Medium",q:"A suspense account is used to",o:{A:"Record all bank transactions",B:"Replace the trial balance",C:"Avoid recording errors",D:"Temporarily hold a difference in the trial balance while errors are located"},a:"D",e:"Suspense account: temporary account to hold unexplained differences."},
  {id:"ac093",s:"Accounting",y:2012,t:"Financial Accounting",d:"Hard",q:"Net realisable value (NRV) of stock is",o:{A:"Estimated selling price minus costs to complete and sell",B:"Replacement cost",C:"Market value of completed goods",D:"Purchase price only"},a:"A",e:"NRV: selling price - completion and selling costs."},
  {id:"ac094",s:"Accounting",y:2013,t:"Financial Accounting",d:"Easy",q:"The source document for a credit sale is",o:{A:"A receipt",B:"An invoice issued to the customer",C:"A purchase order",D:"A debit note"},a:"B",e:"Sales invoice: source document for credit sale."},
  {id:"ac095",s:"Accounting",y:2014,t:"Financial Accounting",d:"Medium",q:"Retained profit is profit that",o:{A:"Is paid as tax",B:"Is given to employees",C:"Is kept in the business after tax and dividends",D:"Leaves as dividend"},a:"C",e:"Retained profit (retained earnings): reinvested in the business."},
  {id:"ac096",s:"Accounting",y:2015,t:"Financial Accounting",d:"Hard",q:"Current ratio = 2, working capital = N80,000. Current liabilities =",o:{A:"N160,000",B:"N80,000",C:"N20,000",D:"N40,000"},a:"D",e:"CR=CA/CL=2 and CA-CL=80,000; 2CL-CL=80,000; CL=N80,000."},
  {id:"ac097",s:"Accounting",y:2016,t:"Financial Accounting",d:"Easy",q:"Turnover is another word for",o:{A:"Revenue (total sales)",B:"Capital invested",C:"Tax paid",D:"Net profit"},a:"A",e:"Turnover = total sales revenue; top line of income statement."},
  {id:"ac098",s:"Accounting",y:2017,t:"Financial Accounting",d:"Medium",q:"A debenture is",o:{A:"A type of share",B:"A long-term loan to a company carrying a fixed interest rate",C:"Business property",D:"Short-term overdraft"},a:"B",e:"Debenture: long-term debt instrument."},
  {id:"ac099",s:"Accounting",y:2018,t:"Financial Accounting",d:"Hard",q:"IFRS (International Financial Reporting Standards) are issued by",o:{A:"World Bank",B:"Nigerian government",C:"The International Accounting Standards Board (IASB)",D:"SEC Nigeria"},a:"C",e:"IASB issues IFRS; adopted by 140+ countries for financial reporting."},
  {id:"ac100",s:"Accounting",y:2019,t:"Financial Accounting",d:"Easy",q:"A profit and loss account is also known as",o:{A:"Cash flow statement",B:"Balance sheet",C:"Statement of financial position",D:"Income statement"},a:"D",e:"Income statement = P&L account."},
  {id:"ag001",s:"Agricultural Science",y:2010,t:"Crop Science",d:"Easy",q:"Photosynthesis in plants requires",o:{A:"Water, CO2, and sunlight",B:"Oxygen and glucose",C:"Nitrogen and phosphorus only",D:"CO2 and oxygen"},a:"A",e:"Photosynthesis: 6CO2 + 6H2O + light gives C6H12O6 + 6O2."},
  {id:"ag002",s:"Agricultural Science",y:2011,t:"Soil Science",d:"Easy",q:"Humus is",o:{A:"A type of fertiliser",B:"Partially decomposed organic matter in the soil",C:"A soil mineral",D:"A chemical pesticide"},a:"B",e:"Humus: dark organic matter formed from decomposed plant and animal material."},
  {id:"ag003",s:"Agricultural Science",y:2012,t:"Animal Science",d:"Easy",q:"Ruminants digest cellulose with the help of",o:{A:"Liver enzymes",B:"Stomach acid",C:"Microorganisms in their rumen",D:"Gallbladder secretions"},a:"C",e:"Ruminants: four-chambered stomach; microbes in rumen break down cellulose."},
  {id:"ag004",s:"Agricultural Science",y:2013,t:"Crop Science",d:"Medium",q:"Nitrogen fixation by legumes is carried out by bacteria called",o:{A:"Nitrosomonas",B:"Nitrobacter",C:"Pseudomonas",D:"Rhizobium"},a:"D",e:"Rhizobium in root nodules of legumes fixes atmospheric N2."},
  {id:"ag005",s:"Agricultural Science",y:2014,t:"Soil Science",d:"Medium",q:"The best soil texture for crop production is",o:{A:"Loamy soil",B:"Clay soil",C:"Stony soil",D:"Sandy soil"},a:"A",e:"Loamy soil: ideal balance of sand, silt, and clay."},
  {id:"ag006",s:"Agricultural Science",y:2015,t:"Crop Science",d:"Easy",q:"Vegetative propagation includes",o:{A:"Planting seeds only",B:"Grafting, budding, and cutting",C:"Using fertilisers",D:"Cross-pollination"},a:"B",e:"Vegetative propagation: asexual reproduction using plant parts."},
  {id:"ag007",s:"Agricultural Science",y:2016,t:"Animal Science",d:"Easy",q:"The study of poultry is called",o:{A:"Apiculture",B:"Pisciculture",C:"Aviculture",D:"Silviculture"},a:"C",e:"Aviculture: rearing and keeping of birds."},
  {id:"ag008",s:"Agricultural Science",y:2017,t:"Soil Science",d:"Medium",q:"Soil pH measures",o:{A:"Soil colour",B:"Amount of humus",C:"Soil water content",D:"Acidity or alkalinity of soil"},a:"D",e:"Soil pH: 1-6 = acidic; 7 = neutral; 8-14 = alkaline."},
  {id:"ag009",s:"Agricultural Science",y:2018,t:"Crop Science",d:"Easy",q:"Monocotyledons have",o:{A:"One seed leaf",B:"Two seed leaves",C:"No seed leaves",D:"Four seed leaves"},a:"A",e:"Monocots: one cotyledon (seed leaf); e.g. grasses, maize, rice."},
  {id:"ag010",s:"Agricultural Science",y:2019,t:"Animal Science",d:"Medium",q:"The gestation period of a cow is approximately",o:{A:"6 months",B:"9 months",C:"18 months",D:"12 months"},a:"B",e:"Cattle: gestation is approximately 9 months (275-283 days)."},
  {id:"ag011",s:"Agricultural Science",y:2020,t:"Crop Science",d:"Medium",q:"Transpiration in plants is the loss of water through",o:{A:"Roots",B:"Lenticels only",C:"Stomata (mainly)",D:"Xylem vessels"},a:"C",e:"Transpiration: water vapour leaves mainly through stomata."},
  {id:"ag012",s:"Agricultural Science",y:2021,t:"Soil Science",d:"Hard",q:"Laterisation is a soil process in which",o:{A:"Clay accumulates at surface",B:"Calcium carbonate deposits form",C:"Organic matter accumulates",D:"Heavy leaching removes nutrients leaving iron and aluminium oxides"},a:"D",e:"Laterisation: intense tropical weathering; infertile laterite soils."},
  {id:"ag013",s:"Agricultural Science",y:2022,t:"Animal Science",d:"Easy",q:"A male sheep is called a",o:{A:"Ram",B:"Buck",C:"Bull",D:"Boar"},a:"A",e:"Ram = male sheep; ewe = female sheep."},
  {id:"ag014",s:"Agricultural Science",y:2023,t:"Crop Science",d:"Medium",q:"The main function of potassium in plant nutrition is",o:{A:"Root development",B:"Strengthening stems and disease resistance",C:"Chlorophyll production",D:"Seed formation"},a:"B",e:"Potassium: strengthens cell walls and improves disease resistance."},
  {id:"ag015",s:"Agricultural Science",y:2024,t:"Soil Science",d:"Easy",q:"Erosion is reduced by",o:{A:"Deep ploughing",B:"Removing vegetation",C:"Planting cover crops and terracing",D:"Monoculture"},a:"C",e:"Cover crops, terracing, and contour ploughing reduce erosion."},
  {id:"ag016",s:"Agricultural Science",y:2010,t:"Crop Science",d:"Easy",q:"A plant that completes its life cycle in one year is called",o:{A:"Perennial",B:"Biennial",C:"Deciduous",D:"Annual"},a:"D",e:"Annual: germinates, flowers, sets seed, and dies in one growing season."},
  {id:"ag017",s:"Agricultural Science",y:2011,t:"Animal Science",d:"Medium",q:"Newcastle disease affects",o:{A:"Poultry (chickens)",B:"Cattle",C:"Sheep",D:"Pigs"},a:"A",e:"Newcastle disease: viral respiratory and nervous disease of poultry."},
  {id:"ag018",s:"Agricultural Science",y:2012,t:"Soil Science",d:"Medium",q:"The process by which water moves down through the soil is called",o:{A:"Evaporation",B:"Percolation",C:"Run-off",D:"Transpiration"},a:"B",e:"Percolation: downward movement of water through soil pores."},
  {id:"ag019",s:"Agricultural Science",y:2013,t:"Crop Science",d:"Easy",q:"Photosynthesis produces",o:{A:"Proteins and fats",B:"Nucleic acids",C:"Glucose and oxygen",D:"Carbon dioxide"},a:"C",e:"Photosynthesis products: glucose (stored energy) and oxygen."},
  {id:"ag020",s:"Agricultural Science",y:2014,t:"Animal Science",d:"Easy",q:"Pigs are scientifically classified in the genus",o:{A:"Gallus",B:"Ovis",C:"Capra",D:"Sus"},a:"D",e:"Sus scrofa domesticus: domestic pig."},
  {id:"ag021",s:"Agricultural Science",y:2015,t:"Crop Science",d:"Medium",q:"The main food reserve in a maize grain is",o:{A:"Starch in the endosperm",B:"Fat",C:"Fibre",D:"Protein"},a:"A",e:"Maize endosperm: mainly starch (about 70%); energy reserve for germination."},
  {id:"ag022",s:"Agricultural Science",y:2016,t:"Soil Science",d:"Easy",q:"The topmost layer of soil is called the",o:{A:"Bedrock",B:"Topsoil (A horizon)",C:"Parent material",D:"Subsoil"},a:"B",e:"Topsoil: rich in organic matter and microorganisms; A horizon."},
  {id:"ag023",s:"Agricultural Science",y:2017,t:"Animal Science",d:"Medium",q:"Signs of good health in a farm animal include",o:{A:"Dull eyes",B:"Rough coat",C:"Bright eyes, smooth coat, and normal appetite",D:"Loss of appetite"},a:"C",e:"Healthy animal: alert, bright eyes, smooth coat, normal feeding."},
  {id:"ag024",s:"Agricultural Science",y:2018,t:"Crop Science",d:"Medium",q:"Crop rotation helps to",o:{A:"Reduce soil fertility",B:"Eliminate all pests",C:"Increase soil acidity",D:"Maintain soil fertility and break pest cycles"},a:"D",e:"Crop rotation: alternating crops prevents nutrient depletion and disrupts pests."},
  {id:"ag025",s:"Agricultural Science",y:2019,t:"Soil Science",d:"Hard",q:"Cation exchange capacity (CEC) measures",o:{A:"Soil's ability to hold and exchange positively charged nutrient ions",B:"Rate of organic matter decomposition",C:"Soil colour intensity",D:"Amount of rainfall absorbed"},a:"A",e:"CEC: higher CEC = more fertile soil; clay and humus have high CEC."},
  {id:"ag026",s:"Agricultural Science",y:2020,t:"Crop Science",d:"Easy",q:"Pollination is the transfer of pollen from",o:{A:"Leaf to stem",B:"Anther to stigma",C:"Seed to soil",D:"Roots to flowers"},a:"B",e:"Pollination: pollen from anther (male) to stigma (female)."},
  {id:"ag027",s:"Agricultural Science",y:2021,t:"Animal Science",d:"Medium",q:"Foot-and-mouth disease affects",o:{A:"Poultry",B:"Fish",C:"Cloven-hoofed animals (cattle, pigs, goats, sheep)",D:"Dogs"},a:"C",e:"FMD: highly contagious viral disease; affects all cloven-hoofed animals."},
  {id:"ag028",s:"Agricultural Science",y:2022,t:"Soil Science",d:"Medium",q:"Liming of soil is done to",o:{A:"Increase soil acidity",B:"Add iron to soil",C:"Remove organic matter",D:"Raise soil pH (reduce acidity)"},a:"D",e:"Lime (CaCO3): neutralises soil acidity."},
  {id:"ag029",s:"Agricultural Science",y:2023,t:"Crop Science",d:"Medium",q:"Removing young seedlings from nursery to main field is called",o:{A:"Transplanting",B:"Weeding",C:"Mulching",D:"Thinning"},a:"A",e:"Transplanting: moving seedlings from nursery to permanent position."},
  {id:"ag030",s:"Agricultural Science",y:2024,t:"Animal Science",d:"Easy",q:"A female pig is called a",o:{A:"Ewe",B:"Sow",C:"Cow",D:"Doe"},a:"B",e:"Sow = female pig; boar = male pig."},
  {id:"ag031",s:"Agricultural Science",y:2010,t:"Crop Science",d:"Easy",q:"Germination requires",o:{A:"Pesticides",B:"Fertilisers",C:"Water, oxygen, and suitable temperature",D:"Sunlight"},a:"C",e:"Germination: needs water, oxygen, and warmth."},
  {id:"ag032",s:"Agricultural Science",y:2011,t:"Soil Science",d:"Medium",q:"Sandy soils are",o:{A:"Rich in nutrients",B:"Good at retaining water",C:"Prone to waterlogging",D:"Light, well-drained but low in nutrients"},a:"D",e:"Sandy soil: large particles, low water retention, low fertility."},
  {id:"ag033",s:"Agricultural Science",y:2012,t:"Animal Science",d:"Easy",q:"Rearing of fish in ponds is called",o:{A:"Fish farming (pisciculture)",B:"Sericulture",C:"Silviculture",D:"Apiculture"},a:"A",e:"Pisciculture/Aquaculture: controlled cultivation of fish."},
  {id:"ag034",s:"Agricultural Science",y:2013,t:"Crop Science",d:"Medium",q:"Nitrogen deficiency causes yellowing of leaves called",o:{A:"Calcium deficiency",B:"Chlorosis",C:"Potassium deficiency",D:"Phosphorus deficiency"},a:"B",e:"Nitrogen deficiency: yellowing (chlorosis) of older leaves first."},
  {id:"ag035",s:"Agricultural Science",y:2014,t:"Soil Science",d:"Easy",q:"Soil structure refers to",o:{A:"Chemical composition",B:"Colour of soil",C:"How soil particles are arranged and clumped together",D:"Texture of sand particles"},a:"C",e:"Soil structure: arrangement of soil particles into aggregates."},
  {id:"ag036",s:"Agricultural Science",y:2015,t:"Crop Science",d:"Medium",q:"Hybridisation in plant breeding involves",o:{A:"Growing plants without soil",B:"Cloning identical plants",C:"Chemical treatment of seeds",D:"Crossing two different varieties to produce offspring with desired traits"},a:"D",e:"Hybridisation: cross-pollination of genetically different parents."},
  {id:"ag037",s:"Agricultural Science",y:2016,t:"Animal Science",d:"Medium",q:"Trypanosomiasis (sleeping sickness) in cattle is transmitted by",o:{A:"Tsetse fly",B:"Tick",C:"Housefly",D:"Mosquito"},a:"A",e:"Nagana (animal trypanosomiasis): transmitted by the tsetse fly."},
  {id:"ag038",s:"Agricultural Science",y:2017,t:"Soil Science",d:"Medium",q:"Waterlogging is harmful to crops because it",o:{A:"Adds too many nutrients",B:"Displaces air and causes root suffocation",C:"Increases soil temperature",D:"Causes soil erosion"},a:"B",e:"Waterlogging: roots need oxygen; flooded soil is anaerobic."},
  {id:"ag039",s:"Agricultural Science",y:2018,t:"Crop Science",d:"Medium",q:"Mixed farming involves",o:{A:"Growing only grasses",B:"Planting the same crop each year",C:"Both crop production and animal rearing on the same farm",D:"Only animal rearing"},a:"C",e:"Mixed farming: combines arable (crop) and pastoral (livestock) farming."},
  {id:"ag040",s:"Agricultural Science",y:2019,t:"Animal Science",d:"Easy",q:"The first milk produced by a cow after calving is called",o:{A:"Skim milk",B:"Pasteurised milk",C:"Homogenised milk",D:"Colostrum"},a:"D",e:"Colostrum: first milk; rich in antibodies and nutrients for newborn."},
  {id:"ag041",s:"Agricultural Science",y:2020,t:"Crop Science",d:"Easy",q:"Weeds compete with crops for",o:{A:"Water, nutrients, space, and sunlight",B:"Warmth only",C:"No resources",D:"Space and sunlight only"},a:"A",e:"Weeds compete for all growth resources."},
  {id:"ag042",s:"Agricultural Science",y:2021,t:"Soil Science",d:"Hard",q:"The C:N ratio of organic matter affects",o:{A:"Animal growth rates",B:"The rate of decomposition in soil",C:"Pest resistance",D:"Irrigation efficiency"},a:"B",e:"High C:N ratio (straw): slow decomposition; low C:N (legume): fast."},
  {id:"ag043",s:"Agricultural Science",y:2022,t:"Animal Science",d:"Medium",q:"Vaccination protects animals by",o:{A:"Killing bacteria immediately",B:"Providing nutrients",C:"Stimulating the immune system to produce antibodies",D:"Treating disease after infection"},a:"C",e:"Vaccination: introduces antigen to stimulate immune response."},
  {id:"ag044",s:"Agricultural Science",y:2023,t:"Crop Science",d:"Medium",q:"Bush fallowing is a system where",o:{A:"Land is permanently cultivated",B:"Crops are grown in water",C:"Same crop is grown repeatedly",D:"Land is left uncultivated for a period to regain fertility"},a:"D",e:"Bush fallowing: traditional shifting cultivation; land rests to recover."},
  {id:"ag045",s:"Agricultural Science",y:2024,t:"Soil Science",d:"Easy",q:"Organic manure improves soil by",o:{A:"Adding nutrients and improving structure and water retention",B:"Making soil acidic",C:"Increasing soil bulk density",D:"Preventing all water loss"},a:"A",e:"Organic manure: improves fertility, structure, and microbial activity."},
  {id:"ag046",s:"Agricultural Science",y:2010,t:"Crop Science",d:"Medium",q:"Lodging in cereals refers to",o:{A:"Pest infestation",B:"The bending or falling of cereal stems",C:"Failure to germinate",D:"Root disease"},a:"B",e:"Lodging: stems bend or collapse due to wind, rain, or excess nitrogen."},
  {id:"ag047",s:"Agricultural Science",y:2011,t:"Animal Science",d:"Easy",q:"Honeybees are reared for",o:{A:"Meat and wool",B:"Leather production",C:"Honey and beeswax (apiculture)",D:"Silk production"},a:"C",e:"Apiculture: rearing of honeybees for honey, beeswax, and pollination."},
  {id:"ag048",s:"Agricultural Science",y:2012,t:"Soil Science",d:"Medium",q:"Soil structure determines the ability to",o:{A:"Change soil colour",B:"Measure pH",C:"Determine texture",D:"Resist compaction and facilitate root penetration"},a:"D",e:"Good soil structure allows root penetration and drainage."},
  {id:"ag049",s:"Agricultural Science",y:2013,t:"Crop Science",d:"Easy",q:"Cassava is propagated by",o:{A:"Stem cuttings",B:"Bulbs",C:"Runners",D:"Seeds"},a:"A",e:"Cassava: vegetatively propagated using stem cuttings (stakes)."},
  {id:"ag050",s:"Agricultural Science",y:2014,t:"Animal Science",d:"Medium",q:"The oestrus cycle in farm animals is the",o:{A:"Annual moulting period",B:"Recurring period of sexual receptivity (heat)",C:"Feeding schedule",D:"Period of disease"},a:"B",e:"Oestrus: period when female animal is receptive to mating."},
  {id:"ag051",s:"Agricultural Science",y:2015,t:"Crop Science",d:"Medium",q:"A biennial plant completes its life cycle in",o:{A:"One season",B:"One month",C:"Two years",D:"Three years"},a:"C",e:"Biennial: two-year life cycle; e.g. carrots, sugarbeet."},
  {id:"ag052",s:"Agricultural Science",y:2016,t:"Soil Science",d:"Easy",q:"Breaking up the soil surface before planting is called",o:{A:"Weeding",B:"Harvesting",C:"Mulching",D:"Tillage (ploughing)"},a:"D",e:"Tillage: mechanical soil preparation to create a seedbed."},
  {id:"ag053",s:"Agricultural Science",y:2017,t:"Animal Science",d:"Hard",q:"Estimated daily milk yield of a high-producing Holstein-Friesian cow is",o:{A:"20-30 litres",B:"5-10 litres",C:"10-15 litres",D:"2-5 litres"},a:"A",e:"Holstein-Friesian: high-yielding dairy breed; 20-30 L/day possible."},
  {id:"ag054",s:"Agricultural Science",y:2018,t:"Crop Science",d:"Medium",q:"Winnowing is done to",o:{A:"Remove weeds",B:"Separate grain from chaff using wind",C:"Irrigate crops",D:"Apply fertiliser"},a:"B",e:"Winnowing: uses wind to blow away lighter chaff from heavier grain."},
  {id:"ag055",s:"Agricultural Science",y:2019,t:"Soil Science",d:"Medium",q:"Bacteria that convert nitrates back to N2 carry out",o:{A:"Nitrification",B:"Nitrogen fixation",C:"Denitrification",D:"Ammonification"},a:"C",e:"Denitrification: bacteria convert nitrates to N2 gas."},
  {id:"ag056",s:"Agricultural Science",y:2020,t:"Animal Science",d:"Easy",q:"Silage is",o:{A:"A type of pest",B:"A farm tool",C:"Preserved grain",D:"Fermented, moist fodder made from green crops"},a:"D",e:"Silage: anaerobic fermentation of green crops; used as livestock feed."},
  {id:"ag057",s:"Agricultural Science",y:2021,t:"Crop Science",d:"Medium",q:"The F1 hybrid refers to",o:{A:"The first filial generation from a cross between two pure lines",B:"A GM organism",C:"The grandparent plant",D:"A plant grown in lab"},a:"A",e:"F1 hybrid: vigorous uniform offspring of two inbred lines."},
  {id:"ag058",s:"Agricultural Science",y:2022,t:"Soil Science",d:"Hard",q:"Soil salinity damages crops because",o:{A:"It increases microbial activity",B:"High salt concentration causes osmotic stress preventing water uptake",C:"It adds too much potassium",D:"It cools the soil"},a:"B",e:"Salinity: raises soil water potential; plants cannot absorb water."},
  {id:"ag059",s:"Agricultural Science",y:2023,t:"Animal Science",d:"Medium",q:"Broiler chickens are reared for",o:{A:"Laying eggs only",B:"Both eggs and meat",C:"Meat production",D:"Exhibition purposes"},a:"C",e:"Broiler: chicken bred specifically for rapid growth and meat production."},
  {id:"ag060",s:"Agricultural Science",y:2024,t:"Crop Science",d:"Easy",q:"The main cereal crop in Nigeria is",o:{A:"Wheat",B:"Barley",C:"Rice",D:"Maize"},a:"D",e:"Maize: most widely grown cereal in Nigeria."},
  {id:"ag061",s:"Agricultural Science",y:2010,t:"Animal Science",d:"Medium",q:"Colostrum is important for newborns because it contains",o:{A:"Maternal antibodies (passive immunity)",B:"No protein",C:"It causes disease",D:"High fat"},a:"A",e:"Colostrum: immunoglobulins protect newborns until their immune system develops."},
  {id:"ag062",s:"Agricultural Science",y:2011,t:"Soil Science",d:"Easy",q:"Topsoil erosion is most severe on",o:{A:"Flat land",B:"Steep unprotected slopes",C:"Forested areas",D:"Valley bottoms"},a:"B",e:"Steep unprotected slopes: high run-off velocity causes rapid erosion."},
  {id:"ag063",s:"Agricultural Science",y:2012,t:"Crop Science",d:"Medium",q:"Photoperiodism in plants refers to response to",o:{A:"Water availability",B:"Temperature changes",C:"Duration of light and dark periods",D:"Nutrient levels"},a:"C",e:"Photoperiodism: plants detect day length to trigger flowering."},
  {id:"ag064",s:"Agricultural Science",y:2013,t:"Animal Science",d:"Easy",q:"A castrated male pig is called a",o:{A:"Steer",B:"Wether",C:"Gelding",D:"Barrow"},a:"D",e:"Barrow: castrated male pig."},
  {id:"ag065",s:"Agricultural Science",y:2014,t:"Crop Science",d:"Medium",q:"Mulching is the practice of",o:{A:"Covering soil with organic or inorganic material to conserve moisture",B:"Spraying herbicides",C:"Deep ploughing",D:"Burying old crops"},a:"A",e:"Mulching: retains soil moisture, reduces erosion, suppresses weeds."},
  {id:"ag066",s:"Agricultural Science",y:2015,t:"Soil Science",d:"Hard",q:"The wilting point of soil is",o:{A:"When soil has excess water",B:"The water content at which plants can no longer extract water and wilt permanently",C:"When soil is optimally moist",D:"When pH drops below 5"},a:"B",e:"Permanent wilting point: soil water tightly bound; plants wilt irreversibly."},
  {id:"ag067",s:"Agricultural Science",y:2016,t:"Animal Science",d:"Medium",q:"Which of the following is a non-ruminant?",o:{A:"Goat",B:"Cow",C:"Pig",D:"Sheep"},a:"C",e:"Pigs are monogastric (non-ruminants); they have a simple stomach."},
  {id:"ag068",s:"Agricultural Science",y:2017,t:"Crop Science",d:"Easy",q:"NPK fertiliser provides",o:{A:"Nitrogen, Potassium, Manganese",B:"Nitrogen, Protein, Calcium",C:"Nickel, Phosphorus, Potassium",D:"Nitrogen, Phosphorus, Potassium"},a:"D",e:"NPK: Nitrogen, Phosphorus, Potassium; three primary macronutrients."},
  {id:"ag069",s:"Agricultural Science",y:2018,t:"Soil Science",d:"Medium",q:"A soil profile shows the",o:{A:"Arrangement of soil horizons from surface to parent rock",B:"Microscopic view of bacteria",C:"Colour distribution only",D:"Chemical formula of soil"},a:"A",e:"Soil profile: cross-section showing A, B, C horizons and parent material."},
  {id:"ag070",s:"Agricultural Science",y:2019,t:"Animal Science",d:"Easy",q:"Rickets is caused by a deficiency of",o:{A:"Iron",B:"Vitamin D (or calcium and phosphorus)",C:"Vitamin C",D:"Iodine"},a:"B",e:"Rickets: soft deformed bones due to Vitamin D deficiency."},
  {id:"ag071",s:"Agricultural Science",y:2020,t:"Crop Science",d:"Medium",q:"The main storage organ of onions is",o:{A:"Root",B:"Stem",C:"Bulb",D:"Leaf"},a:"C",e:"Onion: stores food in fleshy leaf bases forming the bulb."},
  {id:"ag072",s:"Agricultural Science",y:2021,t:"Soil Science",d:"Easy",q:"Earthworms improve soil by",o:{A:"Spreading diseases",B:"Removing all nutrients",C:"Reducing air spaces",D:"Burrowing, mixing organic matter, and improving drainage"},a:"D",e:"Earthworms: aerate soil, mix organic matter, improve structure."},
  {id:"ag073",s:"Agricultural Science",y:2022,t:"Animal Science",d:"Hard",q:"Milk production in cattle is stimulated by the hormone",o:{A:"Prolactin",B:"Testosterone",C:"Adrenaline",D:"Oestrogen"},a:"A",e:"Prolactin: secreted by pituitary gland; stimulates milk production."},
  {id:"ag074",s:"Agricultural Science",y:2023,t:"Crop Science",d:"Medium",q:"Which method of weed control uses chemicals?",o:{A:"Biological control",B:"Chemical control (herbicides)",C:"Cultural control",D:"Mechanical control"},a:"B",e:"Herbicides: chemical weed control."},
  {id:"ag075",s:"Agricultural Science",y:2024,t:"Soil Science",d:"Medium",q:"Contour ploughing involves",o:{A:"Ploughing in straight lines downhill",B:"Ploughing only in dry season",C:"Ploughing along lines of equal elevation to reduce erosion",D:"Removing the topsoil"},a:"C",e:"Contour ploughing: furrows run across a slope slowing water run-off."},
  {id:"ag076",s:"Agricultural Science",y:2010,t:"Animal Science",d:"Easy",q:"Cattle are mainly raised for",o:{A:"Silk",B:"Honey",C:"Wool",D:"Meat, milk, and draught power"},a:"D",e:"Cattle: beef and dairy breeds raised for meat, milk, hides."},
  {id:"ag077",s:"Agricultural Science",y:2011,t:"Crop Science",d:"Medium",q:"Xylem vessels in plants transport",o:{A:"Water and dissolved minerals upward from roots",B:"Waste gases",C:"Mineral salts from roots to shoots",D:"Sugar from leaves to roots"},a:"A",e:"Xylem: transports water and dissolved minerals from roots upward."},
  {id:"ag078",s:"Agricultural Science",y:2012,t:"Soil Science",d:"Easy",q:"Compost is made from",o:{A:"Chemical fertilisers only",B:"Decomposed plant and animal remains",C:"Rocks and minerals",D:"Synthetic materials"},a:"B",e:"Compost: decayed organic material used as natural fertiliser."},
  {id:"ag079",s:"Agricultural Science",y:2013,t:"Animal Science",d:"Medium",q:"Artificial insemination in livestock is used to",o:{A:"Vaccinate animals",B:"Prevent disease",C:"Introduce semen from superior males to improve breeding",D:"Cure infections"},a:"C",e:"AI: controlled breeding using stored semen from genetically superior males."},
  {id:"ag080",s:"Agricultural Science",y:2014,t:"Crop Science",d:"Hard",q:"The economic threshold in pest management is",o:{A:"The point where all pests must be killed",B:"The amount of pesticide needed",C:"The maximum yield attainable",D:"The pest population level below which control is not cost-effective"},a:"D",e:"Economic threshold: pest density at which cost of control equals benefit."},
  {id:"ag081",s:"Agricultural Science",y:2015,t:"Soil Science",d:"Medium",q:"Nitrogen in soil is most available to plants as",o:{A:"Nitrate",B:"Ammonium only",C:"Nitrogen gas",D:"Nitrite"},a:"A",e:"Nitrate: most available form of N for plants; taken up by roots."},
  {id:"ag082",s:"Agricultural Science",y:2016,t:"Animal Science",d:"Easy",q:"Layer chickens are reared for",o:{A:"Show purposes",B:"Egg production",C:"Meat only",D:"Hatching eggs"},a:"B",e:"Layers: chickens selected for high egg production (250-300 eggs per year)."},
  {id:"ag083",s:"Agricultural Science",y:2017,t:"Crop Science",d:"Medium",q:"Thinning of crops involves",o:{A:"Planting more seeds",B:"Adding fertiliser",C:"Removing excess seedlings to allow adequate spacing",D:"Harvesting only large plants"},a:"C",e:"Thinning: ensures optimal plant density for maximum yield."},
  {id:"ag084",s:"Agricultural Science",y:2018,t:"Soil Science",d:"Hard",q:"Field capacity refers to",o:{A:"Amount of clay in soil",B:"Soil colour at harvest",C:"Minimum nutrients in soil",D:"The water held in soil after excess has drained away"},a:"D",e:"Field capacity: optimal moisture; macropores drain, micropores retain water."},
  {id:"ag085",s:"Agricultural Science",y:2019,t:"Animal Science",d:"Medium",q:"Bloat in ruminants is caused by",o:{A:"Accumulation of gas in the rumen",B:"Bacterial infection",C:"Worm infestation",D:"Vitamin deficiency"},a:"A",e:"Bloat: excess gas accumulates in rumen; potentially fatal."},
  {id:"ag086",s:"Agricultural Science",y:2020,t:"Crop Science",d:"Easy",q:"Oil palm is economically important in Nigeria because it produces",o:{A:"Rubber",B:"Palm oil and palm kernel oil for food and industry",C:"Fuel",D:"Furniture wood"},a:"B",e:"Nigeria: historically world's largest palm oil producer."},
  {id:"ag087",s:"Agricultural Science",y:2021,t:"Soil Science",d:"Medium",q:"Gully erosion is",o:{A:"Slightly more severe than sheet erosion",B:"Less severe than sheet erosion",C:"The most severe form of erosion forming deep channels",D:"Only in sandy soils"},a:"C",e:"Gully erosion: concentrated water carves deep channels; very destructive."},
  {id:"ag088",s:"Agricultural Science",y:2022,t:"Animal Science",d:"Easy",q:"Normal body temperature of a cow is approximately",o:{A:"35 degrees C",B:"37 degrees C",C:"40 degrees C",D:"38.5 degrees C"},a:"D",e:"Normal cattle body temperature: approximately 38.5 degrees C."},
  {id:"ag089",s:"Agricultural Science",y:2023,t:"Crop Science",d:"Medium",q:"Storage of grains at high moisture content leads to",o:{A:"Mould growth and aflatoxin contamination",B:"Increased germination rate",C:"Longer shelf life",D:"Better quality grain"},a:"A",e:"High moisture grain: fungal growth leads to aflatoxins."},
  {id:"ag090",s:"Agricultural Science",y:2024,t:"Soil Science",d:"Easy",q:"Irrigation is the",o:{A:"Removal of weeds",B:"Supply of water to crops through artificial means",C:"Use of pesticides",D:"Drainage of excess water"},a:"B",e:"Irrigation: artificial application of water to support crop growth."},
  {id:"ag091",s:"Agricultural Science",y:2010,t:"Animal Science",d:"Medium",q:"Anthrax in animals is caused by",o:{A:"A fungus",B:"A virus",C:"The bacterium Bacillus anthracis",D:"A protozoan"},a:"C",e:"Anthrax: caused by Bacillus anthracis spores."},
  {id:"ag092",s:"Agricultural Science",y:2011,t:"Crop Science",d:"Easy",q:"The process of removing seeds from cereal crops after harvest is called",o:{A:"Winnowing",B:"Milling",C:"Drying",D:"Threshing"},a:"D",e:"Threshing: separates grain from stalks and husks."},
  {id:"ag093",s:"Agricultural Science",y:2012,t:"Soil Science",d:"Medium",q:"Phosphorus in soil is important for",o:{A:"Root development and energy transfer (ATP)",B:"Leaf greenness",C:"Disease resistance",D:"Stem strength"},a:"A",e:"Phosphorus: essential for roots, ATP synthesis, and cell membranes."},
  {id:"ag094",s:"Agricultural Science",y:2013,t:"Animal Science",d:"Easy",q:"A male goat is called a",o:{A:"Ram",B:"Buck",C:"Bull",D:"Boar"},a:"B",e:"Buck = male goat; doe = female goat."},
  {id:"ag095",s:"Agricultural Science",y:2014,t:"Crop Science",d:"Medium",q:"Trellising of crops like yam involves",o:{A:"Removing leaves",B:"Using chemical growth inhibitors",C:"Providing support structures for climbing plants",D:"Deep irrigation"},a:"C",e:"Trellising: sticks or structures support yam or tomato vines."},
  {id:"ag096",s:"Agricultural Science",y:2015,t:"Soil Science",d:"Easy",q:"Soil colour is determined mainly by",o:{A:"Water content only",B:"Temperature",C:"Amount of sand",D:"Organic matter and iron oxide content"},a:"D",e:"Dark soil: high organic matter; red or brown: iron oxides."},
  {id:"ag097",s:"Agricultural Science",y:2016,t:"Animal Science",d:"Hard",q:"A day-old chick is protected by",o:{A:"Maternal antibodies (passive immunity via egg yolk)",B:"Vaccines given at hatch",C:"Antibiotics in water",D:"Feed supplements"},a:"A",e:"Chick passive immunity: IgY antibodies from hen passed through egg yolk."},
  {id:"ag098",s:"Agricultural Science",y:2017,t:"Crop Science",d:"Medium",q:"Intercropping involves",o:{A:"Growing one crop per season",B:"Growing two or more crops simultaneously on the same land",C:"Leaving land fallow",D:"Rotating crops over years"},a:"B",e:"Intercropping: e.g. maize plus beans; maximises land use."},
  {id:"ag099",s:"Agricultural Science",y:2018,t:"Soil Science",d:"Medium",q:"A waterlogged soil has",o:{A:"Low moisture",B:"Excess nitrogen",C:"Poor aeration (anaerobic conditions)",D:"High air circulation"},a:"C",e:"Waterlogged soil: all pores filled with water; anaerobic; roots suffocate."},
  {id:"ag100",s:"Agricultural Science",y:2019,t:"Animal Science",d:"Medium",q:"Normal clutch size of a local hen (village chicken) in Nigeria is",o:{A:"3-5 eggs",B:"20-25 eggs",C:"12-16 eggs",D:"6-12 eggs"},a:"D",e:"Village hens: typically lay 6-12 eggs per clutch before going broody."},
  {id:"b001",s:"Biology",y:2010,t:"Cell Biology",d:"Easy",q:"The powerhouse of the cell is the",o:{A:"Mitochondrion",B:"Ribosome",C:"Nucleus",D:"Golgi body"},a:"A",e:"Mitochondria produce ATP via cellular respiration."},
  {id:"b002",s:"Biology",y:2011,t:"Cell Biology",d:"Easy",q:"The site of protein synthesis in a cell is the",o:{A:"Mitochondrion",B:"Ribosome",C:"Lysosome",D:"Vacuole"},a:"B",e:"Ribosomes translate mRNA into polypeptides."},
  {id:"b003",s:"Biology",y:2012,t:"Cell Biology",d:"Easy",q:"Plant cell walls are mainly composed of",o:{A:"Chitin",B:"Pectin",C:"Cellulose",D:"Lignin"},a:"C",e:"Cellulose forms the structural scaffold of plant cell walls."},
  {id:"b004",s:"Biology",y:2013,t:"Cell Biology",d:"Medium",q:"Which organelle is NOT found in a prokaryotic cell?",o:{A:"Cell wall",B:"Ribosome",C:"Cell membrane",D:"Mitochondrion"},a:"D",e:"Prokaryotes lack membrane-bound organelles."},
  {id:"b005",s:"Biology",y:2014,t:"Cell Biology",d:"Medium",q:"Engulfment of large solid particles by a cell is called",o:{A:"Phagocytosis",B:"Exocytosis",C:"Osmosis",D:"Pinocytosis"},a:"A",e:"Phagocytosis (cell eating) ingests solids like bacteria."},
  {id:"b006",s:"Biology",y:2015,t:"Genetics",d:"Easy",q:"The basic unit of heredity is the",o:{A:"Chromosome",B:"Gene",C:"Allele",D:"Nucleotide"},a:"B",e:"A gene is a DNA segment coding for a specific protein."},
  {id:"b007",s:"Biology",y:2016,t:"Genetics",d:"Medium",q:"The phenotypic ratio from Aa x Aa is",o:{A:"1:2:1",B:"1:1",C:"3:1",D:"9:3:3:1"},a:"C",e:"AA and Aa show dominant; aa shows recessive giving 3:1."},
  {id:"b008",s:"Biology",y:2017,t:"Ecology",d:"Easy",q:"An ecosystem includes",o:{A:"Only living organisms",B:"Only physical environment",C:"Only plants",D:"All organisms and their physical environment"},a:"D",e:"Ecosystem = all biotic and abiotic components."},
  {id:"b009",s:"Biology",y:2018,t:"Nutrition",d:"Easy",q:"Pepsin acts on proteins in the",o:{A:"Stomach",B:"Small intestine",C:"Large intestine",D:"Mouth"},a:"A",e:"Pepsin is a protease active in the stomach."},
  {id:"b010",s:"Biology",y:2019,t:"Transport",d:"Easy",q:"The pulmonary vein carries",o:{A:"Deoxygenated blood from heart to lungs",B:"Oxygenated blood from lungs to left atrium",C:"Deoxygenated blood from body",D:"Oxygenated blood to the body"},a:"B",e:"Pulmonary vein: oxygenated blood from lungs to left atrium."},
  {id:"b011",s:"Biology",y:2020,t:"Respiration",d:"Medium",q:"Net ATP gain from glycolysis is",o:{A:"38",B:"4",C:"2",D:"36"},a:"C",e:"Glycolysis: 4 ATP produced minus 2 used = net 2 ATP."},
  {id:"b012",s:"Biology",y:2021,t:"Excretion",d:"Easy",q:"The functional unit of the kidney is the",o:{A:"Glomerulus",B:"Ureter",C:"Renal pelvis",D:"Nephron"},a:"D",e:"Nephron: complete structural and functional unit."},
  {id:"b013",s:"Biology",y:2022,t:"Reproduction",d:"Easy",q:"Meiosis produces cells that are",o:{A:"Haploid and genetically varied",B:"Diploid and varied",C:"Haploid and identical",D:"Diploid and identical"},a:"A",e:"Meiosis: 4 haploid cells each genetically unique."},
  {id:"b014",s:"Biology",y:2023,t:"Nervous System",d:"Easy",q:"The basic unit of the nervous system is the",o:{A:"Synapse",B:"Neuron",C:"Dendrite",D:"Myelin sheath"},a:"B",e:"Neuron: structural and functional unit."},
  {id:"b015",s:"Biology",y:2024,t:"Evolution",d:"Easy",q:"Natural selection was proposed by",o:{A:"Mendel",B:"Lamarck",C:"Darwin",D:"Pasteur"},a:"C",e:"Darwin and Wallace proposed natural selection in 1858."},
  {id:"b016",s:"Biology",y:2010,t:"Plant Biology",d:"Easy",q:"Guard cells control the opening of",o:{A:"Root hair cells",B:"Lenticels",C:"Phloem tubes",D:"Stomata"},a:"D",e:"Guard cells regulate stomatal aperture."},
  {id:"b017",s:"Biology",y:2011,t:"Ecology",d:"Medium",q:"Energy transferred between trophic levels is approximately",o:{A:"10 percent",B:"50 percent",C:"1 percent",D:"90 percent"},a:"A",e:"10 percent rule: only about 10 percent passes to next level."},
  {id:"b018",s:"Biology",y:2012,t:"Cell Biology",d:"Hard",q:"Smooth ER is mainly responsible for",o:{A:"Protein synthesis",B:"Lipid synthesis and detoxification",C:"DNA replication",D:"ATP production"},a:"B",e:"Smooth ER synthesises lipids, steroids, and detoxifies drugs."},
  {id:"b019",s:"Biology",y:2013,t:"Genetics",d:"Hard",q:"Sickle cell anaemia substitutes glutamic acid with",o:{A:"Alanine",B:"Glycine",C:"Valine",D:"Proline"},a:"C",e:"Point mutation: glutamic acid at position 6 replaced by valine."},
  {id:"b020",s:"Biology",y:2014,t:"Ecology",d:"Medium",q:"In mutualism, both organisms",o:{A:"One benefits, other harmed",B:"One benefits, other unaffected",C:"Both harmed",D:"Both benefit"},a:"D",e:"Mutualism: both organisms benefit (+/+)."},
  {id:"b021",s:"Biology",y:2015,t:"Transport",d:"Hard",q:"Water rises up tall trees mainly due to",o:{A:"Transpiration pull and cohesion-tension",B:"Active transport",C:"Osmosis through phloem",D:"Root pressure alone"},a:"A",e:"Cohesion-tension: transpiration creates negative pressure pulling water up."},
  {id:"b022",s:"Biology",y:2016,t:"Respiration",d:"Hard",q:"The Krebs cycle occurs in the",o:{A:"Cytoplasm",B:"Mitochondrial matrix",C:"Thylakoid",D:"Nucleus"},a:"B",e:"Krebs cycle: in mitochondrial matrix."},
  {id:"b023",s:"Biology",y:2017,t:"Plant Biology",d:"Easy",q:"The overall equation for photosynthesis is",o:{A:"C6H12O6 + 6O2 gives 6CO2 + 6H2O",B:"C6H12O6 gives 2C2H5OH + 2CO2",C:"6CO2 + 6H2O gives C6H12O6 + 6O2",D:"2H2O gives 4H + O2"},a:"C",e:"6CO2 + 6H2O + light gives C6H12O6 + 6O2."},
  {id:"b024",s:"Biology",y:2018,t:"Classification",d:"Easy",q:"Binomial nomenclature was introduced by",o:{A:"Darwin",B:"Mendel",C:"Pasteur",D:"Linnaeus"},a:"D",e:"Linnaeus 1758: two-part Latin naming system."},
  {id:"b025",s:"Biology",y:2019,t:"Nutrition",d:"Easy",q:"The main site of nutrient absorption is the",o:{A:"Small intestine",B:"Large intestine",C:"Oesophagus",D:"Stomach"},a:"A",e:"Villi and microvilli in small intestine absorb nutrients."},
  {id:"b026",s:"Biology",y:2020,t:"Genetics",d:"Medium",q:"Down syndrome results from",o:{A:"Deletion of chromosome 21",B:"Trisomy 21",C:"Inversion of chromosome 21",D:"Monosomy X"},a:"B",e:"Trisomy 21: three copies of chromosome 21."},
  {id:"b027",s:"Biology",y:2021,t:"Cell Division",d:"Medium",q:"Chromatids are pulled to opposite poles during which phase of mitosis?",o:{A:"Prophase",B:"Metaphase",C:"Anaphase",D:"Telophase"},a:"C",e:"Anaphase: centromeres split; chromatids pulled apart."},
  {id:"b028",s:"Biology",y:2022,t:"Hormones",d:"Easy",q:"Insulin is produced by the",o:{A:"Liver",B:"Adrenal gland",C:"Thyroid",D:"Pancreatic beta cells"},a:"D",e:"Beta cells of islets of Langerhans secrete insulin."},
  {id:"b029",s:"Biology",y:2023,t:"Excretion",d:"Hard",q:"Urea is formed in the",o:{A:"Ornithine urea cycle",B:"Glycolysis",C:"ETC",D:"Krebs cycle"},a:"A",e:"Ornithine cycle in liver converts ammonia to urea."},
  {id:"b030",s:"Biology",y:2024,t:"Transport",d:"Easy",q:"Transpiration is the",o:{A:"Uptake of water by roots",B:"Loss of water vapour from aerial plant parts",C:"Absorption of minerals",D:"Water transport through xylem"},a:"B",e:"Transpiration: evaporation of water through stomata."},
  {id:"b031",s:"Biology",y:2010,t:"Cell Biology",d:"Medium",q:"The process by which cells engulf liquid droplets is",o:{A:"Phagocytosis",B:"Exocytosis",C:"Pinocytosis",D:"Endosmosis"},a:"C",e:"Pinocytosis = cell drinking; ingests liquids."},
  {id:"b032",s:"Biology",y:2011,t:"Genetics",d:"Medium",q:"Genes located on sex chromosomes are said to be",o:{A:"Autosomal",B:"Dominant",C:"Recessive",D:"Sex-linked"},a:"D",e:"Sex-linked genes are on X or Y chromosomes."},
  {id:"b033",s:"Biology",y:2012,t:"Ecology",d:"Easy",q:"Producers in an ecosystem are",o:{A:"Green plants",B:"Herbivores",C:"Decomposers",D:"Carnivores"},a:"A",e:"Green plants (autotrophs) produce food via photosynthesis."},
  {id:"b034",s:"Biology",y:2013,t:"Nutrition",d:"Medium",q:"Which vitamin is synthesised by the skin on exposure to sunlight?",o:{A:"Vitamin A",B:"Vitamin D",C:"Vitamin B12",D:"Vitamin C"},a:"B",e:"UV light enables skin to synthesise Vitamin D."},
  {id:"b035",s:"Biology",y:2014,t:"Transport",d:"Medium",q:"The blood vessel with the thickest wall is the",o:{A:"Vein",B:"Venule",C:"Artery",D:"Capillary"},a:"C",e:"Arteries have thick muscular walls to withstand high pressure."},
  {id:"b036",s:"Biology",y:2015,t:"Respiration",d:"Easy",q:"Carbon dioxide is a waste product of",o:{A:"Photosynthesis",B:"Transpiration",C:"Translocation",D:"Cellular respiration"},a:"D",e:"Aerobic respiration: glucose + O2 gives CO2 + H2O + ATP."},
  {id:"b037",s:"Biology",y:2016,t:"Excretion",d:"Medium",q:"Which organ is responsible for producing bile?",o:{A:"Liver",B:"Gall bladder",C:"Spleen",D:"Pancreas"},a:"A",e:"Liver produces bile; gall bladder stores it."},
  {id:"b038",s:"Biology",y:2017,t:"Reproduction",d:"Easy",q:"Fertilisation in flowering plants occurs in the",o:{A:"Anther",B:"Ovule",C:"Sepal",D:"Style"},a:"B",e:"Fertilisation occurs when pollen tube reaches the ovule."},
  {id:"b039",s:"Biology",y:2018,t:"Nervous System",d:"Medium",q:"The junction between two neurons is called",o:{A:"Axon",B:"Dendrite",C:"Synapse",D:"Myelin sheath"},a:"C",e:"Synapse: gap between neurons where signals are transmitted."},
  {id:"b040",s:"Biology",y:2019,t:"Evolution",d:"Medium",q:"Natural selection states that",o:{A:"All organisms are created equal",B:"Acquired characteristics are inherited",C:"Mutations always improve survival",D:"Organisms best adapted survive and reproduce"},a:"D",e:"Darwin: best adapted individuals survive and pass on traits."},
  {id:"b041",s:"Biology",y:2020,t:"Plant Biology",d:"Medium",q:"Which plant hormone promotes cell elongation?",o:{A:"Auxin",B:"Cytokinin",C:"Abscisic acid",D:"Gibberellin"},a:"A",e:"Auxin promotes elongation on the shaded side (phototropism)."},
  {id:"b042",s:"Biology",y:2021,t:"Cell Biology",d:"Medium",q:"Active transport requires",o:{A:"No energy",B:"ATP energy",C:"Diffusion",D:"Gravity"},a:"B",e:"Active transport moves substances against gradient using ATP."},
  {id:"b043",s:"Biology",y:2022,t:"Genetics",d:"Hard",q:"In AaBb x AaBb, what fraction of offspring will be AABB?",o:{A:"3/16",B:"1/4",C:"1/16",D:"9/16"},a:"C",e:"P(AA)=1/4, P(BB)=1/4; P(AABB)=1/16."},
  {id:"b044",s:"Biology",y:2023,t:"Ecology",d:"Medium",q:"Which level is BELOW the community?",o:{A:"Biome",B:"Biosphere",C:"Ecosystem",D:"Population"},a:"D",e:"Hierarchy: organism, population, community, ecosystem, biome."},
  {id:"b045",s:"Biology",y:2024,t:"Nutrition",d:"Easy",q:"The enzyme that digests starch in the mouth is",o:{A:"Salivary amylase",B:"Lipase",C:"Trypsin",D:"Pepsin"},a:"A",e:"Salivary amylase breaks starch into maltose in the mouth."},
  {id:"b046",s:"Biology",y:2010,t:"Transport",d:"Medium",q:"Blood passes from the right ventricle to the",o:{A:"Left atrium",B:"Pulmonary artery",C:"Aorta",D:"Left ventricle"},a:"B",e:"Right ventricle sends blood to pulmonary artery then lungs."},
  {id:"b047",s:"Biology",y:2011,t:"Respiration",d:"Hard",q:"The electron transport chain is located in the",o:{A:"Cytoplasm",B:"Nucleus",C:"Inner mitochondrial membrane",D:"Mitochondrial matrix"},a:"C",e:"ETC is embedded in the inner mitochondrial membrane."},
  {id:"b048",s:"Biology",y:2012,t:"Excretion",d:"Medium",q:"ADH acts on the",o:{A:"Loop of Henle",B:"Bowman's capsule",C:"Glomerulus",D:"Collecting duct"},a:"D",e:"ADH increases water reabsorption in the collecting duct."},
  {id:"b049",s:"Biology",y:2013,t:"Reproduction",d:"Medium",q:"The gestation period of humans is approximately",o:{A:"9 months",B:"6 months",C:"12 months",D:"15 months"},a:"A",e:"Human gestation is approximately 9 months."},
  {id:"b050",s:"Biology",y:2014,t:"Nervous System",d:"Medium",q:"The cerebellum controls",o:{A:"Thinking and memory",B:"Balance and coordination",C:"Speech and language",D:"Hunger and thirst"},a:"B",e:"Cerebellum coordinates voluntary movement and balance."},
  {id:"b051",s:"Biology",y:2015,t:"Evolution",d:"Hard",q:"Which provides DIRECT evidence for evolution?",o:{A:"Comparative anatomy",B:"DNA similarities",C:"Fossil record",D:"Biogeography"},a:"C",e:"Fossil record provides direct chronological evidence."},
  {id:"b052",s:"Biology",y:2016,t:"Plant Biology",d:"Medium",q:"Transpiration is greatest when",o:{A:"It is cool and humid",B:"It is dark",C:"Stomata are closed",D:"It is hot, dry, and windy"},a:"D",e:"Hot dry windy conditions accelerate water loss."},
  {id:"b053",s:"Biology",y:2017,t:"Cell Biology",d:"Hard",q:"The nucleolus is found in the",o:{A:"Nucleus",B:"Mitochondria",C:"Endoplasmic reticulum",D:"Cytoplasm"},a:"A",e:"Nucleolus is within the nucleus and produces rRNA."},
  {id:"b054",s:"Biology",y:2018,t:"Genetics",d:"Medium",q:"Blood group O genotype is",o:{A:"IA IB",B:"ii",C:"IBIB",D:"IAIA"},a:"B",e:"Blood group O = ii (no A or B antigens)."},
  {id:"b055",s:"Biology",y:2019,t:"Ecology",d:"Hard",q:"Total energy fixed by producers in an ecosystem is called",o:{A:"Secondary productivity",B:"Net primary productivity",C:"Gross primary productivity",D:"Biomass"},a:"C",e:"GPP = total energy fixed by photosynthesis."},
  {id:"b056",s:"Biology",y:2020,t:"Nutrition",d:"Medium",q:"Which nutrient provides the most energy per gram?",o:{A:"Carbohydrates",B:"Proteins",C:"Vitamins",D:"Fats"},a:"D",e:"Fats: 9 kcal/g vs carbs and protein at 4 kcal/g."},
  {id:"b057",s:"Biology",y:2021,t:"Transport",d:"Easy",q:"Red blood cells are produced in",o:{A:"Red bone marrow",B:"The spleen",C:"Lymph nodes",D:"The liver"},a:"A",e:"Erythropoiesis occurs in red bone marrow."},
  {id:"b058",s:"Biology",y:2022,t:"Respiration",d:"Medium",q:"Anaerobic respiration in yeast produces",o:{A:"CO2 and water",B:"CO2 and ethanol",C:"Lactic acid",D:"Glucose"},a:"B",e:"Yeast fermentation: glucose gives ethanol and CO2."},
  {id:"b059",s:"Biology",y:2023,t:"Excretion",d:"Easy",q:"Urine is stored in the",o:{A:"Kidney",B:"Ureter",C:"Urinary bladder",D:"Urethra"},a:"C",e:"Urinary bladder stores urine before excretion."},
  {id:"b060",s:"Biology",y:2024,t:"Reproduction",d:"Medium",q:"Identical twins arise from",o:{A:"Two separate eggs fertilised by two sperm",B:"One egg fertilised by two sperm",C:"Two eggs fertilised by one sperm",D:"One fertilised egg that splits into two"},a:"D",e:"Monozygotic twins: one zygote splits into two."},
  {id:"b061",s:"Biology",y:2010,t:"Nervous System",d:"Easy",q:"The function of the myelin sheath is to",o:{A:"Insulate the axon and speed up impulses",B:"Store nerve impulses",C:"Connect neurons",D:"Produce neurotransmitters"},a:"A",e:"Myelin sheath insulates axon and increases conduction speed."},
  {id:"b062",s:"Biology",y:2011,t:"Evolution",d:"Medium",q:"Homologous structures have",o:{A:"Same function",B:"Same embryonic origin but different functions",C:"Different embryonic origins",D:"Identical appearance in all organisms"},a:"B",e:"Homologous: same origin different functions such as arm and fin."},
  {id:"b063",s:"Biology",y:2012,t:"Plant Biology",d:"Easy",q:"Water moves into root hair cells because they have a",o:{A:"Higher water potential",B:"Equal water potential",C:"Lower water potential",D:"Lower solute concentration"},a:"C",e:"Root cells have lower water potential so water moves in by osmosis."},
  {id:"b064",s:"Biology",y:2013,t:"Cell Biology",d:"Medium",q:"Lysosomes contain",o:{A:"Lipids for energy",B:"DNA and RNA",C:"Ribosomes",D:"Digestive enzymes"},a:"D",e:"Lysosomes contain hydrolytic digestive enzymes."},
  {id:"b065",s:"Biology",y:2014,t:"Genetics",d:"Hard",q:"Probability of a male child being colour blind if mother is carrier is",o:{A:"1/2",B:"1/4",C:"3/4",D:"1"},a:"A",e:"X-linked recessive: carrier mother passes defective X to 50% of sons."},
  {id:"b066",s:"Biology",y:2015,t:"Ecology",d:"Medium",q:"Which relationship benefits one organism and harms the other?",o:{A:"Mutualism",B:"Parasitism",C:"Commensalism",D:"Predation"},a:"B",e:"Parasitism (+/-): parasite benefits, host is harmed."},
  {id:"b067",s:"Biology",y:2016,t:"Nutrition",d:"Easy",q:"The mineral required for blood clotting is",o:{A:"Iron",B:"Iodine",C:"Calcium",D:"Fluorine"},a:"C",e:"Calcium ions are essential in the blood clotting cascade."},
  {id:"b068",s:"Biology",y:2017,t:"Transport",d:"Hard",q:"The SA node is the pacemaker because",o:{A:"It pumps blood",B:"It is in the aorta",C:"It stores blood",D:"It initiates the heartbeat by generating electrical impulses"},a:"D",e:"SA node generates impulses that start each heartbeat."},
  {id:"b069",s:"Biology",y:2018,t:"Respiration",d:"Hard",q:"Lactic acid is produced during anaerobic respiration in",o:{A:"Human muscle cells",B:"Bacteria",C:"Yeast",D:"Plants"},a:"A",e:"Muscle cells produce lactic acid when oxygen is insufficient."},
  {id:"b070",s:"Biology",y:2019,t:"Excretion",d:"Medium",q:"The process of removing metabolic waste products from the body is",o:{A:"Egestion",B:"Excretion",C:"Digestion",D:"Secretion"},a:"B",e:"Excretion: removal of metabolic waste products."},
  {id:"b071",s:"Biology",y:2020,t:"Reproduction",d:"Easy",q:"The male gamete in flowering plants is contained in",o:{A:"The ovule",B:"The anther",C:"Pollen grain",D:"The pistil"},a:"C",e:"Pollen grain contains the male gametes."},
  {id:"b072",s:"Biology",y:2021,t:"Nervous System",d:"Medium",q:"Insulin and glucagon are secreted by the",o:{A:"Adrenal gland",B:"Thyroid gland",C:"Pituitary gland",D:"Pancreas"},a:"D",e:"Islets of Langerhans in the pancreas secrete both hormones."},
  {id:"b073",s:"Biology",y:2022,t:"Evolution",d:"Hard",q:"Which is an example of disruptive selection?",o:{A:"Extreme phenotypes favoured over intermediate",B:"All birds develop medium beaks",C:"Only the largest individuals survive",D:"Only average individuals reproduce"},a:"A",e:"Disruptive selection: extremes favoured, intermediate eliminated."},
  {id:"b074",s:"Biology",y:2023,t:"Plant Biology",d:"Hard",q:"In C4 plants, CO2 is first fixed in mesophyll cells by combining with",o:{A:"RuBP",B:"PEP phosphoenolpyruvate",C:"Glucose",D:"ATP"},a:"B",e:"C4 pathway: CO2 + PEP gives oxaloacetate in mesophyll cells."},
  {id:"b075",s:"Biology",y:2024,t:"Cell Biology",d:"Medium",q:"Which process produces genetically identical daughter cells?",o:{A:"Meiosis I",B:"Meiosis II",C:"Mitosis",D:"Fertilisation"},a:"C",e:"Mitosis produces 2 genetically identical diploid daughter cells."},
  {id:"b076",s:"Biology",y:2010,t:"Genetics",d:"Medium",q:"A test cross involves crossing a dominant phenotype with",o:{A:"Another dominant",B:"A homozygous dominant",C:"A heterozygous organism",D:"A homozygous recessive"},a:"D",e:"Test cross: unknown dominant crossed with homozygous recessive."},
  {id:"b077",s:"Biology",y:2011,t:"Ecology",d:"Hard",q:"The nitrogen cycle process converting N2 to ammonia is called",o:{A:"Nitrogen fixation",B:"Nitrification",C:"Denitrification",D:"Ammonification"},a:"A",e:"Nitrogen fixation: N2 to NH3 by Rhizobium and Azotobacter."},
  {id:"b078",s:"Biology",y:2012,t:"Nutrition",d:"Medium",q:"The deficiency of iodine causes",o:{A:"Scurvy",B:"Goitre",C:"Rickets",D:"Kwashiorkor"},a:"B",e:"Iodine deficiency leads to goitre (enlarged thyroid gland)."},
  {id:"b079",s:"Biology",y:2013,t:"Transport",d:"Medium",q:"Which blood type is the universal donor?",o:{A:"AB",B:"A",C:"O",D:"B"},a:"C",e:"Blood group O has no A or B antigens and can donate to all."},
  {id:"b080",s:"Biology",y:2014,t:"Respiration",d:"Easy",q:"The raw materials for photosynthesis are",o:{A:"O2 and glucose",B:"CO2 and O2",C:"Glucose and water",D:"CO2 and water"},a:"D",e:"Photosynthesis uses CO2, water, and light energy."},
  {id:"b081",s:"Biology",y:2015,t:"Excretion",d:"Medium",q:"The Bowman's capsule surrounds the",o:{A:"Glomerulus",B:"Collecting duct",C:"Distal tubule",D:"Loop of Henle"},a:"A",e:"Bowman's capsule is a cup-like structure around the glomerulus."},
  {id:"b082",s:"Biology",y:2016,t:"Reproduction",d:"Medium",q:"Which part of the flower develops into a fruit?",o:{A:"Petal",B:"Ovary",C:"Sepal",D:"Stigma"},a:"B",e:"After fertilisation, the ovary develops into fruit."},
  {id:"b083",s:"Biology",y:2017,t:"Nervous System",d:"Medium",q:"The autonomic nervous system controls",o:{A:"Voluntary movement",B:"Conscious perception",C:"Involuntary body functions",D:"Reflex arcs"},a:"C",e:"ANS regulates involuntary functions like heart rate and digestion."},
  {id:"b084",s:"Biology",y:2018,t:"Evolution",d:"Medium",q:"Analogous structures perform similar functions but have",o:{A:"The same embryonic origin",B:"Different functions",C:"Identical embryonic origin",D:"Different origins"},a:"D",e:"Analogous: different origins same function (convergent evolution)."},
  {id:"b085",s:"Biology",y:2019,t:"Plant Biology",d:"Easy",q:"Chlorophyll is located in the",o:{A:"Chloroplast",B:"Nucleus",C:"Cell wall",D:"Mitochondria"},a:"A",e:"Chlorophyll pigment is found in chloroplasts."},
  {id:"b086",s:"Biology",y:2020,t:"Cell Biology",d:"Medium",q:"The cell membrane is described as",o:{A:"Rigid and impermeable",B:"Selectively permeable",C:"Fully permeable",D:"Completely impermeable"},a:"B",e:"Cell membrane = selectively permeable phospholipid bilayer."},
  {id:"b087",s:"Biology",y:2021,t:"Genetics",d:"Medium",q:"Which base pairs with adenine in DNA?",o:{A:"Guanine",B:"Cytosine",C:"Thymine",D:"Adenine"},a:"C",e:"In DNA: adenine pairs with thymine; guanine pairs with cytosine."},
  {id:"b088",s:"Biology",y:2022,t:"Ecology",d:"Medium",q:"The process by which dead organic matter is broken down is",o:{A:"Predation",B:"Competition",C:"Commensalism",D:"Decomposition"},a:"D",e:"Decomposition: microbes break down dead organic matter."},
  {id:"b089",s:"Biology",y:2023,t:"Nutrition",d:"Hard",q:"Kwashiorkor results from deficiency of",o:{A:"Protein",B:"Carbohydrates",C:"Fats",D:"Vitamin C"},a:"A",e:"Kwashiorkor = severe protein deficiency in young children."},
  {id:"b090",s:"Biology",y:2024,t:"Transport",d:"Medium",q:"The valve between the left atrium and left ventricle is the",o:{A:"Tricuspid",B:"Bicuspid mitral",C:"Pulmonary semilunar",D:"Aortic semilunar"},a:"B",e:"Left AV valve = bicuspid or mitral valve."},
  {id:"b091",s:"Biology",y:2010,t:"Respiration",d:"Medium",q:"Which microorganism carries out fermentation producing ethanol?",o:{A:"Bacteria",B:"Virus",C:"Yeast",D:"Fungi"},a:"C",e:"Yeast: anaerobic fermentation gives ethanol and CO2."},
  {id:"b092",s:"Biology",y:2011,t:"Excretion",d:"Easy",q:"Sweat glands are found in the",o:{A:"Liver",B:"Kidney",C:"Lungs",D:"Skin"},a:"D",e:"Sweat glands in the skin excrete water, salts, and urea."},
  {id:"b093",s:"Biology",y:2012,t:"Reproduction",d:"Medium",q:"Parthenogenesis is development from",o:{A:"An unfertilised egg",B:"Spore formation",C:"Binary fission",D:"Budding"},a:"A",e:"Parthenogenesis: development of an unfertilised egg."},
  {id:"b094",s:"Biology",y:2013,t:"Nervous System",d:"Easy",q:"The part of the brain responsible for conscious thought is the",o:{A:"Medulla oblongata",B:"Cerebral cortex",C:"Hypothalamus",D:"Cerebellum"},a:"B",e:"Cerebral cortex: seat of consciousness, reasoning, and memory."},
  {id:"b095",s:"Biology",y:2014,t:"Evolution",d:"Hard",q:"Punctuated equilibrium suggests evolution occurs",o:{A:"Gradually and continuously",B:"Only in large populations",C:"Rapidly in short bursts followed by long stability",D:"Only through Lamarckian inheritance"},a:"C",e:"Gould and Eldredge: rapid change then long periods of stasis."},
  {id:"b096",s:"Biology",y:2015,t:"Plant Biology",d:"Medium",q:"Phloem transports",o:{A:"Water only",B:"Mineral salts only",C:"Water and mineral salts",D:"Organic solutes such as sugars from leaves"},a:"D",e:"Phloem translocates sugars from source to sink."},
  {id:"b097",s:"Biology",y:2016,t:"Cell Biology",d:"Hard",q:"The fluid mosaic model describes the cell membrane as",o:{A:"A phospholipid bilayer with mobile embedded proteins",B:"A rigid lattice of proteins",C:"A static protein layer",D:"A single layer of lipids"},a:"A",e:"Singer and Nicolson 1972: fluid phospholipid bilayer with mobile proteins."},
  {id:"b098",s:"Biology",y:2017,t:"Genetics",d:"Hard",q:"If mutation rate = 10^-6 and population = 10^6, expected new mutants per generation is",o:{A:"0",B:"1",C:"0.1",D:"10"},a:"B",e:"10^-6 x 10^6 = 1 new mutant per generation."},
  {id:"b099",s:"Biology",y:2018,t:"Ecology",d:"Hard",q:"The competitive exclusion principle states that two species occupying the same niche",o:{A:"Can coexist indefinitely",B:"Always cooperate",C:"Cannot coexist indefinitely",D:"Share resources equally"},a:"C",e:"Gause: one species will be excluded or niche will diverge."},
  {id:"b100",s:"Biology",y:2019,t:"Nutrition",d:"Medium",q:"Bile emulsifies",o:{A:"Proteins into peptides",B:"Starch into sugars",C:"Nucleic acids",D:"Fats into smaller droplets"},a:"D",e:"Bile salts emulsify fat globules increasing surface area for lipase."},
  {id:"cr001",s:"CRS",y:2010,t:"Old Testament",d:"Easy",q:"God called Abraham to leave his country in",o:{A:"Genesis 12",B:"Isaiah",C:"Deuteronomy",D:"Numbers"},a:"A",e:"Genesis 12: God called Abraham from Ur to Canaan."},
  {id:"cr002",s:"CRS",y:2011,t:"New Testament",d:"Easy",q:"The birth of Jesus is celebrated on",o:{A:"1 January",B:"25 December",C:"5 April",D:"25 March"},a:"B",e:"Christmas: 25 December."},
  {id:"cr003",s:"CRS",y:2012,t:"Old Testament",d:"Medium",q:"The book of Psalms is attributed mainly to",o:{A:"Moses",B:"Solomon",C:"David",D:"Isaiah"},a:"C",e:"Most Psalms are attributed to King David."},
  {id:"cr004",s:"CRS",y:2013,t:"Church History",d:"Easy",q:"Pentecost Sunday celebrates the descent of",o:{A:"Jesus to Earth",B:"The dove to Noah",C:"Angels in heaven",D:"The Holy Spirit upon the disciples"},a:"D",e:"Acts 2: the Holy Spirit descended on the disciples at Pentecost."},
  {id:"cr005",s:"CRS",y:2014,t:"New Testament",d:"Easy",q:"The first four books of the New Testament are known as the",o:{A:"Gospels",B:"General Epistles",C:"Acts and Letters",D:"Pauline Epistles"},a:"A",e:"Matthew, Mark, Luke, John: the Four Gospels."},
  {id:"cr006",s:"CRS",y:2015,t:"Old Testament",d:"Medium",q:"The Ten Commandments were given to Moses on",o:{A:"Mount Hermon",B:"Mount Sinai",C:"Mount Zion",D:"Mount Carmel"},a:"B",e:"Exodus 20: God gave the Ten Commandments to Moses on Mount Sinai."},
  {id:"cr007",s:"CRS",y:2016,t:"New Testament",d:"Easy",q:"Jesus was baptised by",o:{A:"Peter",B:"James",C:"John the Baptist",D:"John the Apostle"},a:"C",e:"Matthew 3: Jesus was baptised by John the Baptist."},
  {id:"cr008",s:"CRS",y:2017,t:"Old Testament",d:"Medium",q:"David killed Goliath with",o:{A:"A sword",B:"His bare hands",C:"A spear",D:"A sling and stone"},a:"D",e:"1 Samuel 17: David killed Goliath with a sling and stone."},
  {id:"cr009",s:"CRS",y:2018,t:"New Testament",d:"Easy",q:"The Sermon on the Mount is recorded in",o:{A:"Matthew 5-7",B:"John",C:"Acts",D:"Luke"},a:"A",e:"Matthew 5-7: the Sermon on the Mount."},
  {id:"cr010",s:"CRS",y:2019,t:"Church History",d:"Medium",q:"The Reformation was started by",o:{A:"John Wesley",B:"Martin Luther in 1517",C:"John Calvin",D:"Thomas Aquinas"},a:"B",e:"Luther's 95 Theses (1517) sparked the Protestant Reformation."},
  {id:"cr011",s:"CRS",y:2020,t:"Old Testament",d:"Easy",q:"Noah built an ark at the command of",o:{A:"Moses",B:"David",C:"God",D:"Solomon"},a:"C",e:"Genesis 6: God commanded Noah to build the ark."},
  {id:"cr012",s:"CRS",y:2021,t:"New Testament",d:"Easy",q:"Jesus chose how many disciples?",o:{A:"10",B:"8",C:"14",D:"12"},a:"D",e:"Mark 3:14: Jesus appointed twelve disciples."},
  {id:"cr013",s:"CRS",y:2022,t:"Old Testament",d:"Medium",q:"Joseph's coat of many colours was given by",o:{A:"His father Jacob",B:"His brothers",C:"God",D:"His mother"},a:"A",e:"Genesis 37: Jacob gave Joseph a coat of many colours."},
  {id:"cr014",s:"CRS",y:2023,t:"New Testament",d:"Medium",q:"The Last Supper took place during",o:{A:"Christmas",B:"The Passover feast",C:"Easter Sunday",D:"Pentecost"},a:"B",e:"Luke 22: Jesus held the Last Supper during Passover."},
  {id:"cr015",s:"CRS",y:2024,t:"Church History",d:"Easy",q:"The Bible is divided into",o:{A:"One Testament",B:"Three Testaments",C:"Two Testaments: Old and New",D:"Four Testaments"},a:"C",e:"The Bible: Old Testament and New Testament."},
  {id:"cr016",s:"CRS",y:2010,t:"Old Testament",d:"Easy",q:"Samson's strength came from",o:{A:"His armour",B:"His sword",C:"His prayer",D:"His long hair"},a:"D",e:"Judges 16: Samson's strength was in his hair."},
  {id:"cr017",s:"CRS",y:2011,t:"New Testament",d:"Easy",q:"Jesus fed 5000 people with",o:{A:"5 loaves and 2 fish",B:"2 loaves and 5 fish",C:"7 loaves and 3 fish",D:"10 loaves and 5 fish"},a:"A",e:"John 6: Jesus used 5 loaves and 2 fish to feed 5000."},
  {id:"cr018",s:"CRS",y:2012,t:"Old Testament",d:"Medium",q:"The first king of Israel was",o:{A:"David",B:"Saul",C:"Samuel",D:"Solomon"},a:"B",e:"1 Samuel 10: Saul was anointed as Israel's first king."},
  {id:"cr019",s:"CRS",y:2013,t:"New Testament",d:"Easy",q:"Who denied Jesus three times?",o:{A:"John",B:"James",C:"Peter",D:"Judas"},a:"C",e:"Matthew 26:75: Peter denied Jesus three times."},
  {id:"cr020",s:"CRS",y:2014,t:"Church History",d:"Medium",q:"The Council of Nicaea (325 AD) was convened to address",o:{A:"Missionary activities",B:"Distribution of tithes",C:"Authority of bishops",D:"The nature of Christ (Arianism controversy)"},a:"D",e:"Council of Nicaea 325: resolved Arianism; produced Nicene Creed."},
  {id:"cr021",s:"CRS",y:2015,t:"Old Testament",d:"Easy",q:"Moses parted the",o:{A:"Red Sea",B:"Sea of Galilee",C:"River Nile",D:"Jordan River"},a:"A",e:"Exodus 14: Moses parted the Red Sea."},
  {id:"cr022",s:"CRS",y:2016,t:"New Testament",d:"Medium",q:"The Beatitudes begin with Blessed are the",o:{A:"Rich in spirit",B:"Poor in spirit",C:"Merciful",D:"Strong in faith"},a:"B",e:"Matthew 5:3: Blessed are the poor in spirit."},
  {id:"cr023",s:"CRS",y:2017,t:"Old Testament",d:"Hard",q:"The book of Job deals primarily with the theme of",o:{A:"Creation",B:"Prophecy",C:"Suffering and God's justice",D:"Wisdom of Solomon"},a:"C",e:"Job: explores why the righteous suffer and God's sovereignty."},
  {id:"cr024",s:"CRS",y:2018,t:"New Testament",d:"Easy",q:"The parable of the Prodigal Son is in",o:{A:"Matthew",B:"Mark",C:"John",D:"Luke"},a:"D",e:"Luke 15:11-32: the Parable of the Prodigal Son."},
  {id:"cr025",s:"CRS",y:2019,t:"Church History",d:"Medium",q:"The Apostles Creed is",o:{A:"A statement of basic Christian beliefs",B:"A list of miracles",C:"A missionary guideline",D:"A prayer for healing"},a:"A",e:"Apostles' Creed: early Christian summary of core doctrines."},
  {id:"cr026",s:"CRS",y:2020,t:"Old Testament",d:"Medium",q:"The prophet taken to heaven in a chariot of fire was",o:{A:"Moses",B:"Elijah",C:"Jeremiah",D:"Isaiah"},a:"B",e:"2 Kings 2: Elijah was taken to heaven in a chariot of fire."},
  {id:"cr027",s:"CRS",y:2021,t:"New Testament",d:"Hard",q:"Which of these is NOT a fruit of the Spirit (Galatians 5)?",o:{A:"Love",B:"Peace",C:"Power",D:"Gentleness"},a:"C",e:"Galatians 5:22-23: love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self-control."},
  {id:"cr028",s:"CRS",y:2022,t:"Old Testament",d:"Easy",q:"Adam and Eve lived in the Garden of",o:{A:"Gethsemane",B:"Zion",C:"Galilee",D:"Eden"},a:"D",e:"Genesis 2: Adam and Eve in the Garden of Eden."},
  {id:"cr029",s:"CRS",y:2023,t:"New Testament",d:"Medium",q:"The Great Commission commands believers to",o:{A:"Go and make disciples of all nations",B:"Pray only",C:"Fast regularly",D:"Stay in Jerusalem only"},a:"A",e:"Matthew 28:19: Go and make disciples of all nations."},
  {id:"cr030",s:"CRS",y:2024,t:"Church History",d:"Hard",q:"Liberation theology originated in",o:{A:"North America",B:"Latin America in the 1960s and 70s",C:"Asia",D:"Europe"},a:"B",e:"Liberation theology: Catholic movement linking faith with social justice."},
  {id:"cr031",s:"CRS",y:2010,t:"Old Testament",d:"Medium",q:"Solomon was known for his",o:{A:"Military conquests",B:"Athletic ability",C:"Wisdom",D:"Musical talent"},a:"C",e:"1 Kings 3: God gave Solomon exceptional wisdom."},
  {id:"cr032",s:"CRS",y:2011,t:"New Testament",d:"Easy",q:"The Holy Trinity consists of",o:{A:"Father, Mother, Son",B:"Father, Son, Disciples",C:"Father, Moses, Son",D:"Father, Son, and Holy Spirit"},a:"D",e:"Christian doctrine: Trinity = Father, Son, and Holy Spirit."},
  {id:"cr033",s:"CRS",y:2012,t:"Old Testament",d:"Easy",q:"The Passover commemorates",o:{A:"God passing over Israelites during the last plague in Egypt",B:"Crossing of Jordan",C:"Giving of the Law",D:"Birth of Moses"},a:"A",e:"Exodus 12: God passed over Israelite homes marked with blood."},
  {id:"cr034",s:"CRS",y:2013,t:"New Testament",d:"Medium",q:"Paul was formerly known as",o:{A:"Philip",B:"Saul",C:"Stephen",D:"Silas"},a:"B",e:"Acts 9: Saul became Paul after his conversion on the road to Damascus."},
  {id:"cr035",s:"CRS",y:2014,t:"Church History",d:"Medium",q:"The Protestant Reformation rejected",o:{A:"Church attendance",B:"Prayer",C:"The authority of the Pope and certain Catholic doctrines",D:"Reading the Bible"},a:"C",e:"Reformation: Luther and Calvin challenged papal authority."},
  {id:"cr036",s:"CRS",y:2015,t:"Old Testament",d:"Medium",q:"The prophet Daniel was famous for",o:{A:"Parting the sea",B:"Writing the Psalms",C:"Leading the Exodus",D:"Interpreting dreams and surviving the lions den"},a:"D",e:"Daniel 2 and 6: Daniel interpreted dreams; survived the lions den."},
  {id:"cr037",s:"CRS",y:2016,t:"New Testament",d:"Easy",q:"Jesus raised Lazarus from the dead after how many days?",o:{A:"4",B:"2",C:"5",D:"1"},a:"A",e:"John 11:17: Lazarus had been in the tomb four days."},
  {id:"cr038",s:"CRS",y:2017,t:"Old Testament",d:"Medium",q:"The story of Ruth demonstrates",o:{A:"Political ambition",B:"Loyalty, love, and faithfulness",C:"Royal succession",D:"Military conquest"},a:"B",e:"Ruth: Ruth's loyalty to Naomi."},
  {id:"cr039",s:"CRS",y:2018,t:"New Testament",d:"Hard",q:"The Book of Revelation was written by",o:{A:"Paul",B:"Peter",C:"John the Apostle while in exile on Patmos",D:"Matthew"},a:"C",e:"Revelation 1:9: written by John on Patmos."},
  {id:"cr040",s:"CRS",y:2019,t:"Church History",d:"Medium",q:"Denominationalism in Christianity refers to",o:{A:"Rejection of the Bible",B:"Christian unity",C:"Opposition to missions",D:"The existence of distinct groups (denominations) within Christianity"},a:"D",e:"Denominationalism: Catholic, Anglican, Baptist, Methodist, Pentecostal."},
  {id:"cr041",s:"CRS",y:2020,t:"Old Testament",d:"Easy",q:"The story of creation is in",o:{A:"Genesis",B:"Numbers",C:"Exodus",D:"Deuteronomy"},a:"A",e:"Genesis 1-2: the account of God's creation."},
  {id:"cr042",s:"CRS",y:2021,t:"New Testament",d:"Medium",q:"The Transfiguration of Jesus occurred on",o:{A:"Mount Sinai",B:"A high mountain (Mount Tabor by tradition)",C:"Mount Hermon",D:"The Mount of Olives"},a:"B",e:"Matthew 17: Jesus was transfigured; Moses and Elijah appeared."},
  {id:"cr043",s:"CRS",y:2022,t:"Old Testament",d:"Hard",q:"The Suffering Servant in Isaiah 53 is widely interpreted as a prophecy about",o:{A:"Moses",B:"David",C:"Jesus Christ",D:"Isaiah himself"},a:"C",e:"Isaiah 53: despised and rejected servant; interpreted as prophecy of Jesus."},
  {id:"cr044",s:"CRS",y:2023,t:"New Testament",d:"Easy",q:"The Lord's Prayer begins with",o:{A:"I am the Way",B:"Our Lord who art in Heaven",C:"Hail Mary, full of grace",D:"Our Father, who art in heaven"},a:"D",e:"Matthew 6:9: Our Father, who art in heaven."},
  {id:"cr045",s:"CRS",y:2024,t:"Church History",d:"Medium",q:"The World Council of Churches promotes",o:{A:"Ecumenism: unity among different Christian denominations",B:"Rejection of the Old Testament",C:"Conversion of all religions",D:"Competition between denominations"},a:"A",e:"WCC (founded 1948): fosters unity among Christian churches."},
  {id:"cr046",s:"CRS",y:2010,t:"Old Testament",d:"Easy",q:"The Ten Commandments appear in Exodus and also in",o:{A:"Numbers",B:"Deuteronomy",C:"Joshua",D:"Leviticus"},a:"B",e:"The Ten Commandments: Exodus 20 and Deuteronomy 5."},
  {id:"cr047",s:"CRS",y:2011,t:"New Testament",d:"Easy",q:"The miracle at Cana involved turning water into",o:{A:"Oil",B:"Bread",C:"Wine",D:"Milk"},a:"C",e:"John 2: Jesus turned water into wine at the wedding in Cana."},
  {id:"cr048",s:"CRS",y:2012,t:"Old Testament",d:"Medium",q:"Jonah was swallowed by a great fish because he",o:{A:"Was preaching in Nineveh",B:"Fell into the sea by accident",C:"Was being punished for theft",D:"Fled God's call and was thrown overboard"},a:"D",e:"Jonah 1: Jonah fled to Tarshish; sailors threw him overboard."},
  {id:"cr049",s:"CRS",y:2013,t:"New Testament",d:"Medium",q:"The book of Acts records",o:{A:"The early church and Holy Spirit's work through the apostles",B:"Paul and Barnabas only",C:"Jesus's early childhood",D:"Moses and the Israelites"},a:"A",e:"Acts: history of early church, especially Peter and Paul."},
  {id:"cr050",s:"CRS",y:2014,t:"Church History",d:"Hard",q:"Monasticism in early Christianity emphasised",o:{A:"Wealth and power",B:"Prayer, celibacy, communal life, and withdrawal from the world",C:"Charismatic worship",D:"Active political involvement"},a:"B",e:"Monasticism: Desert Fathers; later Benedictines and Franciscans."},
  {id:"cr051",s:"CRS",y:2015,t:"Old Testament",d:"Medium",q:"The covenant God made with Noah was symbolised by",o:{A:"A burning bush",B:"An altar",C:"A rainbow",D:"A river"},a:"C",e:"Genesis 9:13: God set a rainbow as the sign of covenant with Noah."},
  {id:"cr052",s:"CRS",y:2016,t:"New Testament",d:"Easy",q:"Which Gospel focuses most on the poor and social justice?",o:{A:"Matthew",B:"Mark",C:"John",D:"Luke"},a:"D",e:"Luke: emphasises Jesus's compassion for the poor, women, and outcasts."},
  {id:"cr053",s:"CRS",y:2017,t:"Old Testament",d:"Easy",q:"The first book of the Bible is",o:{A:"Genesis",B:"Leviticus",C:"Numbers",D:"Exodus"},a:"A",e:"Genesis is the first book of the Old Testament."},
  {id:"cr054",s:"CRS",y:2018,t:"New Testament",d:"Medium",q:"Paul's letter to the Romans is primarily about",o:{A:"Church governance",B:"Justification by faith",C:"Jewish history",D:"Prayer and fasting"},a:"B",e:"Romans: Paul's exposition of salvation by grace through faith."},
  {id:"cr055",s:"CRS",y:2019,t:"Church History",d:"Medium",q:"Christian missionaries came to West Africa mainly in the",o:{A:"20th century",B:"17th century",C:"19th century",D:"15th century"},a:"C",e:"19th century: major missionary activity in West Africa."},
  {id:"cr056",s:"CRS",y:2020,t:"Old Testament",d:"Easy",q:"The Exodus describes Israel's",o:{A:"Return from Babylon",B:"Settlement in Canaan",C:"Building of the Temple",D:"Departure from Egypt under Moses"},a:"D",e:"Exodus: Moses leads the Israelites out of Egyptian slavery."},
  {id:"cr057",s:"CRS",y:2021,t:"New Testament",d:"Easy",q:"Jesus was crucified at a place called",o:{A:"Golgotha (Calvary)",B:"Nazareth",C:"Jericho",D:"Bethlehem"},a:"A",e:"Matthew 27:33: Jesus was crucified at Golgotha."},
  {id:"cr058",s:"CRS",y:2022,t:"Old Testament",d:"Hard",q:"The Hebrew concept of shalom means",o:{A:"Strict justice",B:"Comprehensive peace, wholeness, and wellbeing",C:"Punishment of enemies",D:"Ritual purity"},a:"B",e:"Shalom: deep peace; not just absence of conflict but total flourishing."},
  {id:"cr059",s:"CRS",y:2023,t:"New Testament",d:"Medium",q:"The epistle to the Hebrews presents Jesus as",o:{A:"A political revolutionary",B:"An ordinary prophet",C:"The ultimate High Priest fulfilling Old Testament sacrificial law",D:"Only human"},a:"C",e:"Hebrews: Jesus as great High Priest; his sacrifice supersedes all others."},
  {id:"cr060",s:"CRS",y:2024,t:"Church History",d:"Medium",q:"The Pentecostal movement began in",o:{A:"Germany in 1750",B:"England in 1850",C:"Nigeria in 1900",D:"Azusa Street, Los Angeles, USA in 1906"},a:"D",e:"Azusa Street Revival 1906: birth of modern Pentecostalism."},
  {id:"cr061",s:"CRS",y:2010,t:"Old Testament",d:"Easy",q:"Jacob had how many sons?",o:{A:"12",B:"11",C:"13",D:"10"},a:"A",e:"Genesis 35:22-26: Jacob had 12 sons (the 12 tribes of Israel)."},
  {id:"cr062",s:"CRS",y:2011,t:"New Testament",d:"Easy",q:"The Resurrection of Jesus is celebrated on",o:{A:"Palm Sunday",B:"Easter Sunday",C:"Good Friday",D:"Ash Wednesday"},a:"B",e:"Easter Sunday: celebrates Jesus's resurrection from the dead."},
  {id:"cr063",s:"CRS",y:2012,t:"Old Testament",d:"Medium",q:"The book of Proverbs is",o:{A:"Prophecy",B:"Law",C:"Wisdom literature",D:"History"},a:"C",e:"Proverbs: part of the Wisdom literature."},
  {id:"cr064",s:"CRS",y:2013,t:"New Testament",d:"Medium",q:"Who wrote most of the New Testament epistles?",o:{A:"Peter",B:"John",C:"James",D:"Paul"},a:"D",e:"Paul wrote 13 of the 27 New Testament books."},
  {id:"cr065",s:"CRS",y:2014,t:"Church History",d:"Easy",q:"A bishop oversees",o:{A:"A diocese (group of churches)",B:"A local congregation",C:"A country only",D:"A city district"},a:"A",e:"Bishop: oversees a diocese."},
  {id:"cr066",s:"CRS",y:2015,t:"Old Testament",d:"Easy",q:"Moses received the Law on behalf of",o:{A:"All nations",B:"The nation of Israel",C:"Egypt",D:"The Church"},a:"B",e:"Exodus 19-20: God gave the Law to Moses for Israel."},
  {id:"cr067",s:"CRS",y:2016,t:"New Testament",d:"Medium",q:"The parable of the Good Samaritan teaches",o:{A:"Ethnic pride",B:"Tithing",C:"Love for one's neighbour regardless of background",D:"Political loyalty"},a:"C",e:"Luke 10:25-37: love thy neighbour."},
  {id:"cr068",s:"CRS",y:2017,t:"Old Testament",d:"Medium",q:"The prophet Amos preached against",o:{A:"False gods only",B:"Ritual impurity",C:"Intermarriage",D:"Social injustice and oppression of the poor"},a:"D",e:"Amos: God demands justice not empty ritual."},
  {id:"cr069",s:"CRS",y:2018,t:"New Testament",d:"Easy",q:"The fruit of the Spirit listed in Galatians 5 includes",o:{A:"Love, joy, and peace",B:"Prophecy",C:"Power",D:"Healing"},a:"A",e:"Galatians 5:22: love, joy, peace, patience, kindness, goodness, faithfulness."},
  {id:"cr070",s:"CRS",y:2019,t:"Church History",d:"Hard",q:"The Nicene Creed affirms that Jesus is",o:{A:"A created being inferior to God",B:"The same in essence as God the Father (homoousios)",C:"The highest angel",D:"Only human"},a:"B",e:"Nicene Creed 325: Jesus is of one substance with the Father."},
  {id:"cr071",s:"CRS",y:2020,t:"Old Testament",d:"Easy",q:"The Tower of Babel explains",o:{A:"The origin of death",B:"Building of Jerusalem",C:"Why there are many languages on earth",D:"Creation of animals"},a:"C",e:"Genesis 11: God confused languages at Babel to scatter humanity."},
  {id:"cr072",s:"CRS",y:2021,t:"New Testament",d:"Easy",q:"Jesus said I am the Way, the Truth, and the Life in the Gospel of",o:{A:"Matthew",B:"Mark",C:"Luke",D:"John"},a:"D",e:"John 14:6: I am the way, the truth, and the life."},
  {id:"cr073",s:"CRS",y:2022,t:"Old Testament",d:"Medium",q:"The year of Jubilee in Israel was celebrated every",o:{A:"50 years",B:"100 years",C:"7 years",D:"25 years"},a:"A",e:"Leviticus 25:10: Jubilee every 50 years; land returned, slaves freed."},
  {id:"cr074",s:"CRS",y:2023,t:"New Testament",d:"Hard",q:"In Revelation the number 666 is most likely a numerical code for",o:{A:"The Holy Trinity",B:"A Roman emperor (probably Nero)",C:"Number of God's people",D:"Year of Christ's birth"},a:"B",e:"666 (Revelation 13:18): gematria often linked to Emperor Nero."},
  {id:"cr075",s:"CRS",y:2024,t:"Church History",d:"Medium",q:"Archbishop Janani Luwum is commemorated for",o:{A:"Founding Anglicanism",B:"Writing the Nicene Creed",C:"His martyrdom under Idi Amin in Uganda (1977)",D:"Missionary work in Europe"},a:"C",e:"Luwum: Archbishop of Uganda; martyred by Idi Amin's regime."},
  {id:"cr076",s:"CRS",y:2010,t:"Old Testament",d:"Medium",q:"Rahab helped the Israelite spies in",o:{A:"Babylon",B:"Egypt",C:"Jerusalem",D:"Jericho"},a:"D",e:"Joshua 2: Rahab hid Joshua's spies in Jericho and was spared."},
  {id:"cr077",s:"CRS",y:2011,t:"New Testament",d:"Easy",q:"The Annunciation was the announcement to the Virgin Mary that",o:{A:"She would conceive Jesus",B:"She must travel to Jerusalem",C:"She had a special gift",D:"She was blessed"},a:"A",e:"Luke 1:26-38: Angel Gabriel announced to Mary."},
  {id:"cr078",s:"CRS",y:2012,t:"Old Testament",d:"Medium",q:"Elijah challenged the prophets of Baal on",o:{A:"Mount Moriah",B:"Mount Carmel",C:"Mount Sinai",D:"Mount Zion"},a:"B",e:"1 Kings 18: Elijah defeated 450 prophets of Baal on Mount Carmel."},
  {id:"cr079",s:"CRS",y:2013,t:"New Testament",d:"Medium",q:"Jesus's entry into Jerusalem on a donkey is known as",o:{A:"The Ascension",B:"The Transfiguration",C:"Palm Sunday",D:"The Triumphal Entry"},a:"C",e:"Matthew 21: Jesus entered Jerusalem on a donkey; crowd waved palm branches."},
  {id:"cr080",s:"CRS",y:2014,t:"Church History",d:"Hard",q:"Sola Scriptura in the Reformation means",o:{A:"Scripture and tradition are equally authoritative",B:"Salvation by works alone",C:"Scripture is secondary to Church authority",D:"Scripture alone is the supreme authority in matters of faith"},a:"D",e:"Sola Scriptura (Luther): the Bible alone is the final authority."},
  {id:"cr081",s:"CRS",y:2015,t:"Old Testament",d:"Easy",q:"The first human sin (the Fall) involved",o:{A:"Eating the forbidden fruit",B:"Pride",C:"Idolatry",D:"Murder"},a:"A",e:"Genesis 3: Adam and Eve disobeyed God by eating the forbidden fruit."},
  {id:"cr082",s:"CRS",y:2016,t:"New Testament",d:"Medium",q:"Zacchaeus was a",o:{A:"Pharisee",B:"Tax collector who encountered Jesus in Jericho",C:"Soldier",D:"Temple priest"},a:"B",e:"Luke 19: Zacchaeus climbed a tree to see Jesus."},
  {id:"cr083",s:"CRS",y:2017,t:"Old Testament",d:"Medium",q:"The Deuteronomic code refers to",o:{A:"The Psalms of David",B:"The writings of Ezra",C:"The laws in the book of Deuteronomy",D:"Paul's letters"},a:"C",e:"Deuteronomy: Moses reiterates the Law before Israel enters Canaan."},
  {id:"cr084",s:"CRS",y:2018,t:"New Testament",d:"Easy",q:"The book of Revelation is a type of literature called",o:{A:"Epistle",B:"Gospel",C:"Biography",D:"Apocalyptic literature"},a:"D",e:"Revelation: apocalyptic genre with symbolic visions."},
  {id:"cr085",s:"CRS",y:2019,t:"Church History",d:"Medium",q:"The Salvation Army was founded by",o:{A:"William Booth (1865)",B:"Martin Luther",C:"John Wesley",D:"John Calvin"},a:"A",e:"William Booth founded the Salvation Army in London in 1865."},
  {id:"cr086",s:"CRS",y:2020,t:"Old Testament",d:"Medium",q:"The Ark of the Covenant contained",o:{A:"Solomon's writings",B:"The stone tablets of the Law, manna, and Aaron's rod",C:"Mary's veil",D:"Elijah's mantle"},a:"B",e:"Hebrews 9:4: ark held tablets, manna, and Aaron's staff."},
  {id:"cr087",s:"CRS",y:2021,t:"New Testament",d:"Easy",q:"Jesus performed his first miracle in",o:{A:"Jerusalem",B:"Bethlehem",C:"Cana of Galilee",D:"Nazareth"},a:"C",e:"John 2:1-11: first miracle; turning water into wine at Cana."},
  {id:"cr088",s:"CRS",y:2022,t:"Old Testament",d:"Hard",q:"Corporate personality in the Old Testament means",o:{A:"Only king represents God",B:"Only priests matter",C:"Individuals act completely independently",D:"An individual's actions can affect the entire community"},a:"D",e:"Corporate personality: one person's sin affects all (e.g., Achan, Joshua 7)."},
  {id:"cr089",s:"CRS",y:2023,t:"New Testament",d:"Medium",q:"The Epistle of James emphasises",o:{A:"Faith without works is dead",B:"Grace alone",C:"Speaking in tongues",D:"Predestination"},a:"A",e:"James 2:17: Faith without works is dead."},
  {id:"cr090",s:"CRS",y:2024,t:"Church History",d:"Easy",q:"Christianity spread to Nigeria largely through",o:{A:"Government decree",B:"Missionary activity and education in the 19th century",C:"Migration from Egypt",D:"Trade alone"},a:"B",e:"Missionaries and Ajayi Crowther brought Christianity to Nigeria."},
  {id:"cr091",s:"CRS",y:2010,t:"Old Testament",d:"Easy",q:"The first commandment is",o:{A:"Do not murder",B:"Do not steal",C:"You shall have no other gods before God",D:"Honour your father and mother"},a:"C",e:"Exodus 20:3: You shall have no other gods before me."},
  {id:"cr092",s:"CRS",y:2011,t:"New Testament",d:"Medium",q:"Grace in Christianity means",o:{A:"Salvation by good works",B:"Strict law observance",C:"God's unmerited favour and forgiveness given freely",D:"Only God is righteous"},a:"D",e:"Grace: unearned divine favour; basis of Christian salvation theology."},
  {id:"cr093",s:"CRS",y:2012,t:"Old Testament",d:"Medium",q:"The covenant of circumcision was made between God and",o:{A:"Abraham",B:"David",C:"Jacob",D:"Moses"},a:"A",e:"Genesis 17: God commanded circumcision as sign of covenant with Abraham."},
  {id:"cr094",s:"CRS",y:2013,t:"New Testament",d:"Easy",q:"Who baptised Jesus?",o:{A:"James",B:"John the Baptist",C:"Andrew",D:"Peter"},a:"B",e:"Matthew 3:13-17: John the Baptist baptised Jesus."},
  {id:"cr095",s:"CRS",y:2014,t:"Church History",d:"Medium",q:"The charismatic renewal movement emphasises",o:{A:"Liturgy only",B:"Church law",C:"Spiritual gifts such as tongues and healing",D:"Academic theology"},a:"C",e:"Charismatic renewal: emphasis on gifts of the Spirit."},
  {id:"cr096",s:"CRS",y:2015,t:"Old Testament",d:"Medium",q:"Isaiah is known as the Messianic Prophet because",o:{A:"He came after Jesus",B:"He lived in New Testament era",C:"He wrote only about kings",D:"His writings contain numerous prophecies about the coming Messiah"},a:"D",e:"Isaiah 7, 9, 53: prophecies interpreted as foretelling Jesus Christ."},
  {id:"cr097",s:"CRS",y:2016,t:"New Testament",d:"Easy",q:"Jesus died on the cross on",o:{A:"Good Friday",B:"Ash Wednesday",C:"Easter Sunday",D:"Palm Sunday"},a:"A",e:"Good Friday: the crucifixion of Jesus Christ."},
  {id:"cr098",s:"CRS",y:2017,t:"Old Testament",d:"Medium",q:"The Levites in Israel were set apart for",o:{A:"Commerce",B:"Priestly and Temple duties",C:"Farming",D:"Military service"},a:"B",e:"Numbers 3: the Levites served as priests and assistants in the Tabernacle."},
  {id:"cr099",s:"CRS",y:2018,t:"New Testament",d:"Hard",q:"The Logos (Word) in John 1:1 refers to",o:{A:"A book of laws",B:"An angel",C:"The pre-existent divine Christ",D:"The Holy Spirit"},a:"C",e:"John 1:1: In the beginning was the Word; the pre-incarnate Christ."},
  {id:"cr100",s:"CRS",y:2019,t:"Church History",d:"Medium",q:"Ajayi Crowther was significant in Nigerian church history because he was",o:{A:"The first Nigerian Anglican bishop",B:"A colonial officer",C:"Founder of Catholic Church in Nigeria",D:"A Muslim missionary"},a:"D",e:"Samuel Ajayi Crowther: first African Anglican bishop, consecrated 1864."},
  {id:"c001",s:"Chemistry",y:2010,t:"Atomic Structure",d:"Easy",q:"The number of protons determines the",o:{A:"Atomic number",B:"Number of neutrons",C:"Isotope type",D:"Mass number"},a:"A",e:"Atomic number Z = proton count; unique per element."},
  {id:"c002",s:"Chemistry",y:2011,t:"Chemical Bonding",d:"Medium",q:"Which has a dative covalent bond?",o:{A:"NaCl",B:"NH4+",C:"CO2",D:"H2O"},a:"B",e:"In NH4+, N donates both electrons for one N-H bond."},
  {id:"c003",s:"Chemistry",y:2012,t:"Stoichiometry",d:"Hard",q:"40 g NaOH + excess HCl. NaCl formed (Na=23, Cl=35.5)?",o:{A:"40 g",B:"29.25 g",C:"58.5 g",D:"117 g"},a:"C",e:"40g NaOH = 1 mol giving 1 mol NaCl; mass = 58.5 g."},
  {id:"c004",s:"Chemistry",y:2013,t:"Redox",d:"Medium",q:"In 2Mg + O2 gives 2MgO, Mg is",o:{A:"Reduced",B:"A catalyst",C:"An oxidising agent",D:"Oxidised"},a:"D",e:"Mg loses electrons giving Mg2+; loss of electrons = oxidation."},
  {id:"c005",s:"Chemistry",y:2014,t:"Gas Laws",d:"Hard",q:"Gas at 27 C occupies 200 cm3. At 127 C (same P) volume is",o:{A:"266.7 cm3",B:"100 cm3",C:"150 cm3",D:"400 cm3"},a:"A",e:"Charles: V1/T1=V2/T2; V2=200x400/300=266.7 cm3."},
  {id:"c006",s:"Chemistry",y:2015,t:"Periodic Table",d:"Medium",q:"Across Period 3 which INCREASES?",o:{A:"Atomic radius",B:"Electronegativity",C:"Number of electron shells",D:"Metallic character"},a:"B",e:"Increasing Z across period gives higher electronegativity."},
  {id:"c007",s:"Chemistry",y:2016,t:"Organic Chemistry",d:"Medium",q:"IUPAC name of CH3CH2CH2OH is",o:{A:"Ethanol",B:"Propan-2-ol",C:"Propan-1-ol",D:"Butan-1-ol"},a:"C",e:"3C (prop-), OH on C1 = propan-1-ol."},
  {id:"c008",s:"Chemistry",y:2017,t:"Equilibrium",d:"Hard",q:"N2+3H2 gives 2NH3. Increasing pressure shifts equilibrium",o:{A:"Left",B:"Neither",C:"Both",D:"Right"},a:"D",e:"4 mol to 2 mol; higher P favours fewer moles so shifts right."},
  {id:"c009",s:"Chemistry",y:2018,t:"Electrochemistry",d:"Medium",q:"Gas at cathode during electrolysis of dilute H2SO4 is",o:{A:"Hydrogen",B:"SO2",C:"CO2",D:"Oxygen"},a:"A",e:"Cathode: 2H+ + 2e- gives H2 (reduction)."},
  {id:"c010",s:"Chemistry",y:2019,t:"Acids and Bases",d:"Easy",q:"pH=2 indicates solution is",o:{A:"Weakly acidic",B:"Strongly acidic",C:"Alkaline",D:"Neutral"},a:"B",e:"pH 2 means [H+]=0.01 mol/L which is strongly acidic."},
  {id:"c011",s:"Chemistry",y:2020,t:"Kinetics",d:"Medium",q:"A catalyst increases reaction rate by",o:{A:"Increasing concentration",B:"Raising temperature",C:"Lowering activation energy",D:"Increasing pressure"},a:"C",e:"Catalyst provides alternative pathway with lower activation energy."},
  {id:"c012",s:"Chemistry",y:2021,t:"Organic Chemistry",d:"Medium",q:"Alkanes have the general formula",o:{A:"CnH2n",B:"CnH2n-2",C:"CnHn",D:"CnH2n+2"},a:"D",e:"Alkanes (saturated): CnH2n+2."},
  {id:"c013",s:"Chemistry",y:2022,t:"Atomic Structure",d:"Medium",q:"Electron configuration of sodium (Z=11) is",o:{A:"2,8,1",B:"2,8,3",C:"2,7,2",D:"2,8,2"},a:"A",e:"Na: 2 in shell 1, 8 in shell 2, 1 in shell 3."},
  {id:"c014",s:"Chemistry",y:2023,t:"Stoichiometry",d:"Hard",q:"Volume of CO2 (at STP) from 6 g of carbon (C=12)?",o:{A:"5.6 L",B:"11.2 L",C:"22.4 L",D:"44.8 L"},a:"B",e:"6g C = 0.5 mol; 0.5 mol CO2 at STP = 11.2 L."},
  {id:"c015",s:"Chemistry",y:2024,t:"Periodic Table",d:"Medium",q:"Which group contains the noble gases?",o:{A:"Group I",B:"Group VII",C:"Group VIII or 0",D:"Group VI"},a:"C",e:"Noble gases: Group 0 or Group 18."},
  {id:"c016",s:"Chemistry",y:2010,t:"Chemical Bonding",d:"Easy",q:"Ionic bonds are formed between",o:{A:"Two non-metals",B:"Two metals",C:"Two metalloids",D:"A metal and a non-metal"},a:"D",e:"Ionic bond: electron transfer from metal to non-metal."},
  {id:"c017",s:"Chemistry",y:2011,t:"Redox",d:"Medium",q:"Oxidation state of Cr in K2Cr2O7 is",o:{A:"+6",B:"+4",C:"+7",D:"+3"},a:"A",e:"2K(+1) + 2Cr + 7O(-2) = 0; 2Cr = +12; Cr = +6."},
  {id:"c018",s:"Chemistry",y:2012,t:"Organic Chemistry",d:"Hard",q:"In benzene all C-C bond lengths are equal because of",o:{A:"Alternating single and double bonds",B:"Delocalised pi electrons",C:"Ionic bonding",D:"sp3 hybridisation"},a:"B",e:"Delocalisation of pi electrons makes all bonds equivalent."},
  {id:"c019",s:"Chemistry",y:2013,t:"Acids and Bases",d:"Medium",q:"A buffer solution resists change in",o:{A:"Temperature",B:"Colour",C:"pH",D:"Density"},a:"C",e:"Buffer: resists pH change on addition of small acid or base."},
  {id:"c020",s:"Chemistry",y:2014,t:"Gas Laws",d:"Medium",q:"At constant temperature, PV = constant is",o:{A:"Charles Law",B:"Dalton's Law",C:"Avogadro's Law",D:"Boyle's Law"},a:"D",e:"Boyle's Law: PV = constant (isothermal process)."},
  {id:"c021",s:"Chemistry",y:2015,t:"Electrochemistry",d:"Medium",q:"During electrolysis of brine, chlorine is produced at the",o:{A:"Anode",B:"Cathode",C:"Solution",D:"Both electrodes"},a:"A",e:"Anode: 2Cl- gives Cl2 + 2e- (oxidation)."},
  {id:"c022",s:"Chemistry",y:2016,t:"Stoichiometry",d:"Medium",q:"Avogadro's number is",o:{A:"6.022x10^22",B:"6.022x10^23",C:"6.022x10^24",D:"6.022x10^2"},a:"B",e:"Avogadro's constant = 6.022x10^23 per mol."},
  {id:"c023",s:"Chemistry",y:2017,t:"Periodic Table",d:"Easy",q:"Elements in the same group have the same",o:{A:"Number of protons",B:"Number of neutrons",C:"Number of valence electrons",D:"Atomic mass"},a:"C",e:"Same group = same number of valence electrons."},
  {id:"c024",s:"Chemistry",y:2018,t:"Organic Chemistry",d:"Medium",q:"Which of these is an ester?",o:{A:"CH3COOH",B:"CH3CHO",C:"CH3COCH3",D:"CH3COOCH2CH3"},a:"D",e:"Ethyl ethanoate (CH3COOCH2CH3) is an ester."},
  {id:"c025",s:"Chemistry",y:2019,t:"Equilibrium",d:"Medium",q:"Le Chatelier's principle states that if equilibrium is disturbed it will",o:{A:"Shift to counteract the disturbance",B:"Stop reacting",C:"Increase temperature",D:"Reach new equilibrium instantly"},a:"A",e:"Le Chatelier: system shifts to oppose the disturbance."},
  {id:"c026",s:"Chemistry",y:2020,t:"Atomic Structure",d:"Medium",q:"Isotopes are atoms with the same",o:{A:"Mass number but different protons",B:"Atomic number but different neutrons",C:"Electrons but different protons",D:"Neutrons but different protons"},a:"B",e:"Isotopes: same Z (protons), different N (neutrons)."},
  {id:"c027",s:"Chemistry",y:2021,t:"Kinetics",d:"Hard",q:"Rate constant units mol^-1 dm^3 s^-1 correspond to _______ order reaction.",o:{A:"Zero",B:"First",C:"Second",D:"Third"},a:"C",e:"Second order: rate = k[A]^2; k has units mol^-1 dm^3 s^-1."},
  {id:"c028",s:"Chemistry",y:2022,t:"Organic Chemistry",d:"Medium",q:"The functional group -OH in organic compounds indicates",o:{A:"An ether",B:"A ketone",C:"An aldehyde",D:"An alcohol"},a:"D",e:"Hydroxyl group -OH characterises alcohols."},
  {id:"c029",s:"Chemistry",y:2023,t:"Redox",d:"Medium",q:"Which is the reducing agent in Fe + CuSO4 gives FeSO4 + Cu?",o:{A:"Fe",B:"FeSO4",C:"Cu",D:"CuSO4"},a:"A",e:"Fe is oxidised (loses electrons); it is the reducing agent."},
  {id:"c030",s:"Chemistry",y:2024,t:"Acids and Bases",d:"Hard",q:"For weak acid HA, Ka=10^-5. pH of 0.1M solution is",o:{A:"4",B:"3",C:"5",D:"7"},a:"B",e:"[H+]=sqrt(Ka x C)=sqrt(10^-6)=10^-3; pH=3."},
  {id:"c031",s:"Chemistry",y:2010,t:"Chemical Bonding",d:"Medium",q:"The shape of a water molecule is",o:{A:"Linear",B:"Trigonal planar",C:"V-shaped or bent",D:"Tetrahedral"},a:"C",e:"H2O: 2 lone pairs gives bent shape at about 104.5 degrees."},
  {id:"c032",s:"Chemistry",y:2011,t:"Stoichiometry",d:"Medium",q:"The molar mass of H2SO4 is (H=1, S=32, O=16)",o:{A:"80 g/mol",B:"96 g/mol",C:"100 g/mol",D:"98 g/mol"},a:"D",e:"M(H2SO4) = 2+32+64 = 98 g/mol."},
  {id:"c033",s:"Chemistry",y:2012,t:"Periodic Table",d:"Easy",q:"Alkali metals are found in",o:{A:"Group I",B:"Group III",C:"Group VII",D:"Group II"},a:"A",e:"Alkali metals: Li, Na, K, Rb, Cs - Group I."},
  {id:"c034",s:"Chemistry",y:2013,t:"Gas Laws",d:"Medium",q:"Avogadro's Law: equal volumes of gases at same T and P contain",o:{A:"Different numbers of molecules",B:"Same number of molecules",C:"Equal masses",D:"Equal densities"},a:"B",e:"Equal volumes, same T and P = equal moles of molecules."},
  {id:"c035",s:"Chemistry",y:2014,t:"Redox",d:"Easy",q:"Rusting of iron is an example of",o:{A:"Reduction",B:"Decomposition",C:"Oxidation",D:"Displacement"},a:"C",e:"Rusting: Fe gives Fe3+; iron is oxidised."},
  {id:"c036",s:"Chemistry",y:2015,t:"Electrochemistry",d:"Medium",q:"In electroplating, the object to be plated is the",o:{A:"Anode",B:"Electrolyte",C:"Solution",D:"Cathode"},a:"D",e:"Object to be plated = cathode; metal deposited by reduction."},
  {id:"c037",s:"Chemistry",y:2016,t:"Organic Chemistry",d:"Hard",q:"Markovnikov's rule: hydrogen of HX adds to carbon with",o:{A:"More hydrogens",B:"Fewer hydrogens",C:"More attached groups",D:"More substituents"},a:"A",e:"H adds to the less substituted carbon (more hydrogens)."},
  {id:"c038",s:"Chemistry",y:2017,t:"Acids and Bases",d:"Medium",q:"Indicators work by",o:{A:"Changing temperature",B:"Changing colour with pH",C:"Releasing hydrogen ions",D:"Absorbing UV light"},a:"B",e:"Indicators are weak acids whose two forms differ in colour."},
  {id:"c039",s:"Chemistry",y:2018,t:"Equilibrium",d:"Medium",q:"Kc for N2 + 3H2 gives 2NH3 is",o:{A:"[NH3]/[N2][H2]",B:"[N2][H2]^3/[NH3]^2",C:"[NH3]^2/[N2][H2]^3",D:"[NH3]/[N2][H2]^3"},a:"C",e:"Kc = [NH3]^2 / ([N2][H2]^3)."},
  {id:"c040",s:"Chemistry",y:2019,t:"Atomic Structure",d:"Hard",q:"The quantum number describing orientation of an orbital is the",o:{A:"Principal",B:"Spin",C:"Azimuthal",D:"Magnetic"},a:"D",e:"Magnetic quantum number ml describes orientation in space."},
  {id:"c041",s:"Chemistry",y:2020,t:"Organic Chemistry",d:"Medium",q:"Which compound undergoes addition reactions most readily?",o:{A:"Alkene",B:"Alcohol",C:"Alkyne",D:"Alkane"},a:"A",e:"Alkenes: C=C double bond readily undergoes addition."},
  {id:"c042",s:"Chemistry",y:2021,t:"Stoichiometry",d:"Medium",q:"Mass of 2 moles of CO2 (C=12, O=16)?",o:{A:"44 g",B:"88 g",C:"22 g",D:"176 g"},a:"B",e:"M(CO2)=44; 2x44=88 g."},
  {id:"c043",s:"Chemistry",y:2022,t:"Chemical Bonding",d:"Medium",q:"Which property increases across Period 2 from Li to F?",o:{A:"Atomic radius",B:"Ionic radius",C:"Ionisation energy",D:"Melting point"},a:"C",e:"Ionisation energy increases across period due to stronger nuclear pull."},
  {id:"c044",s:"Chemistry",y:2023,t:"Kinetics",d:"Medium",q:"Activation energy is the",o:{A:"Energy released in a reaction",B:"Average kinetic energy of molecules",C:"Total energy of reactants",D:"Minimum energy needed for reaction to occur"},a:"D",e:"Activation energy = minimum energy required for reaction."},
  {id:"c045",s:"Chemistry",y:2024,t:"Electrochemistry",d:"Hard",q:"E of Zn = -0.76V, Cu = +0.34V. EMF of cell is",o:{A:"1.10 V",B:"0.42 V",C:"-0.42 V",D:"0.76 V"},a:"A",e:"E cell = E cathode minus E anode = 0.34-(-0.76) = 1.10 V."},
  {id:"c046",s:"Chemistry",y:2010,t:"Organic Chemistry",d:"Easy",q:"Fermentation of glucose produces",o:{A:"Methanol and CO2",B:"Ethanol and CO2",C:"Water only",D:"Ethanoic acid"},a:"B",e:"C6H12O6 gives 2C2H5OH + 2CO2 (yeast fermentation)."},
  {id:"c047",s:"Chemistry",y:2011,t:"Acids and Bases",d:"Easy",q:"A Bronsted-Lowry acid is a substance that",o:{A:"Accepts a proton",B:"Gains electrons",C:"Donates a proton",D:"Releases hydroxide ions"},a:"C",e:"Bronsted-Lowry acid: proton (H+) donor."},
  {id:"c048",s:"Chemistry",y:2012,t:"Periodic Table",d:"Medium",q:"Which element has the highest electronegativity?",o:{A:"Oxygen",B:"Nitrogen",C:"Chlorine",D:"Fluorine"},a:"D",e:"Fluorine has the highest electronegativity at 3.98."},
  {id:"c049",s:"Chemistry",y:2013,t:"Redox",d:"Easy",q:"OIL RIG stands for",o:{A:"Oxidation Is Loss, Reduction Is Gain of electrons",B:"Only In Liquid Reactions Is Gain",C:"Oxygen In, Lipid Released, Ions Gained",D:"Oxidation Increases, Loss Reduces, Ions Gain"},a:"A",e:"OIL RIG: Oxidation Is Loss, Reduction Is Gain of electrons."},
  {id:"c050",s:"Chemistry",y:2014,t:"Stoichiometry",d:"Medium",q:"24 g of Mg (Mg=24) reacts with oxygen. MgO formed (O=16)?",o:{A:"20 g",B:"40 g",C:"60 g",D:"80 g"},a:"B",e:"1 mol Mg gives 1 mol MgO; M(MgO)=40; 1 mol = 40 g."},
  {id:"c051",s:"Chemistry",y:2015,t:"Gas Laws",d:"Easy",q:"At STP, one mole of any ideal gas occupies",o:{A:"11.2 L",B:"44.8 L",C:"22.4 L",D:"2.24 L"},a:"C",e:"Molar volume at STP = 22.4 L/mol."},
  {id:"c052",s:"Chemistry",y:2016,t:"Chemical Bonding",d:"Medium",q:"Which type of bond involves sharing of electrons?",o:{A:"Ionic",B:"Metallic",C:"Hydrogen",D:"Covalent"},a:"D",e:"Covalent bond: shared electron pairs between atoms."},
  {id:"c053",s:"Chemistry",y:2017,t:"Organic Chemistry",d:"Hard",q:"Saponification is hydrolysis of an ester with",o:{A:"Strong alkali",B:"A weak acid",C:"Strong acid",D:"Water"},a:"A",e:"Saponification: ester + NaOH gives soap (salt) + alcohol."},
  {id:"c054",s:"Chemistry",y:2018,t:"Acids and Bases",d:"Medium",q:"In NH3 + H2O gives NH4+ + OH-, NH3 acts as a",o:{A:"Lewis acid",B:"Bronsted base",C:"Neutral species",D:"Bronsted acid"},a:"B",e:"NH3 accepts a proton so it is a Bronsted base."},
  {id:"c055",s:"Chemistry",y:2019,t:"Equilibrium",d:"Hard",q:"The Haber process for ammonia uses",o:{A:"200 degrees C and 1 atm",B:"500 degrees C and 200 atm",C:"450 degrees C and 200 atm",D:"100 degrees C and 50 atm"},a:"C",e:"Haber: Fe catalyst, about 450 degrees C, about 200 atm."},
  {id:"c056",s:"Chemistry",y:2020,t:"Stoichiometry",d:"Medium",q:"Concentration (molarity) is defined as",o:{A:"Mass of solvent/volume",B:"Mass of solute/mass of solvent",C:"Volume of solute/volume",D:"Moles of solute/volume of solution in dm3"},a:"D",e:"Concentration = mol/dm3."},
  {id:"c057",s:"Chemistry",y:2021,t:"Atomic Structure",d:"Medium",q:"Which subshell is filled after 4s?",o:{A:"3d",B:"4p",C:"5s",D:"3p"},a:"A",e:"Aufbau: 4s filled before 3d; after 4s comes 3d."},
  {id:"c058",s:"Chemistry",y:2022,t:"Periodic Table",d:"Hard",q:"First ionisation energies of Group II elements decrease going down because",o:{A:"Atomic radius decreases",B:"Electron shielding increases",C:"Nuclear charge decreases",D:"Electronegativity increases"},a:"B",e:"More shielding going down makes outer electron easier to remove."},
  {id:"c059",s:"Chemistry",y:2023,t:"Organic Chemistry",d:"Medium",q:"Alkene plus bromine water is used to test for",o:{A:"Saturation",B:"Aromaticity",C:"Unsaturation",D:"Acidity"},a:"C",e:"Alkenes decolourise bromine water by addition across C=C."},
  {id:"c060",s:"Chemistry",y:2024,t:"Redox",d:"Medium",q:"Which species is oxidised in Cl2 + 2KBr gives 2KCl + Br2?",o:{A:"Cl2",B:"KCl",C:"K+",D:"Br-"},a:"D",e:"Br- gives Br2; bromide loses electrons so it is oxidised."},
  {id:"c061",s:"Chemistry",y:2010,t:"Chemical Bonding",d:"Easy",q:"The number of bonds in nitrogen molecule N2 is",o:{A:"One triple bond",B:"One double bond",C:"One single bond",D:"Two double bonds"},a:"A",e:"N2 has a triple bond: N triple bond N."},
  {id:"c062",s:"Chemistry",y:2011,t:"Stoichiometry",d:"Medium",q:"Number of moles in 11.2 L of H2 at STP is",o:{A:"0.25",B:"0.5",C:"2",D:"1"},a:"B",e:"n = V/22.4 = 11.2/22.4 = 0.5 mol."},
  {id:"c063",s:"Chemistry",y:2012,t:"Organic Chemistry",d:"Easy",q:"Methane, ethane, propane, butane form a series called",o:{A:"Alkenes",B:"Alkynes",C:"Alkanes",D:"Aromatics"},a:"C",e:"CH4, C2H6, C3H8, C4H10 are alkanes."},
  {id:"c064",s:"Chemistry",y:2013,t:"Acids and Bases",d:"Medium",q:"Neutralisation is the reaction between",o:{A:"Two acids",B:"Two bases",C:"An acid and a salt",D:"An acid and a base"},a:"D",e:"Neutralisation: acid + base gives salt + water."},
  {id:"c065",s:"Chemistry",y:2014,t:"Kinetics",d:"Medium",q:"Increasing temperature increases reaction rate because",o:{A:"More molecules have energy equal to or greater than Ea",B:"Activation energy decreases",C:"Pressure decreases",D:"Reactants become more concentrated"},a:"A",e:"Higher T gives more molecules with enough energy to react."},
  {id:"c066",s:"Chemistry",y:2015,t:"Equilibrium",d:"Medium",q:"When Kc > 1, the equilibrium favours",o:{A:"Reactants",B:"Products",C:"Equal amounts",D:"Neither"},a:"B",e:"Kc > 1: products predominate at equilibrium."},
  {id:"c067",s:"Chemistry",y:2016,t:"Electrochemistry",d:"Medium",q:"The extraction of aluminium from aluminium oxide is done by",o:{A:"Smelting",B:"Zone refining",C:"Electrolysis",D:"Distillation"},a:"C",e:"Al is extracted by electrolysis of molten Al2O3 (Hall process)."},
  {id:"c068",s:"Chemistry",y:2017,t:"Organic Chemistry",d:"Hard",q:"The iodoform test uses",o:{A:"NaOH only",B:"AgNO3",C:"KMnO4",D:"I2 + NaOH"},a:"D",e:"Iodoform test: I2 + NaOH gives yellow CHI3 with methyl ketones."},
  {id:"c069",s:"Chemistry",y:2018,t:"Periodic Table",d:"Medium",q:"Which exhibits the highest oxidation state?",o:{A:"Manganese",B:"Nitrogen",C:"Chlorine",D:"Iron"},a:"A",e:"Mn can reach +7 in KMnO4 (permanganate)."},
  {id:"c070",s:"Chemistry",y:2019,t:"Gas Laws",d:"Hard",q:"Real gases deviate most from ideal behaviour at",o:{A:"Low T and low P",B:"Low T and high P",C:"High T and low P",D:"High T and high P"},a:"B",e:"Low T (slow molecules) and high P (compressed) cause most deviation."},
  {id:"c071",s:"Chemistry",y:2020,t:"Atomic Structure",d:"Medium",q:"Energy of hydrogen electron: En = -13.6/n2 eV. For n=2, E is",o:{A:"-1.51 eV",B:"-13.6 eV",C:"-3.4 eV",D:"-6.8 eV"},a:"C",e:"E2 = -13.6/4 = -3.4 eV."},
  {id:"c072",s:"Chemistry",y:2021,t:"Chemical Bonding",d:"Hard",q:"Which molecule has a non-zero dipole moment?",o:{A:"CO2",B:"BF3",C:"CCl4",D:"HF"},a:"D",e:"HF: H-F bond is highly polar; molecule has net dipole moment."},
  {id:"c073",s:"Chemistry",y:2022,t:"Stoichiometry",d:"Medium",q:"Empirical formula of compound with 40% C, 6.7% H, 53.3% O is",o:{A:"CH2O",B:"CHO",C:"C2H4O",D:"CH3O"},a:"A",e:"C:H:O = 40/12 : 6.7/1 : 53.3/16 = 3.33:6.7:3.33 = 1:2:1 giving CH2O."},
  {id:"c074",s:"Chemistry",y:2023,t:"Organic Chemistry",d:"Medium",q:"In Friedel-Crafts alkylation the catalyst used is",o:{A:"H2SO4",B:"AlCl3",C:"FeBr3",D:"NaOH"},a:"B",e:"Friedel-Crafts: AlCl3 (Lewis acid) as catalyst."},
  {id:"c075",s:"Chemistry",y:2024,t:"Redox",d:"Hard",q:"In MnO4- + 8H+ + 5e- gives Mn2+ + 4H2O, permanganate is",o:{A:"Oxidised",B:"A catalyst",C:"Reduced",D:"The reducing agent"},a:"C",e:"MnO4- gains electrons (Mn: +7 to +2) so it is reduced."},
  {id:"c076",s:"Chemistry",y:2010,t:"Acids and Bases",d:"Medium",q:"pH of pure water at 25 degrees C is",o:{A:"5",B:"6",C:"8",D:"7"},a:"D",e:"Pure water: [H+]=[OH-]=10^-7; pH=7."},
  {id:"c077",s:"Chemistry",y:2011,t:"Kinetics",d:"Easy",q:"Which factor does NOT affect reaction rate?",o:{A:"Atomic mass of reactants",B:"Catalyst",C:"Concentration",D:"Temperature"},a:"A",e:"Atomic mass does not directly affect reaction rate."},
  {id:"c078",s:"Chemistry",y:2012,t:"Gas Laws",d:"Easy",q:"Graham's Law: rate of diffusion is inversely proportional to the",o:{A:"Volume of gas",B:"Square root of its molar mass",C:"Pressure",D:"Temperature"},a:"B",e:"Rate proportional to 1/sqrt(M) (Graham's law)."},
  {id:"c079",s:"Chemistry",y:2013,t:"Electrochemistry",d:"Medium",q:"In electrolysis of molten NaCl, sodium is produced at the",o:{A:"Anode",B:"Electrolyte",C:"Cathode",D:"Both electrodes"},a:"C",e:"Cathode: Na+ + e- gives Na (reduction)."},
  {id:"c080",s:"Chemistry",y:2014,t:"Organic Chemistry",d:"Medium",q:"Nylon is a synthetic",o:{A:"Polyester",B:"Polyalkene",C:"Polysaccharide",D:"Polyamide"},a:"D",e:"Nylon = polyamide; formed by condensation polymerisation."},
  {id:"c081",s:"Chemistry",y:2015,t:"Periodic Table",d:"Medium",q:"Which group contains halogens?",o:{A:"Group VII",B:"Group VI",C:"Group V",D:"Group VIII"},a:"A",e:"Halogens: F, Cl, Br, I, At in Group VII (17)."},
  {id:"c082",s:"Chemistry",y:2016,t:"Chemical Bonding",d:"Medium",q:"Boiling point of HF is anomalously high because of",o:{A:"Covalent bonding",B:"Hydrogen bonding",C:"Ionic character",D:"Van der Waals forces"},a:"B",e:"HF forms strong hydrogen bonds due to very electronegative F."},
  {id:"c083",s:"Chemistry",y:2017,t:"Stoichiometry",d:"Hard",q:"25 cm3 of 0.1M HCl neutralises 12.5 cm3 NaOH. Concentration of NaOH?",o:{A:"0.05 M",B:"0.1 M",C:"0.2 M",D:"0.4 M"},a:"C",e:"n(HCl)=0.0025; c=0.0025/0.0125=0.2 M."},
  {id:"c084",s:"Chemistry",y:2018,t:"Acids and Bases",d:"Hard",q:"Henderson-Hasselbalch equation is",o:{A:"pH = pKa - log([A-]/[HA])",B:"pH = pKb + log([HA]/[A-])",C:"pH = pKw - pOH",D:"pH = pKa + log([A-]/[HA])"},a:"D",e:"Henderson-Hasselbalch: pH = pKa + log([A-]/[HA])."},
  {id:"c085",s:"Chemistry",y:2019,t:"Organic Chemistry",d:"Hard",q:"Tollens test distinguishes aldehydes from ketones using",o:{A:"Ammoniacal AgNO3",B:"Acidified KMnO4",C:"HNO3",D:"NaOH solution"},a:"A",e:"Tollens: silver mirror with aldehydes; ketones do not react."},
  {id:"c086",s:"Chemistry",y:2020,t:"Equilibrium",d:"Medium",q:"If reactant concentration is increased, the equilibrium constant Kc",o:{A:"Decreases",B:"Remains unchanged",C:"Increases",D:"Increases and decreases alternately"},a:"B",e:"Kc depends only on temperature; concentrations do not change Kc."},
  {id:"c087",s:"Chemistry",y:2021,t:"Atomic Structure",d:"Easy",q:"In which series of hydrogen spectrum are transitions to n=2?",o:{A:"Lyman",B:"Brackett",C:"Balmer",D:"Paschen"},a:"C",e:"Balmer series: transitions to n=2 (visible light)."},
  {id:"c088",s:"Chemistry",y:2022,t:"Chemical Bonding",d:"Medium",q:"Which has the highest melting point?",o:{A:"Ice",B:"Sodium chloride",C:"Candle wax",D:"Diamond"},a:"D",e:"Diamond: giant covalent structure; extremely high melting point."},
  {id:"c089",s:"Chemistry",y:2023,t:"Kinetics",d:"Hard",q:"The Arrhenius equation is",o:{A:"k = Ae^(-Ea/RT)",B:"k = Ae^(Ea/RT)",C:"k = RT/Ea",D:"k = AEa/RT"},a:"A",e:"Arrhenius: k = A e^(-Ea/RT); rate constant depends on temperature."},
  {id:"c090",s:"Chemistry",y:2024,t:"Redox",d:"Medium",q:"The electrochemical series ranks elements by their",o:{A:"Atomic mass",B:"Tendency to be oxidised or reduced",C:"Melting point",D:"Atomic radius"},a:"B",e:"Electrochemical series ranks standard reduction potentials."},
  {id:"c091",s:"Chemistry",y:2010,t:"Stoichiometry",d:"Easy",q:"One mole of any substance contains",o:{A:"6.022x10^22",B:"6.022x10^24",C:"6.022x10^23",D:"6.022x10^20"},a:"C",e:"1 mole = 6.022x10^23 particles (Avogadro's number)."},
  {id:"c092",s:"Chemistry",y:2011,t:"Organic Chemistry",d:"Medium",q:"Polymerisation of ethene produces",o:{A:"Polystyrene",B:"Polyvinyl chloride",C:"Polypropylene",D:"Polyethene"},a:"D",e:"Ethene (CH2=CH2) polymerises to polyethene."},
  {id:"c093",s:"Chemistry",y:2012,t:"Periodic Table",d:"Medium",q:"Going down Group I, reactivity",o:{A:"Increases",B:"Decreases",C:"First increases then decreases",D:"Stays the same"},a:"A",e:"Group I going down: outer electron further away so more reactive."},
  {id:"c094",s:"Chemistry",y:2013,t:"Acids and Bases",d:"Easy",q:"Soap is made by the reaction of",o:{A:"An ester with acid",B:"An oil or fat with NaOH",C:"An acid and a metal",D:"Two alcohols"},a:"B",e:"Saponification: fat + NaOH gives soap + glycerol."},
  {id:"c095",s:"Chemistry",y:2014,t:"Gas Laws",d:"Medium",q:"At constant volume, pressure of gas is proportional to its",o:{A:"Mass",B:"Density",C:"Absolute temperature",D:"Molar mass"},a:"C",e:"Gay-Lussac's Law: P/T = constant at constant V."},
  {id:"c096",s:"Chemistry",y:2015,t:"Chemical Bonding",d:"Easy",q:"The shape of methane CH4 is",o:{A:"Linear",B:"Trigonal planar",C:"Square planar",D:"Tetrahedral"},a:"D",e:"CH4: 4 bonding pairs, no lone pairs gives regular tetrahedral (109.5 degrees)."},
  {id:"c097",s:"Chemistry",y:2016,t:"Redox",d:"Medium",q:"Which is a strong oxidising agent?",o:{A:"KMnO4",B:"Fe",C:"Mg",D:"Na"},a:"A",e:"KMnO4 is a strong oxidising agent (Mn reduces from +7 to +2)."},
  {id:"c098",s:"Chemistry",y:2017,t:"Electrochemistry",d:"Medium",q:"The anode in electrolysis is connected to the",o:{A:"Negative terminal",B:"Positive terminal of the power supply",C:"Neutral terminal",D:"Both terminals"},a:"B",e:"Anode = positive electrode; oxidation occurs here."},
  {id:"c099",s:"Chemistry",y:2018,t:"Organic Chemistry",d:"Medium",q:"IUPAC name of CH3-CO-CH3 is",o:{A:"Propanal",B:"Propan-2-ol",C:"Propanone",D:"Propan-1-ol"},a:"C",e:"CH3COCH3 = acetone = propanone."},
  {id:"c100",s:"Chemistry",y:2019,t:"Atomic Structure",d:"Hard",q:"The de Broglie wavelength of a particle with momentum p is",o:{A:"lambda = p/h",B:"lambda = ph",C:"lambda = h/p2",D:"lambda = h/p"},a:"D",e:"de Broglie: lambda = h/p."},
  {id:"co001",s:"Commerce",y:2010,t:"Trade",d:"Easy",q:"Commerce involves activities that help in the",o:{A:"Distribution and exchange of goods and services",B:"Growing of crops only",C:"Physical production of goods",D:"Manufacturing of goods only"},a:"A",e:"Commerce: buying, selling, and all activities that facilitate trade."},
  {id:"co002",s:"Commerce",y:2011,t:"Banking",d:"Easy",q:"A bank accepts deposits and",o:{A:"Issues passports",B:"Provides loans",C:"Grows crops",D:"Manufactures goods"},a:"B",e:"Bank: financial intermediary accepting deposits and granting credit."},
  {id:"co003",s:"Commerce",y:2012,t:"Trade",d:"Medium",q:"Wholesale trade involves buying goods in",o:{A:"Small quantities for personal use",B:"Small quantities from retailers",C:"Large quantities from manufacturers to sell to retailers",D:"Large quantities directly to consumers"},a:"C",e:"Wholesalers: buy in bulk from manufacturers and sell to retailers."},
  {id:"co004",s:"Commerce",y:2013,t:"Insurance",d:"Easy",q:"The principle of indemnity means the insured is",o:{A:"Over-compensated",B:"Punished",C:"Made to pay extra",D:"Compensated to the exact extent of the loss (not to profit)"},a:"D",e:"Indemnity: restore insured to pre-loss position; no profit from insurance."},
  {id:"co005",s:"Commerce",y:2014,t:"Trade",d:"Medium",q:"A free trade zone is an area where",o:{A:"Goods are traded with few or no customs duties",B:"Only domestic goods are sold",C:"All goods are heavily taxed",D:"Goods are traded for free permanently"},a:"A",e:"Free trade zone: reduced tariffs and customs."},
  {id:"co006",s:"Commerce",y:2015,t:"Banking",d:"Medium",q:"The central bank",o:{A:"Provides loans to businesses",B:"Acts as banker to the government and controls money supply",C:"Manages crop production",D:"Sells goods to consumers"},a:"B",e:"Central bank: lender of last resort; manages monetary policy."},
  {id:"co007",s:"Commerce",y:2016,t:"Trade",d:"Easy",q:"A bill of lading is a document used in",o:{A:"Retail trade",B:"Foreign exchange",C:"Shipping, acknowledging receipt of goods for transport",D:"Local currency"},a:"C",e:"Bill of lading: contract between shipper and carrier."},
  {id:"co008",s:"Commerce",y:2017,t:"Insurance",d:"Medium",q:"The principle of subrogation means",o:{A:"The insurer cancels the policy",B:"The insured pays extra",C:"Insurer refuses all claims",D:"After paying a claim, the insurer can sue the party responsible"},a:"D",e:"Subrogation: insurer takes over insured's rights after paying claim."},
  {id:"co009",s:"Commerce",y:2018,t:"Trade",d:"Easy",q:"VAT stands for",o:{A:"Value Added Tax",B:"Vendor Acquisition Tax",C:"Variable Asset Tax",D:"Very Affordable Trade"},a:"A",e:"VAT: tax on the value added at each stage of production."},
  {id:"co010",s:"Commerce",y:2019,t:"Banking",d:"Medium",q:"A current account",o:{A:"Earns high interest",B:"Allows frequent withdrawals and payments by cheque",C:"Only accepts large deposits",D:"Cannot be used for payments"},a:"B",e:"Current account: used for daily transactions."},
  {id:"co011",s:"Commerce",y:2020,t:"Trade",d:"Easy",q:"A middleman in trade is",o:{A:"A government official",B:"A retailer only",C:"An intermediary between producer and consumer",D:"A consumer"},a:"C",e:"Middleman: wholesaler, agent, or broker facilitating exchange."},
  {id:"co012",s:"Commerce",y:2021,t:"Insurance",d:"Hard",q:"Utmost good faith (uberrima fides) requires",o:{A:"Insurer to pay all claims immediately",B:"Insurer to invest premiums",C:"Insured to reveal only what is asked",D:"Both parties to disclose all material facts honestly"},a:"D",e:"Uberrima fides: both insurer and insured must disclose all relevant facts."},
  {id:"co013",s:"Commerce",y:2022,t:"Banking",d:"Medium",q:"A promissory note is",o:{A:"A written promise to pay a specified sum at a set date",B:"An insurance certificate",C:"A bank's annual report",D:"A government bond"},a:"A",e:"Promissory note: unconditional written promise to pay."},
  {id:"co014",s:"Commerce",y:2023,t:"Trade",d:"Medium",q:"Counterfeiting in commerce refers to",o:{A:"Selling below cost",B:"Making and selling fake goods pretending to be genuine",C:"Genuine product labelling",D:"Legal price fixing"},a:"B",e:"Counterfeiting: fraud involving imitation of authentic goods or currency."},
  {id:"co015",s:"Commerce",y:2024,t:"Banking",d:"Hard",q:"Open market operations involve the central bank",o:{A:"Setting minimum wage",B:"Printing new currency",C:"Buying or selling government securities to control money supply",D:"Regulating stock markets"},a:"C",e:"OMO: central bank buys or sells bonds to inject or withdraw liquidity."},
  {id:"co016",s:"Commerce",y:2010,t:"Trade",d:"Easy",q:"Retail trade involves selling goods",o:{A:"In bulk to manufacturers",B:"In large quantities to wholesalers",C:"To other retailers",D:"In small quantities directly to the final consumer"},a:"D",e:"Retailer: sells to the end consumer in small quantities."},
  {id:"co017",s:"Commerce",y:2011,t:"Insurance",d:"Easy",q:"Premium in insurance is",o:{A:"The amount paid by the insured for insurance coverage",B:"The profit of the insurance company",C:"The maximum coverage amount",D:"The payout when a claim is made"},a:"A",e:"Premium: periodic payment by insured to maintain insurance cover."},
  {id:"co018",s:"Commerce",y:2012,t:"Banking",d:"Easy",q:"A cheque is a written order instructing a bank to",o:{A:"Hold funds indefinitely",B:"Pay a specific amount to a named person",C:"Issue a loan",D:"Pay taxes"},a:"B",e:"Cheque: negotiable instrument ordering a bank to pay a sum."},
  {id:"co019",s:"Commerce",y:2013,t:"Trade",d:"Medium",q:"Dumping in international trade means",o:{A:"Disposing of hazardous waste abroad",B:"Selling goods for more than cost",C:"Selling goods in a foreign market below their cost of production",D:"Blocking imports with tariffs"},a:"C",e:"Dumping: selling below cost to capture market share."},
  {id:"co020",s:"Commerce",y:2014,t:"Banking",d:"Medium",q:"E-commerce refers to",o:{A:"Electronic factory management",B:"Electricity in manufacturing",C:"Electronic government transactions",D:"Buying and selling of goods and services over the internet"},a:"D",e:"E-commerce: online transactions."},
  {id:"co021",s:"Commerce",y:2015,t:"Trade",d:"Medium",q:"A trade discount is a reduction in price given for",o:{A:"Bulk purchase or trade relationship",B:"Insurance purposes",C:"Advertising",D:"Late payment"},a:"A",e:"Trade discount: reduction for bulk purchase; shown on invoice."},
  {id:"co022",s:"Commerce",y:2016,t:"Insurance",d:"Medium",q:"The principle of contribution applies when",o:{A:"Only one insurer covers the loss",B:"A risk is covered by more than one insurer",C:"The insurer refuses to pay",D:"There is no policy in force"},a:"B",e:"Contribution: multiple insurers share the loss proportionately."},
  {id:"co023",s:"Commerce",y:2017,t:"Banking",d:"Easy",q:"A savings account offers",o:{A:"No interest whatsoever",B:"Unlimited withdrawals",C:"Interest and encourages saving with some restrictions",D:"High risk investments"},a:"C",e:"Savings account: earns interest; may limit withdrawals."},
  {id:"co024",s:"Commerce",y:2018,t:"Trade",d:"Easy",q:"A tariff is a tax on",o:{A:"A bank",B:"The public",C:"A business",D:"Imports or exports"},a:"D",e:"Tariff: tax imposed on imported or exported goods."},
  {id:"co025",s:"Commerce",y:2019,t:"Insurance",d:"Hard",q:"Proximate cause principle means",o:{A:"Only the immediate dominant cause of loss determines if a claim is valid",B:"Insurer determines premium",C:"Insured can claim twice",D:"Insurer pays all losses"},a:"A",e:"Proximate cause: direct efficient cause of loss determines coverage."},
  {id:"co026",s:"Commerce",y:2020,t:"Banking",d:"Medium",q:"Discounting a bill of exchange means",o:{A:"Paying it after maturity",B:"Selling it before maturity at less than face value",C:"Storing it safely",D:"Refusing to accept it"},a:"B",e:"Discounting: bank pays less than face value; earns difference as interest."},
  {id:"co027",s:"Commerce",y:2021,t:"Trade",d:"Easy",q:"An invoice is a document that",o:{A:"Promises to pay a debt",B:"Requests a bank transfer",C:"Lists goods supplied with prices and payment terms",D:"Certifies origin of goods"},a:"C",e:"Invoice: commercial document from seller to buyer listing amounts owed."},
  {id:"co028",s:"Commerce",y:2022,t:"Insurance",d:"Easy",q:"Life assurance differs from insurance in that",o:{A:"It is illegal in some countries",B:"It covers only accidents",C:"It covers only property",D:"Life assurance is certain (death will occur); insurance covers uncertain events"},a:"D",e:"Assurance: covers certain events; insurance covers uncertain events."},
  {id:"co029",s:"Commerce",y:2023,t:"Banking",d:"Medium",q:"The minimum reserve ratio (CRR) requires banks to",o:{A:"Hold a percentage of deposits as cash with the central bank",B:"Invest in stocks",C:"Lend a fixed portion",D:"Pay taxes on deposits"},a:"A",e:"CRR: central bank tool to control credit creation."},
  {id:"co030",s:"Commerce",y:2024,t:"Trade",d:"Hard",q:"Terms of trade (TOT) measure",o:{A:"Level of corruption in trade",B:"The ratio of export prices to import prices",C:"Number of trading partners",D:"Trade credit period"},a:"B",e:"TOT = export price index / import price index x 100."},
  {id:"co031",s:"Commerce",y:2010,t:"Banking",d:"Easy",q:"Interest is",o:{A:"A type of insurance cover",B:"A government tax",C:"The cost of borrowing or reward for saving",D:"A penalty for late delivery"},a:"C",e:"Interest: payment for use of borrowed funds."},
  {id:"co032",s:"Commerce",y:2011,t:"Trade",d:"Medium",q:"A sole proprietorship is",o:{A:"A partnership of two",B:"A government business",C:"A cooperative society",D:"A business owned and managed by one person"},a:"D",e:"Sole proprietorship: simplest business form; one owner."},
  {id:"co033",s:"Commerce",y:2012,t:"Insurance",d:"Medium",q:"Fire insurance covers",o:{A:"Loss or damage caused by fire",B:"Marine risks",C:"Currency risks",D:"Health risks"},a:"A",e:"Fire insurance: covers buildings and stock damaged by fire."},
  {id:"co034",s:"Commerce",y:2013,t:"Banking",d:"Medium",q:"A letter of credit in international trade is",o:{A:"A guarantee of goods quality",B:"A bank guarantee that a buyer's payment will be received by the seller",C:"A description of goods",D:"A shipping route"},a:"B",e:"Letter of credit: bank assures seller of payment."},
  {id:"co035",s:"Commerce",y:2014,t:"Trade",d:"Easy",q:"Advertising aims to",o:{A:"Hide product faults",B:"Increase government revenue",C:"Inform, persuade, or remind consumers about products",D:"Reduce competition"},a:"C",e:"Advertising: paid communication to influence consumer behaviour."},
  {id:"co036",s:"Commerce",y:2015,t:"Banking",d:"Hard",q:"The money multiplier is determined by",o:{A:"Number of employees",B:"Rate of inflation",C:"Government budget deficit",D:"The reciprocal of the cash reserve ratio"},a:"D",e:"Money multiplier = 1/CRR; higher CRR = lower multiplier."},
  {id:"co037",s:"Commerce",y:2016,t:"Insurance",d:"Easy",q:"Motor vehicle insurance is compulsory in Nigeria to",o:{A:"Protect third parties who may be injured or have property damaged",B:"Generate revenue for banks",C:"Cover only theft",D:"Protect only the car owner"},a:"A",e:"Third-party motor insurance: legally required to protect other road users."},
  {id:"co038",s:"Commerce",y:2017,t:"Trade",d:"Medium",q:"A cooperative society is formed by",o:{A:"Government officials only",B:"People with common interests pooling resources for mutual benefit",C:"A multinational company",D:"A sole trader"},a:"B",e:"Cooperative: member-owned; profits shared; one member one vote."},
  {id:"co039",s:"Commerce",y:2018,t:"Banking",d:"Medium",q:"Hire purchase allows a buyer to",o:{A:"Own goods immediately with no repayment",B:"Never own the goods",C:"Use goods immediately while paying in instalments",D:"Borrow goods from seller"},a:"C",e:"Hire purchase: use goods now, pay by instalments."},
  {id:"co040",s:"Commerce",y:2019,t:"Trade",d:"Easy",q:"A market is any arrangement where",o:{A:"Only food is sold",B:"Only a physical place",C:"A government building",D:"Buyers and sellers meet to exchange goods"},a:"D",e:"Market: buyers and sellers interact (physical or virtual) to determine price."},
  {id:"co041",s:"Commerce",y:2020,t:"Insurance",d:"Medium",q:"Fire and theft insurance is an example of",o:{A:"General (non-life) insurance",B:"Health insurance",C:"Life assurance",D:"Marine insurance"},a:"A",e:"General insurance: covers property and liability risks."},
  {id:"co042",s:"Commerce",y:2021,t:"Banking",d:"Easy",q:"A fixed deposit account",o:{A:"Has no interest",B:"Pays higher interest for a fixed period with restricted withdrawals",C:"Only accepts coins",D:"Has unlimited withdrawals"},a:"B",e:"Fixed deposit: higher interest rate; funds locked for agreed period."},
  {id:"co043",s:"Commerce",y:2022,t:"Trade",d:"Medium",q:"The balance of trade measures",o:{A:"Tourism revenue",B:"Invisible trade only",C:"The difference in value between visible exports and imports",D:"Capital flows"},a:"C",e:"Balance of trade: exports minus imports of goods (visible trade)."},
  {id:"co044",s:"Commerce",y:2023,t:"Banking",d:"Hard",q:"The relationship between a bank and its customer is that of",o:{A:"Trustee and beneficiary",B:"Employee and employer",C:"Partner and co-partner",D:"Debtor and creditor (and vice versa)"},a:"D",e:"Bank-customer: bank is debtor when customer deposits; creditor when bank lends."},
  {id:"co045",s:"Commerce",y:2024,t:"Insurance",d:"Medium",q:"Reinsurance is when",o:{A:"An insurer transfers part of its risk to another insurance company",B:"Government subsidises premiums",C:"Insured takes a second policy",D:"Insurer cancels policy"},a:"A",e:"Reinsurance: insurer insures itself against very large claims."},
  {id:"co046",s:"Commerce",y:2010,t:"Trade",d:"Medium",q:"A cash and carry wholesaler",o:{A:"Provides credit to retailers",B:"Sells only for cash and requires buyers to collect goods themselves",C:"Manufactures goods",D:"Delivers goods"},a:"B",e:"Cash and carry: no credit, no delivery."},
  {id:"co047",s:"Commerce",y:2011,t:"Banking",d:"Medium",q:"Overdraft facility allows a current account holder to",o:{A:"Open two accounts",B:"Save money tax-free",C:"Withdraw more than the balance up to an agreed limit",D:"Earn double interest"},a:"C",e:"Overdraft: short-term credit; interest charged only on amount used."},
  {id:"co048",s:"Commerce",y:2012,t:"Trade",d:"Easy",q:"The function of an insurance broker is to",o:{A:"Manufacture goods",B:"Adjudicate claims",C:"Settle disputes",D:"Act as agent placing insurance on behalf of clients"},a:"D",e:"Insurance broker: independent intermediary finding best policy for client."},
  {id:"co049",s:"Commerce",y:2013,t:"Banking",d:"Easy",q:"A mortgage is a loan secured against",o:{A:"Real property (land or buildings)",B:"Shares",C:"Savings deposits",D:"A vehicle"},a:"A",e:"Mortgage: long-term loan with property as collateral."},
  {id:"co050",s:"Commerce",y:2014,t:"Trade",d:"Hard",q:"Incoterms (e.g. FOB, CIF) define",o:{A:"Banking charges",B:"Responsibilities of buyers and sellers in international trade contracts",C:"Advertising costs",D:"Insurance premiums"},a:"B",e:"Incoterms: standardised trade terms specifying who bears risk and costs."},
  {id:"co051",s:"Commerce",y:2015,t:"Banking",d:"Easy",q:"SWIFT in banking stands for",o:{A:"System for Wide International Fund Transfer",B:"Standard World Insurance Finance Transfer",C:"Society for Worldwide Interbank Financial Telecommunication",D:"Stock World Investment Finance Trading"},a:"C",e:"SWIFT: global secure messaging network for international bank transfers."},
  {id:"co052",s:"Commerce",y:2016,t:"Insurance",d:"Easy",q:"The insurable interest principle means",o:{A:"You can insure anything for any amount",B:"You must have a financial interest in the subject being insured",C:"Insurer bears all risk",D:"Only governments can take out insurance"},a:"D",e:"Insurable interest: you must stand to lose financially if insured event occurs."},
  {id:"co053",s:"Commerce",y:2017,t:"Trade",d:"Easy",q:"A department store is",o:{A:"A large retail establishment selling many types of goods under one roof",B:"A market stall",C:"A small corner shop",D:"An online shopping platform"},a:"A",e:"Department store: multi-department retail outlet."},
  {id:"co054",s:"Commerce",y:2018,t:"Banking",d:"Medium",q:"The stock exchange facilitates",o:{A:"Importation of goods",B:"Buying and selling of shares and securities",C:"Insurance against theft",D:"Issuance of import licences"},a:"B",e:"Stock exchange: regulated marketplace for securities trading."},
  {id:"co055",s:"Commerce",y:2019,t:"Trade",d:"Medium",q:"Containerisation in shipping refers to",o:{A:"Storing goods in warehouses",B:"Using only small packages",C:"Standardised metal boxes for efficient and secure cargo transport",D:"Packing goods in barrels"},a:"C",e:"Containerisation: revolutionised shipping; reduces handling and losses."},
  {id:"co056",s:"Commerce",y:2020,t:"Banking",d:"Easy",q:"Inflation reduces the",o:{A:"Value of goods",B:"Amount of government spending",C:"Number of banks",D:"Purchasing power of money"},a:"D",e:"Inflation: rising prices; each naira or dollar buys less."},
  {id:"co057",s:"Commerce",y:2021,t:"Trade",d:"Medium",q:"A supermarket primarily sells",o:{A:"Food and household items on a self-service basis",B:"Industrial goods",C:"Luxury items",D:"Clothing only"},a:"A",e:"Supermarket: self-service food and household retail."},
  {id:"co058",s:"Commerce",y:2022,t:"Insurance",d:"Hard",q:"Loss adjusters are appointed by",o:{A:"The government",B:"Insurers to independently assess and quantify insurance claims",C:"Insurance regulators",D:"The insured person"},a:"B",e:"Loss adjuster: independent professional assessing claim value."},
  {id:"co059",s:"Commerce",y:2023,t:"Banking",d:"Medium",q:"Microfinance banks primarily serve",o:{A:"Large corporations",B:"Central government",C:"Small-scale entrepreneurs and low-income earners",D:"International traders"},a:"C",e:"Microfinance: credit and financial services for those excluded from mainstream banking."},
  {id:"co060",s:"Commerce",y:2024,t:"Trade",d:"Easy",q:"Market research helps businesses to",o:{A:"Avoid paying taxes",B:"Manufacture goods cheaply",C:"Bribe competitors",D:"Understand consumer needs and market conditions"},a:"D",e:"Market research: collecting data to inform product decisions."},
  {id:"co061",s:"Commerce",y:2010,t:"Banking",d:"Medium",q:"Foreign exchange refers to",o:{A:"The conversion of one currency into another",B:"Tax paid on imports",C:"Exchange of students",D:"Domestic currency transactions"},a:"A",e:"Foreign exchange: trading currencies."},
  {id:"co062",s:"Commerce",y:2011,t:"Trade",d:"Easy",q:"A commodity market deals in",o:{A:"Financial derivatives only",B:"Raw materials and primary products",C:"Shares and stocks",D:"Government bonds"},a:"B",e:"Commodity market: trading in physical goods such as oil, cocoa, gold."},
  {id:"co063",s:"Commerce",y:2012,t:"Insurance",d:"Medium",q:"Health insurance covers",o:{A:"Only surgery costs",B:"Loss of property",C:"Medical expenses and healthcare costs",D:"Natural disasters"},a:"C",e:"Health insurance: covers hospital bills, surgery, drugs, and medical care."},
  {id:"co064",s:"Commerce",y:2013,t:"Banking",d:"Easy",q:"An ATM is used for",o:{A:"Paying insurance premiums",B:"Applying for loans",C:"Buying shares",D:"Withdrawing cash and basic banking transactions electronically"},a:"D",e:"ATM (Automated Teller Machine): 24-hour electronic banking."},
  {id:"co065",s:"Commerce",y:2014,t:"Trade",d:"Medium",q:"A franchise is a business arrangement where",o:{A:"A franchisor grants rights to a franchisee to operate under its brand",B:"Government licences a business",C:"One business runs without a name",D:"Two businesses merge completely"},a:"A",e:"Franchise: franchisee pays fee for brand and system."},
  {id:"co066",s:"Commerce",y:2015,t:"Banking",d:"Medium",q:"The Nigerian Stock Exchange (NGX) is located in",o:{A:"Abuja",B:"Lagos",C:"Port Harcourt",D:"Kano"},a:"B",e:"Nigerian Exchange Group (NGX): located in Lagos."},
  {id:"co067",s:"Commerce",y:2016,t:"Insurance",d:"Easy",q:"Marine insurance covers",o:{A:"Farm animals",B:"Buildings",C:"Ships, cargo, and freight at sea",D:"Motor vehicles"},a:"C",e:"Marine insurance: covers ocean-going vessels and their cargo."},
  {id:"co068",s:"Commerce",y:2017,t:"Trade",d:"Medium",q:"The purpose of warehousing is",o:{A:"To sell goods to consumers",B:"To advertise goods",C:"To manufacture goods",D:"To store goods until they are needed"},a:"D",e:"Warehouse: stores goods bridging the time gap between production and consumption."},
  {id:"co069",s:"Commerce",y:2018,t:"Banking",d:"Easy",q:"When a cheque is crossed it means",o:{A:"It must be paid into a bank account not cashed directly",B:"It can be cashed over the counter",C:"It is post-dated",D:"It is invalid"},a:"A",e:"Crossed cheque: can only be deposited into an account."},
  {id:"co070",s:"Commerce",y:2019,t:"Trade",d:"Hard",q:"Transfer pricing refers to",o:{A:"Transferring shares between companies",B:"Prices set for transactions between related companies to manage tax",C:"Exchange rate in trade",D:"Settling insurance claims"},a:"B",e:"Transfer pricing: multinationals set internal prices to shift profit to low-tax jurisdictions."},
  {id:"co071",s:"Commerce",y:2020,t:"Banking",d:"Easy",q:"Credit cards allow users to",o:{A:"Pay only from savings",B:"Never repay the bank",C:"Buy goods now and pay the bank later",D:"Convert currency only"},a:"C",e:"Credit card: short-term unsecured loan from card issuer."},
  {id:"co072",s:"Commerce",y:2021,t:"Trade",d:"Medium",q:"A certificate of origin is used to",o:{A:"Guarantee quality",B:"Show shipping cost",C:"Prove seller identity",D:"Certify the country where the goods were produced"},a:"D",e:"Certificate of origin: required by customs to determine tariffs."},
  {id:"co073",s:"Commerce",y:2022,t:"Insurance",d:"Easy",q:"The sum insured is the",o:{A:"Maximum amount the insurer will pay in the event of a claim",B:"Cost of premium",C:"Agent's commission",D:"Profit of insurer"},a:"A",e:"Sum insured: ceiling of compensation under a policy."},
  {id:"co074",s:"Commerce",y:2023,t:"Banking",d:"Hard",q:"The Basel III framework governs",o:{A:"Agricultural subsidies",B:"International banking capital adequacy and risk management",C:"Trade tariffs",D:"Stock exchange regulations"},a:"B",e:"Basel III: international standards for bank capital, liquidity, and leverage."},
  {id:"co075",s:"Commerce",y:2024,t:"Trade",d:"Medium",q:"Protectionism in trade involves",o:{A:"Abolishing all tariffs",B:"Encouraging maximum imports",C:"Using tariffs, quotas, and subsidies to protect domestic industries",D:"Opening all markets freely"},a:"C",e:"Protectionism: shields domestic industries from foreign competition."},
  {id:"co076",s:"Commerce",y:2010,t:"Trade",d:"Easy",q:"A monopoly exists when",o:{A:"There are many sellers",B:"Two sellers control the market",C:"Government buys all goods",D:"One seller dominates the entire market"},a:"D",e:"Monopoly: single supplier; no close substitutes; price maker."},
  {id:"co077",s:"Commerce",y:2011,t:"Insurance",d:"Medium",q:"An endowment policy is",o:{A:"A life policy that pays out on death or at the end of a fixed term",B:"A short-term marine policy",C:"A general insurance product",D:"A type of vehicle insurance"},a:"A",e:"Endowment: savings plus life insurance; pays on death OR maturity."},
  {id:"co078",s:"Commerce",y:2012,t:"Banking",d:"Easy",q:"A commercial bank's primary function is to",o:{A:"Regulate financial markets",B:"Accept deposits and make loans to earn profit",C:"Collect taxes",D:"Issue passports"},a:"B",e:"Commercial bank: profit-driven; takes deposits and makes loans."},
  {id:"co079",s:"Commerce",y:2013,t:"Trade",d:"Medium",q:"Barter is the direct exchange of",o:{A:"Goods for credit",B:"Services for money",C:"Goods for goods without money",D:"Shares for bonds"},a:"C",e:"Barter: pre-monetary exchange."},
  {id:"co080",s:"Commerce",y:2014,t:"Insurance",d:"Medium",q:"A policy excess (deductible) is the",o:{A:"Total sum insured",B:"Insurer's profit",C:"Annual premium increase",D:"Amount the insured must pay before the insurer pays the rest"},a:"D",e:"Excess/deductible: insured bears first part of any loss."},
  {id:"co081",s:"Commerce",y:2015,t:"Banking",d:"Medium",q:"The repo rate is the rate at which",o:{A:"The central bank lends money to commercial banks",B:"Government borrows internationally",C:"Customers earn on savings",D:"Banks lend to businesses"},a:"A",e:"Repo rate: central bank's benchmark lending rate to commercial banks."},
  {id:"co082",s:"Commerce",y:2016,t:"Trade",d:"Easy",q:"An export subsidy is government financial support to",o:{A:"Tax exporters",B:"Help exporters compete internationally",C:"Charge shipping fees",D:"Ban foreign goods"},a:"B",e:"Export subsidy: lowers exporter's price; increases competitiveness abroad."},
  {id:"co083",s:"Commerce",y:2017,t:"Insurance",d:"Medium",q:"Double insurance occurs when",o:{A:"Two brokers sell same policy",B:"A policy is taken twice by insurer",C:"The same risk is insured by the same party with two or more insurers",D:"You cannot make any claim"},a:"C",e:"Double insurance: insured covers same interest twice; contribution applies."},
  {id:"co084",s:"Commerce",y:2018,t:"Banking",d:"Medium",q:"Monetisation in an economy refers to",o:{A:"Removing money from circulation",B:"Exporting money abroad",C:"Taxing financial transactions",D:"Converting assets or debt into cash or increasing money in circulation"},a:"D",e:"Monetisation: central bank buying government debt increases money supply."},
  {id:"co085",s:"Commerce",y:2019,t:"Trade",d:"Easy",q:"Packaging serves to",o:{A:"Protect, attract, and provide information about a product",B:"Eliminate competition",C:"Fix prices",D:"Reduce taxes"},a:"A",e:"Packaging: protects goods, attracts consumers, provides product info."},
  {id:"co086",s:"Commerce",y:2020,t:"Banking",d:"Hard",q:"The yield on a bond is inversely related to its",o:{A:"Maturity date",B:"Price",C:"Face value",D:"Coupon rate"},a:"B",e:"Bond yield increases when price decreases (inverse relationship)."},
  {id:"co087",s:"Commerce",y:2021,t:"Trade",d:"Easy",q:"A multinational corporation (MNC) operates",o:{A:"Only in its country of origin",B:"Without any shareholders",C:"In multiple countries across national borders",D:"As a government enterprise"},a:"C",e:"MNC: a company with operations in more than one country."},
  {id:"co088",s:"Commerce",y:2022,t:"Insurance",d:"Medium",q:"Aviation insurance covers",o:{A:"Farm equipment",B:"Farm animals",C:"Rivers and canals",D:"Aircraft, airports, and liability in air transport"},a:"D",e:"Aviation insurance: aircraft hull, liability, and passenger coverage."},
  {id:"co089",s:"Commerce",y:2023,t:"Banking",d:"Easy",q:"NIBSS stands for",o:{A:"Nigeria Inter-Bank Settlement System",B:"Nigerian Investment Bureau for Securities",C:"Nigerian Bank for Small-Scale Startups",D:"Nigerian Insurance Banking and Securities System"},a:"A",e:"NIBSS: facilitates electronic payments between Nigerian banks."},
  {id:"co090",s:"Commerce",y:2024,t:"Trade",d:"Medium",q:"The Abuja Treaty of 1991 aimed to establish the",o:{A:"West African common currency",B:"African Economic Community (AEC) by 2028",C:"Pan-African Parliament only",D:"East African Federation"},a:"B",e:"Abuja Treaty: roadmap for continental free trade and the AEC."},
  {id:"co091",s:"Commerce",y:2010,t:"Trade",d:"Medium",q:"Middlemen can be eliminated in trade through",o:{A:"More government regulations",B:"More warehousing",C:"Direct selling (producer to consumer)",D:"Longer supply chains"},a:"C",e:"Disintermediation: producers selling directly online or at farm gates."},
  {id:"co092",s:"Commerce",y:2011,t:"Banking",d:"Medium",q:"A bank draft is",o:{A:"An unauthorised overdraft",B:"A personal cheque",C:"A loan repayment schedule",D:"A cheque drawn by a bank on itself; guaranteed payment"},a:"D",e:"Bank draft: bank's own cheque; cannot bounce."},
  {id:"co093",s:"Commerce",y:2012,t:"Insurance",d:"Hard",q:"Moral hazard in insurance refers to",o:{A:"Increased risk-taking behaviour when someone is insured",B:"The size of the payout",C:"Claims fraud and risk pooling",D:"The origin of the insurer"},a:"A",e:"Moral hazard: insured takes more risk because losses are covered."},
  {id:"co094",s:"Commerce",y:2013,t:"Trade",d:"Easy",q:"A price list is a document showing",o:{A:"A government tariff schedule",B:"The prices at which a seller offers goods",C:"A tax document",D:"A court judgment"},a:"B",e:"Price list: catalogue of goods and their selling prices."},
  {id:"co095",s:"Commerce",y:2014,t:"Banking",d:"Medium",q:"Leasing differs from hire purchase in that",o:{A:"Leasing involves no payments",B:"Leasing always results in ownership",C:"Ownership usually does NOT transfer to the lessee at end of lease",D:"Hire purchase is for services only"},a:"C",e:"Leasing: use of asset; typically no ownership transfer (unlike HP)."},
  {id:"co096",s:"Commerce",y:2015,t:"Trade",d:"Medium",q:"The WTO promotes",o:{A:"Agricultural subsidies worldwide",B:"Restrictions on free trade",C:"Currency devaluation",D:"Free trade and resolution of trade disputes between member nations"},a:"D",e:"WTO: facilitates global trade rules and settles trade disputes."},
  {id:"co097",s:"Commerce",y:2016,t:"Insurance",d:"Easy",q:"A claim form is completed to",o:{A:"Request payment from insurer after a loss",B:"Renew insurance policy",C:"Cancel insurance cover",D:"Apply for premium reduction"},a:"A",e:"Claim form: document submitted by insured to request compensation."},
  {id:"co098",s:"Commerce",y:2017,t:"Banking",d:"Easy",q:"Legal tender is",o:{A:"Any foreign currency",B:"Money that must be accepted as payment by law",C:"A bank draft",D:"A type of cheque"},a:"B",e:"Legal tender: currency creditors must accept by law."},
  {id:"co099",s:"Commerce",y:2018,t:"Trade",d:"Medium",q:"A bill of exchange is an unconditional written order to",o:{A:"Hold funds",B:"Pay taxes",C:"Pay a specified sum on demand or at a future date",D:"Issue a loan"},a:"C",e:"Bill of exchange: negotiable instrument used in trade credit."},
  {id:"co100",s:"Commerce",y:2019,t:"Banking",d:"Hard",q:"The Fisher effect states that nominal interest rates equal",o:{A:"Real GDP growth plus inflation",B:"Repo rate plus margin",C:"Exchange rate plus inflation",D:"Real interest rates plus expected inflation"},a:"D",e:"Fisher equation: nominal rate = real rate + expected inflation."},
  {id:"ec001",s:"Economics",y:2010,t:"Micro",d:"Easy",q:"Economics is primarily concerned with",o:{A:"Allocation of scarce resources to satisfy unlimited wants",B:"Making laws",C:"Studying the stars",D:"Politics of government"},a:"A",e:"Economics: how scarce resources are allocated to meet unlimited wants."},
  {id:"ec002",s:"Economics",y:2011,t:"Micro",d:"Medium",q:"The law of demand states that price and quantity demanded",o:{A:"Move in the same direction",B:"Move in opposite directions",C:"Demand is always constant",D:"Supply equals demand"},a:"B",e:"Law of demand: as price rises quantity demanded falls (ceteris paribus)."},
  {id:"ec003",s:"Economics",y:2012,t:"Micro",d:"Medium",q:"Which of these is a determinant of supply?",o:{A:"Consumer income",B:"Consumer tastes",C:"Cost of production",D:"Price of related goods (demand side)"},a:"C",e:"Supply determinants include cost of production, technology, and taxes."},
  {id:"ec004",s:"Economics",y:2013,t:"Macro",d:"Easy",q:"GDP stands for",o:{A:"Government Domestic Policy",B:"Gross Domestic Price",C:"General Domestic Product",D:"Gross Domestic Product"},a:"D",e:"GDP = total value of goods and services produced in a country."},
  {id:"ec005",s:"Economics",y:2014,t:"Micro",d:"Medium",q:"When price elasticity of demand is greater than 1, demand is",o:{A:"Elastic",B:"Unit elastic",C:"Inelastic",D:"Perfectly inelastic"},a:"A",e:"PED > 1: quantity responds more than proportionately to price change."},
  {id:"ec006",s:"Economics",y:2015,t:"Macro",d:"Medium",q:"Inflation refers to",o:{A:"A fall in export value",B:"A sustained increase in the general price level",C:"A decrease in GDP",D:"A rise in unemployment"},a:"B",e:"Inflation: persistent rise in the general price level."},
  {id:"ec007",s:"Economics",y:2016,t:"Macro",d:"Easy",q:"Monetary policy is controlled by",o:{A:"The legislature",B:"Local government",C:"The central bank",D:"Households"},a:"C",e:"Central bank controls monetary policy (money supply, interest rates)."},
  {id:"ec008",s:"Economics",y:2017,t:"Micro",d:"Medium",q:"A normal good is one for which demand",o:{A:"Rises as price rises",B:"Falls as income rises",C:"Falls as price falls",D:"Rises as income rises"},a:"D",e:"Normal good: positive income elasticity; demand rises with income."},
  {id:"ec009",s:"Economics",y:2018,t:"Micro",d:"Hard",q:"Marginal utility of a good is",o:{A:"Utility from the last unit consumed",B:"Average utility times price",C:"Price times quantity",D:"Total utility divided by quantity"},a:"A",e:"Marginal utility = additional utility from consuming one more unit."},
  {id:"ec010",s:"Economics",y:2019,t:"Macro",d:"Medium",q:"The multiplier effect means",o:{A:"Prices always increase",B:"A change in spending leads to a larger change in national income",C:"GDP stays constant",D:"A decrease in investment"},a:"B",e:"Multiplier: initial spending change amplified through income rounds."},
  {id:"ec011",s:"Economics",y:2020,t:"Micro",d:"Easy",q:"In perfect competition, firms are",o:{A:"Price makers",B:"Monopolists",C:"Price takers",D:"Oligopolists"},a:"C",e:"Perfect competition: many firms, homogeneous goods, price takers."},
  {id:"ec012",s:"Economics",y:2021,t:"Macro",d:"Medium",q:"Fiscal policy involves government decisions about",o:{A:"Money supply",B:"Interest rates",C:"Exchange rates",D:"Taxation and expenditure"},a:"D",e:"Fiscal policy: government spending and taxation decisions."},
  {id:"ec013",s:"Economics",y:2022,t:"Micro",d:"Hard",q:"A firm is in equilibrium when",o:{A:"MR = MC",B:"TR is maximised",C:"AC is at minimum",D:"MR > MC"},a:"A",e:"Profit maximisation: produce where MR = MC."},
  {id:"ec014",s:"Economics",y:2023,t:"Macro",d:"Medium",q:"The balance of payments records",o:{A:"Government budget only",B:"All foreign currency transactions",C:"National income",D:"Internal trade statistics"},a:"B",e:"Balance of payments: all economic transactions with rest of world."},
  {id:"ec015",s:"Economics",y:2024,t:"Micro",d:"Hard",q:"In the long run under perfect competition, economic profit is",o:{A:"Always positive",B:"Always negative",C:"Zero (normal profit only)",D:"Maximised indefinitely"},a:"C",e:"Long-run perfect competition: entry eliminates excess profit."},
  {id:"ec016",s:"Economics",y:2010,t:"Macro",d:"Medium",q:"National income can be measured using",o:{A:"Only GDP method",B:"Only factor cost method",C:"Survey method only",D:"Output, income, and expenditure approaches"},a:"D",e:"Three equivalent national income measurement approaches."},
  {id:"ec017",s:"Economics",y:2011,t:"Micro",d:"Easy",q:"Scarcity in economics means",o:{A:"Resources are insufficient to satisfy all human wants",B:"There is enough for everyone",C:"All goods are free",D:"Resources are completely exhausted"},a:"A",e:"Scarcity: unlimited wants vs. limited resources."},
  {id:"ec018",s:"Economics",y:2012,t:"Macro",d:"Medium",q:"Hyperinflation refers to",o:{A:"Inflation below 10 percent",B:"Extremely rapid and uncontrolled inflation",C:"Moderate inflation",D:"Stable prices"},a:"B",e:"Hyperinflation: inflation so extreme it destabilises an economy."},
  {id:"ec019",s:"Economics",y:2013,t:"Micro",d:"Medium",q:"A substitute good is one that",o:{A:"Must be consumed with another good",B:"Cannot replace another good",C:"Can be used instead of another good",D:"Is inferior to another good"},a:"C",e:"Substitutes: goods that can be used in place of each other."},
  {id:"ec020",s:"Economics",y:2014,t:"Macro",d:"Easy",q:"Unemployment from the time taken to find a new job is",o:{A:"Structural",B:"Cyclical",C:"Seasonal",D:"Frictional"},a:"D",e:"Frictional unemployment: temporary between jobs; normal in any economy."},
  {id:"ec021",s:"Economics",y:2015,t:"Micro",d:"Medium",q:"Cross elasticity of demand between two complements is",o:{A:"Negative",B:"Zero",C:"Undefined",D:"Positive"},a:"A",e:"Complements: if price of A rises, demand for B falls (negative)."},
  {id:"ec022",s:"Economics",y:2016,t:"Macro",d:"Hard",q:"The IS-LM model represents",o:{A:"International trade and labour market",B:"Goods market equilibrium (IS) and money market equilibrium (LM)",C:"Government spending and money supply",D:"Savings and investment curves only"},a:"B",e:"IS-LM: investment-savings and liquidity-money curves."},
  {id:"ec023",s:"Economics",y:2017,t:"Micro",d:"Easy",q:"An inferior good is one for which demand",o:{A:"Rises as price rises",B:"Stays constant as income changes",C:"Decreases as income increases",D:"Falls as price falls"},a:"C",e:"Inferior good: negative income elasticity."},
  {id:"ec024",s:"Economics",y:2018,t:"Macro",d:"Medium",q:"The repo rate is the rate at which",o:{A:"Commercial banks lend to public",B:"Government borrows from IMF",C:"Firms borrow from shareholders",D:"Central bank lends to commercial banks"},a:"D",e:"Repo rate: central bank's lending rate to commercial banks."},
  {id:"ec025",s:"Economics",y:2019,t:"Micro",d:"Medium",q:"Diminishing marginal returns occur when",o:{A:"Adding more variable input yields less additional output",B:"Costs always rise",C:"Production is at maximum",D:"Prices always fall"},a:"A",e:"Law of diminishing returns: successive units of variable input add less output."},
  {id:"ec026",s:"Economics",y:2020,t:"Macro",d:"Easy",q:"The economic problem of what to produce is about",o:{A:"How to distribute income",B:"Choice of goods and services to produce with scarce resources",C:"Managing inflation",D:"Who should consume goods"},a:"B",e:"What to produce: fundamental economic question about resource allocation."},
  {id:"ec027",s:"Economics",y:2021,t:"Micro",d:"Hard",q:"In monopoly, price is always",o:{A:"Equal to MC",B:"Below MC",C:"Greater than MC",D:"Equal to AC"},a:"C",e:"Monopoly: P > MC (price above marginal cost) causing deadweight loss."},
  {id:"ec028",s:"Economics",y:2022,t:"Macro",d:"Medium",q:"A budget surplus occurs when",o:{A:"Government borrows more",B:"Government revenue equals expenditure",C:"Government expenditure exceeds revenue",D:"Government revenue exceeds expenditure"},a:"D",e:"Surplus: revenue > expenditure."},
  {id:"ec029",s:"Economics",y:2023,t:"Micro",d:"Medium",q:"The price mechanism allocates resources through",o:{A:"Changes in price signals (demand and supply)",B:"Government regulation",C:"International trade",D:"Central planning"},a:"A",e:"Price mechanism: prices signal where resources should go."},
  {id:"ec030",s:"Economics",y:2024,t:"Macro",d:"Hard",q:"Quantitative easing involves",o:{A:"Reducing money supply",B:"Central bank buying assets to increase money supply",C:"Increasing taxes",D:"Raising interest rates"},a:"B",e:"QE: central bank purchases bonds to inject liquidity."},
  {id:"ec031",s:"Economics",y:2010,t:"Micro",d:"Easy",q:"Supply and demand curves intersect at the",o:{A:"Minimum price",B:"Break-even price",C:"Equilibrium price",D:"Maximum price"},a:"C",e:"Equilibrium: where supply = demand; market clears."},
  {id:"ec032",s:"Economics",y:2011,t:"Macro",d:"Medium",q:"GNP differs from GDP because GNP includes",o:{A:"Government expenditure",B:"Private investment",C:"Only exports",D:"Net factor income from abroad"},a:"D",e:"GNP = GDP + net factor income from abroad."},
  {id:"ec033",s:"Economics",y:2012,t:"Micro",d:"Medium",q:"Opportunity cost is",o:{A:"The cost of the best alternative foregone",B:"The sunk cost of production",C:"Zero in a free market",D:"The monetary cost of a good"},a:"A",e:"Opportunity cost: value of the next best alternative given up."},
  {id:"ec034",s:"Economics",y:2013,t:"Macro",d:"Easy",q:"An increase in government spending tends to",o:{A:"Reduce national income",B:"Increase national income",C:"Decrease investment",D:"Have no effect"},a:"B",e:"Expansionary fiscal: higher G increases national income via multiplier."},
  {id:"ec035",s:"Economics",y:2014,t:"Micro",d:"Hard",q:"The Laffer Curve shows the relationship between",o:{A:"Income and consumption",B:"Imports and exports",C:"Tax rate and tax revenue",D:"Capital and labour"},a:"C",e:"Laffer Curve: at some point higher tax rate yields less revenue."},
  {id:"ec036",s:"Economics",y:2015,t:"Macro",d:"Medium",q:"Stagflation refers to",o:{A:"Rapid growth with inflation",B:"Economic growth with no inflation",C:"No growth and no inflation",D:"High inflation combined with high unemployment and low growth"},a:"D",e:"Stagflation: inflation + stagnation (1970s phenomenon)."},
  {id:"ec037",s:"Economics",y:2016,t:"Micro",d:"Medium",q:"A public good is characterised by",o:{A:"Non-rivalry and non-excludability",B:"Non-rivalry and excludability",C:"Rivalry and non-excludability",D:"Rivalry and excludability"},a:"A",e:"Public good: non-rival and non-excludable."},
  {id:"ec038",s:"Economics",y:2017,t:"Macro",d:"Medium",q:"The exchange rate is the",o:{A:"Interest rate between banks",B:"Price at which one currency exchanges for another",C:"Rate at which goods are exchanged",D:"Trade balance between countries"},a:"B",e:"Exchange rate: price of one currency in terms of another."},
  {id:"ec039",s:"Economics",y:2018,t:"Micro",d:"Easy",q:"A market is in disequilibrium when",o:{A:"Supply equals demand",B:"Price is stable",C:"Quantity demanded does not equal quantity supplied",D:"Quantity demanded equals quantity supplied"},a:"C",e:"Disequilibrium: excess supply or demand; market not cleared."},
  {id:"ec040",s:"Economics",y:2019,t:"Macro",d:"Hard",q:"The quantity theory of money MV=PT states",o:{A:"Money supply times price level equals transactions",B:"Money velocity is always constant",C:"GDP equals money supply",D:"Money supply times velocity equals price level times transactions"},a:"D",e:"Fisher equation: M x V = P x T."},
  {id:"ec041",s:"Economics",y:2020,t:"Micro",d:"Medium",q:"Monopolistic competition features",o:{A:"Differentiated products, many firms, and easy entry",B:"Few firms and high barriers",C:"One firm controlling market",D:"Homogeneous products and many firms"},a:"A",e:"Monopolistic competition: product differentiation plus low barriers."},
  {id:"ec042",s:"Economics",y:2021,t:"Macro",d:"Easy",q:"Economic growth is measured by changes in",o:{A:"Population size",B:"Real GDP over time",C:"Inflation rate",D:"Employment levels"},a:"B",e:"Economic growth: percentage increase in real GDP per period."},
  {id:"ec043",s:"Economics",y:2022,t:"Micro",d:"Hard",q:"Price discrimination requires",o:{A:"Homogeneous consumers",B:"One market only",C:"Ability to separate markets and prevent arbitrage",D:"Consumers able to resell"},a:"C",e:"Price discrimination: seller charges different prices; no resale possible."},
  {id:"ec044",s:"Economics",y:2023,t:"Macro",d:"Medium",q:"Current account deficit means",o:{A:"Exports exceed imports",B:"More savings than investment",C:"Balanced trade",D:"Imports more goods and services than it exports"},a:"D",e:"Current account deficit: imports > exports of goods and services."},
  {id:"ec045",s:"Economics",y:2024,t:"Micro",d:"Medium",q:"Consumer surplus is the difference between",o:{A:"What consumer pays and what they would have been willing to pay",B:"Supply and demand",C:"Producer revenue and costs",D:"Marginal cost and price"},a:"A",e:"Consumer surplus = willingness to pay minus actual price paid."},
  {id:"ec046",s:"Economics",y:2010,t:"Macro",d:"Medium",q:"The central bank of Nigeria is",o:{A:"First Bank",B:"The Central Bank of Nigeria (CBN)",C:"Zenith Bank",D:"Access Bank"},a:"B",e:"CBN is Nigeria's apex financial institution and monetary authority."},
  {id:"ec047",s:"Economics",y:2011,t:"Micro",d:"Easy",q:"When supply decreases, all else equal, price tends to",o:{A:"Stay the same",B:"Fall first then rise",C:"Rise",D:"Fall"},a:"C",e:"Decrease in supply: supply curve shifts left giving higher equilibrium price."},
  {id:"ec048",s:"Economics",y:2012,t:"Macro",d:"Hard",q:"The Solow growth model emphasises",o:{A:"Government spending",B:"Monetary policy",C:"Exports",D:"Capital accumulation, labour, and technology in long-run growth"},a:"D",e:"Solow model: growth from capital, labour, and total factor productivity."},
  {id:"ec049",s:"Economics",y:2013,t:"Micro",d:"Medium",q:"An increase in consumer income for a normal good causes",o:{A:"Demand curve to shift right",B:"Supply curve to shift left",C:"Demand curve to shift left",D:"Supply curve to shift right"},a:"A",e:"Income rise gives more demand for normal goods; D shifts right."},
  {id:"ec050",s:"Economics",y:2014,t:"Macro",d:"Medium",q:"Deflation refers to",o:{A:"Rising unemployment",B:"Falling general price level",C:"Rising general price level",D:"Rising national income"},a:"B",e:"Deflation: sustained fall in the general price level."},
  {id:"ec051",s:"Economics",y:2015,t:"Micro",d:"Hard",q:"The shut-down condition for a firm in the short run is",o:{A:"MR < MC",B:"P < ATC",C:"P < AVC",D:"TR > TC"},a:"C",e:"Shut-down: price below average variable cost so better to stop."},
  {id:"ec052",s:"Economics",y:2016,t:"Macro",d:"Easy",q:"Development economics focuses on",o:{A:"Stock markets",B:"Trade deficits",C:"Monetary theory",D:"Economic growth and poverty in less-developed countries"},a:"D",e:"Development economics: policies for growth and welfare in developing nations."},
  {id:"ec053",s:"Economics",y:2017,t:"Micro",d:"Medium",q:"Giffen goods are an exception to the law of demand because",o:{A:"Their demand rises as price rises",B:"They are luxury goods",C:"Their demand is perfectly elastic",D:"They have close substitutes"},a:"A",e:"Giffen goods: inferior goods where demand rises as price rises."},
  {id:"ec054",s:"Economics",y:2018,t:"Macro",d:"Hard",q:"Keynesian multiplier = 1/(1-MPC). If MPC=0.8, multiplier is",o:{A:"2",B:"5",C:"8",D:"4"},a:"B",e:"Multiplier = 1/(1-0.8) = 1/0.2 = 5."},
  {id:"ec055",s:"Economics",y:2019,t:"Micro",d:"Medium",q:"In oligopoly, price rigidity is explained by the",o:{A:"Monopoly model",B:"Perfect competition model",C:"Kinked demand curve model",D:"Cournot model"},a:"C",e:"Kinked demand curve: price rigidity because rivals match cuts but not rises."},
  {id:"ec056",s:"Economics",y:2020,t:"Macro",d:"Medium",q:"Unemployment benefits and student grants are examples of",o:{A:"Taxes",B:"Capital expenditure",C:"Government revenue",D:"Transfer payments"},a:"D",e:"Transfer payments: redistributive payments with no corresponding output."},
  {id:"ec057",s:"Economics",y:2021,t:"Micro",d:"Easy",q:"Utility in economics means",o:{A:"Satisfaction derived from consuming a good",B:"Monetary value",C:"Brand reputation",D:"Physical usefulness"},a:"A",e:"Utility: satisfaction or benefit a consumer gets from a good."},
  {id:"ec058",s:"Economics",y:2022,t:"Macro",d:"Medium",q:"An appreciation of the naira makes Nigerian exports",o:{A:"Cheaper abroad",B:"More expensive abroad",C:"More profitable in naira terms",D:"More competitive"},a:"B",e:"Appreciation: exports cost more in foreign currency so less competitive."},
  {id:"ec059",s:"Economics",y:2023,t:"Micro",d:"Hard",q:"In a two-part tariff, consumers pay",o:{A:"A flat rate per unit",B:"A subscription fee only",C:"A lump-sum entry fee plus a per-unit price",D:"Only the marginal cost"},a:"C",e:"Two-part tariff: fixed access fee plus per-unit charge."},
  {id:"ec060",s:"Economics",y:2024,t:"Macro",d:"Easy",q:"The term invisible hand was coined by",o:{A:"John Maynard Keynes",B:"Karl Marx",C:"Milton Friedman",D:"Adam Smith"},a:"D",e:"Adam Smith used invisible hand to describe self-regulating markets."},
  {id:"ec061",s:"Economics",y:2010,t:"Micro",d:"Medium",q:"The short run is defined as the period during which",o:{A:"At least one input is fixed",B:"No production occurs",C:"Only labour is employed",D:"All inputs are variable"},a:"A",e:"Short run: at least one factor of production (usually capital) is fixed."},
  {id:"ec062",s:"Economics",y:2011,t:"Macro",d:"Medium",q:"A recession is defined as",o:{A:"A fall in inflation",B:"Two consecutive quarters of negative real GDP growth",C:"One quarter of falling output",D:"A rise in interest rates"},a:"B",e:"Recession: two or more consecutive quarters of negative GDP growth."},
  {id:"ec063",s:"Economics",y:2012,t:"Micro",d:"Hard",q:"In the Cournot duopoly model, each firm",o:{A:"Cooperates with rival",B:"Takes rival's price as given",C:"Takes rival's output as given and maximises profit",D:"Sets the market price"},a:"C",e:"Cournot: each firm assumes rival's output is fixed; Nash equilibrium in quantities."},
  {id:"ec064",s:"Economics",y:2013,t:"Macro",d:"Medium",q:"The Human Development Index (HDI) measures",o:{A:"Only per capita income",B:"GDP and inflation only",C:"Trade balance",D:"Life expectancy, education, and per capita income"},a:"D",e:"HDI: composite measure of life expectancy, education, and income."},
  {id:"ec065",s:"Economics",y:2014,t:"Micro",d:"Easy",q:"A market failure occurs when",o:{A:"The free market fails to allocate resources efficiently",B:"The market produces an efficient outcome",C:"Resources are perfectly allocated",D:"All goods are provided at cost"},a:"A",e:"Market failure: prices fail to reflect true social costs and benefits."},
  {id:"ec066",s:"Economics",y:2015,t:"Macro",d:"Hard",q:"The Phillips Curve illustrates the trade-off between",o:{A:"GDP and inflation",B:"Inflation and unemployment",C:"Interest rates and investment",D:"Employment and wages"},a:"B",e:"Original Phillips Curve: inverse relationship between inflation and unemployment."},
  {id:"ec067",s:"Economics",y:2016,t:"Micro",d:"Medium",q:"When MR = 0, total revenue is",o:{A:"Falling",B:"Rising",C:"At its maximum",D:"Negative"},a:"C",e:"MR=0 means an extra unit adds nothing to TR so TR is at maximum."},
  {id:"ec068",s:"Economics",y:2017,t:"Macro",d:"Easy",q:"Crowding out means government borrowing",o:{A:"Increases private investment",B:"Has no effect",C:"Reduces inflation",D:"Reduces private investment by raising interest rates"},a:"D",e:"Crowding out: government borrowing raises interest rates reducing private investment."},
  {id:"ec069",s:"Economics",y:2018,t:"Micro",d:"Medium",q:"Which market structure has the MOST competition?",o:{A:"Perfect competition",B:"Oligopoly",C:"Monopolistic competition",D:"Monopoly"},a:"A",e:"Perfect competition: the most competitive market structure."},
  {id:"ec070",s:"Economics",y:2019,t:"Macro",d:"Hard",q:"In the IS curve, a higher interest rate leads to",o:{A:"Higher consumption",B:"Lower investment and lower income",C:"Equilibrium in money market",D:"More investment"},a:"B",e:"IS curve: higher r gives lower investment and lower aggregate income."},
  {id:"ec071",s:"Economics",y:2020,t:"Micro",d:"Easy",q:"Demand for a good falls if",o:{A:"Its price falls",B:"Income rises (normal good)",C:"Its price rises",D:"A complementary good becomes cheaper"},a:"C",e:"Law of demand: higher price gives lower quantity demanded."},
  {id:"ec072",s:"Economics",y:2021,t:"Macro",d:"Medium",q:"Nigeria's main export earner is",o:{A:"Agriculture",B:"Manufacturing",C:"Tourism",D:"Crude oil"},a:"D",e:"Nigeria: oil accounts for majority of export earnings."},
  {id:"ec073",s:"Economics",y:2022,t:"Micro",d:"Hard",q:"The Gini coefficient measures",o:{A:"Income inequality",B:"Economic growth",C:"Inflation",D:"National income"},a:"A",e:"Gini coefficient: 0 = perfect equality; 1 = perfect inequality."},
  {id:"ec074",s:"Economics",y:2023,t:"Macro",d:"Medium",q:"Privatisation means",o:{A:"Government takes over private firms",B:"State-owned enterprises are sold to private sector",C:"Firms move abroad",D:"Government buys shares"},a:"B",e:"Privatisation: transfer of state-owned assets to private ownership."},
  {id:"ec075",s:"Economics",y:2024,t:"Micro",d:"Medium",q:"Producer surplus is the difference between",o:{A:"Marginal cost and average cost",B:"Revenue and expenditure",C:"Price received and minimum acceptable price",D:"Supply and demand"},a:"C",e:"Producer surplus = price received minus minimum price willing to accept."},
  {id:"ec076",s:"Economics",y:2010,t:"Macro",d:"Easy",q:"Interest rates are used to control",o:{A:"Government expenditure",B:"Population growth",C:"Employment directly",D:"Inflation and money supply"},a:"D",e:"Central banks raise or lower interest rates to manage inflation and credit."},
  {id:"ec077",s:"Economics",y:2011,t:"Micro",d:"Medium",q:"Income elasticity of demand for a luxury good is",o:{A:"Greater than 1",B:"Exactly 1",C:"Zero",D:"Less than 1"},a:"A",e:"Luxury goods: income elasticity > 1 (demand rises more than proportionately)."},
  {id:"ec078",s:"Economics",y:2012,t:"Macro",d:"Hard",q:"Purchasing power parity (PPP) states that in the long run",o:{A:"Exchange rates are fixed",B:"Exchange rates equalise the purchasing power of currencies",C:"Interest rates determine trade",D:"Inflation has no effect"},a:"B",e:"PPP: exchange rates adjust so same basket costs same everywhere."},
  {id:"ec079",s:"Economics",y:2013,t:"Micro",d:"Medium",q:"A natural monopoly exists when",o:{A:"There is only one buyer",B:"The government bans competitors",C:"Production costs decrease continuously with output",D:"Barriers are low"},a:"C",e:"Natural monopoly: LRAC falls over entire market output (e.g. utilities)."},
  {id:"ec080",s:"Economics",y:2014,t:"Macro",d:"Easy",q:"ECOWAS stands for",o:{A:"East Central Organisation of West African States",B:"Economic Council of West and South Africa",C:"European Committee of West African Suppliers",D:"Economic Community of West African States"},a:"D",e:"ECOWAS: regional body for West African economic integration."},
  {id:"ec081",s:"Economics",y:2015,t:"Micro",d:"Medium",q:"An excise tax on a good with inelastic demand is borne mainly by",o:{A:"The consumer",B:"The government",C:"Equally by producer and consumer",D:"The producer"},a:"A",e:"Inelastic demand: consumers bear most of the tax burden."},
  {id:"ec082",s:"Economics",y:2016,t:"Macro",d:"Hard",q:"The J-curve effect describes how after currency depreciation",o:{A:"Trade balance improves immediately",B:"Trade balance worsens before improving",C:"Exports fall permanently",D:"Trade balance is unaffected"},a:"B",e:"J-curve: short-run worsening then improvement in trade balance after depreciation."},
  {id:"ec083",s:"Economics",y:2017,t:"Micro",d:"Easy",q:"Price controls setting a maximum price below equilibrium are called",o:{A:"Tariffs",B:"Price floors",C:"Price ceilings",D:"Subsidies"},a:"C",e:"Price ceiling (max price): set below equilibrium causing shortages."},
  {id:"ec084",s:"Economics",y:2018,t:"Macro",d:"Medium",q:"The aggregate demand curve slopes downward because",o:{A:"Supply always increases",B:"Government spends more when prices rise",C:"Higher prices increase consumption",D:"Higher prices reduce real wealth, exports, and investment"},a:"D",e:"AD slopes down: wealth effect, international substitution, and interest rate effect."},
  {id:"ec085",s:"Economics",y:2019,t:"Micro",d:"Hard",q:"The Bertrand duopoly model predicts that",o:{A:"Competition drives price to marginal cost",B:"Only one firm survives",C:"Prices rise above marginal cost",D:"Firms cooperate on price"},a:"A",e:"Bertrand: firms compete on price giving P = MC (competitive outcome)."},
  {id:"ec086",s:"Economics",y:2020,t:"Macro",d:"Easy",q:"Absolute poverty means",o:{A:"Income below average",B:"Not meeting basic human needs (food, shelter, clothing)",C:"Relative deprivation",D:"Having less than the richest 10 percent"},a:"B",e:"Absolute poverty: inability to meet basic human needs."},
  {id:"ec087",s:"Economics",y:2021,t:"Micro",d:"Medium",q:"In the long run, the supply curve of a perfectly competitive industry is",o:{A:"Perfectly inelastic",B:"Downward sloping",C:"Horizontal or upward sloping",D:"Backward bending"},a:"C",e:"Long-run supply: horizontal (constant cost) or upward sloping."},
  {id:"ec088",s:"Economics",y:2022,t:"Macro",d:"Medium",q:"Foreign direct investment (FDI) involves",o:{A:"Short-term currency speculation",B:"Portfolio investment only",C:"Bond purchases",D:"Long-term investment by foreign entities in physical assets"},a:"D",e:"FDI: direct investment in businesses and factories in another country."},
  {id:"ec089",s:"Economics",y:2023,t:"Micro",d:"Hard",q:"Deadweight loss in monopoly arises because",o:{A:"The monopolist produces where P > MC reducing total surplus",B:"Producers are too efficient",C:"Consumers pay too little",D:"P = MC"},a:"A",e:"Monopoly: P > MC gives underproduction and deadweight loss."},
  {id:"ec090",s:"Economics",y:2024,t:"Macro",d:"Medium",q:"Animal spirits (Keynes) refers to",o:{A:"Government policy confidence",B:"Irrational market optimism and pessimism driving investment",C:"Business cycle theories",D:"Natural resource cycles"},a:"B",e:"Keynes: animal spirits = instinctive confidence driving investment decisions."},
  {id:"ec091",s:"Economics",y:2010,t:"Micro",d:"Easy",q:"Effective demand is demand that is",o:{A:"Unlimited",B:"For luxury goods only",C:"Backed by the ability to pay",D:"Only from producers"},a:"C",e:"Effective demand = desire plus ability to pay."},
  {id:"ec092",s:"Economics",y:2011,t:"Macro",d:"Medium",q:"OPEC is an organisation that",o:{A:"Controls global banking",B:"Manages immigration",C:"Sets educational standards",D:"Coordinates petroleum production among member countries"},a:"D",e:"OPEC: Organisation of the Petroleum Exporting Countries."},
  {id:"ec093",s:"Economics",y:2012,t:"Micro",d:"Hard",q:"If MPC=0.75 and taxes increase by N100bn, fall in national income is",o:{A:"N300bn",B:"N400bn",C:"N500bn",D:"N300bn"},a:"A",e:"Tax multiplier = -MPC/(1-MPC) = -3; change in Y = -3 x 100 = -N300bn."},
  {id:"ec094",s:"Economics",y:2013,t:"Macro",d:"Easy",q:"Subsistence farming means",o:{A:"Farming for commercial export",B:"Farming to meet only the farmer's own needs",C:"Farming only in dry season",D:"Farming using machines"},a:"B",e:"Subsistence farming: produce only enough for self-consumption."},
  {id:"ec095",s:"Economics",y:2014,t:"Micro",d:"Medium",q:"Fixed costs are costs that",o:{A:"Rise with output",B:"Vary with production level",C:"Do not change with level of output",D:"Only occur in long run"},a:"C",e:"Fixed costs: rent, insurance; independent of output level."},
  {id:"ec096",s:"Economics",y:2015,t:"Macro",d:"Hard",q:"The accelerator theory states investment is driven by",o:{A:"Interest rates alone",B:"Government spending",C:"Money supply changes",D:"Changes in national income (GDP growth)"},a:"D",e:"Accelerator: net investment depends on the change in national income."},
  {id:"ec097",s:"Economics",y:2016,t:"Micro",d:"Easy",q:"Wants are said to be unlimited because",o:{A:"People always have more desires than can be satisfied",B:"Technology always fills gap",C:"Everyone is greedy",D:"Resources are always sufficient"},a:"A",e:"Unlimited wants: human desires always exceed available resources."},
  {id:"ec098",s:"Economics",y:2017,t:"Macro",d:"Medium",q:"Main instrument of monetary policy in Nigeria is",o:{A:"Tariffs",B:"Cash reserve ratio (CRR) and MPR",C:"Minimum wage",D:"Subsidies"},a:"B",e:"CBN uses CRR, MPR, and open market operations as monetary tools."},
  {id:"ec099",s:"Economics",y:2018,t:"Micro",d:"Hard",q:"A dominant strategy in game theory is",o:{A:"Always the cooperative strategy",B:"Only available to monopolists",C:"The best response regardless of what the opponent does",D:"The strategy that maximises social welfare"},a:"C",e:"Dominant strategy: best regardless of rival's action."},
  {id:"ec100",s:"Economics",y:2019,t:"Macro",d:"Easy",q:"Standard of living is best measured by",o:{A:"Total GDP",B:"Population size",C:"Rate of inflation",D:"GDP per capita"},a:"D",e:"GDP per capita: average economic output per person."},
  {id:"ge001",s:"Geography",y:2010,t:"Physical",d:"Easy",q:"The process by which rocks are broken down in situ without being moved is",o:{A:"Weathering",B:"Deposition",C:"Transportation",D:"Erosion"},a:"A",e:"Weathering: breakdown of rock in place; no transport."},
  {id:"ge002",s:"Geography",y:2011,t:"Human",d:"Medium",q:"Population density is calculated as",o:{A:"Population times Area",B:"Population divided by Area",C:"Area divided by Population",D:"Population divided by Birth rate"},a:"B",e:"Population density = total population divided by land area."},
  {id:"ge003",s:"Geography",y:2012,t:"Physical",d:"Medium",q:"The movement of water through soil to the water table is called",o:{A:"Transpiration",B:"Overland flow",C:"Percolation",D:"Evaporation"},a:"C",e:"Percolation: downward movement of water through soil and rock."},
  {id:"ge004",s:"Geography",y:2013,t:"Physical",d:"Easy",q:"The longest river in Africa is the",o:{A:"Niger",B:"Congo",C:"Zambezi",D:"Nile"},a:"D",e:"The Nile (about 6650 km) is the longest river in Africa."},
  {id:"ge005",s:"Geography",y:2014,t:"Human",d:"Medium",q:"Urbanisation refers to",o:{A:"The growth of towns and movement of people from rural to urban areas",B:"Emigration to foreign countries",C:"Increased land use",D:"Decline of agriculture"},a:"A",e:"Urbanisation: increasing proportion of population living in urban areas."},
  {id:"ge006",s:"Geography",y:2015,t:"Physical",d:"Medium",q:"The layer of the atmosphere closest to the Earth's surface is the",o:{A:"Stratosphere",B:"Troposphere",C:"Thermosphere",D:"Mesosphere"},a:"B",e:"Troposphere (0-12 km): contains weather systems."},
  {id:"ge007",s:"Geography",y:2016,t:"Physical",d:"Hard",q:"Insolation refers to",o:{A:"Insulation of buildings",B:"Ocean currents",C:"Solar radiation received at the Earth's surface",D:"Earth's internal heat"},a:"C",e:"Insolation: incoming solar radiation at Earth's surface."},
  {id:"ge008",s:"Geography",y:2017,t:"Human",d:"Easy",q:"The largest continent by area is",o:{A:"Africa",B:"North America",C:"Europe",D:"Asia"},a:"D",e:"Asia: largest continent (about 44.6 million km2)."},
  {id:"ge009",s:"Geography",y:2018,t:"Physical",d:"Medium",q:"A fold mountain is formed by",o:{A:"Plate tectonic collision",B:"River deposition",C:"Glacial erosion",D:"Volcanic activity"},a:"A",e:"Fold mountains form where tectonic plates collide and crust buckles."},
  {id:"ge010",s:"Geography",y:2019,t:"Human",d:"Easy",q:"Emigration is the movement of people",o:{A:"Seasonally with animals",B:"Out of a country to settle elsewhere",C:"Into a country",D:"Within a country"},a:"B",e:"Emigration: leaving one's country to live permanently in another."},
  {id:"ge011",s:"Geography",y:2020,t:"Physical",d:"Easy",q:"The imaginary line at 0 degrees longitude is called the",o:{A:"International Date Line",B:"Tropic of Cancer",C:"Prime Meridian (Greenwich Meridian)",D:"Equator"},a:"C",e:"Prime Meridian: 0 degrees longitude, passing through Greenwich."},
  {id:"ge012",s:"Geography",y:2021,t:"Physical",d:"Medium",q:"Contour lines on a map connect points of equal",o:{A:"Distance",B:"Rainfall",C:"Temperature",D:"Elevation above sea level"},a:"D",e:"Contour lines: join points of same altitude."},
  {id:"ge013",s:"Geography",y:2022,t:"Human",d:"Medium",q:"Brain drain refers to",o:{A:"Emigration of highly educated professionals from a country",B:"Reduction in academic institutions",C:"Reduction in rainfall",D:"Decrease in national intelligence"},a:"A",e:"Brain drain: loss of skilled workers to other countries."},
  {id:"ge014",s:"Geography",y:2023,t:"Physical",d:"Hard",q:"The Sahel region of Africa is",o:{A:"Dense equatorial rainforest",B:"Semi-arid transition zone between Sahara and savanna",C:"Mediterranean climate",D:"Polar tundra"},a:"B",e:"Sahel: belt of semi-arid land between Sahara and Sudan savanna."},
  {id:"ge015",s:"Geography",y:2024,t:"Human",d:"Medium",q:"GDP per capita is used to measure",o:{A:"Total population",B:"Rainfall levels",C:"Average economic output per person",D:"Land area"},a:"C",e:"GDP per capita: proxy for standard of living."},
  {id:"ge016",s:"Geography",y:2010,t:"Physical",d:"Easy",q:"Earthquakes originate at the",o:{A:"Epicentre",B:"Mantle",C:"Continental shelf",D:"Focus (hypocentre)"},a:"D",e:"Focus/hypocentre: point inside Earth where earthquake originates."},
  {id:"ge017",s:"Geography",y:2011,t:"Human",d:"Easy",q:"The study of population is called",o:{A:"Demography",B:"Geomorphology",C:"Meteorology",D:"Ecology"},a:"A",e:"Demography: scientific study of population size, structure, and change."},
  {id:"ge018",s:"Geography",y:2012,t:"Physical",d:"Medium",q:"Savanna vegetation is characterised by",o:{A:"Dense forest canopy",B:"Grassland with scattered trees",C:"No vegetation",D:"Tropical swamps"},a:"B",e:"Savanna: tropical grassland with scattered trees."},
  {id:"ge019",s:"Geography",y:2013,t:"Physical",d:"Medium",q:"The source of a river is",o:{A:"Its mouth",B:"The sea",C:"Where it originates",D:"Its delta"},a:"C",e:"Source: where a river begins."},
  {id:"ge020",s:"Geography",y:2014,t:"Human",d:"Easy",q:"A megalopolis is",o:{A:"A very small village",B:"A rural area",C:"An underwater city",D:"An extremely large urban area formed by merging cities"},a:"D",e:"Megalopolis: chain of metropolitan areas merged into one."},
  {id:"ge021",s:"Geography",y:2015,t:"Physical",d:"Medium",q:"Ocean currents are mainly caused by",o:{A:"Wind, temperature differences, and Earth's rotation",B:"Rainfall patterns",C:"Tidal forces alone",D:"Lunar cycles"},a:"A",e:"Ocean currents: driven by wind, thermohaline circulation, and Coriolis effect."},
  {id:"ge022",s:"Geography",y:2016,t:"Physical",d:"Hard",q:"The Coriolis effect causes moving air in the Northern Hemisphere to deflect",o:{A:"Backwards",B:"To the right",C:"To the left",D:"Southward"},a:"B",e:"Coriolis effect: Earth's rotation deflects winds to the right in Northern Hemisphere."},
  {id:"ge023",s:"Geography",y:2017,t:"Human",d:"Easy",q:"Sustainable development means",o:{A:"Avoiding all economic growth",B:"Development ignoring environmental limits",C:"Meeting present needs without compromising future generations",D:"Only urban development"},a:"C",e:"Sustainable development: Brundtland Commission 1987."},
  {id:"ge024",s:"Geography",y:2018,t:"Physical",d:"Easy",q:"A delta is formed at",o:{A:"The source of a river",B:"The middle of a river",C:"Where two rivers meet",D:"The mouth of a river where sediment is deposited"},a:"D",e:"Delta: fan-shaped deposit at river mouth (e.g., Niger Delta)."},
  {id:"ge025",s:"Geography",y:2019,t:"Human",d:"Medium",q:"Overpopulation occurs when",o:{A:"Population exceeds the carrying capacity of the environment",B:"Population matches resource capacity",C:"Resources exceed population",D:"A country has too few people"},a:"A",e:"Overpopulation: more people than environment can sustainably support."},
  {id:"ge026",s:"Geography",y:2020,t:"Physical",d:"Medium",q:"The rock cycle involves transformation between",o:{A:"Only igneous rocks",B:"Igneous, sedimentary, and metamorphic rock types",C:"No changes to rocks",D:"Only volcanic activity"},a:"B",e:"Rock cycle: continuous transformation between rock types."},
  {id:"ge027",s:"Geography",y:2021,t:"Human",d:"Easy",q:"Birth rate is measured as",o:{A:"Deaths per 1000 per year",B:"Births per woman in lifetime",C:"Births per 1000 population per year",D:"Ratio of births to deaths"},a:"C",e:"Birth rate: number of live births per 1000 population per year."},
  {id:"ge028",s:"Geography",y:2022,t:"Physical",d:"Hard",q:"Periglacial landscapes are associated with",o:{A:"Dense tropical forests",B:"Permanent ice sheets",C:"Volcanic activity",D:"Freeze-thaw cycles near the edges of glaciers"},a:"D",e:"Periglacial: dominated by freeze-thaw processes; near but not covered by ice."},
  {id:"ge029",s:"Geography",y:2023,t:"Human",d:"Medium",q:"The Green Revolution introduced",o:{A:"High-yield crop varieties, irrigation, and fertilisers",B:"Less use of fertilisers",C:"Traditional farming methods",D:"More people to farming"},a:"A",e:"Green Revolution (1960s-70s): transformed agriculture in developing countries."},
  {id:"ge030",s:"Geography",y:2024,t:"Physical",d:"Easy",q:"The equator is at latitude",o:{A:"90 degrees N",B:"0 degrees",C:"23.5 degrees N",D:"45 degrees N"},a:"B",e:"Equator: 0 degrees latitude; equidistant from both poles."},
  {id:"ge031",s:"Geography",y:2010,t:"Physical",d:"Medium",q:"Limestone landscapes with sinkholes and caves are called",o:{A:"Tundra landscapes",B:"Rift valleys",C:"Karst landscapes",D:"Volcanic landscapes"},a:"C",e:"Karst: formed by dissolution of soluble rocks (limestone)."},
  {id:"ge032",s:"Geography",y:2011,t:"Human",d:"Medium",q:"The dependency ratio measures",o:{A:"Economic output per worker",B:"Number of jobs available",C:"Level of poverty",D:"The ratio of dependants to working-age population"},a:"D",e:"Dependency ratio: (dependants / working population) x 100."},
  {id:"ge033",s:"Geography",y:2012,t:"Physical",d:"Easy",q:"Erosion is",o:{A:"The wearing away and removal of material by water, wind, or ice",B:"Deposition of sediment",C:"Formation of new rocks",D:"Breakdown of rock in place"},a:"A",e:"Erosion: removal of material by water, wind, or ice."},
  {id:"ge034",s:"Geography",y:2013,t:"Human",d:"Hard",q:"The demographic transition model shows",o:{A:"How climate affects population",B:"Population change linked to economic development and mortality/fertility decline",C:"Only urban growth",D:"Only birth rate changes"},a:"B",e:"DTM: 4 stages of population change as countries develop."},
  {id:"ge035",s:"Geography",y:2014,t:"Physical",d:"Medium",q:"Tropical rainforests are found near the equator where",o:{A:"It is cold and dry",B:"Seasons are distinct",C:"It is hot and wet all year",D:"There is no rainfall"},a:"C",e:"Tropical rainforest: equatorial belt; high rainfall and temperature."},
  {id:"ge036",s:"Geography",y:2015,t:"Human",d:"Easy",q:"Rural-urban migration is movement of people",o:{A:"Returning to villages",B:"From cities to rural areas",C:"Building cities in rural areas",D:"From rural areas to cities"},a:"D",e:"Rural-urban migration: dominant demographic shift in developing nations."},
  {id:"ge037",s:"Geography",y:2016,t:"Physical",d:"Hard",q:"Albedo of a surface refers to",o:{A:"Reflectivity of incoming solar radiation",B:"Elevation above sea level",C:"Rainfall absorption rate",D:"Temperature in summer"},a:"A",e:"Albedo: fraction of solar radiation reflected."},
  {id:"ge038",s:"Geography",y:2017,t:"Human",d:"Medium",q:"Deforestation leads to",o:{A:"Increased biodiversity",B:"Soil erosion, biodiversity loss, and increased flooding",C:"Improved soil fertility",D:"Reduced flooding"},a:"B",e:"Deforestation consequences: soil erosion, climate change, biodiversity loss."},
  {id:"ge039",s:"Geography",y:2018,t:"Physical",d:"Easy",q:"A lagoon is",o:{A:"A type of volcano",B:"A mountain lake",C:"A shallow body of water separated from the sea by a sandbar or reef",D:"A desert oasis"},a:"C",e:"Lagoon: separated from open sea by a barrier (e.g., Lagos Lagoon)."},
  {id:"ge040",s:"Geography",y:2019,t:"Human",d:"Easy",q:"Nigeria's most populous city is",o:{A:"Abuja",B:"Kano",C:"Ibadan",D:"Lagos"},a:"D",e:"Lagos: largest city in Nigeria."},
  {id:"ge041",s:"Geography",y:2020,t:"Physical",d:"Medium",q:"The Harmattan is",o:{A:"A dry, dusty northeasterly wind that blows over West Africa",B:"A tropical storm",C:"A volcanic eruption",D:"A West African ocean current"},a:"A",e:"Harmattan: dry dust-laden wind from the Sahara, November-March."},
  {id:"ge042",s:"Geography",y:2021,t:"Human",d:"Medium",q:"Desertification is caused by",o:{A:"Increased rainfall",B:"Land degradation in drylands due to climate and human activity",C:"Drop in sea levels",D:"Reforestation"},a:"B",e:"Desertification: degradation of drylands; caused by overgrazing, deforestation."},
  {id:"ge043",s:"Geography",y:2022,t:"Physical",d:"Medium",q:"A watershed divides",o:{A:"Lakes from rivers",B:"A river into two channels",C:"Two river drainage basins",D:"Ocean from sea"},a:"C",e:"Watershed (drainage divide): boundary between adjacent drainage basins."},
  {id:"ge044",s:"Geography",y:2023,t:"Human",d:"Hard",q:"The Gini coefficient measures",o:{A:"Economic growth",B:"Trade balance",C:"Population density",D:"Income inequality within a country"},a:"D",e:"Gini: 0 = perfect equality; 1 = perfect inequality."},
  {id:"ge045",s:"Geography",y:2024,t:"Physical",d:"Easy",q:"Which type of rock is formed from cooled magma?",o:{A:"Igneous",B:"Metamorphic",C:"None of the above",D:"Sedimentary"},a:"A",e:"Igneous rock: formed when magma cools and solidifies."},
  {id:"ge046",s:"Geography",y:2010,t:"Physical",d:"Medium",q:"Tectonic plates that move apart are at a",o:{A:"Convergent boundary",B:"Divergent boundary",C:"Conservative boundary",D:"Transform boundary"},a:"B",e:"Divergent boundary: plates move apart; new ocean floor created."},
  {id:"ge047",s:"Geography",y:2011,t:"Human",d:"Medium",q:"A primate city is one that is",o:{A:"The oldest historically",B:"The industrial capital",C:"Disproportionately large compared to other cities in its country",D:"The most intelligent"},a:"C",e:"Primate city: overwhelmingly dominant city."},
  {id:"ge048",s:"Geography",y:2012,t:"Physical",d:"Easy",q:"The water cycle is also called the",o:{A:"Carbon cycle",B:"Nitrogen cycle",C:"Oxygen cycle",D:"Hydrological cycle"},a:"D",e:"Hydrological cycle: continuous movement of water."},
  {id:"ge049",s:"Geography",y:2013,t:"Human",d:"Easy",q:"Deforestation is the",o:{A:"Clearing of forests for other land uses",B:"Cultivation of crops",C:"Protection of forests",D:"Replanting of trees"},a:"A",e:"Deforestation: large-scale removal of trees from forests."},
  {id:"ge050",s:"Geography",y:2014,t:"Physical",d:"Medium",q:"Temperature decreases with altitude in the troposphere at a rate called the",o:{A:"Albedo rate",B:"Environmental lapse rate",C:"Thermal inversion",D:"Wind shear"},a:"B",e:"Environmental lapse rate: about 6.5 degrees C per 1000 m."},
  {id:"ge051",s:"Geography",y:2015,t:"Physical",d:"Easy",q:"A volcano that has not erupted recently but may erupt again is",o:{A:"Active",B:"Extinct",C:"Dormant",D:"Submarine"},a:"C",e:"Dormant volcano: not currently active but not permanently extinct."},
  {id:"ge052",s:"Geography",y:2016,t:"Human",d:"Medium",q:"The Human Development Index (HDI) combines",o:{A:"GDP, exports, and imports",B:"Population, land, and income",C:"Fertility, mortality, and migration",D:"Life expectancy, education, and income per capita"},a:"D",e:"HDI: composite index of life expectancy, education, and GNI."},
  {id:"ge053",s:"Geography",y:2017,t:"Physical",d:"Hard",q:"The ITCZ (Inter-Tropical Convergence Zone) is",o:{A:"A band of low pressure where trade winds converge near the equator",B:"0 degrees longitude",C:"A mountain range near tropics",D:"The Antarctic boundary"},a:"A",e:"ITCZ: convergence of trade winds near equator; brings heavy rainfall."},
  {id:"ge054",s:"Geography",y:2018,t:"Human",d:"Easy",q:"Overpopulation leads to",o:{A:"Improved food security",B:"Strain on resources, housing, and services",C:"Lower birth rates",D:"More resources per person"},a:"B",e:"Overpopulation: pressure on food, water, housing, and infrastructure."},
  {id:"ge055",s:"Geography",y:2019,t:"Physical",d:"Medium",q:"Metamorphic rocks are formed from existing rocks transformed by",o:{A:"Cooling lava",B:"Wind deposition",C:"Heat and pressure",D:"Compacted sediments"},a:"C",e:"Metamorphic rocks: formed by heat and pressure."},
  {id:"ge056",s:"Geography",y:2020,t:"Human",d:"Hard",q:"Ravenstein's laws of migration state that",o:{A:"All migration is international",B:"Migration has no regular pattern",C:"Only men migrate",D:"Most migrants move short distances and migration occurs in steps"},a:"D",e:"Ravenstein (1885): laws of migration; short distance, step migration."},
  {id:"ge057",s:"Geography",y:2021,t:"Physical",d:"Easy",q:"Longitude lines run",o:{A:"From pole to pole (north-south)",B:"In all directions",C:"Between tropics only",D:"Parallel to the equator"},a:"A",e:"Lines of longitude (meridians): run north-south from pole to pole."},
  {id:"ge058",s:"Geography",y:2022,t:"Human",d:"Medium",q:"An LEDC is characterised by",o:{A:"High per capita income",B:"Low income, poor infrastructure, and dependence on agriculture",C:"Advanced healthcare",D:"Strong industrial base"},a:"B",e:"LEDC: low GDP, high poverty, limited services."},
  {id:"ge059",s:"Geography",y:2023,t:"Physical",d:"Hard",q:"The rain shadow effect causes",o:{A:"More rainfall on both sides",B:"Less rainfall on windward side",C:"Less rainfall on the leeward side of a mountain",D:"Rainfall only at coast"},a:"C",e:"Rain shadow: leeward side gets drier air after moisture lost on windward side."},
  {id:"ge060",s:"Geography",y:2024,t:"Human",d:"Easy",q:"The study of maps is called",o:{A:"Oceanography",B:"Meteorology",C:"Geomorphology",D:"Cartography"},a:"D",e:"Cartography: the science and art of map-making."},
  {id:"ge061",s:"Geography",y:2010,t:"Physical",d:"Medium",q:"A fjord is",o:{A:"A long narrow sea inlet carved by glacial erosion",B:"A type of desert",C:"A river delta",D:"A tropical lagoon"},a:"A",e:"Fjord: glacially eroded valley now flooded by sea."},
  {id:"ge062",s:"Geography",y:2011,t:"Human",d:"Easy",q:"Net migration is",o:{A:"Total population movement",B:"The difference between immigration and emigration",C:"Only immigration",D:"Only emigration"},a:"B",e:"Net migration = immigration minus emigration."},
  {id:"ge063",s:"Geography",y:2012,t:"Physical",d:"Medium",q:"The zone of saturated ground below the water table is called the",o:{A:"Soil horizon",B:"Permafrost layer",C:"Zone of saturation",D:"Unsaturated zone"},a:"C",e:"Zone of saturation: below water table; all pore spaces filled with water."},
  {id:"ge064",s:"Geography",y:2013,t:"Human",d:"Medium",q:"Ribbon development refers to",o:{A:"Urban growth along transport routes",B:"Planned urban development",C:"Growth of housing in rural areas",D:"Circular city expansion"},a:"D",e:"Ribbon development: linear urban growth following roads or railways."},
  {id:"ge065",s:"Geography",y:2014,t:"Physical",d:"Easy",q:"Trade winds blow from subtropical high pressure zones toward the equator. In the Northern Hemisphere they blow from the",o:{A:"Northeast",B:"West",C:"South",D:"East"},a:"A",e:"Trade winds: NE in N. Hemisphere toward the ITCZ."},
  {id:"ge066",s:"Geography",y:2015,t:"Human",d:"Medium",q:"A conurbation is",o:{A:"A rural farming community",B:"A large urban area formed by the merging of several towns or cities",C:"A single isolated city",D:"A small market town"},a:"B",e:"Conurbation: several towns merge into one continuous urban area."},
  {id:"ge067",s:"Geography",y:2016,t:"Physical",d:"Easy",q:"The highest mountain in Africa is",o:{A:"Mount Kenya",B:"Mount Cameroon",C:"Kilimanjaro",D:"Mount Elgon"},a:"C",e:"Kilimanjaro (5895 m): highest peak in Africa, Tanzania."},
  {id:"ge068",s:"Geography",y:2017,t:"Human",d:"Hard",q:"The Kuznets curve proposes that as economies develop inequality",o:{A:"Falls continuously",B:"Is always maintained",C:"Is unrelated to income",D:"Rises then falls as income increases"},a:"D",e:"Kuznets: inequality (or pollution) rises then falls with growth."},
  {id:"ge069",s:"Geography",y:2018,t:"Physical",d:"Medium",q:"Alluvial fans form when a fast-flowing river",o:{A:"Deposits sediment as it enters flat land",B:"Melts completely",C:"Erupts",D:"Enters the sea"},a:"A",e:"Alluvial fan: cone-shaped deposit where river slows on flat land."},
  {id:"ge070",s:"Geography",y:2019,t:"Human",d:"Easy",q:"Life expectancy is the",o:{A:"Fertility rate of women",B:"Average number of years a person is expected to live",C:"Average age at which people die",D:"Number of births per year"},a:"B",e:"Life expectancy: average number of years lived from birth."},
  {id:"ge071",s:"Geography",y:2020,t:"Physical",d:"Easy",q:"Latitude measures distance",o:{A:"Between continents",B:"From prime meridian east or west",C:"From the equator north or south (in degrees)",D:"From sea level upward"},a:"C",e:"Latitude: angular distance north or south of the equator."},
  {id:"ge072",s:"Geography",y:2021,t:"Human",d:"Medium",q:"The multiplier effect in urban geography means",o:{A:"City populations always decline",B:"High-skilled workers leave",C:"Suburban areas shrink",D:"Growth in one sector triggers wider economic growth in a city"},a:"D",e:"Urban multiplier: economic growth generates further jobs and services."},
  {id:"ge073",s:"Geography",y:2022,t:"Physical",d:"Hard",q:"Isohyets are lines on a map joining places of equal",o:{A:"Annual rainfall",B:"Pressure",C:"Wind speed",D:"Temperature"},a:"A",e:"Isohyets: lines of equal precipitation on a map."},
  {id:"ge074",s:"Geography",y:2023,t:"Human",d:"Medium",q:"Globalisation involves",o:{A:"Isolation of national economies",B:"Increasing international economic, cultural, and political integration",C:"Reduction of trade",D:"Rise of local production"},a:"B",e:"Globalisation: growing interconnection of world economies and cultures."},
  {id:"ge075",s:"Geography",y:2024,t:"Physical",d:"Easy",q:"The ozone layer is found in the",o:{A:"Mesosphere",B:"Troposphere",C:"Stratosphere",D:"Exosphere"},a:"C",e:"Ozone layer: 15-35 km in the stratosphere; absorbs UV radiation."},
  {id:"ge076",s:"Geography",y:2010,t:"Physical",d:"Medium",q:"Meanders are features of a river's",o:{A:"Source",B:"Headwater",C:"Upper course",D:"Lower course"},a:"D",e:"Meanders: large bends typical of lower course where gradient is gentle."},
  {id:"ge077",s:"Geography",y:2011,t:"Human",d:"Easy",q:"CBD stands for",o:{A:"Central Business District",B:"Commercial Business Department",C:"Community Business Development",D:"Central Banking District"},a:"A",e:"CBD: city centre; highest land values and commercial density."},
  {id:"ge078",s:"Geography",y:2012,t:"Physical",d:"Easy",q:"The atmosphere is held to the Earth by",o:{A:"Solar winds",B:"Gravity",C:"Ocean currents",D:"Centrifugal force"},a:"B",e:"Gravity keeps the atmosphere from escaping into space."},
  {id:"ge079",s:"Geography",y:2013,t:"Human",d:"Medium",q:"Push factors in migration include",o:{A:"Better wages elsewhere",B:"More job opportunities",C:"Poverty, conflict, and natural disasters forcing people to leave",D:"Good climate elsewhere"},a:"C",e:"Push factors: negative conditions driving people away."},
  {id:"ge080",s:"Geography",y:2014,t:"Physical",d:"Easy",q:"A plateau is",o:{A:"An ocean trench",B:"A narrow coastal strip",C:"A steep mountain slope",D:"A flat-topped elevated landform"},a:"D",e:"Plateau: extensive flat-topped elevated land (e.g., Jos Plateau, Nigeria)."},
  {id:"ge081",s:"Geography",y:2015,t:"Human",d:"Easy",q:"Immigration is the movement of people",o:{A:"Into a country to settle",B:"Within a country",C:"Out of a country",D:"Seasonally with animals"},a:"A",e:"Immigration: entering a foreign country to live permanently."},
  {id:"ge082",s:"Geography",y:2016,t:"Physical",d:"Medium",q:"Coral reefs form in",o:{A:"Deep cold oceans",B:"Shallow warm tropical seas",C:"Freshwater lakes",D:"Polar seas"},a:"B",e:"Coral reefs: grow in warm, clear, shallow tropical marine environments."},
  {id:"ge083",s:"Geography",y:2017,t:"Human",d:"Medium",q:"An ageing population means",o:{A:"High birth rate",B:"Equal numbers of all age groups",C:"An increasing proportion of elderly people",D:"Declining elderly population"},a:"C",e:"Ageing population: elderly population grows as birth rates fall."},
  {id:"ge084",s:"Geography",y:2018,t:"Physical",d:"Easy",q:"Isobars on a weather map connect points of equal",o:{A:"Temperature",B:"Rainfall",C:"Wind speed",D:"Atmospheric pressure"},a:"D",e:"Isobars: lines of equal air pressure."},
  {id:"ge085",s:"Geography",y:2019,t:"Human",d:"Medium",q:"Fair trade aims to",o:{A:"Ensure farmers in developing countries receive fair prices",B:"Benefit only exporting countries",C:"Maximise corporate profit",D:"Reduce all trade between countries"},a:"A",e:"Fair trade: ensures producers in developing countries get fair wages."},
  {id:"ge086",s:"Geography",y:2020,t:"Physical",d:"Hard",q:"A graben is a",o:{A:"Coastal sand dune",B:"Depressed block of land between parallel faults",C:"Lava flow pattern",D:"Type of fold mountain"},a:"B",e:"Graben: down-dropped block between normal faults (e.g., East African Rift)."},
  {id:"ge087",s:"Geography",y:2021,t:"Human",d:"Easy",q:"Deforestation increases the risk of flooding because",o:{A:"It causes more rainfall",B:"It reduces sunlight",C:"Trees absorb rainfall so without them run-off increases",D:"It increases biodiversity"},a:"C",e:"Without trees: rainwater runs off faster causing increased flooding."},
  {id:"ge088",s:"Geography",y:2022,t:"Physical",d:"Easy",q:"Nigeria's rainfall is mainly brought by winds from the",o:{A:"Northeast",B:"North",C:"Sahara",D:"Southwest"},a:"D",e:"Southwest monsoon winds carry moisture from the Atlantic to Nigeria."},
  {id:"ge089",s:"Geography",y:2023,t:"Human",d:"Hard",q:"Counter-urbanisation is movement of people",o:{A:"From urban areas to rural or suburban areas",B:"From one city to another",C:"Into city centres",D:"From rural to urban areas"},a:"A",e:"Counter-urbanisation: reverse of urbanisation."},
  {id:"ge090",s:"Geography",y:2024,t:"Physical",d:"Medium",q:"Frost-shattering type of weathering occurs through",o:{A:"Chemical dissolution",B:"Repeated freezing and thawing of water in rock cracks",C:"Wind abrasion",D:"Biological activity"},a:"B",e:"Freeze-thaw (frost shattering): water expands 9 percent on freezing, shattering rock."},
  {id:"ge091",s:"Geography",y:2010,t:"Human",d:"Easy",q:"Nigeria's capital city is",o:{A:"Ibadan",B:"Kano",C:"Abuja",D:"Lagos"},a:"C",e:"Abuja replaced Lagos as Nigeria's capital in 1991."},
  {id:"ge092",s:"Geography",y:2011,t:"Physical",d:"Medium",q:"A plain is",o:{A:"An elevated plateau",B:"A steep valley",C:"A coastal cliff",D:"A large, flat, low-lying area of land"},a:"D",e:"Plain: extensive flat low-lying land."},
  {id:"ge093",s:"Geography",y:2012,t:"Human",d:"Medium",q:"Import substitution is a development strategy involving",o:{A:"Replacing imports with domestically produced goods",B:"Reducing all trade",C:"Increasing foreign aid",D:"Exporting raw materials"},a:"A",e:"Import substitution industrialisation (ISI): developing domestic manufacturing."},
  {id:"ge094",s:"Geography",y:2013,t:"Physical",d:"Hard",q:"El Nino refers to",o:{A:"A West African harmattan event",B:"Periodic warming of the equatorial Pacific with global weather impacts",C:"A monsoon reversal in Asia",D:"The cold Benguela Current"},a:"B",e:"El Nino: warm phase of ENSO; disrupts global rainfall and temperature."},
  {id:"ge095",s:"Geography",y:2014,t:"Human",d:"Easy",q:"The death rate is",o:{A:"Births per 1000 population",B:"Marriages per year",C:"Deaths per 1000 population per year",D:"Immigrants arriving"},a:"C",e:"Death rate: number of deaths per 1000 population per year."},
  {id:"ge096",s:"Geography",y:2015,t:"Physical",d:"Medium",q:"A strait is",o:{A:"A type of plateau",B:"An elevated coastal zone",C:"A wide ocean",D:"A narrow channel of water connecting two larger bodies of water"},a:"D",e:"Strait: narrow waterway between two seas (e.g., Strait of Gibraltar)."},
  {id:"ge097",s:"Geography",y:2016,t:"Human",d:"Easy",q:"Natural increase of population =",o:{A:"Birth rate minus Death rate",B:"Birth rate times Death rate",C:"Total population divided by Area",D:"Immigration minus Emigration"},a:"A",e:"Natural increase: birth rate minus death rate."},
  {id:"ge098",s:"Geography",y:2017,t:"Physical",d:"Medium",q:"Which Nigerian state lies at the heart of the Niger Delta?",o:{A:"Cross River",B:"Bayelsa",C:"Rivers",D:"Anambra"},a:"B",e:"Bayelsa State is at the centre of the Niger Delta."},
  {id:"ge099",s:"Geography",y:2018,t:"Human",d:"Hard",q:"The von Thunen model explains",o:{A:"City growth patterns",B:"Regional trade",C:"Agricultural land use patterns around a central market",D:"Industrial location"},a:"C",e:"Von Thunen: concentric rings of agricultural activity around a central city."},
  {id:"ge100",s:"Geography",y:2019,t:"Physical",d:"Easy",q:"The sun rises in the",o:{A:"West",B:"South",C:"North",D:"East"},a:"D",e:"Earth rotates west to east so sun appears to rise in the east."},
  {id:"go001",s:"Government",y:2010,t:"Governance",d:"Easy",q:"A state is defined by its permanent population, defined territory, government, and",o:{A:"Sovereignty",B:"Its military",C:"Its population only",D:"Its capital city"},a:"A",e:"Montevideo Convention: 4 elements of a state."},
  {id:"go002",s:"Government",y:2011,t:"Electoral",d:"Medium",q:"A by-election is held",o:{A:"Every four years",B:"When a seat becomes vacant between general elections",C:"During a coup",D:"After a census"},a:"B",e:"By-election fills a vacant seat caused by death or resignation."},
  {id:"go003",s:"Government",y:2012,t:"Governance",d:"Easy",q:"The doctrine of separation of powers was popularised by",o:{A:"Aristotle",B:"Hobbes",C:"Montesquieu",D:"John Locke"},a:"C",e:"Montesquieu (1748) articulated separation of powers."},
  {id:"go004",s:"Government",y:2013,t:"Constitution",d:"Medium",q:"A federal constitution distributes power between",o:{A:"Executive and judiciary only",B:"Legislature and judiciary only",C:"President and governors",D:"Central government and component units"},a:"D",e:"Federalism: constitutional division of power between national and sub-national units."},
  {id:"go005",s:"Government",y:2014,t:"Political Systems",d:"Easy",q:"In a democracy, sovereignty rests with",o:{A:"The people",B:"The president",C:"Parliament",D:"The military"},a:"A",e:"Democracy: sovereignty derived from the people (popular sovereignty)."},
  {id:"go006",s:"Government",y:2015,t:"Electoral",d:"Medium",q:"Proportional representation ensures",o:{A:"The president has more power",B:"Seats reflect the proportion of votes won",C:"The largest party benefits",D:"Reduced voter turnout"},a:"B",e:"PR: seats allocated in proportion to share of votes received."},
  {id:"go007",s:"Government",y:2016,t:"Nigerian Government",d:"Easy",q:"Nigeria became a federal republic in",o:{A:"1960",B:"1966",C:"1963",D:"1979"},a:"C",e:"Nigeria became a republic on 1 October 1963."},
  {id:"go008",s:"Government",y:2017,t:"Governance",d:"Medium",q:"Checks and balances mean",o:{A:"President can veto all laws",B:"All branches have equal power",C:"Only judiciary can check government",D:"Each branch can limit the powers of the others"},a:"D",e:"Checks and balances: each arm can restrain the others."},
  {id:"go009",s:"Government",y:2018,t:"Political Systems",d:"Medium",q:"A theocracy is a government ruled by",o:{A:"Religious leaders or divine authority",B:"Business elites",C:"A royal family",D:"The military"},a:"A",e:"Theocracy: government based on religious law or divine authority."},
  {id:"go010",s:"Government",y:2019,t:"Nigerian Government",d:"Easy",q:"INEC stands for",o:{A:"Independent National Election Commission",B:"Independent National Electoral Commission",C:"International Nigerian Electoral Corporation",D:"Internal National Electoral Committee"},a:"B",e:"INEC: body that conducts Nigeria's elections."},
  {id:"go011",s:"Government",y:2020,t:"Governance",d:"Medium",q:"A unitary state concentrates power in",o:{A:"Local governments",B:"Regional governments",C:"The central government",D:"Sub-national units equally"},a:"C",e:"Unitary state: central government holds supreme authority."},
  {id:"go012",s:"Government",y:2021,t:"Nigerian Government",d:"Medium",q:"Nigeria's National Assembly consists of",o:{A:"Only the Senate",B:"Only the House of Representatives",C:"Senate and State Houses of Assembly",D:"Senate and House of Representatives"},a:"D",e:"Nigeria's National Assembly: Senate (109) plus House of Reps (360)."},
  {id:"go013",s:"Government",y:2022,t:"Political Systems",d:"Easy",q:"Totalitarianism is a system where",o:{A:"The state controls all aspects of public and private life",B:"Power is shared equally",C:"Religious law governs politics",D:"Citizens have full freedoms"},a:"A",e:"Totalitarianism: total state control over all aspects of life."},
  {id:"go014",s:"Government",y:2023,t:"Governance",d:"Hard",q:"The Westphalian system (1648) established",o:{A:"UN peacekeeping",B:"The principle of state sovereignty and non-interference",C:"International financial institutions",D:"Democratic governance worldwide"},a:"B",e:"Peace of Westphalia 1648: foundation of modern state sovereignty."},
  {id:"go015",s:"Government",y:2024,t:"Electoral",d:"Medium",q:"Gerrymandering refers to",o:{A:"Changing the voting age",B:"Holding elections too frequently",C:"Manipulating constituency boundaries to favour one party",D:"Banning political parties"},a:"C",e:"Gerrymandering: drawing district lines to give one party an advantage."},
  {id:"go016",s:"Government",y:2010,t:"Constitution",d:"Easy",q:"A constitution is",o:{A:"A party manifesto",B:"An international treaty",C:"A presidential speech",D:"The fundamental law of a country defining government structure"},a:"D",e:"Constitution: supreme law defining government powers, rights, and structure."},
  {id:"go017",s:"Government",y:2011,t:"Political Systems",d:"Medium",q:"In a presidential system the executive is",o:{A:"Directly elected and separate from the legislature",B:"Elected by parliament",C:"Subordinate to parliament",D:"Part of the legislature"},a:"A",e:"Presidential system: executive elected separately from legislature."},
  {id:"go018",s:"Government",y:2012,t:"Governance",d:"Medium",q:"The rule of law means",o:{A:"Only president makes laws",B:"Everyone including government is subject to the law",C:"Constitution is unwritten",D:"Military interprets law"},a:"B",e:"Rule of law: no one is above the law."},
  {id:"go019",s:"Government",y:2013,t:"Electoral",d:"Easy",q:"Universal adult suffrage means",o:{A:"Only educated can vote",B:"Only men can vote",C:"All adults regardless of sex or class have the right to vote",D:"Only property owners vote"},a:"C",e:"Universal adult suffrage: equal voting rights for all adult citizens."},
  {id:"go020",s:"Government",y:2014,t:"Nigerian Government",d:"Medium",q:"The Supreme Court of Nigeria is the",o:{A:"Court of first instance",B:"International court",C:"Administrative tribunal",D:"Highest court of the land"},a:"D",e:"Nigeria's Supreme Court: apex court; final appellate jurisdiction."},
  {id:"go021",s:"Government",y:2015,t:"Political Systems",d:"Hard",q:"The social contract theory was developed by",o:{A:"Rousseau, Locke, and Hobbes",B:"Plato",C:"Montesquieu",D:"Aristotle"},a:"A",e:"Social contract: Hobbes, Locke, and Rousseau."},
  {id:"go022",s:"Government",y:2016,t:"Governance",d:"Medium",q:"Federalism in Nigeria provides for",o:{A:"Only central government",B:"Three tiers: federal, state, and local government",C:"One tier of government",D:"Only state governments"},a:"B",e:"Nigeria's federalism: three tiers."},
  {id:"go023",s:"Government",y:2017,t:"Nigerian Government",d:"Easy",q:"The head of government in Nigeria's presidential system is the",o:{A:"Senate President",B:"Chief Justice",C:"President",D:"Speaker of the House"},a:"C",e:"Nigeria: President is both head of state and head of government."},
  {id:"go024",s:"Government",y:2018,t:"Political Systems",d:"Medium",q:"Pressure groups differ from political parties in that",o:{A:"They have more members",B:"They run candidates in elections",C:"They control the military",D:"They do not seek to control government directly"},a:"D",e:"Pressure groups: influence policy but do not contest elections."},
  {id:"go025",s:"Government",y:2019,t:"Constitution",d:"Hard",q:"Judicial review is the power of courts to",o:{A:"Declare laws unconstitutional",B:"Draft legislation",C:"Run executive agencies",D:"Elect the president"},a:"A",e:"Judicial review: courts can invalidate laws that violate the constitution."},
  {id:"go026",s:"Government",y:2020,t:"Electoral",d:"Easy",q:"A referendum is a",o:{A:"Debate in parliament",B:"Vote by the general public on a specific issue",C:"Form of census",D:"Type of election"},a:"B",e:"Referendum: direct vote by citizens on a specific policy or constitutional issue."},
  {id:"go027",s:"Government",y:2021,t:"Governance",d:"Medium",q:"The ombudsman is an official who",o:{A:"Conducts elections",B:"Commands the military",C:"Investigates citizens complaints against government",D:"Writes the constitution"},a:"C",e:"Ombudsman: independent official who investigates public complaints."},
  {id:"go028",s:"Government",y:2022,t:"Political Systems",d:"Easy",q:"An autocracy is ruled by",o:{A:"A parliament",B:"A committee",C:"The military alone",D:"One person with unlimited power"},a:"D",e:"Autocracy: single ruler with unchecked authority."},
  {id:"go029",s:"Government",y:2023,t:"Nigerian Government",d:"Medium",q:"The EFCC was established to",o:{A:"Combat economic and financial crimes",B:"Manage national budget",C:"Regulate the press",D:"Conduct elections"},a:"A",e:"EFCC: Economic and Financial Crimes Commission."},
  {id:"go030",s:"Government",y:2024,t:"Constitution",d:"Medium",q:"A rigid constitution requires",o:{A:"A simple majority to change",B:"A special procedure to amend",C:"A presidential decree",D:"Cannot be changed"},a:"B",e:"Rigid constitution: requires supermajority to amend."},
  {id:"go031",s:"Government",y:2010,t:"Political Systems",d:"Medium",q:"Communism advocates for",o:{A:"A free-market economy",B:"Private ownership of production",C:"A classless society with public ownership of means of production",D:"Democratic elections"},a:"C",e:"Communism (Marx): classless society, state ownership."},
  {id:"go032",s:"Government",y:2011,t:"Governance",d:"Easy",q:"The executive arm of government is responsible for",o:{A:"Making laws",B:"Adjudicating disputes",C:"Interpreting the constitution",D:"Implementing laws and running government"},a:"D",e:"Executive: implements and enforces laws."},
  {id:"go033",s:"Government",y:2012,t:"Electoral",d:"Medium",q:"A coalition government is formed when",o:{A:"No single party wins an outright majority so parties combine",B:"The military takes over",C:"The president is impeached",D:"One party wins a majority"},a:"A",e:"Coalition: formed when no party wins majority."},
  {id:"go034",s:"Government",y:2013,t:"Nigerian Government",d:"Hard",q:"The Land Use Act of Nigeria (1978) vests all land in",o:{A:"Private landowners",B:"State governors",C:"The federal government",D:"Local governments"},a:"B",e:"Land Use Act 1978: all land vested in state governors held in trust."},
  {id:"go035",s:"Government",y:2014,t:"Governance",d:"Medium",q:"Sovereignty means",o:{A:"Ability to borrow from IMF",B:"Right to trade internationally",C:"Supreme and absolute authority of a state over its territory",D:"Military superiority"},a:"C",e:"Sovereignty: supreme authority within territorial boundary."},
  {id:"go036",s:"Government",y:2015,t:"Political Systems",d:"Easy",q:"A multi-party system allows",o:{A:"Only two parties to compete",B:"Military to participate",C:"Only one party to rule",D:"Many parties to compete for power"},a:"D",e:"Multi-party system: multiple political parties compete freely."},
  {id:"go037",s:"Government",y:2016,t:"Nigerian Government",d:"Medium",q:"Nigeria's federal system was formally established by the",o:{A:"Lyttleton Constitution of 1954",B:"1963 Constitution",C:"1960 Constitution",D:"1914 Amalgamation"},a:"A",e:"Lyttleton Constitution 1954: first formally federal constitution."},
  {id:"go038",s:"Government",y:2017,t:"Constitution",d:"Hard",q:"Entrenchment in a constitution means",o:{A:"Easily amended provisions",B:"Protected provisions requiring higher threshold to amend",C:"Constitutional monarchy",D:"Removal of citizens rights"},a:"B",e:"Entrenchment: specific clauses protected by requiring higher threshold."},
  {id:"go039",s:"Government",y:2018,t:"Electoral",d:"Medium",q:"Proportional representation works best with",o:{A:"First-past-the-post systems",B:"Single-member constituencies",C:"Multi-member constituencies",D:"One party systems"},a:"C",e:"PR works best with multi-member constituencies."},
  {id:"go040",s:"Government",y:2019,t:"Governance",d:"Easy",q:"Local government is the",o:{A:"National parliament",B:"International body",C:"Sub-regional body above state level",D:"Third tier of government closest to the people"},a:"D",e:"Local government: grassroots governance closest to citizens."},
  {id:"go041",s:"Government",y:2020,t:"Political Systems",d:"Hard",q:"The concept of polyarchy was developed by Robert Dahl to describe",o:{A:"Modern democracies with elected officials plus civil liberties",B:"Hobbes' social contract",C:"Marxist theory",D:"Plato's ideal state"},a:"A",e:"Dahl: polyarchy = real-world democracy."},
  {id:"go042",s:"Government",y:2021,t:"Nigerian Government",d:"Medium",q:"Nigeria has how many states?",o:{A:"30",B:"36",C:"34",D:"32"},a:"B",e:"Nigeria has 36 states plus the FCT (Abuja)."},
  {id:"go043",s:"Government",y:2022,t:"Governance",d:"Medium",q:"Delegated legislation refers to",o:{A:"Laws by state assemblies",B:"International treaties",C:"Secondary law made by bodies other than parliament under parliamentary authority",D:"Customary law"},a:"C",e:"Delegated legislation: ministers make regulations under parliamentary authority."},
  {id:"go044",s:"Government",y:2023,t:"Constitution",d:"Easy",q:"An unwritten constitution is one that",o:{A:"Has no laws",B:"Cannot be enforced",C:"Applies only to government officials",D:"Is not contained in a single document"},a:"D",e:"Unwritten constitution: drawn from conventions, statutes, and case law."},
  {id:"go045",s:"Government",y:2024,t:"Political Systems",d:"Medium",q:"Capitalism is an economic system based on",o:{A:"Private ownership and free markets",B:"Equal distribution of wealth",C:"Central planning",D:"State ownership of all firms"},a:"A",e:"Capitalism: private property, free markets, profit motive."},
  {id:"go046",s:"Government",y:2010,t:"Governance",d:"Hard",q:"A failed state applies when",o:{A:"GDP falls for one year",B:"State can no longer perform basic sovereign functions",C:"Country withdraws from UN",D:"Government loses an election"},a:"B",e:"Failed state: collapse of security, law, and basic services."},
  {id:"go047",s:"Government",y:2011,t:"Nigerian Government",d:"Easy",q:"NASS stands for",o:{A:"National Army Support System",B:"Nigerian Association of Social Scientists",C:"National Assembly",D:"National Academic Support"},a:"C",e:"NASS = Nigeria's National Assembly."},
  {id:"go048",s:"Government",y:2012,t:"Electoral",d:"Medium",q:"Election rigging is also known as",o:{A:"Coalition building",B:"Gerrymandering",C:"Electoral fraud",D:"Proportional representation"},a:"D",e:"Electoral fraud: illegal interference with election process."},
  {id:"go049",s:"Government",y:2013,t:"Governance",d:"Medium",q:"An independent judiciary is important because it",o:{A:"Guarantees rights and upholds constitution without political interference",B:"Controls public spending",C:"Writes the constitution",D:"Makes executive appointments"},a:"A",e:"Independent judiciary: impartial arbiter that protects rights and constitution."},
  {id:"go050",s:"Government",y:2014,t:"Political Systems",d:"Medium",q:"Nationalism refers to",o:{A:"Loyalty to international organisations",B:"Strong identification with one's nation and desire for self-determination",C:"Opposition to all government",D:"Religious devotion"},a:"B",e:"Nationalism: collective identity and loyalty to a nation-state."},
  {id:"go051",s:"Government",y:2015,t:"Constitution",d:"Medium",q:"Supremacy of the constitution means",o:{A:"Parliament can override it",B:"President can suspend it",C:"The constitution is above all other laws",D:"Customary law supersedes it"},a:"C",e:"Constitutional supremacy: constitution is the highest law."},
  {id:"go052",s:"Government",y:2016,t:"Nigerian Government",d:"Hard",q:"Under the 1999 Constitution the concurrent list contains powers",o:{A:"Only for federal government",B:"Only for state governments",C:"For residual matters",D:"For both federal and state governments"},a:"D",e:"Concurrent list: both federal and state governments can legislate."},
  {id:"go053",s:"Government",y:2017,t:"Governance",d:"Easy",q:"The legislature's primary function is",o:{A:"Making laws",B:"Adjudicating disputes",C:"Administering government",D:"Implementing policy"},a:"A",e:"Legislature: primary function is law-making."},
  {id:"go054",s:"Government",y:2018,t:"Electoral",d:"Easy",q:"The voting age in Nigeria is",o:{A:"16",B:"18",C:"25",D:"21"},a:"B",e:"Nigerian Constitution: minimum voting age is 18."},
  {id:"go055",s:"Government",y:2019,t:"Political Systems",d:"Hard",q:"Elite theory argues",o:{A:"All citizens equally influence policy",B:"Democracy always works perfectly",C:"A small powerful elite makes political decisions",D:"Military governs best"},a:"C",e:"Elite theory: wealthy and powerful individuals dominate political decisions."},
  {id:"go056",s:"Government",y:2020,t:"Governance",d:"Medium",q:"Devolution means",o:{A:"Complete independence",B:"Annexation of territories",C:"Central government takes over state powers",D:"Transfer of powers from central to sub-national units"},a:"D",e:"Devolution: central government delegates powers to regional authorities."},
  {id:"go057",s:"Government",y:2021,t:"Nigerian Government",d:"Easy",q:"The chief law officer of Nigeria is",o:{A:"Attorney General of the Federation",B:"Chief Justice",C:"Director of SSS",D:"Inspector General of Police"},a:"A",e:"Attorney General: chief law officer and minister of justice."},
  {id:"go058",s:"Government",y:2022,t:"Constitution",d:"Hard",q:"The 1999 Nigerian constitution was",o:{A:"Drafted by elected delegates",B:"A product of military decree (Decree 24 of 1999)",C:"Written by the Supreme Court",D:"Based entirely on 1963 constitution"},a:"B",e:"Nigeria's 1999 Constitution: promulgated by military."},
  {id:"go059",s:"Government",y:2023,t:"Electoral",d:"Medium",q:"The first-past-the-post system elects",o:{A:"Only female candidates",B:"Candidate with majority of all votes",C:"The candidate with the most votes regardless of majority",D:"Multiple candidates per constituency"},a:"C",e:"FPTP: candidate with most votes wins even without absolute majority."},
  {id:"go060",s:"Government",y:2024,t:"Political Systems",d:"Medium",q:"Fascism is characterised by",o:{A:"Classless society",B:"Free markets and democracy",C:"Theocratic governance",D:"Strong central government, ultranationalism, and suppression of opposition"},a:"D",e:"Fascism: authoritarian nationalism, one-party state."},
  {id:"go061",s:"Government",y:2010,t:"Governance",d:"Easy",q:"A bill becomes law after it is",o:{A:"Signed or assented to by the president or head of state",B:"Published in a newspaper",C:"Debated once in parliament",D:"Proposed by a minister"},a:"A",e:"Bill becomes Law: must be passed by legislature and assented by executive."},
  {id:"go062",s:"Government",y:2011,t:"Electoral",d:"Easy",q:"In Nigeria, INEC is headed by a",o:{A:"Governor",B:"Chairman",C:"Chief Electoral Officer",D:"Vice-President"},a:"B",e:"INEC is headed by a Chairman appointed by the President."},
  {id:"go063",s:"Government",y:2012,t:"Political Systems",d:"Medium",q:"An oligarchy is governed by",o:{A:"The people",B:"A single ruler",C:"A small group of powerful people",D:"One party"},a:"C",e:"Oligarchy: rule by a small privileged group."},
  {id:"go064",s:"Government",y:2013,t:"Nigerian Government",d:"Medium",q:"Local government reforms in Nigeria were most significant in",o:{A:"1990",B:"1999",C:"1914",D:"1976"},a:"D",e:"1976 LG reform: created unified structure with 299 LGAs (now 774)."},
  {id:"go065",s:"Government",y:2014,t:"Governance",d:"Hard",q:"Inter-governmental relations involves",o:{A:"Interaction and cooperation between different tiers of government",B:"Only executive and judiciary",C:"International diplomacy",D:"Only military cooperation"},a:"A",e:"IGR: formal and informal relationships between federal, state, and local governments."},
  {id:"go066",s:"Government",y:2015,t:"Constitution",d:"Medium",q:"Fundamental human rights in Nigeria are contained in",o:{A:"Chapter I",B:"Chapter IV",C:"Chapter III",D:"Chapter II"},a:"B",e:"Nigeria's 1999 Constitution: Chapter IV contains Fundamental Rights."},
  {id:"go067",s:"Government",y:2016,t:"Political Systems",d:"Easy",q:"A one-party state allows",o:{A:"Multiple parties but one rules",B:"No elections",C:"Only one political party to exist and govern",D:"Military rule only"},a:"C",e:"One-party state: single party monopolises political power."},
  {id:"go068",s:"Government",y:2017,t:"Governance",d:"Medium",q:"The prerogative of mercy allows the",o:{A:"Legislature to pass laws without debate",B:"Courts to retry cases",C:"Judiciary to remove ministers",D:"Executive to pardon convicted persons"},a:"D",e:"Prerogative of mercy: executive power to pardon or commute sentences."},
  {id:"go069",s:"Government",y:2018,t:"Nigerian Government",d:"Easy",q:"The Federal Capital Territory of Nigeria is",o:{A:"Abuja",B:"Kano",C:"Lagos",D:"Ibadan"},a:"A",e:"Nigeria's FCT and capital: Abuja."},
  {id:"go070",s:"Government",y:2019,t:"Electoral",d:"Hard",q:"The electoral college system is used in",o:{A:"Nigeria",B:"USA presidential elections",C:"India",D:"UK"},a:"B",e:"USA: president elected indirectly through Electoral College."},
  {id:"go071",s:"Government",y:2020,t:"Constitution",d:"Easy",q:"An amendment to the constitution is",o:{A:"A violation of it",B:"A presidential decree",C:"A formal change made through a prescribed process",D:"An ordinary Act of Parliament"},a:"C",e:"Constitutional amendment: change made through the formal prescribed procedure."},
  {id:"go072",s:"Government",y:2021,t:"Political Systems",d:"Medium",q:"Marxism advocates that history is driven by",o:{A:"Religious conflict",B:"Great individuals",C:"Race dynamics",D:"Class struggle and material conditions"},a:"D",e:"Historical materialism (Marx): class struggle over means of production."},
  {id:"go073",s:"Government",y:2022,t:"Governance",d:"Medium",q:"Public accountability means",o:{A:"Public servants answer to the people and elected representatives",B:"Only president answers to citizens",C:"Courts cannot review government actions",D:"Officials act in secrecy"},a:"A",e:"Accountability: public officials must justify their actions."},
  {id:"go074",s:"Government",y:2023,t:"Nigerian Government",d:"Hard",q:"Impeachment of Nigeria's president requires",o:{A:"Simple majority in House only",B:"Two-thirds majority of each chamber of the National Assembly",C:"INEC ruling",D:"Supreme Court approval"},a:"B",e:"Impeachment: 2/3 majority of both Senate and House of Representatives."},
  {id:"go075",s:"Government",y:2024,t:"Electoral",d:"Medium",q:"Proportional representation reduces",o:{A:"Number of parties",B:"Voter participation",C:"Wasted votes",D:"Proportionality of outcomes"},a:"C",e:"PR: fewer wasted votes; outcomes better reflect voter preferences."},
  {id:"go076",s:"Government",y:2010,t:"Governance",d:"Easy",q:"The judiciary interprets law through",o:{A:"Administrative orders",B:"Military decrees",C:"Executive action",D:"Court decisions (case law)"},a:"D",e:"Judiciary: interprets and applies laws through judgments."},
  {id:"go077",s:"Government",y:2011,t:"Political Systems",d:"Medium",q:"A welfare state provides",o:{A:"Social services (healthcare, education, benefits) funded by the state",B:"Military dominance",C:"Free market with no government intervention",D:"Tax cuts for the wealthy"},a:"A",e:"Welfare state: government ensures basic economic security for citizens."},
  {id:"go078",s:"Government",y:2012,t:"Constitution",d:"Easy",q:"Constitutional monarchy means",o:{A:"Monarch rules absolutely",B:"The monarch's powers are limited by a constitution",C:"King rules with unlimited power",D:"There is no monarch"},a:"B",e:"Constitutional monarchy: monarch's powers are constitutionally limited."},
  {id:"go079",s:"Government",y:2013,t:"Nigerian Government",d:"Medium",q:"The National Economic Council of Nigeria is chaired by the",o:{A:"President",B:"Senate President",C:"Vice-President",D:"Attorney General"},a:"C",e:"NEC: chaired by the Vice-President; includes all state governors."},
  {id:"go080",s:"Government",y:2014,t:"Electoral",d:"Easy",q:"Suffrage means the",o:{A:"Right to stand for election only",B:"Obligation to pay taxes",C:"Duty to serve in the military",D:"Right to vote"},a:"D",e:"Suffrage: the right to vote in elections."},
  {id:"go081",s:"Government",y:2015,t:"Governance",d:"Hard",q:"Ultra vires means an action that is",o:{A:"Beyond the legal powers of an individual or body",B:"Within the law",C:"Supported by international law",D:"Constitutionally sound"},a:"A",e:"Ultra vires: acting beyond legal authority; such acts are void."},
  {id:"go082",s:"Government",y:2016,t:"Political Systems",d:"Easy",q:"Pluralism holds that power is",o:{A:"Concentrated in one party",B:"Distributed among many groups in society",C:"Best concentrated in one person",D:"Best held by military"},a:"B",e:"Pluralism: multiple groups compete and share political power."},
  {id:"go083",s:"Government",y:2017,t:"Nigerian Government",d:"Medium",q:"Each state in Nigeria has how many senators?",o:{A:"2",B:"4",C:"3",D:"1"},a:"C",e:"Nigeria: 3 senators per state (109 total = 36x3 + 1 for FCT)."},
  {id:"go084",s:"Government",y:2018,t:"Governance",d:"Medium",q:"Bicameralism refers to a legislature with",o:{A:"No chambers",B:"A single chamber",C:"Three chambers",D:"Two chambers"},a:"D",e:"Bicameral legislature: two houses."},
  {id:"go085",s:"Government",y:2019,t:"Constitution",d:"Medium",q:"The exclusive legislative list contains matters on which",o:{A:"Only the federal government can make laws",B:"States and federal both legislate",C:"Only state governments legislate",D:"Only local governments legislate"},a:"A",e:"Exclusive list: federal government alone legislates."},
  {id:"go086",s:"Government",y:2020,t:"Political Systems",d:"Medium",q:"Conservatism favours",o:{A:"Radical social change",B:"Tradition, stability, and gradual change",C:"State ownership of production",D:"Abolition of institutions"},a:"B",e:"Conservatism: preserve existing institutions; cautious about rapid change."},
  {id:"go087",s:"Government",y:2021,t:"Governance",d:"Easy",q:"A vote of no confidence removes",o:{A:"A judge",B:"A state governor",C:"The prime minister or head of government in a parliamentary system",D:"A local government chairman"},a:"C",e:"Vote of no confidence: parliamentary mechanism to remove the prime minister."},
  {id:"go088",s:"Government",y:2022,t:"Nigerian Government",d:"Hard",q:"The 1979 Nigerian Constitution introduced",o:{A:"A parliamentary system",B:"Military rule",C:"A confederal system",D:"A presidential system modelled on the USA"},a:"D",e:"1979 Constitution: Nigeria's first presidential constitution."},
  {id:"go089",s:"Government",y:2023,t:"Electoral",d:"Easy",q:"A manifesto is a",o:{A:"Public declaration of a political party's policies and intentions",B:"Court order",C:"Military directive",D:"Constitutional amendment"},a:"A",e:"Manifesto: document outlining a party's aims and policies."},
  {id:"go090",s:"Government",y:2024,t:"Governance",d:"Medium",q:"Federalism is recommended for a state with",o:{A:"Small homogeneous population",B:"Diverse ethnic, linguistic, or regional groups",C:"Only one religion",D:"No ethnic diversity"},a:"B",e:"Federalism: accommodates diversity by sharing power between tiers."},
  {id:"go091",s:"Government",y:2010,t:"Electoral",d:"Easy",q:"INEC was established to",o:{A:"Manage Nigeria's economy",B:"Handle foreign affairs",C:"Organise and oversee elections in Nigeria",D:"Fund political parties"},a:"C",e:"INEC conducts and supervises all elections in Nigeria."},
  {id:"go092",s:"Government",y:2011,t:"Political Systems",d:"Hard",q:"The Westphalian model of sovereignty is challenged today by",o:{A:"Population growth",B:"Federalism within states",C:"Climate change",D:"International organisations and human rights norms"},a:"D",e:"Modern challenges to Westphalian sovereignty: UN, ICC, NGOs, R2P."},
  {id:"go093",s:"Government",y:2012,t:"Governance",d:"Medium",q:"A technocracy is governed by",o:{A:"Technical experts and specialists",B:"Elected politicians",C:"The general public",D:"Religious leaders"},a:"A",e:"Technocracy: governance by those with technical expertise."},
  {id:"go094",s:"Government",y:2013,t:"Nigerian Government",d:"Easy",q:"The first Prime Minister of independent Nigeria was",o:{A:"General Yakubu Gowon",B:"Sir Abubakar Tafawa Balewa",C:"Chief Obafemi Awolowo",D:"Dr Nnamdi Azikiwe"},a:"B",e:"Sir Abubakar Tafawa Balewa: first and only PM of Nigeria (1960-1966)."},
  {id:"go095",s:"Government",y:2014,t:"Constitution",d:"Medium",q:"Civil liberties are freedoms that protect citizens",o:{A:"From each other",B:"Only in courts",C:"FROM government action",D:"From economic deprivation"},a:"C",e:"Civil liberties: freedom of speech, religion, press; protections from government."},
  {id:"go096",s:"Government",y:2015,t:"Political Systems",d:"Easy",q:"A monarchy is a system where",o:{A:"Parliament rules",B:"The military governs",C:"All citizens are equal",D:"A king, queen, or emperor holds power"},a:"D",e:"Monarchy: hereditary head of state."},
  {id:"go097",s:"Government",y:2016,t:"Governance",d:"Hard",q:"Dillon's Rule in US federalism states that local governments",o:{A:"May exercise only powers expressly granted by the state",B:"States have more power than federal",C:"Federal law always supersedes state",D:"Have all residual powers"},a:"A",e:"Dillon's Rule: local governments are creatures of the state."},
  {id:"go098",s:"Government",y:2017,t:"Electoral",d:"Medium",q:"A plebiscite is a direct vote by the electorate on",o:{A:"The national budget",B:"An important public question such as change of sovereignty",C:"Two candidates",D:"Policy making only"},a:"B",e:"Plebiscite: popular vote on a specific issue often sovereignty-related."},
  {id:"go099",s:"Government",y:2018,t:"Nigerian Government",d:"Medium",q:"The Council of State in Nigeria is chaired by the",o:{A:"Vice-President",B:"Senate President",C:"President",D:"Chief Justice"},a:"C",e:"Council of State: chaired by the President; advisory body."},
  {id:"go100",s:"Government",y:2019,t:"Political Systems",d:"Hard",q:"Gramsci's concept of hegemony refers to",o:{A:"Military control",B:"Electoral dominance",C:"Economic superiority",D:"Cultural and ideological dominance of a ruling class"},a:"D",e:"Gramsci: hegemony = dominant class maintains power through consent and ideology."},
  {id:"ir001",s:"IRS",y:2010,t:"Pillars",d:"Easy",q:"The first pillar of Islam is",o:{A:"Shahadah (declaration of faith)",B:"Zakat (almsgiving)",C:"Salat (prayer)",D:"Sawm (fasting)"},a:"A",e:"The Five Pillars: Shahadah, Salat, Zakat, Sawm, Hajj."},
  {id:"ir002",s:"IRS",y:2011,t:"Quran",d:"Easy",q:"The Quran was revealed to Prophet Muhammad through the Angel",o:{A:"Michael (Mikail)",B:"Gabriel (Jibril)",C:"Israfil",D:"Azrael"},a:"B",e:"The Angel Jibril (Gabriel) revealed the Quran to the Prophet."},
  {id:"ir003",s:"IRS",y:2012,t:"History",d:"Easy",q:"The Hijra refers to the migration of the Prophet from",o:{A:"Makkah to Jerusalem",B:"Jerusalem to Madinah",C:"Makkah to Madinah",D:"Madinah to Makkah"},a:"C",e:"622 CE: the Prophet's migration from Makkah to Madinah."},
  {id:"ir004",s:"IRS",y:2013,t:"Pillars",d:"Easy",q:"Muslims fast during the month of",o:{A:"Rajab",B:"Shaban",C:"Dhul Hijja",D:"Ramadan"},a:"D",e:"Ramadan: ninth month of Islamic calendar; month of fasting."},
  {id:"ir005",s:"IRS",y:2014,t:"Theology",d:"Easy",q:"The Islamic Shahadah states",o:{A:"There is no god but Allah and Muhammad is His Messenger",B:"Allah has many partners",C:"Prayer is obligatory",D:"Muhammad is the only prophet"},a:"A",e:"Shahadah: La ilaha illa Allah, Muhammadur rasulullah."},
  {id:"ir006",s:"IRS",y:2015,t:"Pillars",d:"Easy",q:"Zakat is the",o:{A:"Annual tax to government",B:"Obligatory almsgiving (2.5% of savings above nisab)",C:"Obligatory fast",D:"Pilgrimage to Makkah"},a:"B",e:"Zakat: annual purification of wealth distributed to the poor."},
  {id:"ir007",s:"IRS",y:2016,t:"History",d:"Medium",q:"The Hijri calendar begins from",o:{A:"The birth of Prophet Muhammad",B:"The Battle of Badr",C:"The year of the Hijra (622 CE)",D:"The death of the Prophet"},a:"C",e:"Islamic calendar (AH): starts from 622 CE."},
  {id:"ir008",s:"IRS",y:2017,t:"Pillars",d:"Easy",q:"Hajj is the pilgrimage to",o:{A:"Jerusalem",B:"Cairo",C:"Madinah",D:"Makkah"},a:"D",e:"Hajj: pilgrimage to Makkah; fifth pillar of Islam."},
  {id:"ir009",s:"IRS",y:2018,t:"Theology",d:"Easy",q:"The Quran is divided into",o:{A:"114 Surahs (chapters)",B:"Parts only",C:"Lines",D:"Books"},a:"A",e:"Quran: 114 Surahs of varying length."},
  {id:"ir010",s:"IRS",y:2019,t:"Jurisprudence",d:"Medium",q:"Sharia refers to",o:{A:"Islamic art and culture",B:"Islamic law derived from the Quran and Sunnah",C:"Prayer rituals only",D:"The biography of the Prophet"},a:"B",e:"Sharia: comprehensive Islamic legal and moral framework."},
  {id:"ir011",s:"IRS",y:2020,t:"Theology",d:"Easy",q:"The belief in angels in Islam is",o:{A:"Optional",B:"Part of bid'ah",C:"One of the six articles of faith",D:"Forbidden"},a:"C",e:"Six Articles of Faith: Allah, angels, scriptures, prophets, Last Day, divine decree."},
  {id:"ir012",s:"IRS",y:2021,t:"History",d:"Medium",q:"The Battle of Badr (624 CE) was significant because it was",o:{A:"An end with Muslim defeat",B:"Establishing trade routes",C:"With no religious significance",D:"The first major Muslim military victory, affirming the new faith"},a:"D",e:"Battle of Badr: 313 Muslims defeated about 1000 Quraish."},
  {id:"ir013",s:"IRS",y:2022,t:"Pillars",d:"Easy",q:"Muslims pray how many times daily?",o:{A:"5",B:"4",C:"6",D:"3"},a:"A",e:"Five daily prayers: Fajr, Dhuhr, Asr, Maghrib, Isha."},
  {id:"ir014",s:"IRS",y:2023,t:"Theology",d:"Medium",q:"Tawhid is the Islamic concept of",o:{A:"Prophet Muhammad's biography",B:"The oneness and uniqueness of Allah",C:"Pilgrimage rituals",D:"Rules of fasting"},a:"B",e:"Tawhid: strict monotheism; the central doctrine of Islam."},
  {id:"ir015",s:"IRS",y:2024,t:"History",d:"Medium",q:"The Umayyad Caliphate was established in",o:{A:"Baghdad",B:"Madinah",C:"Damascus",D:"Jerusalem"},a:"C",e:"Umayyad Caliphate (661-750 CE): capital at Damascus."},
  {id:"ir016",s:"IRS",y:2010,t:"Theology",d:"Easy",q:"In Islam, shirk means",o:{A:"Fasting during Ramadan",B:"Giving of alms",C:"Performing Hajj",D:"Associating partners with Allah (the greatest sin)"},a:"D",e:"Shirk: polytheism; associating others with Allah."},
  {id:"ir017",s:"IRS",y:2011,t:"Jurisprudence",d:"Medium",q:"The Sunnah refers to",o:{A:"The traditions, sayings, and practices of Prophet Muhammad",B:"The Quran only",C:"Laws of the state",D:"Islamic architecture"},a:"A",e:"Sunnah: recorded words, actions, and approvals of the Prophet."},
  {id:"ir018",s:"IRS",y:2012,t:"History",d:"Easy",q:"Prophet Muhammad was born in",o:{A:"Madinah",B:"Makkah",C:"Baghdad",D:"Jerusalem"},a:"B",e:"Prophet Muhammad was born in Makkah around 570 CE."},
  {id:"ir019",s:"IRS",y:2013,t:"Theology",d:"Medium",q:"The Day of Judgment in Islam is called",o:{A:"Ramadan",B:"Hijra",C:"Yawm al-Qiyamah",D:"Dhikr"},a:"C",e:"Yawm al-Qiyamah: the Day of Resurrection and Judgment."},
  {id:"ir020",s:"IRS",y:2014,t:"Jurisprudence",d:"Medium",q:"Ijma is",o:{A:"A type of prayer",B:"Quranic recitation",C:"The Night Journey",D:"Consensus of Islamic scholars on a legal ruling"},a:"D",e:"Ijma: consensus of scholars; third source of Islamic law."},
  {id:"ir021",s:"IRS",y:2015,t:"History",d:"Medium",q:"The hijra to Abyssinia (Ethiopia) occurred because",o:{A:"Early Muslims sought refuge from Quraish persecution",B:"The Prophet commanded battle",C:"Muslims sought wealth",D:"Trade routes were blocked"},a:"A",e:"615 CE: first hijra; Muslims sought safety in Christian Abyssinia."},
  {id:"ir022",s:"IRS",y:2016,t:"Theology",d:"Easy",q:"Allahu Akbar means",o:{A:"Muhammad is the Messenger",B:"Allah is the Greatest",C:"God is forgiving",D:"There is no god but Allah"},a:"B",e:"Allahu Akbar: Allah is the Greatest."},
  {id:"ir023",s:"IRS",y:2017,t:"Jurisprudence",d:"Medium",q:"Qiyas is the use of",o:{A:"A type of mosque architecture",B:"Prayer beads",C:"Analogical reasoning to derive rulings not in Quran or Sunnah",D:"Government decrees"},a:"C",e:"Qiyas: analogical reasoning; fourth source of Sunni jurisprudence."},
  {id:"ir024",s:"IRS",y:2018,t:"History",d:"Medium",q:"The Night Journey (Isra and Miraj) took the Prophet from",o:{A:"Cairo to Makkah",B:"Madinah to Jerusalem",C:"Jerusalem to Madinah",D:"Makkah to Jerusalem and then to the heavens"},a:"D",e:"Isra: Makkah to Jerusalem; Miraj: ascent through the heavens."},
  {id:"ir025",s:"IRS",y:2019,t:"Pillars",d:"Medium",q:"The Tawaf during Hajj involves",o:{A:"Circumambulating (walking around) the Kaaba seven times",B:"Stoning the Jamarat",C:"Running between Safa and Marwa",D:"Standing at Arafat"},a:"A",e:"Tawaf: circling the Kaaba seven times counterclockwise."},
  {id:"ir026",s:"IRS",y:2020,t:"Theology",d:"Medium",q:"The first Surah of the Quran is called",o:{A:"Ayat al-Kursi",B:"Al-Fatihah",C:"Al-Ikhlas",D:"Al-Baqarah"},a:"B",e:"Al-Fatihah: the opening chapter; recited in every unit of prayer."},
  {id:"ir027",s:"IRS",y:2021,t:"History",d:"Hard",q:"The Constitution of Madinah (624 CE) was significant because it",o:{A:"Imposed Islamic law on non-Muslims",B:"Created the first caliphate",C:"Established a multi-faith civic agreement between Muslims and Jewish and other tribes",D:"Banned non-Muslims from Madinah"},a:"C",e:"Madinah Constitution: first written constitution guaranteeing rights to all communities."},
  {id:"ir028",s:"IRS",y:2022,t:"Theology",d:"Medium",q:"In Islam, angels (malaika) are made of",o:{A:"Fire",B:"Clay",C:"Water",D:"Light (Nur)"},a:"D",e:"Angels: created from light; without free will; always obey Allah."},
  {id:"ir029",s:"IRS",y:2023,t:"Jurisprudence",d:"Hard",q:"The Maliki school of jurisprudence was founded by",o:{A:"Imam Malik ibn Anas",B:"Ahmad ibn Hanbal",C:"Muhammad al-Shafii",D:"Abu Hanifa"},a:"A",e:"Maliki madhab: founded by Imam Malik (711-795 CE); dominant in West Africa."},
  {id:"ir030",s:"IRS",y:2024,t:"History",d:"Medium",q:"The Sokoto Caliphate in Nigeria was established by",o:{A:"Dan Fodio's son Muhammadu Bello",B:"Uthman dan Fodio in 1804",C:"A Hausa king",D:"The British colonisers"},a:"B",e:"Uthman dan Fodio launched jihad 1804 and founded Sokoto Caliphate."},
  {id:"ir031",s:"IRS",y:2010,t:"Theology",d:"Easy",q:"Jannah is the Islamic term for",o:{A:"Hell",B:"Purgatory",C:"Paradise",D:"Limbo"},a:"C",e:"Jannah: the Islamic concept of paradise."},
  {id:"ir032",s:"IRS",y:2011,t:"Pillars",d:"Medium",q:"Sawm during Ramadan requires abstaining from",o:{A:"Only food",B:"Talking",C:"Prayer",D:"Food, drink, and marital relations from dawn to sunset"},a:"D",e:"Ramadan fast: abstinence from food, drink, and intimacy from Fajr to Maghrib."},
  {id:"ir033",s:"IRS",y:2012,t:"History",d:"Easy",q:"The Prophet Muhammad died in the year",o:{A:"632 CE",B:"622 CE",C:"630 CE",D:"610 CE"},a:"A",e:"Prophet Muhammad died on 8 June 632 CE in Madinah."},
  {id:"ir034",s:"IRS",y:2013,t:"Theology",d:"Medium",q:"The six articles of faith in Islam do NOT include",o:{A:"Belief in angels",B:"Belief in the Imams",C:"Belief in divine decree",D:"Belief in Quran"},a:"B",e:"Six Articles (Sunni): Allah, Angels, Scriptures, Prophets, Last Day, Qadar (not Imams)."},
  {id:"ir035",s:"IRS",y:2014,t:"History",d:"Medium",q:"The first caliph after the Prophet was",o:{A:"Ali ibn Abi Talib",B:"Umar ibn al-Khattab",C:"Abu Bakr al-Siddiq",D:"Uthman ibn Affan"},a:"C",e:"Abu Bakr was the first Caliph (632-634 CE)."},
  {id:"ir036",s:"IRS",y:2015,t:"Theology",d:"Easy",q:"Jahannam is the Islamic term for",o:{A:"Purgatory",B:"Limbo",C:"Paradise",D:"Hell"},a:"D",e:"Jahannam: the Islamic concept of hell."},
  {id:"ir037",s:"IRS",y:2016,t:"Jurisprudence",d:"Medium",q:"Halal means",o:{A:"Permissible according to Islamic law",B:"Forbidden by Islamic law",C:"Recommended but not required",D:"Obligatory in Islam"},a:"A",e:"Halal: permitted; opposite of haram (forbidden)."},
  {id:"ir038",s:"IRS",y:2017,t:"Pillars",d:"Medium",q:"The obligatory prayer (Salat) is performed facing",o:{A:"Madinah",B:"The Kaaba in Makkah (Qibla)",C:"East",D:"Jerusalem"},a:"B",e:"Qibla: direction of prayer toward the Kaaba."},
  {id:"ir039",s:"IRS",y:2018,t:"History",d:"Hard",q:"The Abbasid Caliphate is known for its",o:{A:"Colonial conquests in Africa",B:"Military expansion to Europe",C:"Golden Age of science, philosophy, and culture (8th-13th c.)",D:"Founding of Islam"},a:"C",e:"Abbasid Caliphate: Baghdad-centred golden age of Islamic civilisation."},
  {id:"ir040",s:"IRS",y:2019,t:"Theology",d:"Easy",q:"Bismillah means",o:{A:"Praise be to Allah",B:"Thanks be to Allah",C:"There is no god but Allah",D:"In the name of Allah"},a:"D",e:"Bismillah ir-Rahman ir-Rahim: In the name of Allah, the Most Gracious."},
  {id:"ir041",s:"IRS",y:2020,t:"Jurisprudence",d:"Medium",q:"In Islamic jurisprudence, haram means",o:{A:"Strictly forbidden",B:"Obligatory",C:"Permissible",D:"Recommended"},a:"A",e:"Haram: anything prohibited by Islamic law."},
  {id:"ir042",s:"IRS",y:2021,t:"History",d:"Medium",q:"The Quran was compiled into a single book during the caliphate of",o:{A:"Abu Bakr",B:"Uthman",C:"Ali",D:"Umar"},a:"B",e:"Uthman ibn Affan standardised the Quran into a single text around 650 CE."},
  {id:"ir043",s:"IRS",y:2022,t:"Theology",d:"Easy",q:"The Prophet Muhammad is considered in Islam as",o:{A:"Equal to Allah",B:"A divine being",C:"The last and final prophet (Seal of Prophets)",D:"The only prophet"},a:"C",e:"Quran 33:40: Muhammad is Khatam an-Nabiyyin (Seal of Prophets)."},
  {id:"ir044",s:"IRS",y:2023,t:"History",d:"Medium",q:"The Treaty of Hudaybiyyah (628 CE) was",o:{A:"A military defeat for Muslims",B:"An immediate conquest of Makkah",C:"A trade agreement with Persia",D:"A 10-year peace treaty between Muslims and the Quraish"},a:"D",e:"Hudaybiyyah: peace treaty that later enabled Muslim growth."},
  {id:"ir045",s:"IRS",y:2024,t:"Jurisprudence",d:"Medium",q:"Istihsan is an Islamic legal concept meaning",o:{A:"Juristic preference when strict analogy leads to inequitable results",B:"Seeking forgiveness",C:"Monthly fasting",D:"Prayer of need"},a:"A",e:"Istihsan: jurist's preference; departure from strict analogy for equity."},
  {id:"ir046",s:"IRS",y:2010,t:"Theology",d:"Easy",q:"The word Islam means",o:{A:"Prayer",B:"Battle",C:"Community",D:"Submission"},a:"B",e:"Islam: derived from aslama; submission to the will of Allah."},
  {id:"ir047",s:"IRS",y:2011,t:"History",d:"Medium",q:"Makkah was finally conquered by the Prophet in",o:{A:"625 CE",B:"628 CE",C:"630 CE",D:"632 CE"},a:"C",e:"Fatah Makkah (Conquest of Makkah): 630 CE, largely peaceful."},
  {id:"ir048",s:"IRS",y:2012,t:"Theology",d:"Medium",q:"Iman refers to",o:{A:"The Islamic call to prayer",B:"Ritual purification",C:"The mosque",D:"Faith in the six articles of Islamic belief"},a:"D",e:"Iman: faith; belief in Allah, angels, scriptures, prophets, Last Day, Qadar."},
  {id:"ir049",s:"IRS",y:2013,t:"Pillars",d:"Easy",q:"Eid ul-Fitr celebration marks",o:{A:"The end of Ramadan",B:"The beginning of Ramadan",C:"The Prophet's birthday",D:"The end of Hajj"},a:"A",e:"Eid ul-Fitr: Festival of Breaking the Fast; marks end of Ramadan."},
  {id:"ir050",s:"IRS",y:2014,t:"History",d:"Hard",q:"The Mutazilites were a theological school that emphasised",o:{A:"Complete fatalism",B:"Rational theology and human free will",C:"Blind imitation of scholars",D:"Tradition over reason"},a:"B",e:"Mutazila: rationalist Islamic theology; emphasised reason and divine justice."},
  {id:"ir051",s:"IRS",y:2015,t:"Theology",d:"Easy",q:"Wudu is",o:{A:"A type of Islamic prayer",B:"A Quranic verse",C:"Ritual ablution (washing) before prayer",D:"Charitable giving"},a:"C",e:"Wudu: ritual washing of hands, face, and feet before Salat."},
  {id:"ir052",s:"IRS",y:2016,t:"Jurisprudence",d:"Medium",q:"The Hanafi school is named after",o:{A:"Ibn Hanbal",B:"Malik ibn Anas",C:"Al-Shafii",D:"Imam Abu Hanifa (699-767 CE)"},a:"D",e:"Hanafi: oldest and most widely followed school; founded by Abu Hanifa."},
  {id:"ir053",s:"IRS",y:2017,t:"History",d:"Easy",q:"The Kaaba is located in",o:{A:"Makkah",B:"Madinah",C:"Baghdad",D:"Jerusalem"},a:"A",e:"The Kaaba: cube-shaped structure in Masjid al-Haram, Makkah."},
  {id:"ir054",s:"IRS",y:2018,t:"Theology",d:"Medium",q:"Tafsir is",o:{A:"A type of mosque",B:"Scholarly interpretation and commentary of the Quran",C:"An Islamic law code",D:"A hadith collection"},a:"B",e:"Tafsir: exegesis and commentary on the Quran."},
  {id:"ir055",s:"IRS",y:2019,t:"History",d:"Medium",q:"The Hijaz region, birthplace of Islam, is in modern-day",o:{A:"Iraq",B:"Jordan",C:"Saudi Arabia",D:"Egypt"},a:"C",e:"Hijaz: western region of Saudi Arabia containing Makkah and Madinah."},
  {id:"ir056",s:"IRS",y:2020,t:"Theology",d:"Easy",q:"Inshallah means",o:{A:"Allahu Akbar",B:"May Allah forgive",C:"Praise Allah",D:"If Allah wills"},a:"D",e:"Inshallah: If God wills it; expresses submission to divine will."},
  {id:"ir057",s:"IRS",y:2021,t:"Pillars",d:"Medium",q:"The standing at Arafat during Hajj is called",o:{A:"Wuquf",B:"Sai",C:"Ihram",D:"Tawaf"},a:"A",e:"Wuquf at Arafat: standing in prayer on 9th Dhul Hijja; core Hajj ritual."},
  {id:"ir058",s:"IRS",y:2022,t:"Jurisprudence",d:"Medium",q:"Fatwa is",o:{A:"A type of mosque design",B:"A legal opinion issued by a qualified Islamic scholar",C:"Ritual slaughter",D:"Friday prayer sermon"},a:"B",e:"Fatwa: non-binding religious ruling issued by a mufti."},
  {id:"ir059",s:"IRS",y:2023,t:"History",d:"Hard",q:"The Sunni-Shia split originated over",o:{A:"Theological interpretation of Quran",B:"Trade disputes",C:"Succession after the Prophet: Shia supported Ali; Sunni accepted Abu Bakr",D:"Fasting practices"},a:"C",e:"Sunni-Shia division: dispute over leadership after Muhammad's death."},
  {id:"ir060",s:"IRS",y:2024,t:"Theology",d:"Easy",q:"The mosque is",o:{A:"A market",B:"A school only",C:"A Muslim home",D:"A place of worship in Islam"},a:"D",e:"Mosque (Masjid): place of prayer and community gathering for Muslims."},
  {id:"ir061",s:"IRS",y:2010,t:"Theology",d:"Medium",q:"The Night of Power (Laylat al-Qadr) falls in",o:{A:"The last 10 nights of Ramadan",B:"First night of Eid",C:"After Ramadan",D:"First week of Ramadan"},a:"A",e:"Quran 97: Laylat al-Qadr is in the last 10 days of Ramadan."},
  {id:"ir062",s:"IRS",y:2011,t:"History",d:"Easy",q:"Prophet Muhammad received his first revelation at age",o:{A:"25",B:"40",C:"45",D:"35"},a:"B",e:"Prophet received first revelation (Iqra) at age 40 around 610 CE."},
  {id:"ir063",s:"IRS",y:2012,t:"Jurisprudence",d:"Medium",q:"Maslaha in Islamic law refers to",o:{A:"Islamic dress code",B:"Rules of inheritance",C:"Public interest or welfare as basis for legal rulings",D:"Recitation of Quran"},a:"C",e:"Maslaha: juristic consideration of public benefit in deriving rulings."},
  {id:"ir064",s:"IRS",y:2013,t:"Theology",d:"Easy",q:"The Islamic prayer call is known as",o:{A:"Khutbah",B:"Wudu",C:"Tawaf",D:"Adhan"},a:"D",e:"Adhan: call to prayer recited by the muezzin five times daily."},
  {id:"ir065",s:"IRS",y:2014,t:"History",d:"Medium",q:"The first mosque in Madinah was",o:{A:"Masjid Quba",B:"Masjid al-Aqsa",C:"Masjid al-Haram",D:"Masjid al-Nabawi"},a:"A",e:"Masjid Quba: first mosque built by the Prophet upon arriving in Madinah."},
  {id:"ir066",s:"IRS",y:2015,t:"Theology",d:"Medium",q:"The concept of Qadar in Islam refers to",o:{A:"Holy war",B:"Divine predestination and decree",C:"Prayer",D:"Pilgrimage"},a:"B",e:"Qadar: belief that Allah has decreed all things; sixth article of faith."},
  {id:"ir067",s:"IRS",y:2016,t:"History",d:"Hard",q:"The Mutazilite controversy centred on",o:{A:"Architecture of mosques",B:"Trade routes in Arabia",C:"Whether the Quran was created or eternal (uncreated)",D:"Rules of inheritance"},a:"C",e:"Mihna (Inquisition 833-848 CE): debate over created vs uncreated Quran."},
  {id:"ir068",s:"IRS",y:2017,t:"Jurisprudence",d:"Easy",q:"In Islam, riba means",o:{A:"Pilgrimage",B:"Fasting",C:"A type of prayer",D:"Usury or interest on loans (forbidden)"},a:"D",e:"Riba: prohibited in Islam; any unjust increase in exchange."},
  {id:"ir069",s:"IRS",y:2018,t:"Theology",d:"Easy",q:"Alhamdulillah means",o:{A:"All praise is due to Allah",B:"Allah is Greatest",C:"There is no god but Allah",D:"In the name of Allah"},a:"A",e:"Alhamdulillah: All praise and thanks is due to Allah."},
  {id:"ir070",s:"IRS",y:2019,t:"History",d:"Medium",q:"The Umayyad Caliphate was replaced by the",o:{A:"Ottoman Empire",B:"Abbasid Caliphate (750 CE)",C:"Mongol Empire",D:"Fatimid Caliphate"},a:"B",e:"Abbasid revolution 750 CE: overthrew Umayyads; moved capital to Baghdad."},
  {id:"ir071",s:"IRS",y:2020,t:"Theology",d:"Medium",q:"The Friday prayer (Jumuah) is",o:{A:"Optional for all Muslims",B:"Obligatory only for women",C:"Obligatory for adult Muslim men",D:"Recommended but not required"},a:"C",e:"Jumuah: obligatory congregational Friday prayer at noon."},
  {id:"ir072",s:"IRS",y:2021,t:"History",d:"Easy",q:"The Quran was revealed over a period of",o:{A:"5 years",B:"10 years",C:"30 years",D:"23 years"},a:"D",e:"The Quran was revealed over 23 years (610-632 CE)."},
  {id:"ir073",s:"IRS",y:2022,t:"Jurisprudence",d:"Medium",q:"Islamic inheritance law (mirath) gives daughters",o:{A:"Half the share of a son",B:"Nothing from estate",C:"More than sons",D:"Equal share to sons"},a:"A",e:"Quran 4:11: daughters receive half the inheritance of sons."},
  {id:"ir074",s:"IRS",y:2023,t:"Theology",d:"Hard",q:"The Asharite school of Islamic theology holds",o:{A:"Pure rationalism",B:"Divine attributes are real but unlike human attributes (via media)",C:"The Quran was created",D:"Human reason derives all religious truths"},a:"B",e:"Asharism: dominant Sunni theology; middle path between rationalism and anthropomorphism."},
  {id:"ir075",s:"IRS",y:2024,t:"History",d:"Medium",q:"Sultan Bello of Sokoto was",o:{A:"A British colonial officer",B:"A Hausa king who resisted Islam",C:"Son of Uthman dan Fodio; first Sultan of Sokoto",D:"The founder of the jihad movement"},a:"C",e:"Muhammad Bello: son of dan Fodio; first Sultan of Sokoto."},
  {id:"ir076",s:"IRS",y:2010,t:"Theology",d:"Easy",q:"The Arabic word Allah means",o:{A:"The Prophet",B:"Muhammad's name",C:"An angel",D:"The God (the one true God)"},a:"D",e:"Allah: Arabic for The God; used by Arab Christians and Muslims alike."},
  {id:"ir077",s:"IRS",y:2011,t:"Pillars",d:"Medium",q:"Eid ul-Adha commemorates",o:{A:"Ibrahim's willingness to sacrifice his son",B:"The Prophet's birthday",C:"The first revelation of the Quran",D:"The end of Ramadan"},a:"A",e:"Eid ul-Adha: Festival of Sacrifice; commemorates Ibrahim and Ismail."},
  {id:"ir078",s:"IRS",y:2012,t:"History",d:"Medium",q:"The concept of hijra also means in a broader sense",o:{A:"Annual pilgrimage",B:"Migration for the sake of one's faith",C:"A type of prayer",D:"Tax on non-Muslims"},a:"B",e:"Hijra (broader): any migration to preserve religious practice."},
  {id:"ir079",s:"IRS",y:2013,t:"Jurisprudence",d:"Medium",q:"Nikah in Islam refers to",o:{A:"A type of supplication",B:"Pilgrimage to Makkah",C:"Islamic marriage contract",D:"A form of prayer"},a:"C",e:"Nikah: the Islamic marriage contract."},
  {id:"ir080",s:"IRS",y:2014,t:"Theology",d:"Easy",q:"Muslims believe Jesus (Isa) was",o:{A:"Not a prophet",B:"A minor figure",C:"God incarnate",D:"A great prophet but not the Son of God"},a:"D",e:"Quran 4:171: Jesus is a prophet and Messiah but not divine."},
  {id:"ir081",s:"IRS",y:2015,t:"History",d:"Hard",q:"The Almohad dynasty was notable for",o:{A:"A strict Berber Muslim reform movement (1121-1269 CE)",B:"Tolerance of all religions",C:"Founding universities only",D:"Converting to Christianity"},a:"A",e:"Almohads: Berber dynasty; strict Islamic reform in North Africa and Spain."},
  {id:"ir082",s:"IRS",y:2016,t:"Theology",d:"Medium",q:"Sunni Muslims constitute approximately what percentage of global Muslims?",o:{A:"50%",B:"85-90%",C:"75%",D:"65%"},a:"B",e:"Sunni Islam: approximately 85-90% of the world's 1.8 billion Muslims."},
  {id:"ir083",s:"IRS",y:2017,t:"Jurisprudence",d:"Easy",q:"The Friday sermon in a mosque is called",o:{A:"Wudu",B:"Adhan",C:"Khutbah",D:"Tawaf"},a:"C",e:"Khutbah: sermon delivered before Friday prayer."},
  {id:"ir084",s:"IRS",y:2018,t:"History",d:"Medium",q:"Jihad movements in northern Nigeria were inspired by",o:{A:"British colonialism",B:"Trans-Atlantic slave trade",C:"Christian missionaries",D:"The Sokoto jihad of Uthman dan Fodio"},a:"D",e:"Dan Fodio's 1804 jihad inspired several reform movements."},
  {id:"ir085",s:"IRS",y:2019,t:"Theology",d:"Easy",q:"Surah Al-Ikhlas (Chapter 112) declares that Allah",o:{A:"Is One, Eternal, unbegotten, and has no equal",B:"Is like humans",C:"Has partners",D:"Has a son"},a:"A",e:"Al-Ikhlas: Say: He is Allah, the One; pure monotheism."},
  {id:"ir086",s:"IRS",y:2020,t:"History",d:"Medium",q:"The first African to translate the Bible into Yoruba was",o:{A:"Abubakar Gumi",B:"Samuel Ajayi Crowther",C:"Dan Fodio",D:"Philip Quaque"},a:"B",e:"Ajayi Crowther: translated Bible into Yoruba; also wrote Yoruba grammar."},
  {id:"ir087",s:"IRS",y:2021,t:"Theology",d:"Medium",q:"Tawakkul in Islam means",o:{A:"Fasting beyond Ramadan",B:"Paying extra alms",C:"Reliance and trust in Allah after taking appropriate action",D:"Performing extra prayers"},a:"C",e:"Tawakkul: trust in Allah's plan after doing one's part."},
  {id:"ir088",s:"IRS",y:2022,t:"Jurisprudence",d:"Hard",q:"The Hanbali school of jurisprudence was founded by",o:{A:"Malik ibn Anas",B:"Al-Shafii",C:"Abu Hanifa",D:"Ahmad ibn Hanbal (780-855 CE)"},a:"D",e:"Hanbali: strictest school; founded by Ahmad ibn Hanbal."},
  {id:"ir089",s:"IRS",y:2023,t:"History",d:"Easy",q:"The city of Madinah was formerly known as",o:{A:"Yathrib",B:"Taif",C:"Jeddah",D:"Makkah"},a:"A",e:"Yathrib was renamed City of the Prophet after the Hijra."},
  {id:"ir090",s:"IRS",y:2024,t:"Theology",d:"Medium",q:"In Islamic theology, bid'ah means",o:{A:"Obligatory acts",B:"Innovation or heresy not sanctioned by Quran or Sunnah",C:"Acts of worship",D:"Permitted innovations"},a:"B",e:"Bid'ah: religious innovation condemned as deviation from authentic Islam."},
  {id:"ir091",s:"IRS",y:2010,t:"Theology",d:"Easy",q:"The Quran is considered in Islam to be",o:{A:"A human composition",B:"A collection of Hadith",C:"The direct and literal word of Allah",D:"The word of the Prophet only"},a:"C",e:"Quran: Muslims believe it is the uncreated verbatim word of Allah."},
  {id:"ir092",s:"IRS",y:2011,t:"History",d:"Medium",q:"Early Muslims who migrated to Abyssinia were hosted by",o:{A:"Heraclius",B:"Khosrow II",C:"Constantine",D:"Negus (Ashama ibn Abjar)"},a:"D",e:"The Negus of Abyssinia gave refuge to early Muslims."},
  {id:"ir093",s:"IRS",y:2012,t:"Theology",d:"Easy",q:"Subhanallah means",o:{A:"Glory be to Allah",B:"Allah is the Greatest",C:"God is forgiving",D:"All praise to Allah"},a:"A",e:"Subhanallah: Glory be to Allah; expression of praise and wonder."},
  {id:"ir094",s:"IRS",y:2013,t:"Jurisprudence",d:"Medium",q:"The concept of mahr (mahar) in Islam is the",o:{A:"Monthly religious tax",B:"Obligatory gift from groom to bride at marriage",C:"Annual pilgrimage fee",D:"Ritual purification"},a:"B",e:"Mahr: obligatory gift from groom to bride; hers to keep."},
  {id:"ir095",s:"IRS",y:2014,t:"Theology",d:"Easy",q:"Ramadan is significant because it is the month in which",o:{A:"The Prophet was born",B:"The Kaaba was built",C:"The Quran began to be revealed",D:"The Hijra occurred"},a:"C",e:"Quran 2:185: Ramadan is the month the Quran was first revealed."},
  {id:"ir096",s:"IRS",y:2015,t:"History",d:"Hard",q:"Pan-Islamism was most prominently advocated by",o:{A:"Abubakar Gumi",B:"Ibn Taymiyyah",C:"King Faisal",D:"Jamal al-Din al-Afghani (1838-1897)"},a:"D",e:"Al-Afghani: pioneered Pan-Islamism; unity of Muslim nations."},
  {id:"ir097",s:"IRS",y:2016,t:"Theology",d:"Medium",q:"Sufi Islam emphasises",o:{A:"The spiritual and mystical dimensions of Islam",B:"Political conquest",C:"Financial success",D:"Strict legal observance only"},a:"A",e:"Sufism: Islamic mysticism; seeking closeness to Allah."},
  {id:"ir098",s:"IRS",y:2017,t:"History",d:"Easy",q:"Islam was brought to the Yoruba of Nigeria mainly through",o:{A:"Colonialism",B:"Trade and Hausa-Fulani influence",C:"Sokoto jihad",D:"Christian missionaries"},a:"B",e:"Yoruba Islam: spread through Hausa and Nupe traders and clerics."},
  {id:"ir099",s:"IRS",y:2018,t:"Jurisprudence",d:"Medium",q:"In Islamic criminal law, hudud refers to",o:{A:"Punishments discretionary to judge",B:"Compensation to victims",C:"Fixed punishments prescribed in the Quran for specific crimes",D:"Community service"},a:"C",e:"Hudud: Quranically prescribed punishments."},
  {id:"ir100",s:"IRS",y:2019,t:"Theology",d:"Hard",q:"The concept of Akhira in Islam refers to",o:{A:"The first revelation",B:"Daily prayer",C:"Monthly fasting",D:"The afterlife; eternal life after death"},a:"D",e:"Akhira: the hereafter; everything after death including judgment and paradise or hell."},
  {id:"li001",s:"Literature",y:2010,t:"Drama",d:"Easy",q:"Who wrote Death and the King's Horseman?",o:{A:"Wole Soyinka",B:"J.P. Clark",C:"John Pepper Clark",D:"Chinua Achebe"},a:"A",e:"Wole Soyinka wrote Death and the King's Horseman (1975)."},
  {id:"li002",s:"Literature",y:2011,t:"Poetry",d:"Medium",q:"A sonnet has",o:{A:"10 lines",B:"14 lines",C:"16 lines",D:"12 lines"},a:"B",e:"A sonnet: 14 lines, traditionally in iambic pentameter."},
  {id:"li003",s:"Literature",y:2012,t:"Prose",d:"Easy",q:"Things Fall Apart was written by",o:{A:"Wole Soyinka",B:"Ngugi wa Thiong'o",C:"Chinua Achebe",D:"Ama Ata Aidoo"},a:"C",e:"Chinua Achebe's Things Fall Apart (1958) is a landmark African novel."},
  {id:"li004",s:"Literature",y:2013,t:"Drama",d:"Medium",q:"A tragic hero typically has",o:{A:"No flaw",B:"No conflict",C:"Perfect virtue",D:"A fatal flaw (hamartia) leading to downfall"},a:"D",e:"Tragic hero: hamartia (fatal flaw) leads to downfall (Aristotle)."},
  {id:"li005",s:"Literature",y:2014,t:"Poetry",d:"Easy",q:"Iambic pentameter consists of",o:{A:"5 iambs per line",B:"6 iambs per line",C:"3 iambs per line",D:"4 iambs per line"},a:"A",e:"Iambic pentameter: 5 iambs (da-DUM) per line."},
  {id:"li006",s:"Literature",y:2015,t:"Prose",d:"Medium",q:"Stream of consciousness depicts",o:{A:"Story in reverse order",B:"The continuous flow of a character's thoughts",C:"Events quickly summarised",D:"Only dialogue"},a:"B",e:"Stream of consciousness: presents unfiltered mental flow."},
  {id:"li007",s:"Literature",y:2016,t:"Drama",d:"Hard",q:"In Greek tragedy, catharsis refers to",o:{A:"The chorus's role",B:"Dramatic irony",C:"The emotional purging experienced by the audience",D:"Building of tension"},a:"C",e:"Catharsis (Aristotle): purging of pity and fear through watching tragedy."},
  {id:"li008",s:"Literature",y:2017,t:"Poetry",d:"Medium",q:"The repetition of vowel sounds within words is called",o:{A:"Alliteration",B:"Consonance",C:"Rhyme",D:"Assonance"},a:"D",e:"Assonance: repetition of vowel sounds."},
  {id:"li009",s:"Literature",y:2018,t:"Prose",d:"Easy",q:"First-person narration uses",o:{A:"I as the narrator",B:"They throughout",C:"Third-person perspective",D:"It as pronoun"},a:"A",e:"First-person: story told by a character using I."},
  {id:"li010",s:"Literature",y:2019,t:"Drama",d:"Easy",q:"A soliloquy is a speech delivered by a character",o:{A:"Between two characters",B:"Alone, revealing inner thoughts",C:"Sung by protagonist",D:"Given to the chorus"},a:"B",e:"Soliloquy: character speaks thoughts aloud when alone."},
  {id:"li011",s:"Literature",y:2020,t:"Poetry",d:"Medium",q:"Enjambment occurs when",o:{A:"A poem has no rhyme",B:"A line ends with a pause",C:"A sentence runs over from one line to the next without pause",D:"A stanza has 8 lines"},a:"C",e:"Enjambment: no punctuation pause at end of line; thought continues."},
  {id:"li012",s:"Literature",y:2021,t:"Prose",d:"Hard",q:"The omniscient narrator",o:{A:"Tells the story in first person",B:"Has limited knowledge",C:"Is a character in the story",D:"Knows everything including characters' thoughts and motivations"},a:"D",e:"Omniscient narrator: god-like perspective; unlimited access to all minds."},
  {id:"li013",s:"Literature",y:2022,t:"Drama",d:"Medium",q:"Dramatic irony occurs when",o:{A:"Characters are confused",B:"Characters know more than audience",C:"Two characters exchange witty remarks",D:"The audience knows something the characters do not"},a:"A",e:"Dramatic irony: audience aware of something characters are not."},
  {id:"li014",s:"Literature",y:2023,t:"Poetry",d:"Easy",q:"A couplet is",o:{A:"A stanza of 4 lines",B:"Two consecutive rhyming lines",C:"A repeated refrain",D:"A stanza of 6 lines"},a:"B",e:"Couplet: two consecutive lines that rhyme."},
  {id:"li015",s:"Literature",y:2024,t:"Prose",d:"Medium",q:"Flashback as a narrative technique",o:{A:"Speeds up the plot",B:"Predicts future events",C:"Interrupts the present narrative to show earlier events",D:"Ends the story"},a:"C",e:"Flashback (analepsis): returns to earlier events within present narrative."},
  {id:"li016",s:"Literature",y:2010,t:"Drama",d:"Medium",q:"The protagonist of a story is",o:{A:"The narrator",B:"The setting",C:"The theme",D:"The main character"},a:"D",e:"Protagonist: central character around whom the plot revolves."},
  {id:"li017",s:"Literature",y:2011,t:"Poetry",d:"Easy",q:"A simile compares two unlike things using",o:{A:"like or as",B:"is or are",C:"no connective",D:"apostrophe"},a:"A",e:"Simile: comparison using like or as."},
  {id:"li018",s:"Literature",y:2012,t:"Prose",d:"Medium",q:"The climax of a plot is",o:{A:"The initial conflict",B:"The moment of highest tension",C:"The setting of the story",D:"The final resolution"},a:"B",e:"Climax: turning point; peak of conflict in a story."},
  {id:"li019",s:"Literature",y:2013,t:"Drama",d:"Easy",q:"A farce relies on",o:{A:"Subtle irony",B:"Political satire",C:"Exaggerated situations and physical humour",D:"Deep character study"},a:"C",e:"Farce: broad exaggerated physical comedy."},
  {id:"li020",s:"Literature",y:2014,t:"Poetry",d:"Medium",q:"An elegy is a poem",o:{A:"About war",B:"Celebrating a birth",C:"Mocking politicians",D:"Lamenting the dead"},a:"D",e:"Elegy: a mournful poem mourning the death of a person."},
  {id:"li021",s:"Literature",y:2015,t:"Prose",d:"Easy",q:"The theme of a literary work is",o:{A:"The central idea or message",B:"A literary device",C:"The setting",D:"The author's biography"},a:"A",e:"Theme: the underlying main idea explored in the work."},
  {id:"li022",s:"Literature",y:2016,t:"Drama",d:"Hard",q:"Anagnorisis in Aristotle's Poetics refers to",o:{A:"The chorus's commentary",B:"A moment of recognition or discovery by the protagonist",C:"The tragic flaw",D:"Unity of time"},a:"B",e:"Anagnorisis: recognition when protagonist discovers the truth."},
  {id:"li023",s:"Literature",y:2017,t:"Poetry",d:"Medium",q:"A haiku has the structure",o:{A:"5-7-5 across two lines",B:"5-5-7 across three lines",C:"5-7-5 across three lines",D:"7-5-7 across three lines"},a:"C",e:"Haiku: 17 syllables in 3 lines (5-7-5)."},
  {id:"li024",s:"Literature",y:2018,t:"Prose",d:"Medium",q:"Satire uses",o:{A:"Pure tragedy",B:"Lyrical description",C:"Epic narrative",D:"Irony, humour, and exaggeration to criticise human vices"},a:"D",e:"Satire: uses wit to critique society, politics, or human folly."},
  {id:"li025",s:"Literature",y:2019,t:"Drama",d:"Easy",q:"Stage directions in a play script are",o:{A:"Sung as part of play",B:"Part of the dialogue",C:"Spoken by actors",D:"Narrative descriptions of setting and actions"},a:"A",e:"Stage directions: author's instructions for staging (not spoken)."},
  {id:"li026",s:"Literature",y:2020,t:"Poetry",d:"Easy",q:"Onomatopoeia refers to words that",o:{A:"Repeat end sounds",B:"Sound like what they describe",C:"Compare things directly",D:"Describe a 6-line stanza"},a:"B",e:"Onomatopoeia: buzz, hiss, clang — word imitates the sound."},
  {id:"li027",s:"Literature",y:2021,t:"Prose",d:"Medium",q:"An unreliable narrator is one who",o:{A:"Always tells the truth",B:"Is omniscient",C:"May distort or misrepresent the truth",D:"Knows the future"},a:"C",e:"Unreliable narrator: reader cannot fully trust their account."},
  {id:"li028",s:"Literature",y:2022,t:"Drama",d:"Medium",q:"In Greek tragedy the chorus served to",o:{A:"Act as protagonist",B:"Provide costumes",C:"Perform stunts",D:"Comment on action and voice moral perspective"},a:"D",e:"Greek chorus: commentary on action; mediates between actors and audience."},
  {id:"li029",s:"Literature",y:2023,t:"Poetry",d:"Hard",q:"Synecdoche is a figure of speech in which",o:{A:"A part represents the whole (or vice versa)",B:"An object gets human qualities",C:"Opposite is said for effect",D:"Two unlike things are compared"},a:"A",e:"Synecdoche: all hands on deck (hands = sailors)."},
  {id:"li030",s:"Literature",y:2024,t:"Prose",d:"Easy",q:"Diction in literature refers to",o:{A:"Sentence length",B:"The writer's choice of words",C:"Plot structure",D:"Word count"},a:"B",e:"Diction: vocabulary and word choices that establish tone and style."},
  {id:"li031",s:"Literature",y:2010,t:"Drama",d:"Easy",q:"The antagonist opposes the",o:{A:"Setting",B:"Narrator",C:"Protagonist",D:"Theme"},a:"C",e:"Antagonist: character or force in conflict with the protagonist."},
  {id:"li032",s:"Literature",y:2011,t:"Poetry",d:"Hard",q:"Petrarchan sonnet structure is",o:{A:"14 lines divided ABAB CDCD EFEF GG",B:"4 lines plus 10 lines",C:"14 lines all in one block",D:"8 lines plus 6 lines (octave plus sestet)"},a:"D",e:"Petrarchan sonnet: octave (8) + sestet (6)."},
  {id:"li033",s:"Literature",y:2012,t:"Prose",d:"Easy",q:"Prose is distinguished from poetry mainly by",o:{A:"Ordinary sentence structure without regular metrical pattern",B:"Rhythm and rhyme",C:"Lack of figurative language",D:"Use of metaphors"},a:"A",e:"Prose: paragraphs without regular verse structure."},
  {id:"li034",s:"Literature",y:2013,t:"Drama",d:"Medium",q:"Classical Shakespearean play typically follows",o:{A:"Stasis, conflict, climax, fall, death",B:"Exposition, complication, crisis, resolution, denouement",C:"Setting, characters, theme, plot, message",D:"Introduction, body, conflict, resolution, epilogue"},a:"B",e:"Freytag's Pyramid: exposition to rising action to climax to resolution."},
  {id:"li035",s:"Literature",y:2014,t:"Poetry",d:"Easy",q:"A refrain is",o:{A:"A type of stanza",B:"The poem's central theme",C:"A repeated line or phrase in a poem",D:"A poetic device for nature"},a:"C",e:"Refrain: repeated line (like a chorus) throughout a poem."},
  {id:"li036",s:"Literature",y:2015,t:"Prose",d:"Medium",q:"A round character in fiction is",o:{A:"Without any traits",B:"Superficial and unchanging",C:"The story's villain",D:"Complex, fully developed, and capable of change"},a:"D",e:"Round character: psychologically complex; may undergo change."},
  {id:"li037",s:"Literature",y:2016,t:"Drama",d:"Easy",q:"A monologue is a long speech by",o:{A:"A single character",B:"The chorus only",C:"The audience",D:"Multiple characters"},a:"A",e:"Monologue: extended speech by one character."},
  {id:"li038",s:"Literature",y:2017,t:"Poetry",d:"Medium",q:"The villanelle is a poem with",o:{A:"14 lines in sonnet form",B:"19 lines, two refrains, and two rhyme sounds",C:"Free syllable count",D:"Free verse"},a:"B",e:"Villanelle: 19 lines (5 tercets plus final quatrain), two repeating refrains."},
  {id:"li039",s:"Literature",y:2018,t:"Prose",d:"Easy",q:"Setting in a novel refers to",o:{A:"The moral lesson",B:"The central character",C:"The time and place where the story occurs",D:"The narrative voice"},a:"C",e:"Setting: temporal and geographical context of the narrative."},
  {id:"li040",s:"Literature",y:2019,t:"Drama",d:"Medium",q:"Deus ex machina is a plot device where",o:{A:"The hero dies tragically",B:"Two themes conflict",C:"The setting changes suddenly",D:"An unlikely event resolves an unsolvable situation"},a:"D",e:"Deus ex machina: contrived plot resolution."},
  {id:"li041",s:"Literature",y:2020,t:"Poetry",d:"Easy",q:"Free verse poetry",o:{A:"Has no regular rhyme scheme or metre",B:"Always rhymes",C:"Has strict metre",D:"Has no figurative language"},a:"A",e:"Free verse: no fixed metre or rhyme."},
  {id:"li042",s:"Literature",y:2021,t:"Prose",d:"Medium",q:"A bildungsroman is a novel about",o:{A:"Political revolution",B:"The moral and psychological growth of the protagonist from youth to adulthood",C:"A romantic relationship",D:"War and conflict"},a:"B",e:"Bildungsroman: coming-of-age novel."},
  {id:"li043",s:"Literature",y:2022,t:"Drama",d:"Easy",q:"Exposition in drama provides",o:{A:"The climax of action",B:"The final resolution",C:"The falling action",D:"Background information about setting, characters, and situation"},a:"C",e:"Exposition: opening that establishes context, characters, and background."},
  {id:"li044",s:"Literature",y:2023,t:"Poetry",d:"Medium",q:"A caesura is",o:{A:"The poem's central image",B:"A type of rhyme scheme",C:"The poem's structure",D:"A mid-line pause in a poem"},a:"D",e:"Caesura: a pause within a line of verse."},
  {id:"li045",s:"Literature",y:2024,t:"Prose",d:"Hard",q:"Magical realism blends",o:{A:"Realistic narrative with magical elements treated as normal",B:"Two storylines",C:"Horror with comedy",D:"Myth with science fiction"},a:"A",e:"Magical realism: realistic world plus magical events accepted as ordinary."},
  {id:"li046",s:"Literature",y:2010,t:"Drama",d:"Medium",q:"The denouement is",o:{A:"The main conflict",B:"The final unravelling and resolution of a plot",C:"The central character",D:"The rising action"},a:"B",e:"Denouement: final resolution after climax."},
  {id:"li047",s:"Literature",y:2011,t:"Poetry",d:"Easy",q:"Personification gives non-human things",o:{A:"Animal qualities",B:"Scientific properties",C:"Human qualities",D:"Mythological significance"},a:"C",e:"Personification: the wind whispered, justice is blind."},
  {id:"li048",s:"Literature",y:2012,t:"Prose",d:"Hard",q:"Metafiction is fiction that",o:{A:"Only uses dialogue",B:"Is based on real events",C:"Has no plot",D:"Self-consciously draws attention to its own fictional nature"},a:"D",e:"Metafiction: fiction about fiction; breaks the fourth wall."},
  {id:"li049",s:"Literature",y:2013,t:"Drama",d:"Easy",q:"A farce primarily creates",o:{A:"Laughter through improbable situations",B:"Suspense",C:"Romance",D:"Sadness"},a:"A",e:"Farce: extreme comedy through unlikely events and slapstick."},
  {id:"li050",s:"Literature",y:2014,t:"Poetry",d:"Medium",q:"The octave of a Petrarchan sonnet presents",o:{A:"The resolution",B:"The problem, argument, or situation",C:"Two opposing ideas",D:"The poem's conclusion"},a:"B",e:"Octave (first 8 lines): establishes the problem; sestet resolves it."},
  {id:"li051",s:"Literature",y:2015,t:"Prose",d:"Easy",q:"Conflict in fiction is the struggle between",o:{A:"When two stories merge",B:"Always between two people",C:"Opposing forces driving the plot",D:"The central point of a story"},a:"C",e:"Conflict: essential narrative engine."},
  {id:"li052",s:"Literature",y:2016,t:"Drama",d:"Medium",q:"Tragicomedy blends",o:{A:"Satire and allegory",B:"Epic and lyric modes",C:"Two languages",D:"Tragic and comic elements in a single work"},a:"D",e:"Tragicomedy: genre mixing serious and comic elements."},
  {id:"li053",s:"Literature",y:2017,t:"Poetry",d:"Easy",q:"A stanza is",o:{A:"A group of lines in a poem",B:"A figure of speech",C:"A line of poetry",D:"A type of rhyme"},a:"A",e:"Stanza: a grouped set of lines in a poem."},
  {id:"li054",s:"Literature",y:2018,t:"Prose",d:"Medium",q:"Mood in literature refers to",o:{A:"The narrator's opinion",B:"The overall emotional atmosphere created in a work",C:"The author's biography",D:"The theme of the story"},a:"B",e:"Mood: the feeling evoked in the reader by the work."},
  {id:"li055",s:"Literature",y:2019,t:"Drama",d:"Hard",q:"Brecht's epic theatre used alienation effect (Verfremdungseffekt) to",o:{A:"Create emotional attachment",B:"Make audiences forget they watch a play",C:"Prevent emotional identification and prompt critical thinking",D:"Preserve dramatic tension"},a:"C",e:"Brechtian alienation: keeps audience intellectually engaged."},
  {id:"li056",s:"Literature",y:2020,t:"Poetry",d:"Medium",q:"In poetry, tone refers to",o:{A:"The poem's physical appearance",B:"The central metaphor",C:"The rhyme scheme",D:"The attitude of the speaker toward the subject"},a:"D",e:"Tone: speaker's emotional attitude toward the subject."},
  {id:"li057",s:"Literature",y:2021,t:"Prose",d:"Easy",q:"Dialogue in fiction serves to",o:{A:"Reveal character, advance plot, and create realism",B:"Show setting",C:"Replace all description",D:"Summarise the plot only"},a:"A",e:"Dialogue: reveals character and pushes the story forward."},
  {id:"li058",s:"Literature",y:2022,t:"Drama",d:"Easy",q:"The climax in a play is the",o:{A:"First scene",B:"Turning point of highest dramatic tension",C:"Epilogue",D:"Prologue"},a:"B",e:"Climax: moment of greatest dramatic intensity."},
  {id:"li059",s:"Literature",y:2023,t:"Poetry",d:"Medium",q:"Hyperbole in poetry is",o:{A:"Understatement",B:"A type of stanza",C:"Deliberate exaggeration for emphasis",D:"Literal description"},a:"C",e:"Hyperbole: extreme overstatement for effect."},
  {id:"li060",s:"Literature",y:2024,t:"Prose",d:"Medium",q:"Point of view in literature refers to",o:{A:"The setting of the story",B:"The conflict in the narrative",C:"The moral message",D:"The perspective from which a story is narrated"},a:"D",e:"Point of view: first, second, or third person."},
  {id:"li061",s:"Literature",y:2010,t:"Poetry",d:"Easy",q:"Rhyme that occurs within a single line is called",o:{A:"Internal rhyme",B:"Slant rhyme",C:"Masculine rhyme",D:"End rhyme"},a:"A",e:"Internal rhyme: rhyming words appear within the same line."},
  {id:"li062",s:"Literature",y:2011,t:"Drama",d:"Medium",q:"A mystery play in medieval drama depicted",o:{A:"Greek mythology",B:"Biblical stories for religious instruction",C:"Love stories",D:"Roman history"},a:"B",e:"Mystery plays: medieval religious drama depicting Bible stories."},
  {id:"li063",s:"Literature",y:2012,t:"Prose",d:"Easy",q:"An autobiography is",o:{A:"Written by someone else",B:"A fictional memoir",C:"A person's account of their own life",D:"A history of a family"},a:"C",e:"Autobiography: a self-written account of one's own life."},
  {id:"li064",s:"Literature",y:2013,t:"Poetry",d:"Medium",q:"Metre in poetry refers to",o:{A:"The poem's central meaning",B:"The choice of words",C:"The poem's topic",D:"The rhythmic pattern of stressed and unstressed syllables"},a:"D",e:"Metre: structured rhythmic pattern of syllables."},
  {id:"li065",s:"Literature",y:2014,t:"Prose",d:"Hard",q:"The epistolary novel tells a story through",o:{A:"Letters or other documents",B:"A retrospective narrator",C:"Stage directions",D:"Stream of consciousness"},a:"A",e:"Epistolary novel: told through letters."},
  {id:"li066",s:"Literature",y:2015,t:"Drama",d:"Easy",q:"Comedy of manners satirises",o:{A:"The lower class",B:"The social behaviour and conventions of the upper class",C:"Political corruption",D:"Nature and wildlife"},a:"B",e:"Comedy of manners: ridicules social pretensions."},
  {id:"li067",s:"Literature",y:2016,t:"Poetry",d:"Easy",q:"Alliteration is the repetition of",o:{A:"End sounds",B:"Vowel sounds",C:"Initial consonant sounds in nearby words",D:"Syllable counts"},a:"C",e:"Alliteration: Peter Piper picked; repeated initial consonant."},
  {id:"li068",s:"Literature",y:2017,t:"Prose",d:"Medium",q:"A flat character is",o:{A:"Complex and changing",B:"Always evil",C:"The main villain",D:"Simple, one-dimensional, and unchanging"},a:"D",e:"Flat character: defined by a single trait; no development."},
  {id:"li069",s:"Literature",y:2018,t:"Drama",d:"Hard",q:"In Aristotle's six elements of tragedy which is most important?",o:{A:"Plot (mythos)",B:"Spectacle",C:"Song",D:"Character"},a:"A",e:"Aristotle: plot is the soul of tragedy."},
  {id:"li070",s:"Literature",y:2019,t:"Poetry",d:"Medium",q:"An apostrophe (literary device) is when the poet",o:{A:"Uses a possessive",B:"Addresses an absent, dead, or imaginary person directly",C:"Has no theme",D:"Creates two contrasting stanzas"},a:"B",e:"Apostrophe: O Death, where is thy sting? (addressing something absent)."},
  {id:"li071",s:"Literature",y:2020,t:"Prose",d:"Easy",q:"A novella is",o:{A:"A short story",B:"A poem sequence",C:"A work of fiction shorter than a novel but longer than a short story",D:"A drama in five acts"},a:"C",e:"Novella: intermediate length fiction."},
  {id:"li072",s:"Literature",y:2021,t:"Drama",d:"Medium",q:"The fourth wall in theatre is the",o:{A:"Back of the stage",B:"Stage floor",C:"Backstage area",D:"Imaginary boundary between actors and audience"},a:"D",e:"Fourth wall: invisible barrier between performance and audience."},
  {id:"li073",s:"Literature",y:2022,t:"Poetry",d:"Hard",q:"Gerard Manley Hopkins invented",o:{A:"Sprung rhythm",B:"Blank verse",C:"Terza rima",D:"Free verse"},a:"A",e:"Hopkins: sprung rhythm; stressed syllables count, unstressed vary."},
  {id:"li074",s:"Literature",y:2023,t:"Prose",d:"Medium",q:"The denouement in a novel comes",o:{A:"At the climax",B:"After the climax; final resolution",C:"In the middle",D:"At the beginning"},a:"B",e:"Denouement: post-climax resolution of the plot."},
  {id:"li075",s:"Literature",y:2024,t:"Drama",d:"Easy",q:"A Raisin in the Sun was written by",o:{A:"Wole Soyinka",B:"Chinua Achebe",C:"Lorraine Hansberry",D:"J.P. Clark"},a:"C",e:"Lorraine Hansberry wrote A Raisin in the Sun (1959)."},
  {id:"li076",s:"Literature",y:2010,t:"Poetry",d:"Medium",q:"Blank verse is",o:{A:"Verse with no metaphors",B:"Free verse with no structure",C:"Verse rhyming ABAB",D:"Unrhymed iambic pentameter"},a:"D",e:"Blank verse: unrhymed iambic pentameter."},
  {id:"li077",s:"Literature",y:2011,t:"Prose",d:"Medium",q:"A protagonist who is morally ambiguous is called",o:{A:"An antihero",B:"A villain",C:"An anti-villain",D:"A hero"},a:"A",e:"Antihero: protagonist lacking conventional heroic qualities."},
  {id:"li078",s:"Literature",y:2012,t:"Drama",d:"Easy",q:"The prologue appears",o:{A:"At the climax",B:"Before the main action of a play",C:"In the middle",D:"At the end"},a:"B",e:"Prologue: introductory section before the main action."},
  {id:"li079",s:"Literature",y:2013,t:"Poetry",d:"Easy",q:"An ode celebrates or meditates on",o:{A:"Death only",B:"No theme",C:"War only",D:"A person, event, or abstract idea"},a:"C",e:"Ode: formal poem of praise or meditation."},
  {id:"li080",s:"Literature",y:2014,t:"Prose",d:"Medium",q:"Foreshadowing is a technique that",o:{A:"Explains past events",B:"Provides character backstory",C:"Summarises the plot",D:"Hints at future events in a story"},a:"D",e:"Foreshadowing: subtle clues about what will happen later."},
  {id:"li081",s:"Literature",y:2015,t:"Drama",d:"Medium",q:"Peripeteia in Greek tragedy is",o:{A:"A sudden reversal of fortune",B:"The final resolution",C:"The moment of recognition",D:"The hero's fatal flaw"},a:"A",e:"Peripeteia: sudden reversal of circumstances for the hero."},
  {id:"li082",s:"Literature",y:2016,t:"Poetry",d:"Easy",q:"The volta in a sonnet is",o:{A:"The rhyme scheme",B:"The turn in argument or tone",C:"The opening line",D:"The final couplet"},a:"B",e:"Volta: the turn that shifts the poem's direction or argument."},
  {id:"li083",s:"Literature",y:2017,t:"Prose",d:"Easy",q:"Suspense in fiction is created by",o:{A:"Long descriptions",B:"Multiple themes",C:"Uncertainty about what will happen next",D:"Many characters"},a:"C",e:"Suspense: narrative tension that keeps reader wanting to know more."},
  {id:"li084",s:"Literature",y:2018,t:"Drama",d:"Medium",q:"The unities of time, place, and action were rules for",o:{A:"The novel",B:"Epic poetry",C:"Lyric verse",D:"Classical Greek drama (Aristotle)"},a:"D",e:"Aristotelian unities: drama should occur in one day, one place, one plot."},
  {id:"li085",s:"Literature",y:2019,t:"Poetry",d:"Medium",q:"Consonance is the repetition of",o:{A:"Consonant sounds within or at the end of words",B:"Full rhymes at line ends",C:"Identical words",D:"Vowel sounds"},a:"A",e:"Consonance: repetition of consonant sounds (not just at the start)."},
  {id:"li086",s:"Literature",y:2020,t:"Prose",d:"Hard",q:"Intertextuality refers to",o:{A:"A novel's chapter structure",B:"The way a text references or is shaped by other texts",C:"Use of flashback",D:"An author's use of multiple narrators"},a:"B",e:"Intertextuality (Kristeva): texts in dialogue with other texts."},
  {id:"li087",s:"Literature",y:2021,t:"Drama",d:"Easy",q:"The epilogue comes",o:{A:"In the middle",B:"At the climax",C:"After the main action, providing a conclusion",D:"At the beginning"},a:"C",e:"Epilogue: closing section that comments on or concludes the story."},
  {id:"li088",s:"Literature",y:2022,t:"Poetry",d:"Medium",q:"A limerick has the rhyme scheme",o:{A:"ABABB",B:"ABCBA",C:"AABAB",D:"AABBA"},a:"D",e:"Limerick: AABBA; 5 lines, comic tone."},
  {id:"li089",s:"Literature",y:2023,t:"Prose",d:"Easy",q:"Narrative voice is",o:{A:"The perspective from which the story is told",B:"The author's identity",C:"The plot sequence",D:"The physical setting"},a:"A",e:"Narrative voice: the who telling the story and how they tell it."},
  {id:"li090",s:"Literature",y:2024,t:"Drama",d:"Medium",q:"Commedia dell arte is",o:{A:"A Shakespearean genre",B:"Italian improvised comedy with stock characters and masks",C:"A form of opera",D:"A type of epic poetry"},a:"B",e:"Commedia dell arte: Italian popular theatre."},
  {id:"li091",s:"Literature",y:2010,t:"Prose",d:"Easy",q:"A novel is a",o:{A:"Collection of poems",B:"Drama performed on stage",C:"Long prose fiction with complex characters and plot",D:"Very short fictional tale"},a:"C",e:"Novel: long sustained prose narrative."},
  {id:"li092",s:"Literature",y:2011,t:"Drama",d:"Easy",q:"A tragedy ends in",o:{A:"Marriage",B:"Comedy",C:"A happy resolution",D:"Death or disaster for the main character"},a:"D",e:"Tragedy: ends in the downfall or death of the protagonist."},
  {id:"li093",s:"Literature",y:2012,t:"Poetry",d:"Medium",q:"Terza rima has the rhyme scheme",o:{A:"ABA BCB CDC (interlocking)",B:"ABBA",C:"AABB",D:"ABAB"},a:"A",e:"Terza rima: Dante's form; interlocking tercets."},
  {id:"li094",s:"Literature",y:2013,t:"Prose",d:"Hard",q:"Bakhtin's dialogic novel contains",o:{A:"Only one perspective",B:"Multiple competing voices and perspectives",C:"No conflict",D:"Only direct speech"},a:"B",e:"Bakhtin: dialogism; novel contains many unmerged voices (polyphony)."},
  {id:"li095",s:"Literature",y:2014,t:"Drama",d:"Easy",q:"Dramatic tension is created by",o:{A:"Slow descriptions",B:"The prologue",C:"Conflict, uncertainty, and anticipation",D:"Comic relief"},a:"C",e:"Dramatic tension: conflict and uncertainty that keep audiences engaged."},
  {id:"li096",s:"Literature",y:2015,t:"Poetry",d:"Medium",q:"Pathetic fallacy uses weather or nature to",o:{A:"Make direct address to reader",B:"Present logical argument",C:"Cite statistics",D:"Reflect human emotions"},a:"D",e:"Pathetic fallacy: rain for sadness, storm for conflict."},
  {id:"li097",s:"Literature",y:2016,t:"Prose",d:"Medium",q:"A motif in literature is",o:{A:"A recurring element that has symbolic significance",B:"A minor character",C:"A narrative technique",D:"The author's real name"},a:"A",e:"Motif: recurring symbol, idea, or image throughout a work."},
  {id:"li098",s:"Literature",y:2017,t:"Drama",d:"Medium",q:"Comic relief in a tragedy serves to",o:{A:"Extend the play's length",B:"Briefly release tension and intensify surrounding seriousness by contrast",C:"Summarise the plot",D:"Replace tragic elements"},a:"B",e:"Comic relief: brief humour that intensifies the surrounding seriousness."},
  {id:"li099",s:"Literature",y:2018,t:"Poetry",d:"Easy",q:"Lyric poetry expresses",o:{A:"An argument",B:"A narrative",C:"The personal thoughts and emotions of the speaker",D:"An epic tale"},a:"C",e:"Lyric poetry: personal expression of feeling."},
  {id:"li100",s:"Literature",y:2019,t:"Prose",d:"Easy",q:"Characterisation is the method by which an author",o:{A:"Describes the setting",B:"Names the story",C:"Creates the plot",D:"Creates and develops characters"},a:"D",e:"Characterisation: process of making characters believable and distinct."},
  {id:"m001",s:"Mathematics",y:2010,t:"Algebra",d:"Easy",q:"Simplify: 3x + 5x - 2x",o:{A:"6x",B:"4x",C:"8x",D:"10x"},a:"A",e:"3+5-2 = 6; answer is 6x."},
  {id:"m002",s:"Mathematics",y:2011,t:"Number Theory",d:"Medium",q:"Find the HCF of 36 and 48",o:{A:"6",B:"12",C:"18",D:"24"},a:"B",e:"36=4x9, 48=4x12; HCF = 12."},
  {id:"m003",s:"Mathematics",y:2012,t:"Geometry",d:"Medium",q:"Area of a circle with radius 7 cm (pi=22/7)",o:{A:"44 sq cm",B:"22 sq cm",C:"154 sq cm",D:"308 sq cm"},a:"C",e:"A = pi*r^2 = (22/7)*49 = 154 sq cm."},
  {id:"m004",s:"Mathematics",y:2013,t:"Algebra",d:"Hard",q:"Solve: 2x^2 - 5x + 2 = 0",o:{A:"x=1 or x=2",B:"x=2 or x=-0.5",C:"x=-2 or x=0.5",D:"x=2 or x=0.5"},a:"D",e:"Factor: (2x-1)(x-2)=0; x=0.5 or x=2."},
  {id:"m005",s:"Mathematics",y:2014,t:"Statistics",d:"Medium",q:"Mean of 4, 7, 9, 10, 15",o:{A:"9",B:"8",C:"10",D:"11"},a:"A",e:"Sum=45, n=5; mean=9."},
  {id:"m006",s:"Mathematics",y:2015,t:"Trigonometry",d:"Medium",q:"sin 30 degrees =",o:{A:"rt3 over 2",B:"1 over 2",C:"1 over rt2",D:"rt3"},a:"B",e:"sin 30 = 0.5 = 1/2."},
  {id:"m007",s:"Mathematics",y:2016,t:"Number Theory",d:"Easy",q:"Express 0.000045 in standard form",o:{A:"45 x 10^-6",B:"4.5 x 10^-4",C:"4.5 x 10^-5",D:"4.5 x 10^5"},a:"C",e:"Move decimal 5 places right: 4.5 x 10^-5."},
  {id:"m008",s:"Mathematics",y:2017,t:"Algebra",d:"Hard",q:"If log base 2 of 8 = x, find x",o:{A:"2",B:"6",C:"4",D:"3"},a:"D",e:"2^x = 8 = 2^3; x = 3."},
  {id:"m009",s:"Mathematics",y:2018,t:"Geometry",d:"Medium",q:"Sum of interior angles of a hexagon",o:{A:"720",B:"540",C:"360",D:"900"},a:"A",e:"(n-2)*180 = (6-2)*180 = 720 degrees."},
  {id:"m010",s:"Mathematics",y:2019,t:"Algebra",d:"Medium",q:"Factorise completely: x^2 - 9",o:{A:"(x-3)^2",B:"(x+3)(x-3)",C:"(x+9)(x-1)",D:"x(x-9)"},a:"B",e:"Difference of two squares: x^2-9=(x+3)(x-3)."},
  {id:"m011",s:"Mathematics",y:2020,t:"Statistics",d:"Medium",q:"Median of 3, 5, 7, 9, 11, 13",o:{A:"7",B:"9",C:"8",D:"10"},a:"C",e:"Even set; median = (7+9)/2 = 8."},
  {id:"m012",s:"Mathematics",y:2021,t:"Trigonometry",d:"Hard",q:"cos 60 + sin 30 =",o:{A:"0",B:"0.5",C:"rt3",D:"1"},a:"D",e:"cos60=0.5, sin30=0.5; sum = 1."},
  {id:"m013",s:"Mathematics",y:2022,t:"Number Theory",d:"Easy",q:"Convert 1011 base 2 to decimal",o:{A:"11",B:"10",C:"9",D:"12"},a:"A",e:"1x8+0x4+1x2+1x1 = 11."},
  {id:"m014",s:"Mathematics",y:2023,t:"Algebra",d:"Hard",q:"If 3^(x+1) = 81, find x",o:{A:"2",B:"3",C:"4",D:"5"},a:"B",e:"81=3^4; x+1=4; x=3."},
  {id:"m015",s:"Mathematics",y:2024,t:"Geometry",d:"Medium",q:"Volume of a cylinder, r=3, h=10 (pi approx 3.14)",o:{A:"188.4",B:"94.2",C:"282.6",D:"565.2"},a:"C",e:"V=pi*r^2*h=3.14*9*10=282.6 cubic cm."},
  {id:"m016",s:"Mathematics",y:2010,t:"Algebra",d:"Medium",q:"Solve: 5(x-2) = 3(x+4)",o:{A:"x=9",B:"x=7",C:"x=13",D:"x=11"},a:"D",e:"5x-10=3x+12; 2x=22; x=11."},
  {id:"m017",s:"Mathematics",y:2011,t:"Statistics",d:"Easy",q:"Mode of: 3, 5, 3, 7, 3, 9, 5",o:{A:"3",B:"5",C:"7",D:"9"},a:"A",e:"3 appears 3 times; mode = 3."},
  {id:"m018",s:"Mathematics",y:2012,t:"Number Theory",d:"Medium",q:"LCM of 12 and 18",o:{A:"6",B:"36",C:"24",D:"72"},a:"B",e:"12=2^2*3, 18=2*3^2; LCM=2^2*3^2=36."},
  {id:"m019",s:"Mathematics",y:2013,t:"Geometry",d:"Easy",q:"Angles of a triangle sum to",o:{A:"90",B:"270",C:"180",D:"360"},a:"C",e:"Sum of interior angles of any triangle = 180 degrees."},
  {id:"m020",s:"Mathematics",y:2014,t:"Algebra",d:"Hard",q:"Expand (2x+3)^2",o:{A:"4x^2+9",B:"4x^2+6x+9",C:"2x^2+12x+9",D:"4x^2+12x+9"},a:"D",e:"(2x+3)^2=4x^2+12x+9."},
  {id:"m021",s:"Mathematics",y:2015,t:"Trigonometry",d:"Medium",q:"tan 45 degrees =",o:{A:"1",B:"rt2",C:"0",D:"rt3"},a:"A",e:"tan45 = sin45/cos45 = 1."},
  {id:"m022",s:"Mathematics",y:2016,t:"Statistics",d:"Hard",q:"Standard deviation measures",o:{A:"Central tendency",B:"Spread/dispersion around the mean",C:"Highest value",D:"Frequency"},a:"B",e:"Standard deviation: how values deviate from mean."},
  {id:"m023",s:"Mathematics",y:2017,t:"Number Theory",d:"Medium",q:"Evaluate: 3! + 4!",o:{A:"18",B:"36",C:"30",D:"42"},a:"C",e:"3!=6, 4!=24; sum=30."},
  {id:"m024",s:"Mathematics",y:2018,t:"Algebra",d:"Medium",q:"If f(x)=2x^2-3, find f(-2)",o:{A:"minus 5",B:"1",C:"-1",D:"5"},a:"D",e:"f(-2)=2(4)-3=5."},
  {id:"m025",s:"Mathematics",y:2019,t:"Geometry",d:"Hard",q:"Pythagoras: hypotenuse with legs 5 and 12",o:{A:"13",B:"11",C:"15",D:"17"},a:"A",e:"h=sqrt(25+144)=sqrt(169)=13."},
  {id:"m026",s:"Mathematics",y:2020,t:"Algebra",d:"Medium",q:"Solve: |2x-3|=7",o:{A:"x=5 or x=2",B:"x=5 or x=-2",C:"x=-5 or x=2",D:"x=5 only"},a:"B",e:"2x-3=7 gives x=5; 2x-3=-7 gives x=-2."},
  {id:"m027",s:"Mathematics",y:2021,t:"Statistics",d:"Easy",q:"Probability of rolling a 4 on a fair die",o:{A:"1/2",B:"1/4",C:"1/6",D:"1/3"},a:"C",e:"6 outcomes; P(4) = 1/6."},
  {id:"m028",s:"Mathematics",y:2022,t:"Number Theory",d:"Hard",q:"Simplify: (2^3 x 3^2)/(2 x 3^0)",o:{A:"36",B:"24",C:"18",D:"12"},a:"D",e:"= 8x9/2 = 72/6 = 12."},
  {id:"m029",s:"Mathematics",y:2023,t:"Algebra",d:"Medium",q:"If x:y = 3:5 and x+y=40, find x",o:{A:"15",B:"20",C:"12",D:"25"},a:"A",e:"8k=40; k=5; x=15."},
  {id:"m030",s:"Mathematics",y:2024,t:"Geometry",d:"Hard",q:"Area of triangle with base 8 cm and height 5 cm",o:{A:"13 sq cm",B:"20 sq cm",C:"80 sq cm",D:"40 sq cm"},a:"B",e:"A=0.5*b*h=0.5*8*5=20 sq cm."},
  {id:"m031",s:"Mathematics",y:2010,t:"Algebra",d:"Medium",q:"If 2x + 3 = 11, then x =",o:{A:"2",B:"5",C:"4",D:"6"},a:"C",e:"2x=8; x=4."},
  {id:"m032",s:"Mathematics",y:2011,t:"Number Theory",d:"Easy",q:"What is 25% of 200?",o:{A:"25",B:"40",C:"75",D:"50"},a:"D",e:"25/100 x 200 = 50."},
  {id:"m033",s:"Mathematics",y:2012,t:"Geometry",d:"Medium",q:"The sum of angles in a quadrilateral is",o:{A:"360",B:"270",C:"180",D:"540"},a:"A",e:"(4-2)*180 = 360 degrees."},
  {id:"m034",s:"Mathematics",y:2013,t:"Statistics",d:"Easy",q:"The range of 4, 7, 2, 9, 1 is",o:{A:"5",B:"8",C:"7",D:"9"},a:"B",e:"Range = 9 - 1 = 8."},
  {id:"m035",s:"Mathematics",y:2014,t:"Algebra",d:"Hard",q:"Solve simultaneously: x+y=7, x-y=3",o:{A:"x=3,y=4",B:"x=4,y=3",C:"x=5,y=2",D:"x=2,y=5"},a:"C",e:"Add: 2x=10, x=5; y=2."},
  {id:"m036",s:"Mathematics",y:2015,t:"Trigonometry",d:"Hard",q:"In right triangle, if sin theta = 3/5, then cos theta =",o:{A:"5/4",B:"3/4",C:"5/3",D:"4/5"},a:"D",e:"cos theta = sqrt(1-9/25) = 4/5."},
  {id:"m037",s:"Mathematics",y:2016,t:"Number Theory",d:"Medium",q:"Express 56 as a product of prime factors",o:{A:"2^3 x 7",B:"2x4x7",C:"2x28",D:"7x8"},a:"A",e:"56 = 2x2x2x7 = 2^3 x 7."},
  {id:"m038",s:"Mathematics",y:2017,t:"Algebra",d:"Medium",q:"If 5^x = 125, find x",o:{A:"2",B:"3",C:"4",D:"5"},a:"B",e:"125 = 5^3; x = 3."},
  {id:"m039",s:"Mathematics",y:2018,t:"Geometry",d:"Easy",q:"A triangle with all sides equal is called",o:{A:"Scalene",B:"Isosceles",C:"Equilateral",D:"Right-angled"},a:"C",e:"Equilateral = all 3 sides equal."},
  {id:"m040",s:"Mathematics",y:2019,t:"Statistics",d:"Medium",q:"12 of 30 students scored above 50. P(student scored above 50) =",o:{A:"1/3",B:"5/12",C:"12/30",D:"2/5"},a:"D",e:"P = 12/30 = 2/5."},
  {id:"m041",s:"Mathematics",y:2020,t:"Algebra",d:"Easy",q:"The value of 0! is",o:{A:"1",B:"0",C:"undefined",D:"infinity"},a:"A",e:"By definition, 0! = 1."},
  {id:"m042",s:"Mathematics",y:2021,t:"Number Theory",d:"Medium",q:"Find the value of sqrt(196)",o:{A:"12",B:"14",C:"16",D:"18"},a:"B",e:"14^2 = 196; sqrt(196) = 14."},
  {id:"m043",s:"Mathematics",y:2022,t:"Geometry",d:"Medium",q:"Perimeter of a square with side 9 cm is",o:{A:"18 cm",B:"27 cm",C:"36 cm",D:"81 cm"},a:"C",e:"P = 4x9 = 36 cm."},
  {id:"m044",s:"Mathematics",y:2023,t:"Algebra",d:"Hard",q:"If x^2 - 5x + 6 = 0, find the roots",o:{A:"x=3 or x=-2",B:"x=1 or x=6",C:"x=-2 or x=-3",D:"x=2 or x=3"},a:"D",e:"(x-2)(x-3)=0; x=2 or x=3."},
  {id:"m045",s:"Mathematics",y:2024,t:"Statistics",d:"Medium",q:"The mean of 6, 8, 10, 12, 14 is",o:{A:"10",B:"9",C:"8",D:"11"},a:"A",e:"Sum=50, n=5; mean=10."},
  {id:"m046",s:"Mathematics",y:2010,t:"Trigonometry",d:"Medium",q:"cos 0 degrees =",o:{A:"0",B:"1",C:"0.5",D:"rt2 over 2"},a:"B",e:"cos 0 = 1."},
  {id:"m047",s:"Mathematics",y:2011,t:"Number Theory",d:"Easy",q:"Express 3/4 as a percentage",o:{A:"50%",B:"60%",C:"75%",D:"80%"},a:"C",e:"3/4 x 100 = 75%."},
  {id:"m048",s:"Mathematics",y:2012,t:"Algebra",d:"Medium",q:"Simplify: (x^2-4)/(x-2)",o:{A:"2x",B:"x-2",C:"x^2+2",D:"x+2"},a:"D",e:"(x^2-4)=(x+2)(x-2); divide by (x-2) = x+2."},
  {id:"m049",s:"Mathematics",y:2013,t:"Geometry",d:"Hard",q:"The angle in a semicircle is always",o:{A:"90",B:"60",C:"45",D:"120"},a:"A",e:"Angle in semicircle = 90 degrees (Thales theorem)."},
  {id:"m050",s:"Mathematics",y:2014,t:"Statistics",d:"Hard",q:"P(A)=0.4 and P(B)=0.3, independent. Find P(A and B)",o:{A:"0.1",B:"0.12",C:"0.7",D:"0.58"},a:"B",e:"P(A and B) = 0.4 x 0.3 = 0.12."},
  {id:"m051",s:"Mathematics",y:2015,t:"Algebra",d:"Medium",q:"Evaluate: 2^3 x 2^2 divided by 2^4",o:{A:"2^2",B:"4",C:"2",D:"8"},a:"C",e:"2^(3+2-4) = 2^1 = 2."},
  {id:"m052",s:"Mathematics",y:2016,t:"Number Theory",d:"Hard",q:"Which of these is NOT a perfect square?",o:{A:"25",B:"36",C:"49",D:"50"},a:"D",e:"sqrt(50) is irrational; 50 is not a perfect square."},
  {id:"m053",s:"Mathematics",y:2017,t:"Geometry",d:"Medium",q:"An exterior angle of a regular hexagon is",o:{A:"60",B:"45",C:"30",D:"90"},a:"A",e:"360/6 = 60 degrees."},
  {id:"m054",s:"Mathematics",y:2018,t:"Algebra",d:"Easy",q:"If y = 2x + 3 and x = 4, find y",o:{A:"8",B:"11",C:"9",D:"13"},a:"B",e:"y = 2(4)+3 = 11."},
  {id:"m055",s:"Mathematics",y:2019,t:"Statistics",d:"Medium",q:"Which average is most affected by extreme values?",o:{A:"Mode",B:"Median",C:"Mean",D:"Range"},a:"C",e:"Mean uses all values so is most affected by extremes."},
  {id:"m056",s:"Mathematics",y:2020,t:"Trigonometry",d:"Hard",q:"If tan theta = 1, what is theta?",o:{A:"30",B:"90",C:"60",D:"45"},a:"D",e:"tan 45 = 1; theta = 45 degrees."},
  {id:"m057",s:"Mathematics",y:2021,t:"Number Theory",d:"Medium",q:"Convert 0.375 to a fraction",o:{A:"3/8",B:"3/7",C:"1/4",D:"4/9"},a:"A",e:"0.375 = 375/1000 = 3/8."},
  {id:"m058",s:"Mathematics",y:2022,t:"Algebra",d:"Hard",q:"Solve: log base 10 of x^2 = 4",o:{A:"x=10",B:"x=plus or minus 100",C:"x=100",D:"x=1000"},a:"B",e:"x^2 = 10^4 = 10000; x = plus or minus 100."},
  {id:"m059",s:"Mathematics",y:2023,t:"Geometry",d:"Medium",q:"The larger region cut off by a chord is called the",o:{A:"Minor arc",B:"Minor segment",C:"Major segment",D:"Chord arc"},a:"C",e:"Major segment = larger region cut off by a chord."},
  {id:"m060",s:"Mathematics",y:2024,t:"Statistics",d:"Easy",q:"In a pie chart, a sector of 90 degrees represents what fraction?",o:{A:"1/3",B:"1/2",C:"1/6",D:"1/4"},a:"D",e:"90/360 = 1/4."},
  {id:"m061",s:"Mathematics",y:2010,t:"Number Theory",d:"Medium",q:"Find the value of 2^5",o:{A:"32",B:"16",C:"64",D:"128"},a:"A",e:"2^5 = 32."},
  {id:"m062",s:"Mathematics",y:2011,t:"Algebra",d:"Medium",q:"If 3(2x-1) = 15, find x",o:{A:"2",B:"3",C:"4",D:"5"},a:"B",e:"6x-3=15; 6x=18; x=3."},
  {id:"m063",s:"Mathematics",y:2012,t:"Statistics",d:"Easy",q:"Find the mode of: 2, 4, 4, 6, 7, 4, 2",o:{A:"2",B:"6",C:"4",D:"7"},a:"C",e:"4 appears 3 times; mode = 4."},
  {id:"m064",s:"Mathematics",y:2013,t:"Geometry",d:"Hard",q:"Area of a trapezium with parallel sides 6 and 10 cm, height 4 cm",o:{A:"64 sq cm",B:"40 sq cm",C:"48 sq cm",D:"32 sq cm"},a:"D",e:"A=0.5*(6+10)*4=32 sq cm."},
  {id:"m065",s:"Mathematics",y:2014,t:"Algebra",d:"Medium",q:"Simplify: (3a^2 b)(2ab^3)",o:{A:"6a^3b^4",B:"5a^3b^4",C:"6a^2b^4",D:"5a^2b^6"},a:"A",e:"3x2=6; a^(2+1)=a^3; b^(1+3)=b^4."},
  {id:"m066",s:"Mathematics",y:2015,t:"Trigonometry",d:"Medium",q:"sin 90 degrees =",o:{A:"0",B:"1",C:"rt2 over 2",D:"0.5"},a:"B",e:"sin 90 = 1."},
  {id:"m067",s:"Mathematics",y:2016,t:"Number Theory",d:"Easy",q:"Express 45% as a decimal",o:{A:"0.045",B:"4.5",C:"0.45",D:"45.0"},a:"C",e:"45% = 45/100 = 0.45."},
  {id:"m068",s:"Mathematics",y:2017,t:"Algebra",d:"Hard",q:"Sum of 2, 5, 8, ... to 10 terms",o:{A:"110",B:"200",C:"120",D:"155"},a:"D",e:"S10 = 10/2*(2+29) = 5*31 = 155."},
  {id:"m069",s:"Mathematics",y:2018,t:"Geometry",d:"Medium",q:"A regular polygon with interior angles of 120 degrees has how many sides?",o:{A:"6",B:"5",C:"4",D:"8"},a:"A",e:"(n-2)*180/n=120; n=6 hexagon."},
  {id:"m070",s:"Mathematics",y:2019,t:"Statistics",d:"Hard",q:"Two dice rolled. Probability of sum = 7 is",o:{A:"1/6",B:"6/36",C:"5/36",D:"7/36"},a:"B",e:"6 favourable outcomes out of 36."},
  {id:"m071",s:"Mathematics",y:2020,t:"Algebra",d:"Medium",q:"Evaluate: 4^0 + 3^1 + 2^2",o:{A:"7",B:"9",C:"8",D:"10"},a:"C",e:"1+3+4=8."},
  {id:"m072",s:"Mathematics",y:2021,t:"Number Theory",d:"Medium",q:"The LCM of 4, 6 and 9 is",o:{A:"12",B:"18",C:"72",D:"36"},a:"D",e:"LCM(4,6,9)=36."},
  {id:"m073",s:"Mathematics",y:2022,t:"Geometry",d:"Easy",q:"Circumference of circle with diameter 14 cm (pi=22/7)",o:{A:"44 cm",B:"22 cm",C:"88 cm",D:"154 cm"},a:"A",e:"C=pi*d=22/7*14=44 cm."},
  {id:"m074",s:"Mathematics",y:2023,t:"Algebra",d:"Medium",q:"If p=3 and q=-2, evaluate p^2 - 2pq + q^2",o:{A:"5",B:"25",C:"17",D:"13"},a:"B",e:"(p-q)^2=(3-(-2))^2=5^2=25."},
  {id:"m075",s:"Mathematics",y:2024,t:"Statistics",d:"Hard",q:"The standard deviation of 2, 2, 2, 2 is",o:{A:"2",B:"1",C:"0",D:"4"},a:"C",e:"All values equal; no deviation; SD=0."},
  {id:"m076",s:"Mathematics",y:2010,t:"Number Theory",d:"Medium",q:"Which of these numbers is PRIME?",o:{A:"21",B:"27",C:"35",D:"29"},a:"D",e:"29 is divisible only by 1 and itself."},
  {id:"m077",s:"Mathematics",y:2011,t:"Algebra",d:"Easy",q:"Solve: x divided by 3 = 7",o:{A:"21",B:"18",C:"24",D:"7"},a:"A",e:"x = 3*7 = 21."},
  {id:"m078",s:"Mathematics",y:2012,t:"Geometry",d:"Hard",q:"The central angle is _______ the inscribed angle on the same arc.",o:{A:"Equal to",B:"Twice",C:"Half",D:"Three times"},a:"B",e:"Central angle = 2 times inscribed angle on same arc."},
  {id:"m079",s:"Mathematics",y:2013,t:"Trigonometry",d:"Medium",q:"In triangle ABC, angle B = 90, AB=5, BC=12. Find AC.",o:{A:"7",B:"17",C:"13",D:"15"},a:"C",e:"AC=sqrt(25+144)=sqrt(169)=13."},
  {id:"m080",s:"Mathematics",y:2014,t:"Number Theory",d:"Medium",q:"Express 72 in index form using prime factors",o:{A:"2^2 x 3^3",B:"4x18",C:"2x36",D:"2^3 x 3^2"},a:"D",e:"72=8x9=2^3 x 3^2."},
  {id:"m081",s:"Mathematics",y:2015,t:"Algebra",d:"Medium",q:"Simplify: 5x - 3(2x - 4)",o:{A:"minus x + 12",B:"11x-12",C:"minus x minus 12",D:"x+12"},a:"A",e:"5x-6x+12= -x+12."},
  {id:"m082",s:"Mathematics",y:2016,t:"Statistics",d:"Easy",q:"Bag has 3 red, 5 blue balls. P(red) =",o:{A:"1/3",B:"3/8",C:"5/8",D:"1/5"},a:"B",e:"P(red)=3/8."},
  {id:"m083",s:"Mathematics",y:2017,t:"Geometry",d:"Medium",q:"Value of x if angles on a straight line are 2x and 3x is",o:{A:"18",B:"30",C:"36",D:"45"},a:"C",e:"2x+3x=180; 5x=180; x=36 degrees."},
  {id:"m084",s:"Mathematics",y:2018,t:"Algebra",d:"Hard",q:"Quadratic with roots 3 and -5 is",o:{A:"x^2-2x-15",B:"x^2+8x-15",C:"x^2-8x+15",D:"x^2+2x-15"},a:"D",e:"(x-3)(x+5)=x^2+5x-3x-15=x^2+2x-15."},
  {id:"m085",s:"Mathematics",y:2019,t:"Number Theory",d:"Easy",q:"What is 20% of 350?",o:{A:"70",B:"60",C:"50",D:"80"},a:"A",e:"20/100*350=70."},
  {id:"m086",s:"Mathematics",y:2020,t:"Trigonometry",d:"Medium",q:"sin^2(theta) + cos^2(theta) =",o:{A:"0",B:"1",C:"sin 2 theta",D:"2"},a:"B",e:"Pythagorean identity: sin^2+cos^2 = 1."},
  {id:"m087",s:"Mathematics",y:2021,t:"Geometry",d:"Easy",q:"A right angle measures exactly",o:{A:"45",B:"60",C:"90",D:"180"},a:"C",e:"Right angle = 90 degrees by definition."},
  {id:"m088",s:"Mathematics",y:2022,t:"Algebra",d:"Medium",q:"Expand: (x+4)(x-3)",o:{A:"x^2-x-12",B:"x^2-x+12",C:"x^2+x+12",D:"x^2+x-12"},a:"D",e:"x^2-3x+4x-12=x^2+x-12."},
  {id:"m089",s:"Mathematics",y:2023,t:"Statistics",d:"Medium",q:"In a histogram, each bar's area represents",o:{A:"Frequency",B:"Frequency density",C:"Class width",D:"Class midpoint"},a:"A",e:"Area of bar = frequency in a histogram."},
  {id:"m090",s:"Mathematics",y:2024,t:"Number Theory",d:"Hard",q:"Remainder when 5^10 is divided by 4",o:{A:"0",B:"1",C:"2",D:"3"},a:"B",e:"5 is congruent to 1 mod 4; 5^10 is congruent to 1."},
  {id:"m091",s:"Mathematics",y:2010,t:"Algebra",d:"Medium",q:"If ax + b = c, then x =",o:{A:"(c+b)/a",B:"a/(c-b)",C:"(c-b)/a",D:"b/(c-a)"},a:"C",e:"ax=c-b; x=(c-b)/a."},
  {id:"m092",s:"Mathematics",y:2011,t:"Geometry",d:"Easy",q:"Vertically opposite angles are",o:{A:"Supplementary",B:"Complementary",C:"Adjacent",D:"Equal"},a:"D",e:"Vertically opposite angles are always equal."},
  {id:"m093",s:"Mathematics",y:2012,t:"Number Theory",d:"Medium",q:"The HCF of 24, 36 and 48 is",o:{A:"12",B:"6",C:"24",D:"36"},a:"A",e:"HCF(24,36,48)=12."},
  {id:"m094",s:"Mathematics",y:2013,t:"Algebra",d:"Hard",q:"Solve: 2^(2x) = 16",o:{A:"x=1",B:"x=2",C:"x=3",D:"x=4"},a:"B",e:"2^(2x)=2^4; 2x=4; x=2."},
  {id:"m095",s:"Mathematics",y:2014,t:"Statistics",d:"Medium",q:"A cumulative frequency curve is also called",o:{A:"Bar chart",B:"Histogram",C:"Ogive",D:"Polygon"},a:"C",e:"Cumulative frequency curve = ogive."},
  {id:"m096",s:"Mathematics",y:2015,t:"Geometry",d:"Medium",q:"Two angles of a triangle are 50 and 70 degrees. The third angle is",o:{A:"40",B:"50",C:"70",D:"60"},a:"D",e:"180-50-70=60 degrees."},
  {id:"m097",s:"Mathematics",y:2016,t:"Algebra",d:"Easy",q:"What is the value of 3^2 + 4^2?",o:{A:"25",B:"14",C:"7",D:"49"},a:"A",e:"9+16=25."},
  {id:"m098",s:"Mathematics",y:2017,t:"Trigonometry",d:"Hard",q:"If sin x = cos x, then x =",o:{A:"30",B:"45",C:"60",D:"90"},a:"B",e:"sin x = cos x at x=45 degrees."},
  {id:"m099",s:"Mathematics",y:2018,t:"Number Theory",d:"Medium",q:"Convert 0.6 recurring to a fraction",o:{A:"6/9",B:"3/5",C:"2/3",D:"5/8"},a:"C",e:"Let x=0.666...; 10x=6.666...; 9x=6; x=2/3."},
  {id:"m100",s:"Mathematics",y:2019,t:"Algebra",d:"Hard",q:"The discriminant of 3x^2 - 5x + 2 is",o:{A:"13",B:"-1",C:"4",D:"1"},a:"D",e:"b^2-4ac=25-24=1."},
  {id:"p001",s:"Physics",y:2010,t:"Mechanics",d:"Easy",q:"A body with uniform velocity has",o:{A:"Zero acceleration",B:"Increasing speed",C:"Decreasing momentum",D:"Constant acceleration"},a:"A",e:"Uniform velocity means no change in velocity so acceleration is zero."},
  {id:"p002",s:"Physics",y:2011,t:"Waves",d:"Medium",q:"Wave frequency 50 Hz, wavelength 4 m. Speed is",o:{A:"12.5 m/s",B:"200 m/s",C:"46 m/s",D:"54 m/s"},a:"B",e:"v = f times lambda = 50 x 4 = 200 m/s."},
  {id:"p003",s:"Physics",y:2012,t:"Electricity",d:"Hard",q:"Three 6-ohm resistors in parallel. Equivalent resistance is",o:{A:"18 ohm",B:"6 ohm",C:"2 ohm",D:"3 ohm"},a:"C",e:"1/R = 3/6 = 1/2; R = 2 ohm."},
  {id:"p004",s:"Physics",y:2013,t:"Optics",d:"Medium",q:"The sky appears blue because of",o:{A:"Reflection",B:"Refraction",C:"Diffraction",D:"Rayleigh scattering"},a:"D",e:"Short wavelength blue light is scattered more by atmosphere."},
  {id:"p005",s:"Physics",y:2014,t:"Thermodynamics",d:"Medium",q:"Heat cannot spontaneously flow from cold to hot. This is the",o:{A:"Second law",B:"First law",C:"Third law",D:"Zeroth law"},a:"A",e:"Second Law of Thermodynamics."},
  {id:"p006",s:"Physics",y:2015,t:"Mechanics",d:"Medium",q:"A 5 kg body acted on by 20 N. Acceleration is",o:{A:"0.25 m/s2",B:"4 m/s2",C:"2.5 m/s2",D:"100 m/s2"},a:"B",e:"F=ma; a=20/5=4 m/s2."},
  {id:"p007",s:"Physics",y:2016,t:"Waves",d:"Easy",q:"Sound cannot travel through",o:{A:"Water",B:"Steel",C:"A vacuum",D:"Air"},a:"C",e:"Sound is mechanical and needs particles to vibrate."},
  {id:"p008",s:"Physics",y:2017,t:"Nuclear Physics",d:"Hard",q:"U-238 undergoes alpha decay. Daughter nucleus is",o:{A:"234-92-U",B:"238-90-Th",C:"236-91-Pa",D:"234-90-Th"},a:"D",e:"Alpha decay: A minus 4, Z minus 2; gives Th-234."},
  {id:"p009",s:"Physics",y:2018,t:"Electricity",d:"Hard",q:"Power in 4 ohm resistor with 3 A current is",o:{A:"36 W",B:"0.75 W",C:"48 W",D:"12 W"},a:"A",e:"P = I squared R = 9 x 4 = 36 W."},
  {id:"p010",s:"Physics",y:2019,t:"Mechanics",d:"Medium",q:"Ball dropped from 20 m (g=10). Time to reach ground is",o:{A:"1 s",B:"2 s",C:"root 2 s",D:"4 s"},a:"B",e:"h = 0.5 g t squared; 20 = 5 t squared; t = 2 s."},
  {id:"p011",s:"Physics",y:2020,t:"Optics",d:"Medium",q:"Concave mirror f=10 cm, object at 30 cm. Image distance is",o:{A:"15 cm behind",B:"20 cm in front",C:"15 cm in front",D:"60 cm in front"},a:"C",e:"1/f=1/v+1/u; 1/10=1/v+1/30; v=15 cm."},
  {id:"p012",s:"Physics",y:2021,t:"Mechanics",d:"Easy",q:"SI unit of force is the",o:{A:"Watt",B:"Joule",C:"Pascal",D:"Newton"},a:"D",e:"Force measured in Newtons; 1 N = 1 kg m/s2."},
  {id:"p013",s:"Physics",y:2022,t:"Electricity",d:"Easy",q:"Ohm's Law states (constant temperature)",o:{A:"V=IR",B:"I=VR",C:"R=V+I",D:"V=I+R"},a:"A",e:"V=IR (voltage = current times resistance)."},
  {id:"p014",s:"Physics",y:2023,t:"Nuclear Physics",d:"Hard",q:"Half-life 4 years. Fraction remaining after 12 years is",o:{A:"1/2",B:"1/8",C:"1/16",D:"1/4"},a:"B",e:"3 half-lives: (1/2) cubed = 1/8."},
  {id:"p015",s:"Physics",y:2024,t:"Mechanics",d:"Hard",q:"Stone thrown up at 20 m/s (g=10). Max height is",o:{A:"10 m",B:"40 m",C:"20 m",D:"80 m"},a:"C",e:"v2=u2 minus 2gh; 0=400 minus 20h; h=20 m."},
  {id:"p016",s:"Physics",y:2010,t:"Waves",d:"Easy",q:"Amplitude of a wave is the",o:{A:"Distance between crests",B:"Waves per second",C:"Wave speed",D:"Maximum displacement from equilibrium"},a:"D",e:"Amplitude = max displacement from equilibrium position."},
  {id:"p017",s:"Physics",y:2011,t:"Thermodynamics",d:"Easy",q:"Best conductor of heat is",o:{A:"Copper",B:"Wood",C:"Rubber",D:"Glass"},a:"A",e:"Copper has free electrons that efficiently transfer heat."},
  {id:"p018",s:"Physics",y:2012,t:"Electricity",d:"Medium",q:"Energy of 60 W bulb in 2 hours is",o:{A:"30 J",B:"432000 J",C:"720 J",D:"120 J"},a:"B",e:"E=Pt=60 x 7200=432000 J."},
  {id:"p019",s:"Physics",y:2013,t:"Magnetism",d:"Medium",q:"Fleming's left-hand rule gives direction of",o:{A:"Induced EMF",B:"Magnetic pole",C:"Force on current-carrying conductor in a field",D:"Electron flow"},a:"C",e:"Motor rule: thumb=force, index=field, middle=current."},
  {id:"p020",s:"Physics",y:2014,t:"Mechanics",d:"Medium",q:"Kinetic energy formula is",o:{A:"mv",B:"mv2",C:"2mv2",D:"0.5 mv2"},a:"D",e:"KE = 0.5 mv2."},
  {id:"p021",s:"Physics",y:2015,t:"Mechanics",d:"Medium",q:"Pressure is defined as",o:{A:"Force divided by Area",B:"Mass divided by Volume",C:"Weight times Height",D:"Force times Area"},a:"A",e:"P = F/A; unit: Pascal = N/m2."},
  {id:"p022",s:"Physics",y:2016,t:"Thermodynamics",d:"Medium",q:"Gas compressed isothermally. Pressure",o:{A:"Decreases",B:"Increases",C:"Becomes zero",D:"Stays constant"},a:"B",e:"Boyle's Law: PV=constant; if V decreases, P increases."},
  {id:"p023",s:"Physics",y:2017,t:"Waves",d:"Hard",q:"Constructive interference occurs when path difference equals",o:{A:"lambda/2",B:"Odd multiples of lambda/2",C:"Integer multiples of lambda",D:"Quarter wavelength"},a:"C",e:"Constructive: path diff = n*lambda where n = 0,1,2..."},
  {id:"p024",s:"Physics",y:2018,t:"Optics",d:"Easy",q:"Law of reflection: angle of incidence",o:{A:"Greater than angle of reflection",B:"Is always 90",C:"Less than reflection",D:"Equals angle of reflection"},a:"D",e:"Angle of incidence equals angle of reflection (measured from normal)."},
  {id:"p025",s:"Physics",y:2019,t:"Mechanics",d:"Easy",q:"Conservation of energy states energy",o:{A:"Cannot be created or destroyed, only transformed",B:"Can be created",C:"Is always kinetic",D:"Equals KE always"},a:"A",e:"Energy cannot be created or destroyed, only converted."},
  {id:"p026",s:"Physics",y:2020,t:"Nuclear Physics",d:"Easy",q:"Gamma rays are",o:{A:"Fast electrons",B:"High-energy EM radiation",C:"Neutrons",D:"Helium nuclei"},a:"B",e:"Gamma rays: EM radiation, very high frequency, no charge."},
  {id:"p027",s:"Physics",y:2021,t:"Electricity",d:"Medium",q:"In a parallel circuit, all components share the same",o:{A:"Current",B:"Resistance",C:"Potential difference",D:"Power"},a:"C",e:"Parallel: all connected between same two nodes; same voltage."},
  {id:"p028",s:"Physics",y:2022,t:"Mechanics",d:"Medium",q:"Newton's First Law: a body at rest stays at rest unless",o:{A:"Gravity alone acts",B:"Friction acts",C:"Air resistance acts",D:"A net external force acts"},a:"D",e:"Law of Inertia: net external force required to change motion."},
  {id:"p029",s:"Physics",y:2023,t:"Optics",d:"Medium",q:"Convex lens corrects",o:{A:"Hypermetropia",B:"Astigmatism",C:"Colour blindness",D:"Myopia"},a:"A",e:"Hypermetropia: eyeball too short; convex lens corrects it."},
  {id:"p030",s:"Physics",y:2024,t:"Electricity",d:"Hard",q:"Transformer Ns:Np=1:10, Vp=240 V. Vs is",o:{A:"2400 V",B:"24 V",C:"0.24 V",D:"240 V"},a:"B",e:"Vs = Vp x Ns/Np = 240 x 1/10 = 24 V."},
  {id:"p031",s:"Physics",y:2010,t:"Mechanics",d:"Medium",q:"Work done = Force x Distance when force and displacement are",o:{A:"Perpendicular",B:"In opposite directions",C:"In the same direction",D:"At 45 degrees"},a:"C",e:"W = Fd cos(theta); maximum when theta=0."},
  {id:"p032",s:"Physics",y:2011,t:"Waves",d:"Easy",q:"The number of waves passing a point per second is",o:{A:"Wavelength",B:"Amplitude",C:"Wave speed",D:"Frequency"},a:"D",e:"Frequency = number of complete oscillations per second."},
  {id:"p033",s:"Physics",y:2012,t:"Electricity",d:"Medium",q:"Which of these is an insulator?",o:{A:"Rubber",B:"Aluminium",C:"Silver",D:"Copper"},a:"A",e:"Rubber does not conduct electricity."},
  {id:"p034",s:"Physics",y:2013,t:"Optics",d:"Easy",q:"A concave mirror is also called a",o:{A:"Plane mirror",B:"Parabolic mirror",C:"Convex mirror",D:"Diverging mirror"},a:"B",e:"Concave mirrors converge light; also called parabolic or converging."},
  {id:"p035",s:"Physics",y:2014,t:"Thermodynamics",d:"Medium",q:"At absolute zero, the kinetic energy of molecules is",o:{A:"Maximum",B:"Moderate",C:"Minimum approaching zero",D:"Equal to room temperature"},a:"C",e:"Absolute zero 0 K: molecules have minimum kinetic energy."},
  {id:"p036",s:"Physics",y:2015,t:"Nuclear Physics",d:"Medium",q:"Alpha particles consist of",o:{A:"2 protons and 1 neutron",B:"2 electrons",C:"1 proton and 1 neutron",D:"2 protons and 2 neutrons"},a:"D",e:"Alpha particle = helium-4 nucleus: 2 protons plus 2 neutrons."},
  {id:"p037",s:"Physics",y:2016,t:"Mechanics",d:"Easy",q:"Momentum is defined as",o:{A:"Mass times Velocity",B:"Mass divided by Velocity",C:"Mass times Acceleration",D:"Force times Time"},a:"A",e:"p = mv."},
  {id:"p038",s:"Physics",y:2017,t:"Waves",d:"Medium",q:"Distance between two consecutive crests of a wave is the",o:{A:"Amplitude",B:"Wavelength",C:"Frequency",D:"Period"},a:"B",e:"Wavelength = distance between two adjacent crests."},
  {id:"p039",s:"Physics",y:2018,t:"Electricity",d:"Medium",q:"The unit of electrical resistance is the",o:{A:"Ampere",B:"Volt",C:"Ohm",D:"Watt"},a:"C",e:"Resistance is measured in ohms."},
  {id:"p040",s:"Physics",y:2019,t:"Optics",d:"Medium",q:"Total internal reflection occurs when light travels from",o:{A:"Air to water",B:"Less dense to denser medium",C:"Vacuum to glass",D:"Denser to less dense medium above critical angle"},a:"D",e:"TIR: light hits boundary from denser side above critical angle."},
  {id:"p041",s:"Physics",y:2020,t:"Thermodynamics",d:"Medium",q:"Specific heat capacity is the heat required to",o:{A:"Raise 1 kg by 1 degree C",B:"Melt 1 kg of substance",C:"Vaporise 1 g",D:"Change state"},a:"A",e:"Specific heat capacity: energy per kg per degree."},
  {id:"p042",s:"Physics",y:2021,t:"Mechanics",d:"Hard",q:"A satellite in circular orbit has constant",o:{A:"Speed and velocity",B:"Speed but changing velocity",C:"Velocity but changing speed",D:"Neither speed nor velocity"},a:"B",e:"Circular orbit: speed is constant but direction changes so velocity changes."},
  {id:"p043",s:"Physics",y:2022,t:"Waves",d:"Hard",q:"The Doppler effect relates to change in",o:{A:"Amplitude of a wave",B:"Speed of a wave",C:"Observed frequency due to relative motion",D:"Wavelength only"},a:"C",e:"Doppler: observed frequency shifts when source or observer moves."},
  {id:"p044",s:"Physics",y:2023,t:"Electricity",d:"Hard",q:"In a full-wave rectifier, the output frequency is",o:{A:"Same as input",B:"Half of input",C:"Four times the input",D:"Twice the input"},a:"D",e:"Full-wave rectifier: both half-cycles used; f output = 2 x f input."},
  {id:"p045",s:"Physics",y:2024,t:"Nuclear Physics",d:"Hard",q:"Nuclear fission is the splitting of a heavy nucleus into",o:{A:"Two lighter nuclei",B:"Two neutrons",C:"An alpha particle and gamma ray",D:"A proton and electron"},a:"A",e:"Fission: heavy nucleus splits into two lighter nuclei."},
  {id:"p046",s:"Physics",y:2010,t:"Mechanics",d:"Easy",q:"The SI unit of energy is the",o:{A:"Newton",B:"Joule",C:"Pascal",D:"Watt"},a:"B",e:"Energy is measured in Joules."},
  {id:"p047",s:"Physics",y:2011,t:"Thermodynamics",d:"Medium",q:"Latent heat of vaporisation is heat needed to",o:{A:"Raise temperature of liquid",B:"Freeze a liquid",C:"Convert liquid to vapour without temperature change",D:"Convert solid to liquid"},a:"C",e:"Latent heat of vaporisation: liquid to vapour at constant temperature."},
  {id:"p048",s:"Physics",y:2012,t:"Waves",d:"Easy",q:"Longitudinal waves include",o:{A:"Light",B:"Radio waves",C:"X-rays",D:"Sound"},a:"D",e:"Sound = longitudinal wave with compression and rarefaction."},
  {id:"p049",s:"Physics",y:2013,t:"Electricity",d:"Medium",q:"Kirchhoff's current law states algebraic sum of currents at a junction is",o:{A:"Zero",B:"Infinite",C:"Negative",D:"Equal to voltage"},a:"A",e:"KCL: sum of currents = 0 at any node."},
  {id:"p050",s:"Physics",y:2014,t:"Optics",d:"Medium",q:"Refractive index of glass is 1.5. Speed of light in glass is (c=3x10^8)",o:{A:"4.5x10^8 m/s",B:"2x10^8 m/s",C:"3x10^8 m/s",D:"1.5x10^8 m/s"},a:"B",e:"v = c/n = 3x10^8/1.5 = 2x10^8 m/s."},
  {id:"p051",s:"Physics",y:2015,t:"Mechanics",d:"Medium",q:"Impulse is defined as",o:{A:"Force divided by Time",B:"Force times Distance",C:"Force times Time",D:"Mass times Acceleration"},a:"C",e:"Impulse = F times delta t = change in momentum."},
  {id:"p052",s:"Physics",y:2016,t:"Thermodynamics",d:"Easy",q:"Heat is transferred through a vacuum by",o:{A:"Conduction",B:"Convection",C:"Both conduction and convection",D:"Radiation"},a:"D",e:"Radiation is the only heat transfer mode that works through vacuum."},
  {id:"p053",s:"Physics",y:2017,t:"Electricity",d:"Medium",q:"A fuse protects a circuit by",o:{A:"Melting and breaking the circuit when current is too high",B:"Storing charge",C:"Reducing voltage",D:"Increasing current"},a:"A",e:"Fuse melts at its rated current, breaking the circuit."},
  {id:"p054",s:"Physics",y:2018,t:"Mechanics",d:"Hard",q:"For SHM, acceleration is proportional to",o:{A:"Velocity",B:"Displacement directed toward equilibrium",C:"Square of amplitude",D:"Amplitude"},a:"B",e:"SHM: a proportional to minus x (toward centre)."},
  {id:"p055",s:"Physics",y:2019,t:"Waves",d:"Medium",q:"Which electromagnetic wave has the highest frequency?",o:{A:"Radio waves",B:"Microwaves",C:"Gamma rays",D:"X-rays"},a:"C",e:"EM spectrum: gamma rays have the highest frequency."},
  {id:"p056",s:"Physics",y:2020,t:"Electricity",d:"Medium",q:"The relationship between charge, current and time is",o:{A:"Q = I/t",B:"Q = t/I",C:"Q = I squared t",D:"Q = It"},a:"D",e:"Q = It (charge = current times time)."},
  {id:"p057",s:"Physics",y:2021,t:"Optics",d:"Easy",q:"A diverging lens is also called a",o:{A:"Concave lens",B:"Convex lens",C:"Bifocal lens",D:"Converging lens"},a:"A",e:"Diverging = concave lens (spreads light rays)."},
  {id:"p058",s:"Physics",y:2022,t:"Mechanics",d:"Medium",q:"Angular velocity of a body completing one revolution per second is",o:{A:"pi rad/s",B:"2 pi rad/s",C:"4 pi rad/s",D:"6 pi rad/s"},a:"B",e:"omega = 2 pi f = 2 pi x 1 = 2 pi rad/s."},
  {id:"p059",s:"Physics",y:2023,t:"Thermodynamics",d:"Hard",q:"An ideal gas obeys which equation?",o:{A:"P/T = nR/V",B:"PV = RT",C:"PV = nRT",D:"PV = nRt squared"},a:"C",e:"Ideal gas law: PV = nRT."},
  {id:"p060",s:"Physics",y:2024,t:"Nuclear Physics",d:"Medium",q:"Beta-minus decay emits",o:{A:"A helium nucleus",B:"A positron",C:"A gamma ray",D:"An electron"},a:"D",e:"Beta-minus decay: neutron gives proton plus electron plus antineutrino."},
  {id:"p061",s:"Physics",y:2010,t:"Mechanics",d:"Easy",q:"Weight is the",o:{A:"Force of gravity on a body",B:"Mass of a body",C:"Volume of a body",D:"Density of a body"},a:"A",e:"Weight = mg; force exerted by gravity on a mass."},
  {id:"p062",s:"Physics",y:2011,t:"Waves",d:"Hard",q:"Standing waves are formed by",o:{A:"Two waves in same direction",B:"Reflection and superposition of two identical waves",C:"Diffraction only",D:"Refraction of light"},a:"B",e:"Standing waves: two identical waves travelling in opposite directions."},
  {id:"p063",s:"Physics",y:2012,t:"Mechanics",d:"Medium",q:"Terminal velocity is",o:{A:"Always zero",B:"Acceleration due to gravity",C:"Maximum constant velocity when drag equals weight",D:"Twice the initial velocity"},a:"C",e:"Terminal velocity: drag force equals weight so no acceleration."},
  {id:"p064",s:"Physics",y:2013,t:"Optics",d:"Hard",q:"Chromatic aberration in lenses is caused by",o:{A:"Spherical shape",B:"Total internal reflection",C:"Refraction at flat surfaces",D:"Different focal lengths for different wavelengths"},a:"D",e:"Different wavelengths are refracted differently by the lens."},
  {id:"p065",s:"Physics",y:2014,t:"Thermodynamics",d:"Medium",q:"Charles Law states that at constant pressure",o:{A:"V/T = constant",B:"PV = constant",C:"PT = constant",D:"P/T = constant"},a:"A",e:"Charles Law: V/T = constant at constant pressure."},
  {id:"p066",s:"Physics",y:2015,t:"Magnetism",d:"Easy",q:"Like poles of magnets",o:{A:"Attract each other",B:"Repel each other",C:"Create a field",D:"Have no effect"},a:"B",e:"Like poles repel; unlike poles attract."},
  {id:"p067",s:"Physics",y:2016,t:"Mechanics",d:"Medium",q:"A projectile at maximum height has",o:{A:"Zero velocity",B:"Zero horizontal velocity",C:"Zero vertical velocity",D:"Maximum kinetic energy"},a:"C",e:"At max height: vertical velocity = 0; horizontal velocity unchanged."},
  {id:"p068",s:"Physics",y:2017,t:"Waves",d:"Easy",q:"X-rays and visible light are both examples of",o:{A:"Sound waves",B:"Mechanical waves",C:"Longitudinal waves",D:"Electromagnetic waves"},a:"D",e:"X-rays and light are EM waves (transverse)."},
  {id:"p069",s:"Physics",y:2018,t:"Electricity",d:"Medium",q:"Resistance of a conductor is directly proportional to its",o:{A:"Temperature for metals",B:"Cross-sectional area",C:"Voltage",D:"Current"},a:"A",e:"R increases with temperature for metals."},
  {id:"p070",s:"Physics",y:2019,t:"Optics",d:"Easy",q:"The pupil of the eye controls",o:{A:"Focus",B:"Amount of light entering",C:"Detail vision",D:"Colour detection"},a:"B",e:"Iris and pupil regulate light entering the eye."},
  {id:"p071",s:"Physics",y:2020,t:"Mechanics",d:"Hard",q:"Moment of inertia of a solid sphere about its diameter is",o:{A:"MR2",B:"1/2 MR2",C:"2/5 MR2",D:"7/5 MR2"},a:"C",e:"I = 2/5 MR2 for solid sphere about diameter."},
  {id:"p072",s:"Physics",y:2021,t:"Thermodynamics",d:"Medium",q:"The efficiency of a Carnot engine depends on",o:{A:"Working substance",B:"Friction only",C:"Material of engine",D:"Temperature of hot and cold reservoirs"},a:"D",e:"Eta = 1 minus T cold/T hot; depends only on temperatures."},
  {id:"p073",s:"Physics",y:2022,t:"Waves",d:"Medium",q:"Diffraction is most noticeable when the wavelength is",o:{A:"Much larger than the slit",B:"Much smaller than the slit",C:"Equal to the amplitude",D:"Twice the frequency"},a:"A",e:"Diffraction greatest when lambda is approximately equal to or greater than slit width."},
  {id:"p074",s:"Physics",y:2023,t:"Electricity",d:"Medium",q:"Capacitance of a parallel plate capacitor increases when",o:{A:"Plate area decreases",B:"Plate area increases",C:"A conductor is inserted",D:"Plate separation increases"},a:"B",e:"C = epsilon A/d; C increases as A increases."},
  {id:"p075",s:"Physics",y:2024,t:"Nuclear Physics",d:"Easy",q:"Radioactive decay is",o:{A:"Affected by temperature",B:"A chemical process",C:"A spontaneous process unaffected by physical conditions",D:"Enhanced by pressure"},a:"C",e:"Radioactive decay: spontaneous; independent of temperature, pressure, chemistry."},
  {id:"p076",s:"Physics",y:2010,t:"Mechanics",d:"Easy",q:"Acceleration due to gravity on Earth is approximately",o:{A:"9 m/s2",B:"12 m/s2",C:"11 m/s2",D:"10 m/s2"},a:"D",e:"g approximately 9.8 m/s2, approximated as 10 m/s2 in JAMB."},
  {id:"p077",s:"Physics",y:2011,t:"Electricity",d:"Easy",q:"The unit of electric current is the",o:{A:"Ampere",B:"Ohm",C:"Watt",D:"Volt"},a:"A",e:"Current is measured in Amperes."},
  {id:"p078",s:"Physics",y:2012,t:"Waves",d:"Medium",q:"A transverse wave vibrates",o:{A:"Parallel to wave direction",B:"Perpendicular to wave direction",C:"With no vibration",D:"In a random direction"},a:"B",e:"Transverse wave: oscillation perpendicular to propagation direction."},
  {id:"p079",s:"Physics",y:2013,t:"Optics",d:"Medium",q:"Which of these is NOT a property of light?",o:{A:"Reflection",B:"Refraction",C:"Compression",D:"Diffraction"},a:"C",e:"Compression is a property of sound not light."},
  {id:"p080",s:"Physics",y:2014,t:"Mechanics",d:"Medium",q:"The centre of gravity of a regular object is at its",o:{A:"Surface",B:"Highest point",C:"Lowest point",D:"Geometric centre"},a:"D",e:"Regular symmetric object: centre of gravity at geometric centre."},
  {id:"p081",s:"Physics",y:2015,t:"Thermodynamics",d:"Easy",q:"Water boils at 100 degrees C. In Kelvin this is",o:{A:"373 K",B:"273 K",C:"473 K",D:"100 K"},a:"A",e:"K = degrees C + 273 = 100 + 273 = 373 K."},
  {id:"p082",s:"Physics",y:2016,t:"Electricity",d:"Medium",q:"Two resistors of 6 ohm and 3 ohm in series. Total resistance is",o:{A:"2 ohm",B:"9 ohm",C:"4 ohm",D:"18 ohm"},a:"B",e:"Series: R = R1 + R2 = 6 + 3 = 9 ohm."},
  {id:"p083",s:"Physics",y:2017,t:"Mechanics",d:"Medium",q:"Car accelerates from rest to 20 m/s in 5 s. Acceleration is",o:{A:"2 m/s2",B:"100 m/s2",C:"4 m/s2",D:"5 m/s2"},a:"C",e:"a = (v minus u)/t = 20/5 = 4 m/s2."},
  {id:"p084",s:"Physics",y:2018,t:"Waves",d:"Medium",q:"Frequency of mains electricity in Nigeria is",o:{A:"25 Hz",B:"60 Hz",C:"100 Hz",D:"50 Hz"},a:"D",e:"Nigeria uses 50 Hz AC mains."},
  {id:"p085",s:"Physics",y:2019,t:"Nuclear Physics",d:"Medium",q:"Which radiation is most penetrating?",o:{A:"Gamma",B:"Beta",C:"X-rays",D:"Alpha"},a:"A",e:"Gamma rays are most penetrating and can pass through thick concrete."},
  {id:"p086",s:"Physics",y:2020,t:"Mechanics",d:"Easy",q:"A scalar quantity has",o:{A:"Direction only",B:"Magnitude only",C:"No value",D:"Both magnitude and direction"},a:"B",e:"Scalar: magnitude only such as mass, speed, temperature."},
  {id:"p087",s:"Physics",y:2021,t:"Optics",d:"Medium",q:"Focal length of convex lens of power +5 D is",o:{A:"5 m",B:"0.5 m",C:"0.2 m",D:"2 m"},a:"C",e:"f = 1/P = 1/5 = 0.2 m."},
  {id:"p088",s:"Physics",y:2022,t:"Thermodynamics",d:"Hard",q:"During an adiabatic process",o:{A:"Heat exchanged at constant volume",B:"Temperature stays constant",C:"Pressure remains constant",D:"No heat exchange occurs with surroundings"},a:"D",e:"Adiabatic: Q=0; no heat exchanged with surroundings."},
  {id:"p089",s:"Physics",y:2023,t:"Electricity",d:"Medium",q:"The diode allows current to flow in",o:{A:"Only the forward direction",B:"Only the reverse direction",C:"Neither direction",D:"Both directions"},a:"A",e:"Diode: allows current in forward bias only."},
  {id:"p090",s:"Physics",y:2024,t:"Mechanics",d:"Hard",q:"The escape velocity from Earth is approximately",o:{A:"7.9 km/s",B:"11.2 km/s",C:"15 km/s",D:"3 km/s"},a:"B",e:"Escape velocity from Earth is approximately 11.2 km/s."},
  {id:"p091",s:"Physics",y:2010,t:"Waves",d:"Medium",q:"Which of the following is a mechanical wave?",o:{A:"Radio",B:"Light",C:"Sound",D:"X-ray"},a:"C",e:"Sound requires a medium; it is a mechanical wave."},
  {id:"p092",s:"Physics",y:2011,t:"Mechanics",d:"Medium",q:"The work-energy theorem states",o:{A:"W = mgh",B:"W = 0.5 mv2",C:"W = Ft",D:"W = change in KE"},a:"D",e:"Work done on a body equals change in kinetic energy."},
  {id:"p093",s:"Physics",y:2012,t:"Electricity",d:"Easy",q:"An ammeter is connected _______ in a circuit.",o:{A:"Series",B:"Both series and parallel",C:"Neither",D:"Parallel"},a:"A",e:"Ammeter: connected in series to measure current."},
  {id:"p094",s:"Physics",y:2013,t:"Thermodynamics",d:"Medium",q:"Which process keeps temperature constant?",o:{A:"Adiabatic",B:"Isothermal",C:"Isochoric",D:"Isobaric"},a:"B",e:"Isothermal: temperature constant."},
  {id:"p095",s:"Physics",y:2014,t:"Optics",d:"Medium",q:"A virtual image is one that",o:{A:"Can be projected on screen",B:"Is formed behind a mirror",C:"Is always upright and cannot be projected on screen",D:"Is formed only by concave mirrors"},a:"C",e:"Virtual image: upright, cannot be captured on screen."},
  {id:"p096",s:"Physics",y:2015,t:"Magnetism",d:"Medium",q:"An electromagnet is made by",o:{A:"Rubbing steel with a magnet",B:"Hammering a magnet",C:"Cooling a permanent magnet",D:"Passing current through a coil around an iron core"},a:"D",e:"Electromagnet: soft iron core plus current-carrying coil."},
  {id:"p097",s:"Physics",y:2016,t:"Nuclear Physics",d:"Medium",q:"In nuclear reactions, which is conserved?",o:{A:"Both mass number and atomic number",B:"Only charge",C:"Only energy",D:"Only mass"},a:"A",e:"Both A and Z are conserved in nuclear equations."},
  {id:"p098",s:"Physics",y:2017,t:"Mechanics",d:"Easy",q:"Speed is defined as",o:{A:"Displacement divided by Time",B:"Distance divided by Time",C:"Acceleration times Time",D:"Velocity times Mass"},a:"B",e:"Speed = distance/time; a scalar quantity."},
  {id:"p099",s:"Physics",y:2018,t:"Electricity",d:"Medium",q:"The EMF of a battery is",o:{A:"The internal resistance",B:"Terminal voltage under load",C:"Work done per unit charge",D:"The power it delivers"},a:"C",e:"EMF = work done per coulomb."},
  {id:"p100",s:"Physics",y:2019,t:"Waves",d:"Hard",q:"The intensity of a sound is proportional to the square of its",o:{A:"Frequency",B:"Wavelength",C:"Speed",D:"Amplitude"},a:"D",e:"Intensity is proportional to amplitude squared."},
  {id:"e001",s:"Use of English",y:2010,t:"Lexis",d:"Easy",q:"The word nearest in meaning to ABSCOND is",o:{A:"Flee secretly",B:"Confess",C:"Arrive",D:"Surrender"},a:"A",e:"Abscond means to leave hurriedly and secretly."},
  {id:"e002",s:"Use of English",y:2011,t:"Oral English",d:"Medium",q:"In which word is stress on the SECOND syllable?",o:{A:"PHOtograph",B:"preSENT (verb)",C:"REcord (noun)",D:"PROtest (noun)"},a:"B",e:"Present used as a verb = preSENT; as noun/adj = PREsent."},
  {id:"e003",s:"Use of English",y:2012,t:"Comprehension",d:"Medium",q:"A sardonic tone means the writer is",o:{A:"Warm and enthusiastic",B:"Neutral and objective",C:"Grimly mocking or cynical",D:"Descriptive and vivid"},a:"C",e:"Sardonic = grimly mocking, cynical."},
  {id:"e004",s:"Use of English",y:2013,t:"Lexis",d:"Easy",q:"The students were _______ by the exam difficulty.",o:{A:"overran",B:"overturned",C:"overrode",D:"overwhelmed"},a:"D",e:"Overwhelmed = overcome by something difficult."},
  {id:"e005",s:"Use of English",y:2014,t:"Oral English",d:"Medium",q:"Which word has the same vowel sound as in FEET?",o:{A:"Beat",B:"Bet",C:"Bit",D:"Bat"},a:"A",e:"Beat /iː/ matches feet /iː/."},
  {id:"e006",s:"Use of English",y:2015,t:"Lexis",d:"Medium",q:"Despite the rain, the athletes _______ to complete the race.",o:{A:"achieved",B:"managed",C:"succeeded",D:"accomplished"},a:"B",e:"Managed to + infinitive is the correct collocation."},
  {id:"e007",s:"Use of English",y:2016,t:"Novel",d:"Hard",q:"In In Dependence, Tayo and Vanessa mainly represent",o:{A:"A successful marriage",B:"Academic rivalry",C:"African identity vs Western aspiration",D:"Colonial exploitation"},a:"C",e:"Their bond dramatises tension between Nigerian roots and British aspiration."},
  {id:"e008",s:"Use of English",y:2017,t:"Comprehension",d:"Medium",q:"Didactic writing primarily aims to",o:{A:"Entertain the reader",B:"Persuade through emotion",C:"Describe vividly",D:"Teach or instruct"},a:"D",e:"Didactic = intended to teach or instruct."},
  {id:"e009",s:"Use of English",y:2018,t:"Novel",d:"Medium",q:"In Dependence is set primarily in",o:{A:"Nigeria and Britain",B:"Nigeria and USA",C:"Ghana and France",D:"South Africa and Britain"},a:"A",e:"Tayo moves between Nigeria and Oxford, England."},
  {id:"e010",s:"Use of English",y:2019,t:"Novel",d:"Medium",q:"In Sweet Sixteen, Aliya's father is best described as",o:{A:"Authoritarian",B:"Progressive, warm, and communicative",C:"Absent",D:"Religiously strict"},a:"B",e:"He engages Aliya in thoughtful coming-of-age conversations."},
  {id:"e011",s:"Use of English",y:2020,t:"Cloze",d:"Medium",q:"The minister's speech was full of _______ that impressed no one.",o:{A:"precision",B:"humility",C:"bombast",D:"candour"},a:"C",e:"Bombast = inflated, high-sounding language with little meaning."},
  {id:"e012",s:"Use of English",y:2021,t:"Novel",d:"Medium",q:"In The Life Changer, which character illustrates the dangers of drug abuse?",o:{A:"Salma",B:"Omar",C:"Ummi",D:"Talle"},a:"D",e:"Talle's descent into drug abuse is the cautionary tale."},
  {id:"e013",s:"Use of English",y:2022,t:"Novel",d:"Hard",q:"The title The Life Changer primarily refers to",o:{A:"Education as transformation",B:"University campus",C:"The protagonist's mother",D:"The drug that ruins Talle"},a:"A",e:"Central theme: education changes lives for better or worse."},
  {id:"e014",s:"Use of English",y:2023,t:"Oral English",d:"Hard",q:"Which pair are minimal pairs based on vowel contrast?",o:{A:"cut / cup",B:"bit / bat",C:"sing / ring",D:"ship / chip"},a:"B",e:"Bit and bat differ only in vowel sound."},
  {id:"e015",s:"Use of English",y:2024,t:"Lexis",d:"Medium",q:"He was found guilty _______ murder.",o:{A:"for",B:"about",C:"of",D:"with"},a:"C",e:"Fixed collocation: guilty of."},
  {id:"e016",s:"Use of English",y:2010,t:"Comprehension",d:"Easy",q:"A narrator using I is using",o:{A:"Third person omniscient",B:"Second person",C:"Third person limited",D:"First person"},a:"D",e:"First-person narration uses I and we."},
  {id:"e017",s:"Use of English",y:2011,t:"Lexis",d:"Medium",q:"The antonym of VERBOSE is",o:{A:"Concise",B:"Talkative",C:"Fluent",D:"Eloquent"},a:"A",e:"Verbose = too wordy; antonym = concise."},
  {id:"e018",s:"Use of English",y:2012,t:"Novel",d:"Medium",q:"The central theme of The Potter's Wheel is",o:{A:"Political corruption",B:"A boy's journey to maturity through discipline",C:"War and conflict",D:"Religious conversion"},a:"B",e:"Obu's boarding school experience — bildungsroman."},
  {id:"e019",s:"Use of English",y:2013,t:"Oral English",d:"Medium",q:"Photograph is stressed on the",o:{A:"Third syllable",B:"Second syllable",C:"First syllable",D:"All syllables equally"},a:"C",e:"PHO-to-graph: primary stress on first syllable."},
  {id:"e020",s:"Use of English",y:2014,t:"Lexis",d:"Hard",q:"Which sentence has correct subject-verb agreement?",o:{A:"Neither of the students have submitted",B:"Neither students has submitted",C:"Neither student have submitted",D:"Neither of the students has submitted his work"},a:"D",e:"Neither takes singular verb."},
  {id:"e021",s:"Use of English",y:2015,t:"Comprehension",d:"Medium",q:"Giving human qualities to abstract ideas is called",o:{A:"Personification",B:"Metaphor",C:"Simile",D:"Hyperbole"},a:"A",e:"Personification: the wind whispered, justice is blind."},
  {id:"e022",s:"Use of English",y:2016,t:"Oral English",d:"Hard",q:"Which word contains a completely silent consonant?",o:{A:"Bright",B:"Knife",C:"Bread",D:"Trust"},a:"B",e:"Knife: k is silent, pronounced nife."},
  {id:"e023",s:"Use of English",y:2017,t:"Lexis",d:"Medium",q:"The correct collocation is: He made a _______ decision.",o:{A:"hasty-minded",B:"quick-minded",C:"rash",D:"fast"},a:"C",e:"Rash decision = standard collocation meaning poorly considered."},
  {id:"e024",s:"Use of English",y:2018,t:"Novel",d:"Hard",q:"The key literary technique in In Dependence is",o:{A:"Stream of consciousness",B:"Dramatic monologue",C:"Magical realism",D:"Epistolary form (letters)"},a:"D",e:"Manyika uses letters to convey emotional distance."},
  {id:"e025",s:"Use of English",y:2019,t:"Novel",d:"Hard",q:"Sweet Sixteen is best described as",o:{A:"Coming-of-age novel",B:"Political satire",C:"Historical fiction",D:"Tragic romance"},a:"A",e:"Aliya's conversations with her father — coming-of-age."},
  {id:"e026",s:"Use of English",y:2020,t:"Lexis",d:"Easy",q:"A synonym of DILIGENT is",o:{A:"Lazy",B:"Hardworking",C:"Clever",D:"Dishonest"},a:"B",e:"Diligent = careful and persistent = hardworking."},
  {id:"e027",s:"Use of English",y:2021,t:"Comprehension",d:"Medium",q:"Verbal irony involves",o:{A:"Saying exactly what you mean",B:"Exaggerating for effect",C:"Saying the opposite of what you mean for effect",D:"Comparing two unlike things"},a:"C",e:"Verbal irony: saying the opposite of what is meant."},
  {id:"e028",s:"Use of English",y:2022,t:"Novel",d:"Medium",q:"Ummi in The Life Changer represents",o:{A:"A villain",B:"An insignificant character",C:"A drug addict",D:"A positive role model succeeding through hard work"},a:"D",e:"Ummi is focused, disciplined, morally grounded."},
  {id:"e029",s:"Use of English",y:2023,t:"Oral English",d:"Medium",q:"Economics is stressed as",o:{A:"ec-o-NOM-ics",B:"e-co-NO-mics",C:"E-CO-no-mics",D:"EC-o-nom-ics"},a:"A",e:"Economics: stress on third syllable."},
  {id:"e030",s:"Use of English",y:2024,t:"Novel",d:"Medium",q:"The Lekki Headmaster is set in",o:{A:"Rural northern village",B:"Lagos suburban school",C:"Abuja government office",D:"British university"},a:"B",e:"Set in Lekki area of Lagos."},
  {id:"e031",s:"Use of English",y:2010,t:"Lexis",d:"Hard",q:"Correctly completed: The committee _______ reached its decision.",o:{A:"have",B:"are",C:"has",D:"were"},a:"C",e:"Committee as collective noun takes singular verb."},
  {id:"e032",s:"Use of English",y:2011,t:"Comprehension",d:"Medium",q:"A passage arguing for and against a proposition is",o:{A:"Narrative",B:"Expository",C:"Descriptive",D:"Argumentative or Discursive"},a:"D",e:"Discursive essay presents multiple perspectives."},
  {id:"e033",s:"Use of English",y:2012,t:"Novel",d:"Hard",q:"The Potter's Wheel title metaphorically represents",o:{A:"The school shaping students like clay",B:"Industrial production",C:"Obu's father's job",D:"Traditional craft"},a:"A",e:"Potter shapes clay; school shapes students."},
  {id:"e034",s:"Use of English",y:2013,t:"Oral English",d:"Easy",q:"How many syllables are in international?",o:{A:"4",B:"5",C:"6",D:"3"},a:"B",e:"in-ter-na-tion-al = 5 syllables."},
  {id:"e035",s:"Use of English",y:2014,t:"Lexis",d:"Medium",q:"Medicine should be taken _______ meals.",o:{A:"at",B:"in",C:"after",D:"by"},a:"C",e:"After meals: correct medical instruction collocation."},
  {id:"e036",s:"Use of English",y:2015,t:"Oral English",d:"Medium",q:"The homophone of knight is",o:{A:"Right",B:"Knit",C:"Bright",D:"Night"},a:"D",e:"Knight and night are both pronounced nite."},
  {id:"e037",s:"Use of English",y:2016,t:"Lexis",d:"Medium",q:"I would rather _______ than lie.",o:{A:"stay silent",B:"staying silent",C:"to stay silent",D:"have stayed silent"},a:"A",e:"Would rather + bare infinitive."},
  {id:"e038",s:"Use of English",y:2017,t:"Novel",d:"Medium",q:"Nigeria gained independence in",o:{A:"1957",B:"1960",C:"1963",D:"1966"},a:"B",e:"Nigeria independence: 1 October 1960."},
  {id:"e039",s:"Use of English",y:2018,t:"Novel",d:"Medium",q:"The main narrative device in Sweet Sixteen is",o:{A:"Flashback",B:"Letters between friends",C:"Father-daughter conversations",D:"Dream sequence"},a:"C",e:"Structure: conversations between Aliya and her father."},
  {id:"e040",s:"Use of English",y:2019,t:"Lexis",d:"Medium",q:"The odd one out among these words is",o:{A:"Huge",B:"Enormous",C:"Gigantic",D:"Tiny"},a:"D",e:"Tiny = very small; others = very large."},
  {id:"e041",s:"Use of English",y:2020,t:"Oral English",d:"Hard",q:"In which word is gh completely silent?",o:{A:"Though",B:"Cough",C:"Ghost",D:"Rough"},a:"A",e:"Though: gh completely silent, pronounced tho."},
  {id:"e042",s:"Use of English",y:2021,t:"Comprehension",d:"Medium",q:"Alliteration repeats",o:{A:"Vowel sounds",B:"Initial consonant sounds in connected words",C:"Entire phrases",D:"Rhyming end words"},a:"B",e:"Alliteration: repeated initial consonant sounds."},
  {id:"e043",s:"Use of English",y:2022,t:"Lexis",d:"Medium",q:"Which word is correctly spelt?",o:{A:"Accomodation",B:"Accommadation",C:"Accommodation",D:"Acommodation"},a:"C",e:"Accommodation: double c, double m."},
  {id:"e044",s:"Use of English",y:2023,t:"Novel",d:"Medium",q:"The Life Changer was authored by",o:{A:"Wole Soyinka",B:"Chinua Achebe",C:"Chimamanda Adichie",D:"Khadija Abubakar Jalli"},a:"D",e:"Khadija Abubakar Jalli wrote The Life Changer."},
  {id:"e045",s:"Use of English",y:2024,t:"Lexis",d:"Medium",q:"The word nearest in meaning to OBSTINATE is",o:{A:"Stubborn",B:"Flexible",C:"Obedient",D:"Timid"},a:"A",e:"Obstinate = stubbornly refusing to change."},
  {id:"e046",s:"Use of English",y:2010,t:"Oral English",d:"Medium",q:"In which word is stress on the FIRST syllable?",o:{A:"comPUTE",B:"PHOtograph",C:"econOMICS",D:"adoLEScent"},a:"B",e:"PHO-to-graph: primary stress on first syllable."},
  {id:"e047",s:"Use of English",y:2011,t:"Comprehension",d:"Easy",q:"A simile compares two things using",o:{A:"is or are",B:"no connective",C:"like or as",D:"apostrophe"},a:"C",e:"Simile: She is like a rose."},
  {id:"e048",s:"Use of English",y:2012,t:"Lexis",d:"Medium",q:"EPHEMERAL means",o:{A:"Permanent",B:"Mysterious",C:"Enormous",D:"Lasting only a short time"},a:"D",e:"Ephemeral: lasting for a very short time."},
  {id:"e049",s:"Use of English",y:2013,t:"Novel",d:"Medium",q:"The author of The Potter's Wheel is",o:{A:"Chukwuemeka Ike",B:"Chinua Achebe",C:"T.M. Aluko",D:"Wole Soyinka"},a:"A",e:"Chukwuemeka Ike wrote The Potter's Wheel."},
  {id:"e050",s:"Use of English",y:2014,t:"Oral English",d:"Hard",q:"Which pair are homophones?",o:{A:"Bit and beat",B:"Fair and fare",C:"Sit and set",D:"Cot and coat"},a:"B",e:"Fair and fare are both pronounced fair."},
  {id:"e051",s:"Use of English",y:2015,t:"Lexis",d:"Medium",q:"Choose the correct collocation: The surgeon performed a _______ operation.",o:{A:"sensitive",B:"fragile",C:"delicate",D:"tender"},a:"C",e:"Delicate operation = standard medical collocation."},
  {id:"e052",s:"Use of English",y:2016,t:"Comprehension",d:"Easy",q:"The purpose of a topic sentence is to",o:{A:"Conclude the paragraph",B:"Add descriptive detail",C:"Provide evidence",D:"Introduce the main idea"},a:"D",e:"A topic sentence states the main idea of a paragraph."},
  {id:"e053",s:"Use of English",y:2017,t:"Oral English",d:"Medium",q:"Which word rhymes with THOUGH?",o:{A:"Dough",B:"Cough",C:"Tough",D:"Through"},a:"A",e:"Though rhymes with dough, both pronounced oh."},
  {id:"e054",s:"Use of English",y:2018,t:"Lexis",d:"Hard",q:"OSTENTATIOUS is closest in meaning to",o:{A:"Modest",B:"Showy",C:"Reserved",D:"Generous"},a:"B",e:"Ostentatious = displaying wealth to impress others."},
  {id:"e055",s:"Use of English",y:2019,t:"Comprehension",d:"Medium",q:"A writer using second person intends to",o:{A:"Create distance",B:"Describe events objectively",C:"Address the reader directly",D:"Narrate in hindsight"},a:"C",e:"Second person you directly addresses the reader."},
  {id:"e056",s:"Use of English",y:2020,t:"Oral English",d:"Medium",q:"Which word is a perfect example of a plosive consonant?",o:{A:"fan",B:"van",C:"man",D:"pan"},a:"D",e:"Pan begins with the voiceless bilabial plosive p."},
  {id:"e057",s:"Use of English",y:2021,t:"Lexis",d:"Medium",q:"Choose the correct preposition: She is married _______ a doctor.",o:{A:"to",B:"with",C:"for",D:"by"},a:"A",e:"Married to: correct fixed preposition."},
  {id:"e058",s:"Use of English",y:2022,t:"Comprehension",d:"Easy",q:"A rhetorical question is asked for",o:{A:"A factual answer",B:"Effect, not an answer",C:"Formal writing only",D:"Clarification"},a:"B",e:"Rhetorical question: asked for effect, no answer expected."},
  {id:"e059",s:"Use of English",y:2023,t:"Lexis",d:"Medium",q:"The word LACONIC means",o:{A:"Talkative",B:"Confused",C:"Using very few words",D:"Aggressive"},a:"C",e:"Laconic: brief and using very few words."},
  {id:"e060",s:"Use of English",y:2024,t:"Oral English",d:"Medium",q:"In which word does ough sound like aw in law?",o:{A:"Tough",B:"Enough",C:"Through",D:"Thought"},a:"D",e:"Thought: ough sounds like aw."},
  {id:"e061",s:"Use of English",y:2010,t:"Lexis",d:"Medium",q:"AMELIORATE means",o:{A:"Improve",B:"Worsen",C:"Evaluate",D:"Ignore"},a:"A",e:"Ameliorate = to make something better."},
  {id:"e062",s:"Use of English",y:2011,t:"Comprehension",d:"Medium",q:"Onomatopoeia refers to words that",o:{A:"Rhyme with each other",B:"Imitate the sound they describe",C:"Have opposite meanings",D:"Are borrowed from other languages"},a:"B",e:"Onomatopoeia: buzz, hiss, clang."},
  {id:"e063",s:"Use of English",y:2012,t:"Oral English",d:"Hard",q:"The word present used as an ADJECTIVE is stressed on the",o:{A:"Second syllable",B:"Third syllable",C:"First syllable",D:"Both equally"},a:"C",e:"PREsent as adjective; preSENT as verb."},
  {id:"e064",s:"Use of English",y:2013,t:"Lexis",d:"Medium",q:"The thief was caught _______ the act.",o:{A:"by",B:"on",C:"at",D:"in"},a:"D",e:"Caught in the act: fixed expression."},
  {id:"e065",s:"Use of English",y:2014,t:"Comprehension",d:"Hard",q:"Pathetic fallacy means",o:{A:"Using weather or nature to reflect human emotions",B:"Weak arguments",C:"A logical fallacy",D:"Exaggerated praise"},a:"A",e:"Pathetic fallacy: attributing emotions to nature."},
  {id:"e066",s:"Use of English",y:2015,t:"Novel",d:"Medium",q:"Sweet Sixteen was written by",o:{A:"Chimamanda Adichie",B:"Bolaji Abdullahi",C:"Wole Soyinka",D:"Chinua Achebe"},a:"B",e:"Bolaji Abdullahi wrote Sweet Sixteen."},
  {id:"e067",s:"Use of English",y:2016,t:"Oral English",d:"Medium",q:"How many phonemes are in CHURCH?",o:{A:"5",B:"4",C:"3",D:"6"},a:"C",e:"Church: ch + er + ch = 3 phonemes."},
  {id:"e068",s:"Use of English",y:2017,t:"Lexis",d:"Easy",q:"AMIABLE means",o:{A:"Hostile",B:"Arrogant",C:"Ambitious",D:"Friendly and pleasant"},a:"D",e:"Amiable = having a friendly and pleasant manner."},
  {id:"e069",s:"Use of English",y:2018,t:"Comprehension",d:"Medium",q:"A euphemism is a word or phrase that",o:{A:"Is a polite substitute for something unpleasant",B:"Is rude and offensive",C:"Exaggerates the truth",D:"Contradicts itself"},a:"A",e:"Euphemism: passed away for died; let go for fired."},
  {id:"e070",s:"Use of English",y:2019,t:"Oral English",d:"Medium",q:"Which has a FALLING tone in a declarative sentence?",o:{A:"Yes",B:"She left.",C:"Really?",D:"Where?"},a:"B",e:"Declarative sentences typically end with a falling tone."},
  {id:"e071",s:"Use of English",y:2020,t:"Lexis",d:"Medium",q:"The plural of PHENOMENON is",o:{A:"Phenomenons",B:"Phenomenas",C:"Phenomena",D:"Phenomenes"},a:"C",e:"Phenomena is the correct Greek-origin plural."},
  {id:"e072",s:"Use of English",y:2021,t:"Comprehension",d:"Easy",q:"A synonym for MELANCHOLY is",o:{A:"Joy",B:"Surprise",C:"Anger",D:"Sadness"},a:"D",e:"Melancholy = a deep, pensive sadness."},
  {id:"e073",s:"Use of English",y:2022,t:"Oral English",d:"Hard",q:"Which pair of words are HOMOPHONES?",o:{A:"All of the above",B:"Write and right",C:"Bear and bare",D:"Sea and see"},a:"A",e:"All three pairs are homophones."},
  {id:"e074",s:"Use of English",y:2023,t:"Lexis",d:"Medium",q:"TRUNCATE means",o:{A:"Expand",B:"Shorten by cutting off",C:"Translate",D:"Repeat"},a:"B",e:"Truncate = shorten by cutting off part."},
  {id:"e075",s:"Use of English",y:2024,t:"Comprehension",d:"Medium",q:"Hyperbole is a figure of speech that involves",o:{A:"Understatement",B:"Comparison using like or as",C:"Exaggeration for emphasis",D:"Personification of objects"},a:"C",e:"Hyperbole: I have told you a million times!"},
  {id:"e076",s:"Use of English",y:2010,t:"Oral English",d:"Medium",q:"The consonant sound at the end of SING is",o:{A:"s",B:"n",C:"g",D:"the ng sound"},a:"D",e:"Sing ends with the velar nasal ng sound."},
  {id:"e077",s:"Use of English",y:2011,t:"Lexis",d:"Hard",q:"PROPITIOUS means",o:{A:"Giving a good chance of success",B:"Unfavourable",C:"Ordinary",D:"Secret"},a:"A",e:"Propitious = favourably auspicious."},
  {id:"e078",s:"Use of English",y:2012,t:"Comprehension",d:"Medium",q:"An oxymoron combines",o:{A:"Two synonyms",B:"Two contradictory terms",C:"A noun and a verb",D:"Two rhyming words"},a:"B",e:"Oxymoron: deafening silence, bittersweet."},
  {id:"e079",s:"Use of English",y:2013,t:"Lexis",d:"Easy",q:"CANDID means",o:{A:"Deceitful",B:"Wealthy",C:"Frank and outspoken",D:"Careful"},a:"C",e:"Candid = truthful and straightforward."},
  {id:"e080",s:"Use of English",y:2014,t:"Oral English",d:"Hard",q:"In nation, the vowel in the second syllable is",o:{A:"Short a",B:"Short i",C:"Long a",D:"Schwa"},a:"D",e:"Nation: second syllable has schwa sound."},
  {id:"e081",s:"Use of English",y:2015,t:"Lexis",d:"Medium",q:"Choose the correct sentence.",o:{A:"He has gone to school",B:"He have gone to school",C:"He has went to school",D:"He had went to school"},a:"A",e:"Has gone: present perfect, correct form."},
  {id:"e082",s:"Use of English",y:2016,t:"Comprehension",d:"Easy",q:"The introduction of an essay should",o:{A:"Summarise all points",B:"Capture attention and state the main idea",C:"Give the writer's conclusion",D:"List all evidence"},a:"B",e:"Introduction: engage reader and state main idea."},
  {id:"e083",s:"Use of English",y:2017,t:"Lexis",d:"Medium",q:"GREGARIOUS means",o:{A:"Shy and reserved",B:"Aggressive",C:"Fond of company; sociable",D:"Careless"},a:"C",e:"Gregarious = liking to be with other people."},
  {id:"e084",s:"Use of English",y:2018,t:"Oral English",d:"Medium",q:"The word DEBT is pronounced",o:{A:"dɛbt",B:"diːt",C:"diːbt",D:"dɛt"},a:"D",e:"Debt: the b is silent, pronounced det."},
  {id:"e085",s:"Use of English",y:2019,t:"Lexis",d:"Hard",q:"SYCOPHANT means",o:{A:"A flatterer who seeks favour",B:"A medical expert",C:"A military officer",D:"A type of plant"},a:"A",e:"Sycophant = person who flatters for gain."},
  {id:"e086",s:"Use of English",y:2020,t:"Comprehension",d:"Medium",q:"A prose passage written in first person reflecting private thoughts is a",o:{A:"Biography",B:"Diary or Journal",C:"Report",D:"Essay"},a:"B",e:"First-person private thoughts = diary or journal."},
  {id:"e087",s:"Use of English",y:2021,t:"Lexis",d:"Medium",q:"The word that best completes: He _______ to the terms of the contract is",o:{A:"accepted",B:"admitted",C:"agreed",D:"acceded"},a:"C",e:"Agreed to the terms: correct collocation."},
  {id:"e088",s:"Use of English",y:2022,t:"Oral English",d:"Hard",q:"How many syllables does PARLIAMENTARY have?",o:{A:"4",B:"5",C:"7",D:"6"},a:"D",e:"par-lia-men-ta-ry = 5 or 6 syllables depending on pronunciation."},
  {id:"e089",s:"Use of English",y:2023,t:"Lexis",d:"Medium",q:"REPUDIATE means",o:{A:"Reject or disown",B:"Accept eagerly",C:"Praise highly",D:"Ignore"},a:"A",e:"Repudiate = refuse to accept; reject."},
  {id:"e090",s:"Use of English",y:2024,t:"Comprehension",d:"Easy",q:"A conclusion in an essay should",o:{A:"Introduce new points",B:"Restate main points and give a final thought",C:"List only evidence",D:"Begin with a rhetorical question"},a:"B",e:"Conclusion: summarise and give final thought."},
  {id:"e091",s:"Use of English",y:2010,t:"Lexis",d:"Medium",q:"CIRCUMSPECT means",o:{A:"Bold and raring",B:"Happy and content",C:"Wary and unwilling to take risks",D:"Confused"},a:"C",e:"Circumspect = cautious, wary."},
  {id:"e092",s:"Use of English",y:2011,t:"Oral English",d:"Hard",q:"Which word has primary stress on the THIRD syllable?",o:{A:"Beautiful",B:"Comfortable",C:"Happiness",D:"Entertainment"},a:"D",e:"En-ter-TAIN-ment: stress on third syllable."},
  {id:"e093",s:"Use of English",y:2012,t:"Lexis",d:"Medium",q:"The plural of CRITERION is",o:{A:"Criteria",B:"Criterias",C:"Criterions",D:"Criteriems"},a:"A",e:"Criteria is the correct Greek-origin plural."},
  {id:"e094",s:"Use of English",y:2013,t:"Comprehension",d:"Medium",q:"The tone of a passage refers to the writer's",o:{A:"Choice of vocabulary",B:"Attitude toward the subject",C:"Use of punctuation",D:"Sentence length"},a:"B",e:"Tone = writer's attitude as reflected in the writing."},
  {id:"e095",s:"Use of English",y:2014,t:"Novel",d:"Medium",q:"In Dependence was written by",o:{A:"Chimamanda Adichie",B:"Chinua Achebe",C:"Sarah Ladipo Manyika",D:"Wole Soyinka"},a:"C",e:"Sarah Ladipo Manyika wrote In Dependence."},
  {id:"e096",s:"Use of English",y:2015,t:"Lexis",d:"Easy",q:"INDIGENT means",o:{A:"Native",B:"Industrious",C:"Angry",D:"Very poor"},a:"D",e:"Indigent = poor, needy."},
  {id:"e097",s:"Use of English",y:2016,t:"Comprehension",d:"Medium",q:"An analogy is used to",o:{A:"Explain something by comparing it to something familiar",B:"Contradict an argument",C:"Exaggerate a point",D:"List examples"},a:"A",e:"Analogy: explaining unfamiliar by comparing to familiar."},
  {id:"e098",s:"Use of English",y:2017,t:"Oral English",d:"Medium",q:"The sound th as in THINK is",o:{A:"A voiced dental fricative",B:"A voiceless dental fricative",C:"A bilabial plosive",D:"An alveolar fricative"},a:"B",e:"The voiceless dental fricative is used in think, three."},
  {id:"e099",s:"Use of English",y:2018,t:"Lexis",d:"Hard",q:"TACITURN means",o:{A:"Talkative",B:"Angry",C:"Habitually silent",D:"Generous"},a:"C",e:"Taciturn = reserved, saying little."},
  {id:"e100",s:"Use of English",y:2019,t:"Comprehension",d:"Easy",q:"The setting of a story refers to",o:{A:"The main character",B:"The resolution",C:"The problem in the story",D:"The time and place where events occur"},a:"D",e:"Setting = time and place of events."}
];

// ─── STORAGE ──────────────────────────────────────────────────────────────────
const initStore = () => ({ sessions:[], subjectStats:{}, topicStats:{}, totalQ:0, totalC:0 });

// Dual-layer storage: Capacitor Preferences (native, survives reinstalls) + localStorage fallback
const CAP_AVAIL = typeof window!=='undefined' && window.Capacitor && window.Capacitor.isPluginAvailable && window.Capacitor.isPluginAvailable('Preferences');

async function capGet(key){
  if(!CAP_AVAIL) return null;
  try{
    const {Preferences} = await import('@capacitor/preferences');
    const {value} = await Preferences.get({key});
    return value;
  }catch(e){ return null; }
}
async function capSet(key,value){
  if(!CAP_AVAIL) return;
  try{
    const {Preferences} = await import('@capacitor/preferences');
    await Preferences.set({key,value});
  }catch(e){}
}
async function capRemove(key){
  if(!CAP_AVAIL) return;
  try{
    const {Preferences} = await import('@capacitor/preferences');
    await Preferences.remove({key});
  }catch(e){}
}

async function loadStore(){
  try{
    // Try native Preferences first (survives APK reinstalls)
    const native = await capGet(SKEY);
    if(native) return JSON.parse(native);
    // Fall back to localStorage (web/PWA)
    const s=localStorage.getItem(SKEY);
    if(s){
      const parsed=JSON.parse(s);
      // Migrate to native storage
      await capSet(SKEY,s);
      return parsed;
    }
    return initStore();
  }
  catch(e){ return initStore(); }
}
async function saveStore(s){
  try{
    const json=JSON.stringify(s);
    await capSet(SKEY,json);          // native (primary)
    localStorage.setItem(SKEY,json);  // localStorage (backup/web)
    return true;
  }
  catch(e){ return false; }
}
async function clearStore(){
  try{
    await capRemove(SKEY);
    localStorage.removeItem(SKEY);
  }catch(e){}
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

function subjectCount(sub){ return sub==="Use of English"?60:40; }

function buildExam(mode,cfg,bank){
  if(mode==="subject"){
    let p=[...bank].filter(q=>q.s===cfg.subject);
    const maxQ=subjectCount(cfg.subject);
    return shuffle(p).slice(0,Math.min(cfg.count||maxQ,maxQ));
  }
  if(mode==="mixed"){
    const subs=cfg.subjects||["Use of English","Biology","Chemistry","Physics"];
    let out=[];
    subs.forEach(sub=>{
      const perSub=cfg.perSubject?.[sub]||subjectCount(sub);
      let pool=[...bank].filter(q=>q.s===sub);
      if(cfg.year) pool=pool.filter(q=>q.y===cfg.year);
      out=out.concat(shuffle(pool).slice(0,perSub));
    });
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
const VERSION_URL="https://getrooster.onrender.com/downloads/version.json";
const UPDATE_INTERVAL_MS=6*60*60*1000; // 6 hours

// Compare semver strings: returns true if remote > local
function isNewerVersion(remote,local){
  try{
    const r=remote.split(".").map(Number);
    const l=local.split(".").map(Number);
    for(let i=0;i<3;i++){
      if((r[i]||0)>(l[i]||0)) return true;
      if((r[i]||0)<(l[i]||0)) return false;
    }
    return false;
  }catch{ return false; }
}

async function checkForUpdate(){
  try{
    const res=await fetch(VERSION_URL,{cache:"no-store"});
    if(!res.ok) return null;
    const data=await res.json();
    // data: { version, whatsNew: [], apkUrl }
    if(data.version && isNewerVersion(data.version,VERSION)){
      return{ version:data.version, whatsNew:data.whatsNew||[], apkUrl:data.apkUrl };
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
const CSS = `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
:root{
  --bg:#1a1714;--bg2:#201d1a;--bg3:#272320;--bg4:#2f2b27;
  --accent:#da7756;--accent2:#bd5f3e;--accent-glow:rgba(218,119,86,0.3);
  --green:#7fb77e;--amber:#e8a87c;--red:#c9614a;
  --text:#ede8e3;--text2:#b3a69c;--text3:#7c6e63;
  --border:#2a2622;--border2:#3e3731;
  --r:16px;--r2:12px;--r3:8px;
  --font:'Poppins',sans-serif;--mono:'JetBrains Mono',monospace;
  --cbg:#201d1a;--cbo:#2f2b27;--obg:#201d1a;--obo:#3e3731;
  --navbg:rgba(26,23,20,0.97);
}
body{background:var(--bg);color:var(--text);font-family:var(--font);min-height:100vh;}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-track{background:#201d1a;}
::-webkit-scrollbar-thumb{background:#da7756;border-radius:10px;}
.app{max-width:430px;margin:0 auto;min-height:100vh;background:var(--bg);display:flex;flex-direction:column;position:relative;}
.screen{flex:1;padding:24px 16px 96px;overflow-y:auto;}
.nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:var(--navbg);backdrop-filter:blur(20px);border-top:1px solid var(--border2);display:flex;justify-content:space-around;padding:10px 0 20px;z-index:100;}
.nb{display:flex;flex-direction:column;align-items:center;gap:3px;background:none;border:none;color:var(--text3);cursor:pointer;transition:color .15s;padding:4px 18px;}
.nb.on{color:var(--accent);}
.nb span{font-size:10px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;}
.card{background:var(--cbg);border:1px solid var(--cbo);border-radius:var(--r);padding:16px;}
.card-acc{background:linear-gradient(135deg,rgba(218,119,86,.08),rgba(189,95,62,.04));border:1px solid rgba(218,119,86,.25);border-radius:var(--r);padding:18px;}
.update-banner{background:linear-gradient(135deg,rgba(127,183,126,.1),rgba(218,119,86,.07));border:1px solid rgba(127,183,126,.28);border-radius:var(--r2);padding:12px 14px;margin-bottom:16px;display:flex;align-items:center;gap:10px;}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:14px 20px;border-radius:var(--r2);border:none;font-family:var(--font);font-weight:600;font-size:15px;cursor:pointer;transition:all .12s;width:100%;}
.btn:disabled{opacity:.35;cursor:not-allowed;}
.bp{background:linear-gradient(105deg,#da7756,#bd5f3e);color:#1a1714;border:1px solid rgba(255,215,190,.4);box-shadow:0 6px 18px -4px var(--accent-glow);}
.bp:active:not(:disabled){background:linear-gradient(105deg,#c96845,#a84f30);transform:scale(.98);}
.bg{background:transparent;color:var(--text2);border:1px solid var(--border2);}
.bg:active{background:var(--bg3);}
.bd{background:rgba(201,97,74,.1);color:var(--red);border:1px solid rgba(201,97,74,.22);}
.bsm{padding:8px 14px;font-size:13px;border-radius:var(--r3);width:auto;}
.bdg{display:inline-flex;align-items:center;padding:3px 9px;border-radius:999px;font-size:11px;font-weight:700;}
.deasy{background:rgba(127,183,126,.12);color:var(--green);}
.dmed{background:rgba(232,168,124,.12);color:var(--amber);}
.dhard{background:rgba(201,97,74,.12);color:var(--red);}
.bok{background:rgba(127,183,126,.12);color:var(--green);}
.bfail{background:rgba(201,97,74,.12);color:var(--red);}
.prog{height:4px;border-radius:999px;background:var(--bg4);overflow:hidden;}
.pf{height:100%;border-radius:999px;transition:width .3s;}
.tmr{display:inline-flex;align-items:center;gap:6px;background:var(--bg3);border:1px solid var(--border2);border-radius:999px;padding:6px 14px;font-family:var(--mono);font-weight:700;font-size:14px;}
.tw{border-color:rgba(232,168,124,.4);color:var(--amber);}
.tc{border-color:rgba(201,97,74,.4);color:var(--red);animation:pulse 1s infinite;}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
.opt{display:flex;align-items:flex-start;gap:12px;padding:14px;border-radius:var(--r2);border:1.5px solid var(--obo);background:var(--obg);cursor:pointer;transition:all .12s;margin-bottom:10px;}
.opt:active{transform:scale(.99);}
.osel{border-color:var(--accent)!important;background:rgba(218,119,86,.07)!important;}
.ocor{border-color:var(--green)!important;background:rgba(127,183,126,.07)!important;}
.owrng{border-color:var(--red)!important;background:rgba(201,97,74,.07)!important;}
.okey{width:28px;height:28px;border-radius:50%;border:1.5px solid var(--border2);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;flex-shrink:0;color:var(--text2);transition:all .12s;}
.osel .okey{border-color:var(--accent);background:var(--accent);color:#1a1714;}
.ocor .okey{border-color:var(--green);background:var(--green);color:#1a1714;}
.owrng .okey{border-color:var(--red);background:var(--red);color:#fff;}
.pg{display:grid;grid-template-columns:repeat(8,1fr);gap:5px;margin:10px 0;}
.pb{aspect-ratio:1;border-radius:6px;border:none;font-size:11px;font-weight:700;cursor:pointer;transition:all .1s;background:var(--bg3);color:var(--text3);}
.pb.pa{background:rgba(218,119,86,.2);color:var(--accent);}
.pb.pf2{background:rgba(232,168,124,.18);color:var(--amber);}
.pb.pc{outline:2px solid var(--accent);outline-offset:1px;color:var(--text);}
.chip{background:var(--bg3);border:1px solid var(--border2);border-radius:999px;padding:6px 14px;font-size:13px;font-weight:600;color:var(--text2);cursor:pointer;transition:all .12s;white-space:nowrap;}
.chip.on{background:var(--accent);color:#1a1714;border-color:var(--accent);box-shadow:0 2px 8px var(--accent-glow);}
.chip:active{transform:scale(.95);}
.tabs{display:flex;background:var(--bg3);border-radius:var(--r2);padding:4px;gap:4px;margin-bottom:20px;}
.tab{flex:1;padding:10px 4px;border:none;background:none;color:var(--text3);font-family:var(--font);font-size:13px;font-weight:600;border-radius:var(--r3);cursor:pointer;transition:all .18s;}
.tab.on{background:var(--cbg);color:var(--text);box-shadow:0 2px 8px rgba(0,0,0,.25);}
.expl{background:rgba(218,119,86,.05);border:1px solid rgba(218,119,86,.18);border-radius:var(--r2);padding:14px;margin-top:12px;}
.yp{padding:7px 13px;border-radius:var(--r3);border:none;background:var(--bg3);color:var(--text2);font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;}
.yp.on{background:var(--accent);color:#1a1714;box-shadow:0 2px 8px var(--accent-glow);}
.yp:active{opacity:.85;}
.sgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;}
.sc{border-radius:var(--r);padding:16px;cursor:pointer;border:2px solid transparent;transition:all .15s;}
.sc:active{transform:scale(.97);}
.sc.on{transform:scale(.98);}
.mc{background:var(--cbg);border:1px solid var(--cbo);border-radius:var(--r);padding:16px;cursor:pointer;transition:background .12s;display:flex;align-items:center;gap:14px;margin-bottom:10px;}
.mc:active{background:var(--bg3);}
.sub-break{border-radius:var(--r2);padding:10px 14px;margin-bottom:14px;display:flex;align-items:center;gap:10px;}
.overlay{position:absolute;inset:0;background:rgba(26,23,20,.95);z-index:200;display:flex;flex-direction:column;padding:20px;overflow-y:auto;}
.lbl{font-size:11px;font-weight:700;letter-spacing:.8px;color:var(--text3);text-transform:uppercase;margin-bottom:10px;}
.row{display:flex;justify-content:space-between;align-items:center;}
.empty{text-align:center;padding:56px 24px;color:var(--text3);}
.empty p{margin-top:10px;font-size:14px;line-height:1.7;}
.tgl{width:46px;height:24px;border-radius:999px;border:none;cursor:pointer;position:relative;transition:background .2s;flex-shrink:0;}
.tgl.on{background:var(--accent);}
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
::-webkit-scrollbar-thumb{background:var(--accent);border-radius:999px;}`;

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App(){
  const [screen,setScreen]=useState("landing");
  const [tab,setTab]=useState("home");

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
    const iv=setInterval(()=>{
      checkForUpdate().then(u=>{ if(u) setUpdate(u); });
    },6*60*60*1000);
    return()=>clearInterval(iv);
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
      <div className="app">
        {screen==="landing"  && <Landing onStart={()=>setScreen("home")}/>}
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
        {screen==="settings" && <SettingsScreen store={store} setStore={setStore}/>}

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
        <img src="/icon-192.png" alt="Rooster" style={{width:80,height:80,borderRadius:24,marginBottom:28,boxShadow:"0 8px 32px rgba(218,119,86,.3)"}}/>
        <div style={{fontSize:52,fontWeight:900,letterSpacing:-2,lineHeight:1,marginBottom:8,
          background:"linear-gradient(135deg,var(--text) 40%,var(--accent))",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
          Rooster
        </div>
        <div style={{fontSize:14,fontWeight:600,color:"var(--text3)",letterSpacing:.5,marginBottom:40}}>
          JAMB UTME Exam Simulator
        </div>
        <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:8,marginBottom:40,maxWidth:320}}>
          {["14 Subjects","400+ Questions","2010–2025","Offline"].map(f=>(
            <span key={f} style={{padding:"6px 14px",borderRadius:999,background:"var(--bg3)",
              border:"1px solid var(--border2)",fontSize:12,fontWeight:700,color:"var(--text2)"}}>
              {f}
            </span>
          ))}
        </div>
        <button className="btn bp" style={{maxWidth:280,borderRadius:999,fontSize:16,
          padding:"16px 40px",boxShadow:"0 8px 24px rgba(218,119,86,.35)"}}
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
            Rooster <span style={{color:"var(--accent)"}}>CBT</span>
          </div>
        </div>
        <div style={{width:48,height:48,borderRadius:"var(--r)",background:"linear-gradient(135deg,#da7756,#bd5f3e)",
          display:"flex",alignItems:"center",justifyContent:"center"}}>
          <img src="/icon-192.png" alt="Rooster" style={{width:40,height:40,borderRadius:12}}/>
        </div>
      </div>

      {update && (
        <div className="update-banner">
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <I n="download" sz={15} c="var(--green)"/>
              <div style={{fontSize:13,fontWeight:800,color:"var(--green)"}}>Update available — v{update.version}</div>
            </div>
            {update.whatsNew.length>0&&(
              <div style={{marginBottom:10}}>
                {update.whatsNew.map((item,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"flex-start",gap:6,marginBottom:3}}>
                    <div style={{width:4,height:4,borderRadius:"50%",background:"var(--accent)",marginTop:5,flexShrink:0}}/>
                    <div style={{fontSize:11,color:"var(--text2)",lineHeight:1.5}}>{item}</div>
                  </div>
                ))}
              </div>
            )}
            <button className="btn bp bsm" style={{width:"auto",padding:"8px 18px",fontSize:12,borderRadius:999}}
              onClick={()=>{ if(typeof window!=="undefined") window.open(update.apkUrl,"_blank"); }}>
              <I n="download" sz={13} c="#1a1714"/> Download Update
            </button>
          </div>
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
                <div style={{fontSize:36,fontWeight:800,fontFamily:"var(--mono)",color:avg>=50?"var(--accent)":"var(--red)"}}>
                  {getScore(totalC,totalQ)}<span style={{fontSize:16,color:"var(--text3)",fontWeight:600}}>/400</span>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:11,color:"var(--text3)",fontWeight:600,marginBottom:2}}>Questions</div>
                <div style={{fontSize:28,fontWeight:800,fontFamily:"var(--mono)"}}>{totalQ}</div>
              </div>
            </div>
            <div className="prog"><div className="pf" style={{width:`${avg}%`,background:"linear-gradient(90deg,#da7756,#bd5f3e)"}}/></div>
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
        {l:"Subjects",sub:"Pick any subject & how many questions",n:"book"},
        {l:"Mixed",sub:"Pick your 4 subjects + optional year",n:"chart"},
      ].map((m,i)=>(
        <div key={i} className="mc" onClick={()=>setScreen("select")}>
          <div style={{width:44,height:44,borderRadius:"var(--r2)",background:"var(--bg4)",
            border:"1px solid var(--border2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <I n={m.n} sz={18} c="var(--accent)"/>
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
                background:s.pct>=50?"rgba(218,119,86,.1)":"rgba(201,97,74,.08)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontFamily:"var(--mono)",fontWeight:800,fontSize:13,
                color:s.pct>=50?"var(--accent)":"var(--red)"}}>
                {s.score}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                  {s.mode==="mixed"?`Mixed (${(s.subjects||[]).join(", ").slice(0,30)||"4 subjects"})${s.year?` · ${s.year}`:""}`:s.subject}
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
  const [count,setCount]=useState(40);
  const [selectedSubs,setSelectedSubs]=useState(["Use of English","Biology","Chemistry","Physics"]);
  const [cluster,setCluster]=useState(null);
  const [mixedYear,setMixedYear]=useState(null);

  // When subject changes, reset count to the correct default
  function pickSubject(s){
    setSubject(s);
    setCount(subjectCount(s));
  }

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

  // per-subject counts map: English=60, others=40
  const perSubMap=Object.fromEntries(selectedSubs.map(s=>[s,subjectCount(s)]));
  const totalQ=selectedSubs.reduce((acc,s)=>acc+subjectCount(s),0);
  const maxCount=subjectCount(subject);
  const countOptions=[10,20,maxCount].filter((v,i,a)=>a.indexOf(v)===i).concat(maxCount===60?[]:[]); // dedupe

  return(
    <div className="screen fade">
      <div className="row" style={{marginBottom:22}}>
        <div style={{fontSize:18,fontWeight:800}}>Configure Exam</div>
        <button className="btn bg bsm" onClick={()=>setScreen("home")}><I n="x" sz={14}/></button>
      </div>

      <div className="lbl">Mode</div>
      <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
        {[{id:"subject",l:"Subjects"},{id:"mixed",l:"Mixed"}].map(m=>(
          <button key={m.id} className={`chip ${mode===m.id?"on":""}`} onClick={()=>setMode(m.id)}>{m.l}</button>
        ))}
      </div>

      {mode==="subject"&&(
        <>
          <div className="lbl">Subject</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:20}}>
            {ALL_SUBJECTS.map(s=>(
              <button key={s} onClick={()=>pickSubject(s)}
                style={{padding:"9px 16px",borderRadius:"var(--r2)",border:"none",
                  background:subject===s?SC[s]:"var(--bg3)",color:subject===s?"#1a1714":"var(--text2)",
                  fontSize:12,fontWeight:700,cursor:"pointer",transition:"all .15s",
                  boxShadow:subject===s?"0 2px 10px "+SC[s]+"66":"none"}}>
                {s}
              </button>
            ))}
          </div>
          <div className="lbl">Number of Questions <span style={{color:"var(--accent)",fontWeight:800}}>max {maxCount}</span></div>
          <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
            {[10,20,maxCount].map(n=><button key={n} className={`chip ${count===n?"on":""}`} onClick={()=>setCount(n)}>{n}</button>)}
          </div>
        </>
      )}

      {mode==="mixed"&&(
        <>
          <div className="lbl">Quick Cluster</div>
          <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
            {Object.keys(CLUSTERS).map(c=>(
              <button key={c} className={`chip ${cluster===c?"on":""}`} onClick={()=>pickCluster(c)}>{c}</button>
            ))}
          </div>
          <div className="lbl">Your 4 Subjects <span style={{color:"var(--accent)",fontWeight:800}}>{selectedSubs.length}/4</span></div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:8}}>
            {ALL_SUBJECTS.map(s=>{
              const on=selectedSubs.includes(s);
              return(
                <button key={s} onClick={()=>toggleSub(s)}
                  style={{padding:"9px 16px",borderRadius:"var(--r2)",border:"none",
                    background:on?SC[s]:"var(--bg3)",color:on?"#1a1714":"var(--text2)",
                    fontSize:12,fontWeight:700,cursor:"pointer",transition:"all .15s",
                    boxShadow:on?"0 2px 10px "+SC[s]+"66":"none"}}>
                  {s}
                </button>
              );
            })}
          </div>
          <div style={{fontSize:11,color:"var(--text3)",marginBottom:20}}>Select up to 4 · tap to toggle · max 4 auto-drops oldest</div>

          <div className="lbl">Year (optional)</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:20}}>
            <button className={`yp ${!mixedYear?"on":""}`} onClick={()=>setMixedYear(null)}>All Years</button>
            {YEARS.map(y=><button key={y} className={`yp ${mixedYear===y?"on":""}`} onClick={()=>setMixedYear(y)}>{y}</button>)}
          </div>

          <div className="card-acc" style={{marginBottom:20}}>
            <div style={{fontSize:13,fontWeight:600,color:"var(--text2)",lineHeight:1.9}}>
              {selectedSubs.map(s=>`${s} (${subjectCount(s)}q)`).join(" → ")}<br/>
              Total: {totalQ} questions · 105 minutes
              {mixedYear&&<> · Year {mixedYear}</>}
            </div>
          </div>
        </>
      )}

      <button className="btn bp"
        onClick={()=>startExam({mode,subject,year:mode==="mixed"?mixedYear:null,count,subjects:selectedSubs,perSubject:perSubMap})}
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
            <span style={{color:"var(--accent)"}}>Answered</span>
            <span style={{color:"var(--amber)"}}>Flagged</span>
            <span style={{color:"var(--text3)"}}>Unanswered</span>
          </div>
          {subjList.length>1?
            subjList.map(sub=>{
              const idxs=questions.reduce((acc,q_,i)=>q_.s===sub?[...acc,i]:acc,[]);
              return(
                <div key={sub} style={{marginBottom:12}}>
                  <div style={{fontSize:10,fontWeight:700,color:SC[sub]||"var(--accent)",letterSpacing:.5,textTransform:"uppercase",marginBottom:6}}>{sub}</div>
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
            <div className="pf" style={{width:`${((currentQ+1)/questions.length)*100}%`,background:"var(--accent)"}}/>
          </div>
          <div style={{fontSize:12,fontWeight:700,fontFamily:"var(--mono)",color:"var(--text2)",whiteSpace:"nowrap"}}>
            {currentQ+1} / {questions.length}
          </div>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          <span style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:999,color:SC[q.s]||"var(--accent)",background:(SC[q.s]||"var(--accent)")+"14"}}>{q.s}</span>
          <span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:999,color:"var(--text3)",background:"var(--bg3)"}}>{q.t}</span>
          <span className={`bdg ${diffCls}`}>{q.d}</span>
          <span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:999,color:"var(--text3)",background:"var(--bg3)",fontFamily:"var(--mono)"}}>{q.y}</span>
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"14px 16px 0"}}>
        {isNewSubj&&(
          <div className="sub-break" style={{background:(SC[q.s]||"var(--accent)")+"12",border:`1px solid ${SC[q.s]||"var(--accent)"}30`}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:SC[q.s]||"var(--accent)",flexShrink:0}}/>
            <div>
              <div style={{fontSize:10,color:"var(--text3)",fontWeight:600}}>Now starting</div>
              <div style={{fontSize:14,fontWeight:700,color:SC[q.s]||"var(--accent)"}}>{q.s}</div>
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
            <div style={{fontSize:11,fontWeight:700,color:"var(--accent)",marginBottom:6,letterSpacing:.5,textTransform:"uppercase"}}>Explanation</div>
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
  const gc=p>=70?"var(--green)":p>=50?"var(--accent)":p>=40?"var(--amber)":"var(--red)";
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
        {[{l:"Correct",v:correct,c:"var(--green)"},{l:"Wrong",v:total-correct,c:"var(--red)"},{l:"Total",v:total,c:"var(--accent)"}].map(s=>(
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
                  <div style={{fontSize:13,fontWeight:800,color:SC[sub]||"var(--accent)",fontFamily:"var(--mono)"}}>{sp}%</div>
                </div>
                <div className="prog"><div className="pf" style={{width:`${sp}%`,background:SC[sub]||"var(--accent)"}}/></div>
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
                    background:isCor?"rgba(34,197,94,.08)":isBad?"rgba(201,97,74,.07)":"var(--bg3)",
                    color:isCor?"var(--green)":isBad?"var(--red)":"var(--text3)"}}>
                    {k}. {v}
                  </div>
                );
              })}
            </div>
            <div className="expl" style={{marginTop:12}}>
              <div style={{fontSize:11,fontWeight:700,color:"var(--accent)",marginBottom:6,letterSpacing:.5,textTransform:"uppercase"}}>Explanation</div>
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
        <div style={{fontSize:44,fontWeight:800,color:avg>=50?"var(--accent)":"var(--red)",fontFamily:"var(--mono)"}}>
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
                  <span style={{fontFamily:"var(--mono)",fontWeight:800,color:SC[s]||"var(--accent)",fontSize:15}}>{sp}%</span>
                </div>
                <div className="prog"><div className="pf" style={{width:`${sp}%`,background:SC[s]||"var(--accent)"}}/></div>
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
              <div style={{width:44,height:44,borderRadius:"var(--r3)",flexShrink:0,background:"rgba(201,97,74,.08)",
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
            background:s.pct>=50?"rgba(218,119,86,.09)":"rgba(201,97,74,.07)",
            display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--mono)",fontWeight:800,fontSize:13,
            color:s.pct>=50?"var(--accent)":"var(--red)"}}>
            {s.score}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
              {s.mode==="mixed"?`Mixed${s.year?` · ${s.year}`:""}`:s.subject}
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
function SettingsScreen({store,setStore}){
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
    {l:"Question Bank",v:`${QB.length} questions`},
    {l:"Exam Duration",v:"105 minutes"},
    {l:"Sessions Stored",v:String(count)},
  ];

  return(
    <div className="screen fade">
      <div style={{fontSize:18,fontWeight:800,marginBottom:24}}>Settings</div>

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
          Send any complaints to frntcoda@gmail.com
        </div>
        {done?(
          <div style={{padding:14,borderRadius:"var(--r3)",background:"rgba(127,183,126,.07)",
            color:"var(--green)",fontSize:14,fontWeight:600,textAlign:"center",border:"1px solid rgba(127,183,126,.18)"}}>
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
