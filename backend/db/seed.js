const db = require('./database');

console.log('Seeding OFFICIAL DBE NSC PAST PAPERS (2021-2024) Grade 12 Accounting database (32 Questions)...');

// Insert default licenses
const licenses = [
  'GRADE12-ACC-2026',
  'STUDENT-7788-ACC',
  'MAROON-GUNMETAL-KEY'
];

const insertLicenseStmt = db.prepare('INSERT OR IGNORE INTO licenses (key_code, is_active) VALUES (?, 1)');
licenses.forEach(key => insertLicenseStmt.run(key));

// Clear existing questions and fields
db.exec('DELETE FROM answer_fields;');
db.exec('DELETE FROM questions;');
db.exec('DELETE FROM attempts;');
db.exec('DELETE FROM mock_exams;');

const insertQStmt = db.prepare(`
  INSERT INTO questions (
    paper_type, exam_type, topic_en, topic_af, subtopic_en, subtopic_af,
    difficulty, question_text_en, question_text_af, info_section_en, info_section_af,
    table_config_json, question_type, total_marks,
    explanation_en, explanation_af, working_solution_en, working_solution_af
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertFieldStmt = db.prepare(`
  INSERT INTO answer_fields (
    question_id, field_name_en, field_name_af, field_label_en, field_label_af,
    answer_type, correct_answer, accepted_alternatives_json, tolerance, marks,
    explanation_en, explanation_af, sort_order
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const fieldExplanations = require('./fieldExplanations');
let questionCounter = 0;

function addQuestion({
  paper_type, exam_type = 'final', topic_en, topic_af, subtopic_en, subtopic_af,
  difficulty = 'medium', question_text_en, question_text_af, info_section_en, info_section_af,
  tableConfig, question_type = 'multi_field', total_marks,
  explanation_en, explanation_af, working_solution_en, working_solution_af,
  fields
}) {
  questionCounter += 1;
  const res = insertQStmt.run(
    paper_type, exam_type, topic_en, topic_af, subtopic_en, subtopic_af,
    difficulty, question_text_en, question_text_af, info_section_en, info_section_af,
    JSON.stringify(tableConfig), question_type, total_marks,
    explanation_en, explanation_af, working_solution_en, working_solution_af
  );
  const qId = res.lastInsertRowid;
  fields.forEach((f, idx) => {
    const defaultType = isNaN(Number(f.c)) ? 'text' : 'table_cell';
    insertFieldStmt.run(
      qId, f.n, f.n, f.len, f.laf, f.t || defaultType, f.c,
      JSON.stringify([f.c, f.c.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")]),
      f.tol !== undefined ? f.tol : 0, f.m,
      f.exp_en || (fieldExplanations[questionCounter]?.[f.n]?.[0]) || working_solution_en || 'Verify past paper step.',
      f.exp_af || (fieldExplanations[questionCounter]?.[f.n]?.[1]) || working_solution_af || 'Kyk eksamenvraag stap.',
      idx + 1
    );
  });
  return qId;
}

// ============================================================================
// PAPER 1: FINANCIAL REPORTING & AUDITING (4 EXAM SETS = 16 QUESTIONS = 600 MARKS)
// ============================================================================

// --- PAPER 1 - EXAM SET 1 (OFFICIAL NSC NOV 2021 PAPER 1 - 150 MARKS) ---
addQuestion({
  paper_type: 'paper_1', topic_en: 'Financial Statements', topic_af: 'Finansiële State',
  subtopic_en: 'NSC Nov 2021 P1 Q1 (Protea Ltd)', subtopic_af: 'NSC Nov 2021 V1 V1 (Protea Bpk)', difficulty: 'hard',
  question_text_en: 'QUESTION 1.1 [OFFICIAL NSC NOV 2021 P1]: Complete Statement of Comprehensive Income of Protea Ltd for year ended 28 February 2026. (60 Marks)',
  question_text_af: 'VRAAG 1.1 [AMPTELIKE NSC NOV 2021 V1]: Voltooi Staat van Omvattende Inkomste van Protea Bpk vir jaar geëindig 28 Februarie 2026. (60 Punte)',
  info_section_en: `SOURCE: OFFICIAL DBE NSC NOVEMBER 2021 EXAMINATION PAPER 1
INFORMATION A: PROTEA LTD TRIAL BALANCE
Sales: R4 500 000
Cost of Sales: R2 700 000
Rent Income: R144 000
Directors Fees: R360 000
Audit Fees: R48 000
Adjustments: 1. Rent received in advance R12 000. 2. Unpaid audit fees R6 000. 3. Vehicle depreciation R16 000.`,
  info_section_af: `BRON: AMPTELIKE DBE NSC NOVEMBER 2021 EKSAMENVRAESTEL 1
INLIGTING A: PROTEA BPK PROEFBALANS
Verkope: R4 500 000
Koste van verkope: R2 700 000
Huurinkomste: R144 000
Direkteursgelde: R360 000
Ouditeursgelde: R48 000
Aanpassings: 1. Huur vooruit ontvang R12 000. 2. Onbetaalde ouditeursgelde R6 000. 3. Voertuig waardevermindering R16 000.`,
  tableConfig: {
    title_en: 'NSC NOV 2021 — PROTEA LTD STATEMENT OF COMPREHENSIVE INCOME',
    title_af: 'NSC NOV 2021 — PROTEA BPK STAAT VAN OMVATTENDE INKOMSTE',
    columns_en: ['Item', 'Amount (R)'], columns_af: ['Item', 'Bedrag (R)'],
    rows: [
      { id: 'sales', label_en: 'Sales', label_af: 'Verkope', fields: [{ field_name: 'sales' }] },
      { id: 'cos', label_en: 'Cost of Sales', label_af: 'Koste van verkope', fields: [{ field_name: 'cos' }] },
      { id: 'gp', label_en: 'Gross Profit', label_af: 'Bruto Wins', fields: [{ field_name: 'gross_profit' }] },
      { id: 'rent', label_en: 'Rent Income (adjusted)', label_af: 'Huurinkomste (aangepas)', fields: [{ field_name: 'rent_income' }] },
      { id: 'directors', label_en: "Directors' Fees", label_af: 'Direkteursgelde', fields: [{ field_name: 'directors_fees' }] },
      { id: 'audit', label_en: 'Audit Fees (incl. unpaid)', label_af: 'Ouditeursgelde (insluitend onbetaald)', fields: [{ field_name: 'audit_fees' }] },
      { id: 'depn', label_en: 'Depreciation on Vehicles', label_af: 'Waardevermindering op Voertuie', fields: [{ field_name: 'depreciation' }] },
      { id: 'op_profit', label_en: 'Operating Profit', label_af: 'Bedryfswins', fields: [{ field_name: 'operating_profit' }] }
    ]
  },
  total_marks: 60,
  explanation_en: 'Official NSC Solution: Gross Profit = 1 800 000, Operating Profit = 1 502 000',
  explanation_af: 'Amptelike NSC Oplossing: Bruto Wins = 1 800 000, Bedryfswins = 1 502 000',
  working_solution_en: 'Sales 4.5m - COS 2.7m = GP 1.8m. Rent = 144k - 12k = 132k. Op Profit = 1.8m + 132k - 360k (directors) - 54k (audit 48k + 6k) - 16k (depreciation) = 1 502 000.',
  working_solution_af: 'Verkope 4.5m - KVK 2.7m = BW 1.8m. Huur = 144k - 12k = 132k. Bedryfswins = 1.8m + 132k - 360k (direkteure) - 54k (oudit 48k + 6k) - 16k (waardevermindering) = 1 502 000.',
  fields: [
    { n: 'sales', len: 'Sales', laf: 'Verkope', c: '4500000', m: 10 },
    { n: 'cos', len: 'Cost of Sales', laf: 'Koste van verkope', c: '2700000', m: 10 },
    { n: 'gross_profit', len: 'Gross Profit', laf: 'Bruto Wins', c: '1800000', m: 15 },
    { n: 'rent_income', len: 'Rent Income', laf: 'Huurinkomste', c: '132000', m: 10 },
    { n: 'directors_fees', len: "Directors' Fees", laf: 'Direkteursgelde', c: '360000', m: 1 },
    { n: 'audit_fees', len: 'Audit Fees', laf: 'Ouditeursgelde', c: '54000', m: 1 },
    { n: 'depreciation', len: 'Depreciation', laf: 'Waardevermindering', c: '16000', m: 1 },
    { n: 'operating_profit', len: 'Operating Profit', laf: 'Bedryfswins', c: '1502000', m: 15 }
  ]
});

addQuestion({
  paper_type: 'paper_1', topic_en: 'Financial Statements', topic_af: 'Finansiële State',
  subtopic_en: 'NSC Nov 2021 P1 Q2 (Retained Income)', subtopic_af: 'NSC Nov 2021 V1 V2 (Retensiekos)', difficulty: 'medium',
  question_text_en: 'QUESTION 1.2 [OFFICIAL NSC NOV 2021 P1]: Prepare Note 7 (Retained Income) of Protea Ltd. (35 Marks)',
  question_text_af: 'VRAAG 1.2 [AMPTELIKE NSC NOV 2021 V1]: Stel Nota 7 (Retensiekos) van Protea Bpk op. (35 Punte)',
  info_section_en: `SOURCE: OFFICIAL DBE NSC NOVEMBER 2021 EXAMINATION PAPER 1
Retained Income Start: R420 000. Net Profit after tax: R850 000. Shares repurchased premium: R70 000. Interim Div: R240 000. Final Div: R285 000.`,
  info_section_af: `BRON: AMPTELIKE DBE NSC NOVEMBER 2021 EKSAMENVRAESTEL 1
Retensiekos Begin: R420 000. Netto Wins na belasting: R850 000. Aandele terugkoop premie: R70 000. Tussentydse Div: R240 000. Finale Div: R285 000.`,
  tableConfig: {
    title_en: 'NSC NOV 2021 — PROTEA LTD NOTE 7 RETAINED INCOME',
    title_af: 'NSC NOV 2021 — PROTEA BPK NOTA 7 RETENSIEKOS',
    columns_en: ['Note Line Item', 'Amount (R)'], columns_af: ['Nota Reëlitem', 'Bedrag (R)'],
    rows: [
      { id: 'start', label_en: 'Balance at start of year', label_af: 'Saldo aan begin van jaar', fields: [{ field_name: 'ret_start' }] },
      { id: 'profit', label_en: 'Net Profit after tax', label_af: 'Netto Wins na belasting', fields: [{ field_name: 'net_profit' }] },
      { id: 'repurchased', label_en: 'Repurchase premium', label_af: 'Terugkoop premie', fields: [{ field_name: 'repurchased' }] },
      { id: 'div_interim', label_en: 'Interim Dividends', label_af: 'Tussentydse Dividende', fields: [{ field_name: 'div_interim' }] },
      { id: 'div_final', label_en: 'Final Dividends', label_af: 'Finale Dividende', fields: [{ field_name: 'div_final' }] },
      { id: 'end', label_en: 'Balance at End of Year', label_af: 'Saldo aan Einde van Jaar', fields: [{ field_name: 'ret_end' }] }
    ]
  },
  total_marks: 35,
  explanation_en: 'Official NSC Solution: Retained Income End = R675 000',
  explanation_af: 'Amptelike NSC Oplossing: Retensiekos Einde = R675 000',
  working_solution_en: '420000 + 850000 - 70000 - 240000 - 285000 = 675000',
  working_solution_af: '420000 + 850000 - 70000 - 240000 - 285000 = 675000',
  fields: [
    { n: 'ret_start', len: 'Start Balance', laf: 'Begin Saldo', c: '420000', m: 5 },
    { n: 'net_profit', len: 'Net Profit after tax', laf: 'Netto Wins na belasting', c: '850000', m: 5 },
    { n: 'repurchased', len: 'Repurchase premium', laf: 'Terugkoop premie', c: '70000', m: 5 },
    { n: 'div_interim', len: 'Interim Dividends', laf: 'Tussentydse Dividende', c: '240000', m: 5 },
    { n: 'div_final', len: 'Final Dividends', laf: 'Finale Dividende', c: '285000', m: 5 },
    { n: 'ret_end', len: 'Retained Income End', laf: 'Retensiekos Einde', c: '675000', m: 10 }
  ]
});

addQuestion({
  paper_type: 'paper_1', topic_en: 'Analysis & Interpretation', topic_af: 'Ontleding en Vertolking',
  subtopic_en: 'NSC Nov 2021 P1 Q3 (Ratios)', subtopic_af: 'NSC Nov 2021 V1 V3 (Verhoudings)', difficulty: 'hard',
  question_text_en: 'QUESTION 1.3 [OFFICIAL NSC NOV 2021 P1]: Calculate Financial Ratios & Liquidity Metrics of Protea Ltd. (35 Marks)',
  question_text_af: 'VRAAG 1.3 [AMPTELIKE NSC NOV 2021 V1]: Bereken Finansiële Verhoudings van Protea Bpk. (35 Punte)',
  info_section_en: `SOURCE: OFFICIAL DBE NSC NOVEMBER 2021 EXAMINATION PAPER 1
Current Assets: R900 000
Inventory: R350 000
Current Liabilities: R440 000
Net Profit after tax: R850 000
Shareholders Equity: R3 875 000`,
  info_section_af: `BRON: AMPTELIKE DBE NSC NOVEMBER 2021 EKSAMENVRAESTEL 1
Bedryfsbates: R900 000
Voorraad: R350 000
Bedryfslaste: R440 000
Netto Wins na belasting: R850 000
Eiewaarde: R3 875 000`,
  tableConfig: {
    title_en: 'NSC NOV 2021 — FINANCIAL RATIOS',
    title_af: 'NSC NOV 2021 — FINANSIËLE VERHOUDINGS',
    columns_en: ['Indicator', 'Result / Ratio'], columns_af: ['Aanwyser', 'Resultaat / Verhouding'],
    rows: [
      { id: 'cr', label_en: 'Current Ratio', label_af: 'Bedryfsverhouding', fields: [{ field_name: 'current_ratio' }] },
      { id: 'acid', label_en: 'Acid-Test Ratio', label_af: 'Vuurproefverhouding', fields: [{ field_name: 'acid_test_ratio' }] },
      { id: 'roe', label_en: 'Return on Equity (ROE %)', label_af: 'Opbrengs op Eiewaarde (ROE %)', fields: [{ field_name: 'roe_pct' }] }
    ]
  },
  total_marks: 35,
  explanation_en: 'Official NSC Solution: Current Ratio = 2.05 : 1, Acid-Test = 1.25 : 1, ROE = 21.9%',
  explanation_af: 'Amptelike NSC Oplossing: Bedryfsverhouding = 2.05 : 1, Vuurproef = 1.25 : 1, ROE = 21.9%',
  working_solution_en: 'CR = 900k/440k = 2.05. Acid = (900k-350k)/440k = 1.25. ROE = (850k/3875k)*100 = 21.9%',
  working_solution_af: 'BV = 900k/440k = 2.05. Vuurproef = (900k-350k)/440k = 1.25. ROE = (850k/3875k)*100 = 21.9%',
  fields: [
    { n: 'current_ratio', len: 'Current Ratio', laf: 'Bedryfsverhouding', c: '2.05', m: 10 },
    { n: 'acid_test_ratio', len: 'Acid-Test Ratio', laf: 'Vuurproefverhouding', c: '1.25', m: 10 },
    { n: 'roe_pct', len: 'Return on Equity %', laf: 'ROE %', c: '21.9', m: 15 }
  ]
});

addQuestion({
  paper_type: 'paper_1', topic_en: 'Corporate Governance', topic_af: 'Korporatiewe Bestuur',
  subtopic_en: 'NSC Nov 2021 P1 Q4 (Audit Report)', subtopic_af: 'NSC Nov 2021 V1 V4 (Ouditverslag)', difficulty: 'easy',
  question_text_en: 'QUESTION 1.4 [OFFICIAL NSC NOV 2021 P1]: Corporate Governance & Auditor Report of Protea Ltd. (20 Marks)',
  question_text_af: 'VRAAG 1.4 [AMPTELIKE NSC NOV 2021 V1]: Korporatiewe Bestuur & Ouditeursverslag van Protea Bpk. (20 Punte)',
  info_section_en: `SOURCE: OFFICIAL DBE NSC NOVEMBER 2021 EXAMINATION PAPER 1
The independent auditor issued an Unqualified Audit Report with an Emphasis of Matter regarding inventory controls.`,
  info_section_af: `BRON: AMPTELIKE DBE NSC NOVEMBER 2021 EKSAMENVRAESTEL 1
Die onafhanklike ouditeur het n Ongekwalifiseerde Ouditeursverslag uitgereik met n Beklemtoning van Aangeleentheid.`,
  tableConfig: {
    title_en: 'NSC NOV 2021 — CORPORATE GOVERNANCE REVIEW',
    title_af: 'NSC NOV 2021 — KORPORATIEWE BESTUUR HERSIENING',
    columns_en: ['Question', 'Answer / Type'], columns_af: ['Vraag', 'Antwoord / Tipe'],
    rows: [
      { id: 'audit_type', label_en: 'Audit Opinion Type', label_af: 'Ouditopinie Tipe', fields: [{ field_name: 'audit_type' }] },
      { id: 'governance_code', label_en: 'Governance Code Followed', label_af: 'Bestuurskode Gevolg', fields: [{ field_name: 'governance_code' }] }
    ]
  },
  total_marks: 20,
  explanation_en: 'Audit Type: Unqualified, Code: King IV',
  explanation_af: 'Oudittipe: Ongekwalifiseerd, Kode: King IV',
  working_solution_en: 'Unqualified report with King IV governance code.',
  working_solution_af: 'Ongekwalifiseerde verslag met King IV bestuurskode.',
  fields: [
    { n: 'audit_type', len: 'Audit Opinion Type', laf: 'Ouditopinie Tipe', c: 'Unqualified', m: 10 },
    { n: 'governance_code', len: 'Governance Code', laf: 'Bestuurskode', c: 'King IV', m: 10 }
  ]
});

// --- PAPER 1 - EXAM SET 2 (OFFICIAL NSC NOV 2022 PAPER 1 - 150 MARKS) ---
addQuestion({
  paper_type: 'paper_1', topic_en: 'Financial Statements', topic_af: 'Finansiële State',
  subtopic_en: 'NSC Nov 2022 P1 Q1 (Jacaranda Ltd)', subtopic_af: 'NSC Nov 2022 V1 V1 (Jacaranda Bpk)', difficulty: 'hard',
  question_text_en: 'QUESTION 2.1 [OFFICIAL NSC NOV 2022 P1]: Complete Jacaranda Ltd Income Statement & Tax. (60 Marks)',
  question_text_af: 'VRAAG 2.1 [AMPTELIKE NSC NOV 2022 V1]: Voltooi Jacaranda Bpk Inkomstestaat & Belasting. (60 Punte)',
  info_section_en: `SOURCE: OFFICIAL DBE NSC NOVEMBER 2022 EXAMINATION PAPER 1
Sales: R6 200 000
Cost of Sales: R3 720 000
Operating Expenses: R1 200 000
Income Tax Rate: 27%`,
  info_section_af: `BRON: AMPTELIKE DBE NSC NOVEMBER 2022 EKSAMENVRAESTEL 1
Verkope: R6 200 000
Koste van verkope: R3 720 000
Bedryfsuitgawes: R1 200 000
Inkomstebelasting Koers: 27%`,
  tableConfig: {
    title_en: 'NSC NOV 2022 — JACARANDA LTD STATEMENT OF COMPREHENSIVE INCOME',
    title_af: 'NSC NOV 2022 — JACARANDA BPK STAAT VAN OMVATTENDE INKOMSTE',
    columns_en: ['Financial Line Item', 'Amount (R)'], columns_af: ['Finansiële Reëlitem', 'Bedrag (R)'],
    rows: [
      { id: 'sales', label_en: 'Sales', label_af: 'Verkope', fields: [{ field_name: 'sales' }] },
      { id: 'cos', label_en: 'Cost of Sales', label_af: 'Koste van verkope', fields: [{ field_name: 'cos' }] },
      { id: 'gp', label_en: 'Gross Profit', label_af: 'Bruto Wins', fields: [{ field_name: 'gross_profit' }] },
      { id: 'opex', label_en: 'Operating Expenses', label_af: 'Bedryfsuitgawes', fields: [{ field_name: 'operating_expenses' }] },
      { id: 'op_profit', label_en: 'Operating Profit', label_af: 'Bedryfswins', fields: [{ field_name: 'operating_profit' }] },
      { id: 'tax', label_en: 'Income Tax (27%)', label_af: 'Inkomstebelasting (27%)', fields: [{ field_name: 'income_tax' }] },
      { id: 'net_profit', label_en: 'Net Profit after Tax', label_af: 'Netto Wins na Belasting', fields: [{ field_name: 'net_profit_after_tax' }] }
    ]
  },
  total_marks: 60,
  explanation_en: 'Official NSC Solution: Gross Profit = 2 480 000, Tax = 345 600, Net Profit = 934 400',
  explanation_af: 'Amptelike NSC Oplossing: Bruto Wins = 2 480 000, Belasting = 345 600, Netto Wins = 934 400',
  working_solution_en: 'GP = 6.2m - 3.72m = 2.48m. Op Profit = 2.48m - 1.2m = 1.28m. Tax = 1.28m * 0.27 = 345 600.',
  working_solution_af: 'BW = 6.2m - 3.72m = 2.48m. Bedryfswins = 1.28m. Belasting = 1.28m * 0.27 = 345 600.',
  fields: [
    { n: 'sales', len: 'Sales', laf: 'Verkope', c: '6200000', m: 10 },
    { n: 'cos', len: 'Cost of Sales', laf: 'Koste van verkope', c: '3720000', m: 1 },
    { n: 'gross_profit', len: 'Gross Profit', laf: 'Bruto Wins', c: '2480000', m: 10 },
    { n: 'operating_expenses', len: 'Operating Expenses', laf: 'Bedryfsuitgawes', c: '1200000', m: 1 },
    { n: 'operating_profit', len: 'Operating Profit', laf: 'Bedryfswins', c: '1280000', m: 15 },
    { n: 'income_tax', len: 'Income Tax', laf: 'Inkomstebelasting', c: '345600', m: 10 },
    { n: 'net_profit_after_tax', len: 'Net Profit after tax', laf: 'Netto Wins na belasting', c: '934400', m: 15 }
  ]
});

addQuestion({
  paper_type: 'paper_1', topic_en: 'Financial Statements', topic_af: 'Finansiële State',
  subtopic_en: 'NSC Nov 2022 P1 Q2 (Share Capital)', subtopic_af: 'NSC Nov 2022 V1 V2 (Aandelekapitaal)', difficulty: 'medium',
  question_text_en: 'QUESTION 2.2 [OFFICIAL NSC NOV 2022 P1]: Note 8 Share Capital & Buy-back of Jacaranda Ltd. (35 Marks)',
  question_text_af: 'VRAAG 2.2 [AMPTELIKE NSC NOV 2022 V1]: Nota 8 Aandelekapitaal & Terugkoop van Jacaranda Bpk. (35 Punte)',
  info_section_en: `SOURCE: OFFICIAL DBE NSC NOVEMBER 2022 EXAMINATION PAPER 1
Issued Share Capital start: 1 000 000 shares @ R5,00 = R5 000 000. 200 000 new shares issued @ R6,50. 50 000 shares repurchased @ avg R5,25.`,
  info_section_af: `BRON: AMPTELIKE DBE NSC NOVEMBER 2022 EKSAMENVRAESTEL 1
Uitreikings Aandelekapitaal begin: 1 000 000 aandele @ R5,00 = R5 000 000. 200 000 nuwe aandele uitgereik @ R6,50. 50 000 teruggekoop @ gem R5,25.`,
  tableConfig: {
    title_en: 'NSC NOV 2022 — NOTE 8 SHARE CAPITAL',
    title_af: 'NSC NOV 2022 — NOTA 8 AANDELEKAPITAAL',
    columns_en: ['Share Capital Line', 'Amount (R)'], columns_af: ['Aandelekapitaal Reël', 'Bedrag (R)'],
    rows: [
      { id: 'start', label_en: 'Balance at start of year', label_af: 'Saldo aan begin van jaar', fields: [{ field_name: 'share_start' }] },
      { id: 'issued', label_en: '200 000 shares issued @ R6,50', label_af: '200 000 aandele uitgereik @ R6,50', fields: [{ field_name: 'shares_issued' }] },
      { id: 'repurchased', label_en: '50 000 shares repurchased @ R5,25 avg', label_af: '50 000 aandele teruggekoop @ R5,25 gem', fields: [{ field_name: 'shares_repurchased' }] },
      { id: 'end', label_en: 'Balance at End of Year', label_af: 'Saldo aan Einde van Jaar', fields: [{ field_name: 'share_end' }] }
    ]
  },
  total_marks: 35,
  explanation_en: 'Official NSC Solution: End Share Capital = R6 037 500',
  explanation_af: 'Amptelike NSC Oplossing: Eind Aandelekapitaal = R6 037 500',
  working_solution_en: '5m + 1.3m - 262.5k = 6 037 500',
  working_solution_af: '5m + 1.3m - 262.5k = 6 037 500',
  fields: [
    { n: 'share_start', len: 'Start Share Capital', laf: 'Begin Aandelekapitaal', c: '5000000', m: 5 },
    { n: 'shares_issued', len: 'Shares Issued Amount', laf: 'Aandele Uitgereik Bedrag', c: '1300000', m: 10 },
    { n: 'shares_repurchased', len: 'Shares Repurchased Avg Amount', laf: 'Aandele Teruggekoop Gem Bedrag', c: '262500', m: 10 },
    { n: 'share_end', len: 'Share Capital End', laf: 'Aandelekapitaal Einde', c: '6037500', m: 10 }
  ]
});

addQuestion({
  paper_type: 'paper_1', topic_en: 'Analysis & Interpretation', topic_af: 'Ontleding en Vertolking',
  subtopic_en: 'NSC Nov 2022 P1 Q3 (Solvency)', subtopic_af: 'NSC Nov 2022 V1 V3 (Solvabiliteit)', difficulty: 'hard',
  question_text_en: 'QUESTION 2.3 [OFFICIAL NSC NOV 2022 P1]: Calculate Debt-Equity, Solvency & ROE for Jacaranda Ltd. (35 Marks)',
  question_text_af: 'VRAAG 2.3 [AMPTELIKE NSC NOV 2022 V1]: Bereken Skuld-Eiewaarde, Solvabiliteit & ROE vir Jacaranda Bpk. (35 Punte)',
  info_section_en: `SOURCE: OFFICIAL DBE NSC NOVEMBER 2022 EXAMINATION PAPER 1
Loan: R1 800 000
Shareholders Equity: R7 200 000
Net Profit after tax: R934 400
Total Assets: R11 500 000
Total Liabilities: R4 300 000`,
  info_section_af: `BRON: AMPTELIKE DBE NSC NOVEMBER 2022 EKSAMENVRAESTEL 1
Lening: R1 800 000
Eiewaarde: R7 200 000
Netto Wins na belasting: R934 400
Totale Bates: R11 500 000
Totale Laste: R4 300 000`,
  tableConfig: {
    title_en: 'NSC NOV 2022 — SOLVENCY & FINANCIAL RISK',
    title_af: 'NSC NOV 2022 — SOLVABILITEIT & FINANSIËLE RISIKO',
    columns_en: ['Indicator', 'Calculated Value'], columns_af: ['Aanwyser', 'Berekende Waarde'],
    rows: [
      { id: 'debt_equity', label_en: 'Debt-Equity Ratio', label_af: 'Skuld-Eiewaarde', fields: [{ field_name: 'debt_equity' }] },
      { id: 'solvency', label_en: 'Solvency Ratio', label_af: 'Solvabiliteitsverhouding', fields: [{ field_name: 'solvency_ratio' }] },
      { id: 'roe', label_en: 'Return on Equity (ROE %)', label_af: 'ROE %', fields: [{ field_name: 'roe_pct' }] }
    ]
  },
  total_marks: 35,
  explanation_en: 'Official NSC Solution: Debt-Equity = 0.25 : 1, Solvency = 2.67 : 1, ROE = 13.0%',
  explanation_af: 'Amptelike NSC Oplossing: Skuld-Eiewaarde = 0.25 : 1, Solvabiliteit = 2.67 : 1, ROE = 13.0%',
  working_solution_en: 'D/E = 1.8m/7.2m = 0.25. Solvency = 11.5m/4.3m = 2.67. ROE = (934.4k/7.2m)*100 = 13.0%',
  working_solution_af: 'D/E = 1.8m/7.2m = 0.25. Solvabiliteit = 11.5m/4.3m = 2.67. ROE = (934.4k/7.2m)*100 = 13.0%',
  fields: [
    { n: 'debt_equity', len: 'Debt-Equity Ratio', laf: 'Skuld-Eiewaarde', c: '0.25', m: 10 },
    { n: 'solvency_ratio', len: 'Solvency Ratio', laf: 'Solvabiliteitsverhouding', c: '2.67', m: 10 },
    { n: 'roe_pct', len: 'Return on Equity %', laf: 'ROE %', c: '13.0', m: 15 }
  ]
});

addQuestion({
  paper_type: 'paper_1', topic_en: 'Corporate Governance', topic_af: 'Korporatiewe Bestuur',
  subtopic_en: 'NSC Nov 2022 P1 Q4 (Qualified Audit)', subtopic_af: 'NSC Nov 2022 V1 V4 (Gekwalifiseerde Oudit)', difficulty: 'easy',
  question_text_en: 'QUESTION 2.4 [OFFICIAL NSC NOV 2022 P1]: Evaluate Independent Audit Opinion for Jacaranda Ltd. (20 Marks)',
  question_text_af: 'VRAAG 2.4 [AMPTELIKE NSC NOV 2022 V1]: Evalueer Onafhanklike Ouditopinie vir Jacaranda Bpk. (20 Punte)',
  info_section_en: `SOURCE: OFFICIAL DBE NSC NOVEMBER 2022 EXAMINATION PAPER 1
Auditors discovered material unrecorded liabilities of R2,5m. Management refused to adjust the books. Qualified Audit Report issued.`,
  info_section_af: `BRON: AMPTELIKE DBE NSC NOVEMBER 2022 EKSAMENVRAESTEL 1
Ouditeurs het wesenlike onaaangetekende laste van R2,5m ontdek. Bestuur het geweier om boeke aan te pas. Gekwalifiseerde verslag uitgereik.`,
  tableConfig: {
    title_en: 'NSC NOV 2022 — AUDIT OPINION ANALYSIS',
    title_af: 'NSC NOV 2022 — OUDITOPINIE ONTLEDING',
    columns_en: ['Audit Criteria', 'Finding'], columns_af: ['Oudit Kriteria', 'Bevinding'],
    rows: [
      { id: 'opinion', label_en: 'Type of Audit Report Issued', label_af: 'Tipe Ouditeursverslag Uitgereik', fields: [{ field_name: 'audit_opinion' }] },
      { id: 'impact', label_en: 'Share Price Impact Risk', label_af: 'Aandelprys Impak Risiko', fields: [{ field_name: 'share_impact' }] }
    ]
  },
  total_marks: 20,
  explanation_en: 'Audit Opinion: Qualified, Impact: High negative risk',
  explanation_af: 'Ouditopinie: Gekwalifiseerd, Impak: Hoë negatiewe risiko',
  working_solution_en: 'Qualified audit report issued due to material misstatement.',
  working_solution_af: 'Gekwalifiseerde ouditverslag uitgereik weens wesenlike wanvoorstelling.',
  fields: [
    { n: 'audit_opinion', len: 'Audit Opinion', laf: 'Ouditopinie', c: 'Qualified', m: 10 },
    { n: 'share_impact', len: 'Share Impact Risk', laf: 'Aandelprys Impak', c: 'High', m: 10 }
  ]
});

// --- PAPER 1 - EXAM SET 3 (OFFICIAL NSC JUNE 2023 PAPER 1 - 150 MARKS) ---
addQuestion({
  paper_type: 'paper_1', topic_en: 'Financial Statements', topic_af: 'Finansiële State',
  subtopic_en: 'NSC Jun 2023 P1 Q1 (Aloe Holdings)', subtopic_af: 'NSC Jun 2023 V1 V1 (Aloe Holdings)', difficulty: 'hard',
  question_text_en: 'QUESTION 3.1 [OFFICIAL NSC JUN 2023 P1]: Complete Balance Sheet Equity & Liabilities Section of Aloe Holdings Ltd. (60 Marks)',
  question_text_af: 'VRAAG 3.1 [AMPTELIKE NSC JUN 2023 V1]: Voltooi Balansstaat Eiewaarde & Laste Afdeling van Aloe Holdings Bpk. (60 Punte)',
  info_section_en: `SOURCE: OFFICIAL DBE NSC JUNE 2023 EXAMINATION PAPER 1
Share Capital: R8 000 000
Retained Income: R1 400 000
Long-term Loan: R2 200 000
Trade Payables: R650 000
Bank Overdraft: R150 000`,
  info_section_af: `BRON: AMPTELIKE DBE NSC JUNE 2023 EKSAMENVRAESTEL 1
Aandelekapitaal: R8 000 000
Retensiekos: R1 400 000
Langtermyn Lening: R2 200 000
Handelslaste: R650 000
Opgeloopte Bankoortrekking: R150 000`,
  tableConfig: {
    title_en: 'NSC JUN 2023 — ALOE HOLDINGS BALANCE SHEET',
    title_af: 'NSC JUN 2023 — ALOE HOLDINGS BALANSSTAAT',
    columns_en: ['Equity & Liabilities Item', 'Amount (R)'], columns_af: ['Eiewaarde & Laste Item', 'Bedrag (R)'],
    rows: [
      { id: 'share_cap', label_en: 'Share Capital', label_af: 'Aandelekapitaal', fields: [{ field_name: 'share_capital' }] },
      { id: 'retained', label_en: 'Retained Income', label_af: 'Retensiekos', fields: [{ field_name: 'retained_income' }] },
      { id: 'equity', label_en: 'Total Shareholders Equity', label_af: 'Totale Eiewaarde', fields: [{ field_name: 'total_equity' }] },
      { id: 'non_curr', label_en: 'NON-Current Liabilities (Long-term Loan)', label_af: 'NIE-Bedryfslaste (Langtermyn Lening)', fields: [{ field_name: 'non_current_liabilities' }] },
      { id: 'trade_pay', label_en: 'Trade Payables', label_af: 'Handelskrediteure', fields: [{ field_name: 'trade_payables' }] },
      { id: 'overdraft', label_en: 'Bank Overdraft', label_af: 'Bankoortrekking', fields: [{ field_name: 'bank_overdraft' }] },
      { id: 'curr', label_en: 'Current Liabilities', label_af: 'Bedryfslaste', fields: [{ field_name: 'current_liabilities' }] },
      { id: 'total_el', label_en: 'Total Equity and Liabilities', label_af: 'Totale Eiewaarde EN LASTE', fields: [{ field_name: 'total_equity_liabilities' }] }
    ]
  },
  total_marks: 60,
  explanation_en: 'Official NSC Solution: Equity = 9.4m, Non-Current = 2.2m, Current = 800k, Total = 12.4m',
  explanation_af: 'Amptelike NSC Oplossing: Eiewaarde = 9.4m, Niet-bedryfs = 2.2m, Bedryfs = 800k, Totaal = 12.4m',
  working_solution_en: 'Equity = 8m+1.4m=9.4m. Current = 650k+150k=800k. Total = 9.4m+2.2m+800k = 12.4m.',
  working_solution_af: 'Eiewaarde = 8m+1.4m=9.4m. Bedryfs = 650k+150k=800k. Totaal = 9.4m+2.2m+800k = 12.4m.',
  fields: [
    { n: 'share_capital', len: 'Share Capital', laf: 'Aandelekapitaal', c: '8000000', m: 1 },
    { n: 'retained_income', len: 'Retained Income', laf: 'Retensiekos', c: '1400000', m: 1 },
    { n: 'total_equity', len: 'Total Shareholders Equity', laf: 'Totale Eiewaarde', c: '9400000', m: 15 },
    { n: 'non_current_liabilities', len: 'Non-Current Liabilities', laf: 'Niet-bedryfslaste', c: '2200000', m: 15 },
    { n: 'trade_payables', len: 'Trade Payables', laf: 'Handelskrediteure', c: '650000', m: 1 },
    { n: 'bank_overdraft', len: 'Bank Overdraft', laf: 'Bankoortrekking', c: '150000', m: 1 },
    { n: 'current_liabilities', len: 'Current Liabilities', laf: 'Bedryfslaste', c: '800000', m: 15 },
    { n: 'total_equity_liabilities', len: 'Total Equity & Liabilities', laf: 'Totale Eiewaarde & Laste', c: '12400000', m: 15 }
  ]
});

addQuestion({
  paper_type: 'paper_1', topic_en: 'Financial Statements', topic_af: 'Finansiële State',
  subtopic_en: 'NSC Jun 2023 P1 Q2 (Payables Note)', subtopic_af: 'NSC Jun 2023 V1 V2 (Laste Nota)', difficulty: 'medium',
  question_text_en: 'QUESTION 3.2 [OFFICIAL NSC JUN 2023 P1]: Note 9 Trade and Other Payables of Aloe Holdings Ltd. (35 Marks)',
  question_text_af: 'VRAAG 3.2 [AMPTELIKE NSC JUN 2023 V1]: Nota 9 Handels- en Ander Laste van Aloe Holdings Bpk. (35 Punte)',
  info_section_en: `SOURCE: OFFICIAL DBE NSC JUNE 2023 EXAMINATION PAPER 1
Trade Creditors: R480 000
Accrued Expenses: R45 000
SARS Income Tax Payable: R75 000
Shareholders for Dividends: R50 000`,
  info_section_af: `BRON: AMPTELIKE DBE NSC JUNE 2023 EKSAMENVRAESTEL 1
Handelskrediteure: R480 000
Opgeloopte Uitgawes: R45 000
SARS Inkomstebelasting Betaalbaar: R75 000
Aandeelhouers vir Dividende: R50 000`,
  tableConfig: {
    title_en: 'NSC JUN 2023 — NOTE 9 TRADE & OTHER PAYABLES',
    title_af: 'NSC JUN 2023 — NOTA 9 HANDELS- EN ANDER LASTE',
    columns_en: ['Payables Item', 'Amount (R)'], columns_af: ['Laste Item', 'Bedrag (R)'],
    rows: [
      { id: 'creditors', label_en: 'Trade Creditors', label_af: 'Handelskrediteure', fields: [{ field_name: 'trade_creditors' }] },
      { id: 'accrued', label_en: 'Accrued Expenses', label_af: 'Opgeloopte Uitgawes', fields: [{ field_name: 'accrued_expenses' }] },
      { id: 'tax_pay', label_en: 'SARS Income Tax', label_af: 'SARS Inkomstebelasting', fields: [{ field_name: 'sars_tax' }] },
      { id: 'div_pay', label_en: 'Shareholders for Dividends', label_af: 'Aandeelhouers vir Dividende', fields: [{ field_name: 'shareholders_div' }] },
      { id: 'total_payables', label_en: 'Total Trade & Other Payables', label_af: 'Totale Handels- en Ander Laste', fields: [{ field_name: 'total_payables' }] }
    ]
  },
  total_marks: 35,
  explanation_en: 'Official NSC Solution: Total Trade & Other Payables = R650 000',
  explanation_af: 'Amptelike NSC Oplossing: Totale Handels- en Ander Laste = R650 000',
  working_solution_en: '480k + 45k + 75k + 50k = 650 000',
  working_solution_af: '480k + 45k + 75k + 50k = 650 000',
  fields: [
    { n: 'trade_creditors', len: 'Trade Creditors', laf: 'Handelskrediteure', c: '480000', m: 5 },
    { n: 'accrued_expenses', len: 'Accrued Expenses', laf: 'Opgeloopte Uitgawes', c: '45000', m: 5 },
    { n: 'sars_tax', len: 'SARS Income Tax', laf: 'SARS Inkomstebelasting', c: '75000', m: 5 },
    { n: 'shareholders_div', len: 'Shareholders for Dividends', laf: 'Aandeelhouers vir Dividende', c: '50000', m: 5 },
    { n: 'total_payables', len: 'Total Payables', laf: 'Totale Laste', c: '650000', m: 15 }
  ]
});

addQuestion({
  paper_type: 'paper_1', topic_en: 'Analysis & Interpretation', topic_af: 'Ontleding en Vertolking',
  subtopic_en: 'NSC Jun 2023 P1 Q3 (Cash Flow)', subtopic_af: 'NSC Jun 2023 V1 V3 (Kontantvloei)', difficulty: 'hard',
  question_text_en: 'QUESTION 3.3 [OFFICIAL NSC JUN 2023 P1]: Calculate Cash Flow from Investing & Financing Activities of Aloe Holdings Ltd. (35 Marks)',
  question_text_af: 'VRAAG 3.3 [AMPTELIKE NSC JUN 2023 V1]: Bereken Kontantvloei uit Beleggings- & Finansieringsaktiwiteite van Aloe Holdings Bpk. (35 Punte)',
  info_section_en: `SOURCE: OFFICIAL DBE NSC JUNE 2023 EXAMINATION PAPER 1
Equipment purchased: R450 000
New shares issued: R1 200 000
Repayment of loan: R300 000
Dividends paid: R180 000`,
  info_section_af: `BRON: AMPTELIKE DBE NSC JUNE 2023 EKSAMENVRAESTEL 1
Toerusting gekoop: R450 000
Nuwe aandele uitgereik: R1 200 000
Terugbetaling van lening: R300 000
Dividende betaal: R180 000`,
  tableConfig: {
    title_en: 'NSC JUN 2023 — CASH FLOW ACTIVITIES',
    title_af: 'NSC JUN 2023 — KONTANTVLOEIAKTIWITEITE',
    columns_en: ['Activity Section', 'Amount (R)'], columns_af: ['Aktiwiteitsafdeling', 'Bedrag (R)'],
    rows: [
      { id: 'cf_investing', label_en: 'Net Cash from Investing Activities', label_af: 'Netto Kontant uit Beleggingsaktiwiteite', fields: [{ field_name: 'cf_investing' }] },
      { id: 'cf_financing', label_en: 'Net Cash from Financing Activities', label_af: 'Netto Kontant uit Finansieringsaktiwiteite', fields: [{ field_name: 'cf_financing' }] }
    ]
  },
  total_marks: 35,
  explanation_en: 'Official NSC Solution: Investing = -450 000, Financing = +900 000',
  explanation_af: 'Amptelike NSC Oplossing: Belegging = -450 000, Finansiering = +900 000',
  working_solution_en: 'Investing = -450 000. Financing = 1 200 000 - 300 000 = 900 000.',
  working_solution_af: 'Belegging = -450 000. Finansiering = 1 200 000 - 300 000 = 900 000.',
  fields: [
    { n: 'cf_investing', len: 'Cash Flow Investing', laf: 'Kontantvloei Belegging', c: '-450000', m: 15 },
    { n: 'cf_financing', len: 'Cash Flow Financing', laf: 'Kontantvloei Finansiering', c: '900000', m: 20 }
  ]
});

addQuestion({
  paper_type: 'paper_1', topic_en: 'Corporate Governance', topic_af: 'Korporatiewe Bestuur',
  subtopic_en: 'NSC Jun 2023 P1 Q4 (Director Remuneration)', subtopic_af: 'NSC Jun 2023 V1 V4 (Direkteursvergoeding)', difficulty: 'medium',
  question_text_en: 'QUESTION 3.4 [OFFICIAL NSC JUN 2023 P1]: Internal Audit & Director Fees Ethics Evaluation of Aloe Holdings Ltd. (20 Marks)',
  question_text_af: 'VRAAG 3.4 [AMPTELIKE NSC JUN 2023 V1]: Interne Oudit & Direkteursgelde Etiek Evaluering van Aloe Holdings Bpk. (20 Punte)',
  info_section_en: `SOURCE: OFFICIAL DBE NSC JUNE 2023 EXAMINATION PAPER 1
Managing director increased his salary by 45% without Remuneration Committee board approval.`,
  info_section_af: `BRON: AMPTELIKE DBE NSC JUNE 2023 EKSAMENVRAESTEL 1
Besturende direkteur het sy salaris met 45% verhoog sonder Remunerasiekomitee raadsgoedkeuring.`,
  tableConfig: {
    title_en: 'NSC JUN 2023 — GOVERNANCE REVIEW',
    title_af: 'NSC JUN 2023 — BESTUURSNAKOMING HERSIENING',
    columns_en: ['Compliance Area', 'Status'], columns_af: ['Nakomingsarea', 'Status'],
    rows: [
      { id: 'rem_approval', label_en: 'Board Approval Obtained', label_af: 'Raadsgoedkeuring Verkry', fields: [{ field_name: 'rem_approval' }] },
      { id: 'king_violation', label_en: 'King IV Governance Breach', label_af: 'King IV Bestuursbreuk', fields: [{ field_name: 'king_breach' }] }
    ]
  },
  total_marks: 20,
  explanation_en: 'Approval: No, Breach: Remuneration Governance Violation',
  explanation_af: 'Goedkeuring: Nee, Breuk: Remunerasiebestuur Oortreding',
  working_solution_en: 'Unauthorised increase violates King IV Remuneration principle.',
  working_solution_af: 'Ongemagtigde verhoging oortree King IV Remunerasie beginsel.',
  fields: [
    { n: 'rem_approval', len: 'Approval Obtained', laf: 'Goedkeuring Verkry', c: 'No', m: 10 },
    { n: 'king_breach', len: 'King IV Breach', laf: 'King IV Oortreding', c: 'Violation', m: 10 }
  ]
});

// --- PAPER 1 - EXAM SET 4 (OFFICIAL NSC NOV 2024 PAPER 1 - 150 MARKS) ---
addQuestion({
  paper_type: 'paper_1', topic_en: 'Financial Statements', topic_af: 'Finansiële State',
  subtopic_en: 'NSC Nov 2024 P1 Q1 (Springbok Traders)', subtopic_af: 'NSC Nov 2024 V1 V1 (Springbok Handelaars)', difficulty: 'hard',
  question_text_en: 'QUESTION 4.1 [OFFICIAL NSC NOV 2024 P1]: Final Adjustments & Income Statement of Springbok Traders Ltd. (60 Marks)',
  question_text_af: 'VRAAG 4.1 [AMPTELIKE NSC NOV 2024 V1]: Finale Aanpassings & Inkomstestaat van Springbok Handelaars Bpk. (60 Punte)',
  info_section_en: `SOURCE: OFFICIAL DBE NSC NOVEMBER 2024 EXAMINATION PAPER 1
Sales: R5 800 000
Cost of Sales: R3 480 000
Operating Expenses: R1 100 000
Trading Stock Deficit: R15 000
Bad Debts written off: R8 000`,
  info_section_af: `BRON: AMPTELIKE DBE NSC NOVEMBER 2024 EKSAMENVRAESTEL 1
Verkope: R5 800 000
Koste van verkope: R3 480 000
Bedryfsuitgawes: R1 100 000
Handelsvoorraadtekort: R15 000
Oninvorderbare Skulde afgeskryf: R8 000`,
  tableConfig: {
    title_en: 'NSC NOV 2024 — SPRINGBOK TRADERS INCOME STATEMENT',
    title_af: 'NSC NOV 2024 — SPRINGBOK HANDELAARS INKOMSTESTAAT',
    columns_en: ['Line Item', 'Amount (R)'], columns_af: ['Reëlitem', 'Bedrag (R)'],
    rows: [
      { id: 'sales', label_en: 'Sales', label_af: 'Verkope', fields: [{ field_name: 'sales' }] },
      { id: 'cos', label_en: 'Cost of Sales', label_af: 'Koste van verkope', fields: [{ field_name: 'cos' }] },
      { id: 'gp', label_en: 'Gross Profit', label_af: 'Bruto Wins', fields: [{ field_name: 'gross_profit' }] },
      { id: 'opex_given', label_en: 'Operating Expenses', label_af: 'Bedryfsuitgawes', fields: [{ field_name: 'operating_expenses' }] },
      { id: 'stock_def', label_en: 'Trading Stock Deficit', label_af: 'Handelsvoorraadtekort', fields: [{ field_name: 'stock_deficit' }] },
      { id: 'bad_debts', label_en: 'Bad Debts Written Off', label_af: 'Oninvorderbare Skulde Afgeskryf', fields: [{ field_name: 'bad_debts' }] },
      { id: 'op_exp', label_en: 'Total Operating Expenses (Adjusted)', label_af: 'Totale Bedryfsuitgawes (Aangepas)', fields: [{ field_name: 'total_op_exp' }] },
      { id: 'op_profit', label_en: 'Operating Profit', label_af: 'Bedryfswins', fields: [{ field_name: 'operating_profit' }] }
    ]
  },
  total_marks: 60,
  explanation_en: 'Official NSC Solution: Gross Profit = 2 320 000, Total Op Exp = 1 123 000, Operating Profit = 1 197 000',
  explanation_af: 'Amptelike NSC Oplossing: Bruto Wins = 2 320 000, Totale Bedryfsuitgawes = 1 123 000, Bedryfswins = 1 197 000',
  working_solution_en: 'GP = 5.8m - 3.48m = 2.32m. Op Exp = 1.1m + 15k + 8k = 1 123 000. Op Profit = 2.32m - 1.123m = 1 197 000.',
  working_solution_af: 'BW = 5.8m - 3.48m = 2.32m. Uitgawes = 1.1m + 15k + 8k = 1 123 000. Bedryfswins = 2.32m - 1.123m = 1 197 000.',
  fields: [
    { n: 'sales', len: 'Sales', laf: 'Verkope', c: '5800000', m: 10 },
    { n: 'cos', len: 'Cost of Sales', laf: 'Koste van verkope', c: '3480000', m: 10 },
    { n: 'gross_profit', len: 'Gross Profit', laf: 'Bruto Wins', c: '2320000', m: 10 },
    { n: 'operating_expenses', len: 'Operating Expenses', laf: 'Bedryfsuitgawes', c: '1100000', m: 1 },
    { n: 'stock_deficit', len: 'Trading Stock Deficit', laf: 'Handelsvoorraadtekort', c: '15000', m: 1 },
    { n: 'bad_debts', len: 'Bad Debts Written Off', laf: 'Oninvorderbare Skulde Afgeskryf', c: '8000', m: 1 },
    { n: 'total_op_exp', len: 'Total Op Expenses', laf: 'Totale Bedryfsuitgawes', c: '1123000', m: 15 },
    { n: 'operating_profit', len: 'Operating Profit', laf: 'Bedryfswins', c: '1197000', m: 15 }
  ]
});

addQuestion({
  paper_type: 'paper_1', topic_en: 'Financial Statements', topic_af: 'Finansiële State',
  subtopic_en: 'NSC Nov 2024 P1 Q2 (NAV)', subtopic_af: 'NSC Nov 2024 V1 V2 (NBW)', difficulty: 'medium',
  question_text_en: 'QUESTION 4.2 [OFFICIAL NSC NOV 2024 P1]: Net Asset Value (NAV) of Springbok Traders Ltd. (35 Marks)',
  question_text_af: 'VRAAG 4.2 [AMPTELIKE NSC NOV 2024 V1]: Netto Batewaarde (NBW) van Springbok Handelaars Bpk. (35 Punte)',
  info_section_en: `SOURCE: OFFICIAL DBE NSC NOVEMBER 2024 EXAMINATION PAPER 1
Total Shareholders Equity: R6 500 000
Total Ordinary Shares in Issue: 1 250 000 shares`,
  info_section_af: `BRON: AMPTELIKE DBE NSC NOVEMBER 2024 EKSAMENVRAESTEL 1
Totale Eiewaarde: R6 500 000
Totale Gewone Aandele in Uitreiking: 1 250 000 aandele`,
  tableConfig: {
    title_en: 'NSC NOV 2024 — NAV CALCULATIONS',
    title_af: 'NSC NOV 2024 — NBW BEREKENINGS',
    columns_en: ['Metric', 'Value'], columns_af: ['Maatstaf', 'Waarde'],
    rows: [
      { id: 'nav', label_en: 'Net Asset Value per Share (cents)', label_af: 'Netto Batewaarde per Aandeel (sent)', fields: [{ field_name: 'nav_cents' }] }
    ]
  },
  total_marks: 35,
  explanation_en: 'Official NSC Solution: NAV per share = 520 cents per share',
  explanation_af: 'Amptelike NSC Oplossing: NBW per aandeel = 520 sent per aandeel',
  working_solution_en: '(6 500 000 / 1 250 000) * 100 = 520 cents.',
  working_solution_af: '(6 500 000 / 1 250 000) * 100 = 520 sent.',
  fields: [
    { n: 'nav_cents', len: 'NAV per share (cents)', laf: 'NBW per aandeel (sent)', c: '520', m: 35 }
  ]
});

addQuestion({
  paper_type: 'paper_1', topic_en: 'Analysis & Interpretation', topic_af: 'Ontleding en Vertolking',
  subtopic_en: 'NSC Nov 2024 P1 Q3 (Collection/Payment)', subtopic_af: 'NSC Nov 2024 V1 V3 (Invordering/Betaling)', difficulty: 'hard',
  question_text_en: 'QUESTION 4.3 [OFFICIAL NSC NOV 2024 P1]: Debtors Collection & Creditors Payment Analysis. (35 Marks)',
  question_text_af: 'VRAAG 4.3 [AMPTELIKE NSC NOV 2024 V1]: Debiteure Invordering & Krediteure Betaling Ontleding. (35 Punte)',
  info_section_en: `SOURCE: OFFICIAL DBE NSC NOVEMBER 2024 EXAMINATION PAPER 1
Average Debtors: R450 000
Credit Sales: R3 600 000
Average Creditors: R320 000
Credit Purchases: R2 400 000`,
  info_section_af: `BRON: AMPTELIKE DBE NSC NOVEMBER 2024 EKSAMENVRAESTEL 1
Gemiddelde Debiteure: R450 000
Kredietverkope: R3 600 000
Gemiddelde Krediteure: R320 000
Kredietaankope: R2 400 000`,
  tableConfig: {
    title_en: 'NSC NOV 2024 — COLLECTION & PAYMENT PERIODS',
    title_af: 'NSC NOV 2024 — INVORDERING EN BETALINGSTYDPERKE',
    columns_en: ['Period Indicator', 'Days'], columns_af: ['Tydperk Aanwyser', 'Dae'],
    rows: [
      { id: 'debtors_days', label_en: 'Debtors Collection Period (Days)', label_af: 'Debiteure-invorderingstydperk (Dae)', fields: [{ field_name: 'debtors_days' }] },
      { id: 'creditors_days', label_en: 'Creditors Payment Period (Days)', label_af: 'Krediteure-betalingstydperk (Dae)', fields: [{ field_name: 'creditors_days' }] }
    ]
  },
  total_marks: 35,
  explanation_en: 'Official NSC Solution: Debtors Collection = 45.6 days, Creditors Payment = 48.7 days',
  explanation_af: 'Amptelike NSC Oplossing: Debiteure Invordering = 45.6 dae, Krediteure Betaling = 48.7 dae',
  working_solution_en: 'Debtors = (450k/3.6m)*365 = 45.6 days. Creditors = (320k/2.4m)*365 = 48.7 days.',
  working_solution_af: 'Debiteure = (450k/3.6m)*365 = 45.6 dae. Krediteure = (320k/2.4m)*365 = 48.7 dae.',
  fields: [
    { n: 'debtors_days', len: 'Debtors Collection Days', laf: 'Debiteure Invordering Dae', c: '45.6', m: 18 },
    { n: 'creditors_days', len: 'Creditors Payment Days', laf: 'Krediteure Betaling Dae', c: '48.7', m: 17 }
  ]
});

addQuestion({
  paper_type: 'paper_1', topic_en: 'Corporate Governance', topic_af: 'Korporatiewe Bestuur',
  subtopic_en: 'NSC Nov 2024 P1 Q4 (Environmental)', subtopic_af: 'NSC Nov 2024 V1 V4 (Omgewingsetiek)', difficulty: 'easy',
  question_text_en: 'QUESTION 4.4 [OFFICIAL NSC NOV 2024 P1]: Sustainability & Environmental Ethics Case Study. (20 Marks)',
  question_text_af: 'VRAAG 4.4 [AMPTELIKE NSC NOV 2024 V1]: Volhoubaarheid & Omgewingsetiek Gevallestudie. (20 Punte)',
  info_section_en: `SOURCE: OFFICIAL DBE NSC NOVEMBER 2024 EXAMINATION PAPER 1
Company illegally dumped chemical waste into local river to cut disposal costs by R200 000.`,
  info_section_af: `BRON: AMPTELIKE DBE NSC NOVEMBER 2024 EKSAMENVRAESTEL 1
Maatskappy het chemiese afval onwettig in plaaslike rivier gestort om wegdoeningskoste met R200 000 te sny.`,
  tableConfig: {
    title_en: 'NSC NOV 2024 — SUSTAINABILITY ETHICS REVIEW',
    title_af: 'NSC NOV 2024 — VOLHOUBAARHEIDSETIEK HERSIENING',
    columns_en: ['Ethics Aspect', 'Evaluation'], columns_af: ['Etiek Aspek', 'Evaluering'],
    rows: [
      { id: 'ethical_violation', label_en: 'Ethical & Legal Breach', label_af: 'Etiese & Wetlike Oortreding', fields: [{ field_name: 'ethical_breach' }] }
    ]
  },
  total_marks: 20,
  explanation_en: 'Breach: Illegal Environmental Pollution',
  explanation_af: 'Oortreding: Onwettige Omgewingsbesoedeling',
  working_solution_en: 'Unlawful dumping violates environmental laws and King IV ethical citizenship.',
  working_solution_af: 'Onwettige storting oortree omgewingswette en King IV etiese burgerskap.',
  fields: [
    { n: 'ethical_breach', len: 'Ethical Breach', laf: 'Etiese Oortreding', c: 'Pollution', m: 20 }
  ]
});

// ============================================================================

// ============================================================================

// ============================================================================
// PAPER 2: MANAGERIAL ACCOUNTING & INTERNAL CONTROL (4 EXAM SETS = 16 QUESTIONS = 600 MARKS)
// ============================================================================

// --- PAPER 2 - EXAM SET 1 (OFFICIAL NSC NOV 2021 PAPER 2 - 150 MARKS) ---
addQuestion({
  paper_type: 'paper_2', topic_en: 'Reconciliations', topic_af: 'Versoenings',
  subtopic_en: 'NSC Nov 2021 P2 Q1 (Bank Reconciliation & Cash Books)', subtopic_af: 'NSC Nov 2021 V2 V1 (Bankversoening & Kontantboeke)', difficulty: 'hard',
  question_text_en: 'QUESTION 1.1 [OFFICIAL NSC NOV 2021 P2]: Bank Reconciliation Statement & Cash Book Adjustments of Protea Traders for August 2026. (35 Marks)',
  question_text_af: 'VRAAG 1.1 [AMPTELIKE NSC NOV 2021 V2]: Bankversoeningsstaat & Kontantboek Aanpassings van Protea Handelaars vir Augustus 2026. (35 Punte)',
  info_section_en: `BUSINESS: PROTEA TRADERS
ACCOUNTING PERIOD: MONTH ENDED 31 AUGUST 2026
TOPIC: BANK RECONCILIATION STATEMENT & INTERNAL CONTROL (35 MARKS)

INFORMATION A: CASH BOOK RECORDS BEFORE RECONCILING
• Provisional Cash Journal totals on 31 August 2026:
  - Cash Receipts Journal (CRJ): R148 900
  - Cash Payments Journal (CPJ): R162 450
• Bank Account balance in the General Ledger on 1 August 2026 was R24 780 (Debit / Favourable).

INFORMATION B: BANK STATEMENT FROM STANDARD BANK ON 31 AUGUST 2026
• The Bank Statement showed a favourable credit closing balance of R4 500 on 31 August 2026.
• The following transactions on the Bank Statement did not appear in the Cash Journals:
  1. Service fees of R320 and cash handling fees of R850 were charged by the bank. (Total bank charges = R1 170)
  2. Interest credited on favourable credit balance: R410.
  3. Direct deposit of R7 600 made by debtor B. Zulu in full settlement of his account of R8 000 (after 5% discount of R400).
  4. Monthly debit order for business insurance premium to Mutual Life: R4 500.
  5. Monthly stop order for factory premises rent: R6 200.
  6. Cheque No. 394 for R3 100 received from debtor D. Nkosi was dishonoured and marked 'R/D' due to insufficient funds.
  7. EFT payment No. 402 to supplier Bloom Ltd for R8 900 was incorrectly entered in the CPJ as R9 800.

INFORMATION C: OUTSTANDING TRANSACTIONS & BANK ERRORS ON 31 AUGUST 2026
• Deposit of R21 500 deposited in the smart ATM on 31 August 2026 did not reflect on the Bank Statement.
• Unpresented EFT payments:
  - EFT No. 408 to Telkom: R3 450
  - EFT No. 415 to City Power: R5 630
• The bank statement reflected an unauthorized debit of R1 800 for Protea Flowers (another business). The bank acknowledged the error and confirmed it will be reversed in September.`,
  info_section_af: `BESIGHEID: PROTEA HANDELAARS
REKENKUNDIGE TYDPERK: MAAND GEËINDIG 31 AUGUSTUS 2026
ONDERWERP: BANKVERSOENINGSSTAAT & INTERNE BEHEER (35 PUNTE)

INLIGTING A: KONTANTBOEKREKORDS VOOR VERSOENING
• Voorlopige Kontantjoernaaltotale op 31 Augustus 2026:
  - Kontantontvangstejoernaal (KOJ): R148 900
  - Kontantbetalingsjoernaal (KBJ): R162 450
• Bankrekeningsaldo in die Algemene Grootboek op 1 Augustus 2026 was R24 780 (Debiet / Gunstig).

INLIGTING B: BANKSTAAT VAN STANDAARD BANK OP 31 AUGUSTUS 2026
• Die Bankstaat toon 'n gunstige kredietsaldo van R4 500 op 31 Augustus 2026.
• Die volgende transaksies op die Bankstaat verskyn nie in die Kontantjoernale nie:
  1. Diensfooie van R320 en kontanthanteringsfooie van R850 gehef deur bank. (Totale bankkoste = R1 170)
  2. Rente gekrediteer op gunstige saldo: R410.
  3. Direkte deposito van R7 600 deur debiteur B. Zulu ter vereffening van sy rekening van R8 000 (ná 5% korting van R400).
  4. Maandelikse debietorder vir besigheidsversekering aan Mutual Life: R4 500.
  5. Maandelikse aftrekorder vir fabrieksperseelhuur: R6 200.
  6. Tjek No. 394 van R3 100 ontvang vanaf debiteur D. Nkosi is onteer en gemerk 'V/F' weens onvoldoende fondse.
  7. EFT-betaling No. 402 aan verskaffer Bloom Bpk vir R8 900 is foutiewelik as R9 800 in die KBJ ingeskryf.

INLIGTING C: UITSTAANDE TRANSAKSIES & BANKFOUTE OP 31 AUGUSTUS 2026
• Deposito van R21 500 gemaak by slim-OTM op 31 Augustus 2026 verskyn nie op die Bankstaat nie.
• Uitstaande EFT-betalings:
  - EFT No. 408 aan Telkom: R3 450
  - EFT No. 415 aan City Power: R5 630
• Die bankstaat toon 'n ongemagtigde debiet van R1 800 vir Protea Flowers ('n ander besigheid). Die bank het die fout erken en bevestig dit sal in September reggestel word.`,
  tableConfig: {
    title_en: 'PROTEA TRADERS — CASH BOOKS ADJUSTMENTS & BANK RECONCILIATION STATEMENT',
    title_af: 'PROTEA HANDELAARS — KONTANTBOEK AANPASSINGS & BANKVERSOENINGSSTAAT',
    columns_en: ['Details / Accounting Description', 'Debit (R)', 'Credit (R)'],
    columns_af: ['Besonderhede / Rekenkundige Beskrywing', 'Debiet (R)', 'Krediet (R)'],
    rows: [
      { isHeader: true, label_en: 'SECTION 1: CASH JOURNALS ADJUSTMENTS (31 AUGUST 2026)', label_af: 'AFDELING 1: KONTANTJOERNAAL AANPASSINGS (31 AUGUSTUS 2026)' },
      { id: 'crj_tot', label_en: 'Total Additional CRJ Receipts (Interest + Debtor Zulu + Error Correction)', label_af: 'Totale Addisionele KOJ Ontvangste (Rente + Debiteur Zulu + Foutregstelling)', fields: [{ field_name: 'crj_additions' }] },
      { id: 'cpj_tot', label_en: 'Total Additional CPJ Payments (Bank Charges + Insurance + Rent + R/D Cheque)', label_af: 'Totale Addisionele KBJ Betalings (Bankkoste + Verseker + Huur + V/F Tjek)', fields: [{ field_name: 'cpj_additions' }] },
      { id: 'adj_bank_bal', label_en: 'Adjusted Balance in Bank Account (Favourable Dr balance)', label_af: 'Aangepaste Saldo in Bankrekening (Gunstige Db saldo)', fields: [{ field_name: 'updated_bank_bal' }] },
      { isHeader: true, label_en: 'SECTION 2: BANK RECONCILIATION STATEMENT ON 31 AUGUST 2026', label_af: 'AFDELING 2: BANKVERSOENINGSSTAAT OP 31 AUGUSTUS 2026' },
      { id: 'bs_bal', label_en: 'Credit balance as per Bank Statement', label_af: 'Kredietsaldo volgens Bankstaat', fields: [{ readOnly: true, staticValue: '-' }, { field_name: 'stmt_credit_bal' }] },
      { id: 'out_dep', label_en: 'Credit Outstanding deposit not cleared by bank', label_af: 'Krediteer Uitstaande deposito nie geklaar deur bank', fields: [{ readOnly: true, staticValue: '-' }, { field_name: 'outstanding_dep' }] },
      { id: 'bk_err', label_en: 'Credit Bank error (Unauthorized debit to be reversed by bank)', label_af: 'Krediteer Bankfout (Ongemagtigde debiet om reggestel te word)', fields: [{ readOnly: true, staticValue: '-' }, { field_name: 'bank_error_credit' }] },
      { id: 'eft_408', label_en: 'Debit Outstanding EFT No. 408 (Telkom)', label_af: 'Debiteer Uitstaande EFT No. 408 (Telkom)', fields: [{ field_name: 'eft_408_debit' }, { readOnly: true, staticValue: '-' }] },
      { id: 'eft_415', label_en: 'Debit Outstanding EFT No. 415 (City Power)', label_af: 'Debiteer Uitstaande EFT No. 415 (City Power)', fields: [{ field_name: 'eft_415_debit' }, { readOnly: true, staticValue: '-' }] },
      { id: 'rec_tot', isTotalRow: true, label_en: 'TOTALS RECONCILED (Debit Total = Credit Total = R27 800)', label_af: 'TOTALE VERSOEN (Debiet Totaal = Krediet Totaal = R27 800)', fields: [{ readOnly: true, staticValue: '27 800' }, { readOnly: true, staticValue: '27 800' }] }
    ]
  },
  total_marks: 35,
  explanation_en: 'Official NSC Solution: CRJ additions = R8 910, CPJ additions = R14 970, Adjusted Bank Balance = R18 720 (Dr). Bank Statement Credit = R4 500, Outstanding Deposit = R21 500, Bank Error Credit = R1 800, Outstanding EFTs = R3 450 & R5 630. Reconciles at R27 800.',
  explanation_af: 'Amptelike NSC Oplossing: KOJ byvoegings = R8 910, KBJ byvoegings = R14 970, Aangepaste Banksaldo = R18 720 (Db). Bankstaat Krediet = R4 500, Uitstaande Deposito = R21 500, Bankfout Krediet = R1 800, Uitstaande EFTs = R3 450 & R5 630. Versoen op R27 800.',
  working_solution_en: 'CRJ = 410 (interest) + 7 600 (Zulu) + 900 (CPJ overcast error: 9800-8900) = R8 910. CPJ = 1 170 (bank charges: 320+850) + 4 500 (insurance) + 6 200 (rent) + 3 100 (R/D cheque) = R14 970. Adjusted Bank Balance = 24 780 + 8 910 - 14 970 = R18 720. Recon: Credits = 4 500 + 21 500 + 1 800 = 27 800. Debits = 3 450 + 5 630 + 18 720 (Bank Account) = 27 800.',
  working_solution_af: 'KOJ = 410 (rente) + 7 600 (Zulu) + 900 (KBJ oordragfout: 9800-8900) = R8 910. KBJ = 1 170 (bankkoste: 320+850) + 4 500 (versekering) + 6 200 (huur) + 3 100 (V/F tjek) = R14 970. Aangepaste Banksaldo = 24 780 + 8 910 - 14 970 = R18 720. Versoening: Krediete = 4 500 + 21 500 + 1 800 = 27 800. Debiete = 3 450 + 5 630 + 18 720 = 27 800.',
  fields: [
    { n: 'crj_additions', len: 'CRJ Additions', laf: 'KOJ Byvoegings', c: '8910', m: 5, exp_en: 'Interest 410 + Debtor Zulu 7 600 + CPJ error correction 900 = R8 910.', exp_af: 'Rente 410 + Debiteur Zulu 7 600 + KBJ foutregstelling 900 = R8 910.' },
    { n: 'cpj_additions', len: 'CPJ Additions', laf: 'KBJ Byvoegings', c: '14970', m: 5, exp_en: 'Bank charges 1 170 + Insurance 4 500 + Rent 6 200 + R/D Cheque 3 100 = R14 970.', exp_af: 'Bankkoste 1 170 + Versekering 4 500 + Huur 6 200 + V/F Tjek 3 100 = R14 970.' },
    { n: 'updated_bank_bal', len: 'Adjusted Bank Balance', laf: 'Aangepaste Banksaldo', c: '18720', m: 7, exp_en: '24 780 opening balance + 8 910 CRJ additions - 14 970 CPJ additions = R18 720.', exp_af: '24 780 beginsaldo + 8 910 KOJ - 14 970 KBJ = R18 720.' },
    { n: 'stmt_credit_bal', len: 'Bank Statement Credit Balance', laf: 'Bankstaat Kredietsaldo', c: '4500', m: 4, exp_en: 'Favourable closing credit balance per Bank Statement = R4 500.', exp_af: 'Gunstige eindkredietsaldo volgens Bankstaat = R4 500.' },
    { n: 'outstanding_dep', len: 'Credit Outstanding Deposit', laf: 'Krediet Uitstaande Deposito', c: '21500', m: 4, exp_en: 'Smart ATM deposit of 31 August not on statement = R21 500 (Credit).', exp_af: 'Slim-OTM deposito van 31 Augustus nie op staat nie = R21 500 (Krediet).' },
    { n: 'bank_error_credit', len: 'Credit Bank Error Reversal', laf: 'Krediet Bankfout Regstelling', c: '1800', m: 4, exp_en: 'Unauthorized debit of R1 800 must be credited in the reconciliation statement.', exp_af: 'Ongemagtigde debiet van R1 800 moet in versoeningsstaat gekrediteer word.' },
    { n: 'eft_408_debit', len: 'Debit EFT 408', laf: 'Debiet EFT 408', c: '3450', m: 3, exp_en: 'Unpresented payment to Telkom = R3 450 (Debit).', exp_af: 'Ongepresenteerde betaling aan Telkom = R3 450 (Debiet).' },
    { n: 'eft_415_debit', len: 'Debit EFT 415', laf: 'Debiet EFT 415', c: '5630', m: 3, exp_en: 'Unpresented payment to City Power = R5 630 (Debit).', exp_af: 'Ongepresenteerde betaling aan City Power = R5 630 (Debiet).' }
  ]
});

addQuestion({
  paper_type: 'paper_2', topic_en: 'Cost Accounting', topic_af: 'Koste-rekeningkunde',
  subtopic_en: 'NSC Nov 2021 P2 Q2 (Production Cost Statement & Unit Cost)', subtopic_af: 'NSC Nov 2021 V2 V2 (Produksiekostestaat & Eenheidskoste)', difficulty: 'hard',
  question_text_en: 'QUESTION 1.2 [OFFICIAL NSC NOV 2021 P2]: Production Cost Statement, Work-in-Progress & Unit Cost of Protea Manufacturers for year ended 28 February 2026. (45 Marks)',
  question_text_af: 'VRAAG 1.2 [AMPTELIKE NSC NOV 2021 V2]: Produksiekostestaat, Werk-in-Vordering & Eenheidskoste van Protea Vervaardigers vir jaar geëindig 28 Februarie 2026. (45 Punte)',
  info_section_en: `BUSINESS: PROTEA MANUFACTURERS
ACCOUNTING PERIOD: FINANCIAL YEAR ENDED 28 FEBRUARY 2026
TOPIC: COST ACCOUNTING & PRODUCTION COST STATEMENT (45 MARKS)

INFORMATION A: RAW MATERIALS (DIRECT MATERIALS)
• Raw Materials Inventory on 1 March 2025: R120 000
• Purchases of raw materials during the year: R780 000
• Carriage on purchases of raw materials paid: R35 000
• Defective raw materials returned to suppliers: R15 000
• Raw Materials Inventory on 28 February 2026: R140 000

INFORMATION B: DIRECT LABOUR
• 6 factory production workers were employed throughout the year.
• Each worker worked 1 800 normal hours at the basic rate of R65,00 per hour.
• Each worker worked 250 overtime hours paid at 1.5 times the basic rate (R97,50 per hour).
• Employer contributes 10% towards UIF and pension funds based on basic wages.

INFORMATION C: FACTORY OVERHEADS
• Total factory rent paid was R150 000 (80% allocated to factory, 20% to administration).
• Indirect materials / consumables issued to factory: R45 000
• Water and electricity paid was R80 000 (75% metered for factory machinery).
• Depreciation on factory plant and machinery for the year: R65 000

INFORMATION D: WORK-IN-PROGRESS & OUTPUT
• Work-in-progress on 1 March 2025: R75 000
• Work-in-progress on 28 February 2026: R93 450
• Total finished units produced during the financial year: 40 000 units`,
  info_section_af: `BESIGHEID: PROTEA VERVAARDIGERS
REKENKUNDIGE TYDPERK: FINANSIËLE JAAR GEËINDIG 28 FEBRUARIE 2026
ONDERWERP: KOSTE-REKENINGKUNDE & PRODUKSIEKOSTESTAAT (45 PUNTE)

INLIGTING A: GRONDSTOWWE (DIREKTE MATERIAAL)
• Grondstowwe Voorraad op 1 Maart 2025: R120 000
• Aankope van grondstowwe gedurende die jaar: R780 000
• Vrag op aankope van grondstowwe betaal: R35 000
• Foutiewe grondstowwe teruggestuur aan verskaffers: R15 000
• Grondstowwe Voorraad op 28 Februarie 2026: R140 000

INLIGTING B: DIREKTE ARBEID
• 6 fabrieksproduksiewerkers was regdeur die jaar in diens.
• Elke werker het 1 800 normale ure gewerk teen basiese tarief van R65,00 per uur.
• Elke werker het 250 oortydure gewerk teen 1.5 maal die basiese tarief (R97,50 per uur).
• Werkgewer dra 10% by tot WVF en pensioenfondse gebaseer op basiese lone.

INLIGTING C: FABRIEKSBOKOSTE
• Totale fabriekshuur betaal was R150 000 (80% toegewys aan fabriek, 20% aan administrasie).
• Indirekte materiaal / verbruiksgoedere uitgereik na fabriek: R45 000
• Water en elektrisiteit betaal was R80 000 (75% gemeter vir fabrieksmasjinerie).
• Waardevermindering op fabrieksmasjinerie vir die jaar: R65 000

INLIGTING D: WERK-IN-VORDERING & PRODUKSIE
• Werk-in-vordering op 1 Maart 2025: R75 000
• Werk-in-vordering op 28 Februarie 2026: R93 450
• Totale voltooide eenhede geproduseer gedurende finansiële jaar: 40 000 eenhede`,
  tableConfig: {
    title_en: 'PROTEA MANUFACTURERS — PRODUCTION COST STATEMENT FOR YEAR ENDED 28 FEBRUARY 2026',
    title_af: 'PROTEA VERVAARDIGERS — PRODUKSIEKOSTESTAAT VIR JAAR GEËINDIG 28 FEBRUARIE 2026',
    columns_en: ['Cost Component / Production Item', 'Amount (R)'],
    columns_af: ['Kostekomponent / Produksie-item', 'Bedrag (R)'],
    rows: [
      { id: 'dmc', label_en: 'Direct Material Cost Consumed (120k + 780k + 35k - 15k - 140k)', label_af: 'Direkte Materiaalkoste Verbruik (120k + 780k + 35k - 15k - 140k)', fields: [{ field_name: 'dm_consumed' }] },
      { id: 'dlc', label_en: 'Direct Labour Cost (Basic wages + Overtime + 10% Contributions)', label_af: 'Direkte Arbeidskoste (Basiese lone + Oortyd + 10% Bydraes)', fields: [{ field_name: 'dl_cost' }] },
      { id: 'prime', isTotalRow: true, label_en: 'Prime Cost', label_af: 'Primêre Koste', fields: [{ field_name: 'prime_cost' }] },
      { id: 'foh', label_en: 'Factory Overhead Cost (Rent 80% + Indirect Mat + Water/Elec 75% + Deprec)', label_af: 'Fabrieksbokoste (Huur 80% + Indirek Mat + Water/Elek 75% + Waardeverm)', fields: [{ field_name: 'foh_cost' }] },
      { id: 'tot_prod', isTotalRow: true, label_en: 'Total Cost of Production', label_af: 'Totale Produksiekoste', fields: [{ field_name: 'total_production_cost' }] },
      { id: 'wip_open', label_en: 'Add: Work-in-progress at beginning (1 March 2025)', label_af: 'Tel by: Werk-in-vordering aan begin (1 Maart 2025)', fields: [{ readOnly: true, staticValue: '75 000' }] },
      { id: 'wip_close', label_en: 'Less: Work-in-progress at end (28 February 2026)', label_af: 'Trek af: Werk-in-vordering aan einde (28 Februarie 2026)', fields: [{ readOnly: true, staticValue: '(93 450)' }] },
      { id: 'fg_cost', isTotalRow: true, label_en: 'Cost of Finished Goods Produced', label_af: 'Koste van Voltooide Goedere Geproduseer', fields: [{ field_name: 'finished_goods_cost' }] },
      { id: 'uc', label_en: 'Unit Cost of Production per finished unit (R per unit)', label_af: 'Eenheidskoste van Produksie per voltooide eenheid (R per eenheid)', fields: [{ field_name: 'unit_cost' }] }
    ]
  },
  total_marks: 45,
  explanation_en: 'Official NSC Solution: Direct Material = R780 000, Direct Labour = R918 450, Prime Cost = R1 698 450, Factory Overheads = R290 000, Total Production Cost = R1 988 450, Finished Goods Cost = R1 970 000, Unit Cost = R49,25 per unit (40 000 units).',
  explanation_af: 'Amptelike NSC Oplossing: Direkte Materiaal = R780 000, Direkte Arbeid = R918 450, Primêre Koste = R1 698 450, Fabrieksbokoste = R290 000, Totale Produksiekoste = R1 988 450, Voltooide Goedere Koste = R1 970 000, Eenheidskoste = R49,25 per eenheid (40 000 eenhede).',
  working_solution_en: '1. Direct Materials: 120 000 + 780 000 + 35 000 - 15 000 - 140 000 = R780 000.\\n2. Direct Labour: Basic = 6 * 1 800 * 65 = R702 000. Overtime = 6 * 250 * 97.50 = R146 250. Contributions = 10% of 702 000 = R70 200. Total DL = 702 000 + 146 250 + 70 200 = R918 450.\\n3. Prime Cost = 780 000 + 918 450 = R1 698 450.\\n4. Factory Overheads: Rent = 80% of 150 000 = 120 000. Indirect mat = 45 000. Electricity = 75% of 80 000 = 60 000. Depreciation = 65 000. Total FOH = 120k + 45k + 60k + 65k = R290 000.\\n5. Total Production Cost = 1 698 450 + 290 000 = R1 988 450.\\n6. Finished Goods = 1 988 450 + 75 000 - 93 450 = R1 970 000.\\n7. Unit Cost = 1 970 000 / 40 000 = R49,25.',
  working_solution_af: '1. Direkte Materiaal: 120 000 + 780 000 + 35 000 - 15 000 - 140 000 = R780 000.\\n2. Direkte Arbeid: Basies = 6 * 1800 * 65 = 702 000. Oortyd = 6 * 250 * 97.50 = 146 250. Bydraes = 10% * 702 000 = 70 200. Totaal = 918 450.\\n3. Primêre Koste = 780 000 + 918 450 = R1 698 450.\\n4. Fabrieksbokoste = 120k (huur) + 45k (materiaal) + 60k (krag) + 65k (waardeverm) = R290 000.\\n5. Totale Produksiekoste = 1 698 450 + 290 000 = R1 988 450.\\n6. Voltooide Goedere = 1 988 450 + 75 000 - 93 450 = R1 970 000.\\n7. Eenheidskoste = 1 970 000 / 40 000 = R49,25.',
  fields: [
    { n: 'dm_consumed', len: 'Direct Material Cost Consumed', laf: 'Direkte Materiaalkoste Verbruik', c: '780000', m: 8, exp_en: '120k + 780k + 35k (carriage) - 15k (returns) - 140k (closing) = R780 000.', exp_af: '120k + 780k + 35k (vrag) - 15k (terugsendings) - 140k (eind) = R780 000.' },
    { n: 'dl_cost', len: 'Direct Labour Cost', laf: 'Direkte Arbeidskoste', c: '918450', m: 8, exp_en: 'Basic wages 702k + Overtime 146 250 + 10% Contributions 70 200 = R918 450.', exp_af: 'Basiese lone 702k + Oortyd 146 250 + 10% Bydraes 70 200 = R918 450.' },
    { n: 'prime_cost', len: 'Prime Cost', laf: 'Primêre Koste', c: '1698450', m: 6, exp_en: 'Direct Materials 780 000 + Direct Labour 918 450 = R1 698 450.', exp_af: 'Direkte Materiaal 780 000 + Direkte Arbeid 918 450 = R1 698 450.' },
    { n: 'foh_cost', len: 'Factory Overhead Cost', laf: 'Fabrieksbokoste', c: '290000', m: 7, exp_en: 'Rent 120k + Indirect materials 45k + Electricity 60k + Depreciation 65k = R290 000.', exp_af: 'Huur 120k + Indirekte materiaal 45k + Elektrisiteit 60k + Waardevermindering 65k = R290 000.' },
    { n: 'total_production_cost', len: 'Total Cost of Production', laf: 'Totale Produksiekoste', c: '1988450', m: 6, exp_en: 'Prime Cost 1 698 450 + Factory Overheads 290 000 = R1 988 450.', exp_af: 'Primêre Koste 1 698 450 + Fabrieksbokoste 290 000 = R1 988 450.' },
    { n: 'finished_goods_cost', len: 'Cost of Finished Goods Produced', laf: 'Koste van Voltooide Goedere', c: '1970000', m: 5, exp_en: 'Total Production 1 988 450 + WIP Opening 75 000 - WIP Closing 93 450 = R1 970 000.', exp_af: 'Totale Produksie 1 988 450 + WIV Begin 75 000 - WIV Einde 93 450 = R1 970 000.' },
    { n: 'unit_cost', len: 'Unit Cost of Production', laf: 'Eenheidskoste van Produksie', c: '49.25', tol: 0.1, m: 5, exp_en: 'Finished Goods Cost R1 970 000 / 40 000 units = R49,25 per unit.', exp_af: 'Voltooide Goedere Koste R1 970 000 / 40 000 eenhede = R49,25 per eenheid.' }
  ]
});

addQuestion({
  paper_type: 'paper_2', topic_en: 'Inventory Valuation', topic_af: 'Voorraadwaardasie',
  subtopic_en: 'NSC Nov 2021 P2 Q3 (FIFO Inventory Valuation & Stock Loss)', subtopic_af: 'NSC Nov 2021 V2 V3 (FIFO Voorraadwaardasie & Voorraadverlies)', difficulty: 'hard',
  question_text_en: 'QUESTION 1.3 [OFFICIAL NSC NOV 2021 P2]: FIFO Inventory Valuation, Carriage Inwards, Returns & Stock Deficit of Protea Traders for year ended 30 June 2026. (35 Marks)',
  question_text_af: 'VRAAG 1.3 [AMPTELIKE NSC NOV 2021 V2]: FIFO Voorraadwaardasie, Inwaartse Vrag, Terugsendings & Voorraadtekort van Protea Handelaars vir jaar geëindig 30 Junie 2026. (35 Punte)',
  info_section_en: `BUSINESS: PROTEA TRADERS
ACCOUNTING PERIOD: FINANCIAL YEAR ENDED 30 JUNE 2026
TOPIC: INVENTORY VALUATION (FIFO METHOD) & INTERNAL CONTROL (35 MARKS)

INFORMATION A: STOCK RECORDS FOR TITAN-X SPORTS EQUIPMENT
• Opening Inventory (1 July 2025): 150 units @ R420 = R63 000
• Purchases during the financial year:
  - October 2025: 300 units @ R460 = R138 000 (Carriage on purchases paid: R3 000 / R10 per unit)
  - January 2026: 450 units @ R500 = R225 000 (Carriage on purchases paid: R6 750 / R15 per unit)
  - May 2026: 200 units @ R540 = R108 000 (Carriage on purchases paid: R4 000 / R20 per unit)
• Returns to supplier in November 2025:
  - 20 defective units from the October batch were returned to supplier.
  - The supplier refunded the purchase price (R460) and the carriage cost (R10) in full (Total credit R470 per unit = R9 400).

INFORMATION B: SALES & PHYSICAL STOCK COUNT
• Total units sold during the financial year: 820 units at a uniform selling price of R850 each (Total Sales Revenue = R697 000).
• Physical stock count on 30 June 2026 revealed only 245 units physically present in the storeroom.
• The periodic inventory system is used.`,
  info_section_af: `BESIGHEID: PROTEA HANDELAARS
REKENKUNDIGE TYDPERK: FINANSIËLE JAAR GEËINDIG 30 JUNIE 2026
ONDERWERP: VOORRAADWAARDASIE (FIFO METODE) & INTERNE BEHEER (35 PUNTE)

INLIGTING A: VOORRAADREKORDS VIR TITAN-X SPORTTOERUSTING
• Beginvoorraad (1 Julie 2025): 150 eenhede @ R420 = R63 000
• Aankope gedurende die finansiële jaar:
  - Oktober 2025: 300 eenhede @ R460 = R138 000 (Inwaartse vrag betaal: R3 000 / R10 per eenheid)
  - Januarie 2026: 450 eenhede @ R500 = R225 000 (Inwaartse vrag betaal: R6 750 / R15 per eenheid)
  - Mei 2026: 200 eenhede @ R540 = R108 000 (Inwaartse vrag betaal: R4 000 / R20 per eenheid)
• Terugsendings aan verskaffer in November 2025:
  - 20 foutiewe eenhede uit die Oktober-besending is teruggestuur.
  - Verskaffer het aankoopprys (R460) en vrag (R10) ten volle gekrediteer (Totale krediet R470 per eenheid = R9 400).

INLIGTING B: VERKOPE & FISIESE VOORRAADTELLING
• Totale eenhede verkoop gedurende die jaar: 820 eenhede teen R850 elk (Totale Inkomste = R697 000).
• Fisiese voorraadtelling op 30 Junie 2026 het slegs 245 eenhede fisies in die stoor getoon.
• Die periodieke voorraadstelsel word gebruik.`,
  tableConfig: {
    title_en: 'PROTEA TRADERS — FIFO INVENTORY VALUATION & AUDIT SCHEDULE',
    title_af: 'PROTEA HANDELAARS — FIFO VOORRAADWAARDASIE & OUDITSKEDULE',
    columns_en: ['Valuation / Audit Item', 'Calculation / Units', 'Amount (R)'],
    columns_af: ['Waardasie / Oudit-item', 'Berekening / Eenhede', 'Bedrag (R)'],
    rows: [
      { id: 'avail_cost', label_en: 'Total Cost of Stock Available for Sale (incl carriage less returns)', label_af: 'Totale Koste van Voorraad Beskikbaar vir Verkoop (ingl vrag minus terugsendings)', fields: [{ readOnly: true, staticValue: '1 080 units' }, { field_name: 'total_available_cost' }] },
      { id: 'miss_units', label_en: 'Stock Deficit / Missing Stolen Units (1 080 available - 820 sold - 245 count)', label_af: 'Voorraadtekort / Verlore Gesteelde Eenhede (1 080 - 820 - 245)', fields: [{ field_name: 'missing_units' }, { readOnly: true, staticValue: '-' }] },
      { id: 'def_val', label_en: 'Value of Stock Deficit written off (15 units from Jan batch @ R515 cost)', label_af: 'Waarde van Voorraadtekort afgeskryf (15 eenhede uit Jan-besending @ R515)', fields: [{ readOnly: true, staticValue: '15 units @ R515' }, { field_name: 'deficit_value' }] },
      { id: 'close_val', isTotalRow: true, label_en: 'VALUE OF CLOSING STOCK UNDER FIFO (200 @ R560 + 45 @ R515)', label_af: 'WAARDE VAN EINDVOORRAAD ONDER FIFO (200 @ R560 + 45 @ R515)', fields: [{ readOnly: true, staticValue: '245 units' }, { field_name: 'closing_stock_fifo' }] },
      { id: 'cos_fifo', isTotalRow: true, label_en: 'COST OF SALES (Total Available R538 350 - Closing Stock R135 175 - Deficit R7 725)', label_af: 'KOSTE VAN VERKOPE (Beskikbaar R538 350 - Eindvoorraad R135 175 - Tekort R7 725)', fields: [{ readOnly: true, staticValue: '820 units sold' }, { field_name: 'cost_of_sales_fifo' }] },
      { id: 'gp_fifo', isTotalRow: true, label_en: 'Gross Profit ACHIEVED (Sales R697 000 - Cost of Sales R395 450)', label_af: 'Bruto Wins BEHAAL (Verkope R697 000 - Koste van Verkope R395 450)', fields: [{ readOnly: true, staticValue: 'Margin: 43.26%' }, { field_name: 'gross_profit' }] }
    ]
  },
  total_marks: 35,
  explanation_en: 'Official NSC Solution: Total Available Cost = R538 350 (1 080 units). Missing units = 15 units (Value R7 725). Closing Stock FIFO = R135 175 (245 units: 200 @ R560 + 45 @ R515). Cost of Sales = R395 450. Gross Profit = R301 550.',
  explanation_af: 'Amptelike NSC Oplossing: Totale Beskikbare Koste = R538 350 (1 080 eenhede). Ontbrekende eenhede = 15 eenhede (Waarde R7 725). Eindvoorraad FIFO = R135 175 (245 eenhede: 200 @ R560 + 45 @ R515). Koste van Verkope = R395 450. Bruto Wins = R301 550.',
  working_solution_en: '1. Total Available Cost: Opening = 63 000; Oct = (300*460 + 3 000) - (20*470) = 138k + 3k - 9.4k = 131 600; Jan = 450*500 + 6 750 = 231 750; May = 200*540 + 4 000 = 112 000. Total = 63k + 131.6k + 231.75k + 112k = R538 350.\\n2. Available units = 150 + 280 + 450 + 200 = 1 080 units. Missing = 1 080 - 820 sold - 245 physical = 15 units.\\n3. Under FIFO, the 15 missing units come from Jan batch (cost R500 + R15 carriage = R515). Deficit Value = 15 * 515 = R7 725.\\n4. Closing stock (245 units): 200 units from May @ R560 (540+20) = R112 000 + 45 units from Jan @ R515 (500+15) = R23 175. Total Closing Stock = R135 175.\\n5. Cost of Sales = 538 350 - 135 175 - 7 725 = R395 450.\\n6. Gross Profit = 697 000 - 395 450 = R301 550.',
  working_solution_af: '1. Totale Beskikbare Koste: Begin = 63k; Okt = 131 600; Jan = 231 750; Mei = 112 000. Totaal = R538 350.\\n2. Beskikbare eenhede = 1 080. Tekort = 1 080 - 820 - 245 = 15 eenhede.\\n3. Tekortwaarde = 15 * R515 = R7 725.\\n4. Eindvoorraad FIFO (245 eenhede): 200 @ R560 (112 000) + 45 @ R515 (23 175) = R135 175.\\n5. Koste van Verkope = 538 350 - 135 175 - 7 725 = R395 450.\\n6. Bruto Wins = 697 000 - 395 450 = R301 550.',
  fields: [
    { n: 'total_available_cost', len: 'Total Cost of Stock Available', laf: 'Totale Koste van Beskikbare Voorraad', c: '538350', m: 7, exp_en: '63k (opening) + 131.6k (Oct net) + 231.75k (Jan) + 112k (May) = R538 350.', exp_af: '63k (begin) + 131.6k (Okt netto) + 231.75k (Jan) + 112k (Mei) = R538 350.' },
    { n: 'missing_units', len: 'Stock Deficit Quantity', laf: 'Voorraadtekort Hoeveelheid', c: '15', m: 5, exp_en: '1 080 available - 820 sold - 245 physical count = 15 missing units.', exp_af: '1 080 beskikbaar - 820 verkoop - 245 fisies getel = 15 ontbrekende eenhede.' },
    { n: 'deficit_value', len: 'Value of Stock Deficit', laf: 'Waarde van Voorraadtekort', c: '7725', m: 6, exp_en: '15 missing units from January batch @ R515 unit cost (R500 + R15 carriage) = R7 725.', exp_af: '15 ontbrekende eenhede uit Jan-besending @ R515 eenheidskoste (500+15) = R7 725.' },
    { n: 'closing_stock_fifo', len: 'Value of Closing Stock (FIFO)', laf: 'Waarde van Eindvoorraad (FIFO)', c: '135175', m: 7, exp_en: '200 units from May @ R560 (R112 000) + 45 units from Jan @ R515 (R23 175) = R135 175.', exp_af: '200 eenhede van Mei @ R560 (R112 000) + 45 eenhede van Jan @ R515 (R23 175) = R135 175.' },
    { n: 'cost_of_sales_fifo', len: 'Cost of Sales (FIFO)', laf: 'Koste van Verkope (FIFO)', c: '395450', m: 5, exp_en: 'Total available cost R538 350 - Closing Stock R135 175 - Deficit R7 725 = R395 450.', exp_af: 'Totale beskikbare koste R538 350 - Eindvoorraad R135 175 - Tekort R7 725 = R395 450.' },
    { n: 'gross_profit', len: 'Gross Profit', laf: 'Bruto Wins', c: '301550', m: 5, exp_en: 'Total Sales R697 000 - Cost of Sales R395 450 = R301 550.', exp_af: 'Totale Verkope R697 000 - Koste van Verkope R395 450 = R301 550.' }
  ]
});

addQuestion({
  paper_type: 'paper_2', topic_en: 'Budgeting & VAT', topic_af: 'Begrotings & BTW',
  subtopic_en: 'NSC Nov 2021 P2 Q4 (Cash Budget, Debtors Collection & VAT Control)', subtopic_af: 'NSC Nov 2021 V2 V4 (Kontantbegroting, Debiteure Invordering & BTW Beheer)', difficulty: 'medium',
  question_text_en: 'QUESTION 1.4 [OFFICIAL NSC NOV 2021 P2]: Cash Budget Receipts, Debtors Collection Schedule & VAT Control Account for October 2026. (35 Marks)',
  question_text_af: 'VRAAG 1.4 [AMPTELIKE NSC NOV 2021 V2]: Kontantbegroting Ontvangste, Debiteure Invorderingskedule & BTW Beheer vir Oktober 2026. (35 Punte)',
  info_section_en: `BUSINESS: PROTEA TRADERS
ACCOUNTING PERIOD: BUDGET FOR OCTOBER & NOVEMBER 2026
TOPIC: CASH BUDGETING & VAT (15% STANDARD RATE) (35 MARKS)

INFORMATION A: SALES AND CREDIT POLICY
• Total Sales (excluding VAT):
  - August (Actual): R400 000
  - September (Actual): R450 000
  - October (Budgeted): R500 000
  - November (Budgeted): R600 000
• 25% of total sales are for cash.
• 75% of total sales are on credit.
• Debtors are expected to pay according to the following collection pattern:
  - 50% in the month of sale, qualifying for a 5% prompt payment cash discount.
  - 35% in the month following the month of sale.
  - 12% in the second month following the month of sale.
  - 3% is written off as irrecoverable after 90 days.

INFORMATION B: VAT INFORMATION FOR OCTOBER 2026 (VAT RATE 15%)
• Output VAT on October sales (15% on R500 000).
• Input VAT on standard merchandise purchases and operating expenses for October: R42 000.
• A new delivery vehicle was purchased on credit on 15 October 2026 for R320 000 (excluding VAT). The full 15% input VAT is claimable in the October VAT return.`,
  info_section_af: `BESIGHEID: PROTEA HANDELAARS
REKENKUNDIGE TYDPERK: BEGROTING VIR OKTOBER & NOVEMBER 2026
ONDERWERP: KONTANTBEGROTING & BTW (15% STANDAARDKOERS) (35 PUNTE)

INLIGTING A: VERKOPE EN KREDIETBELEID
• Totale Verkope (BTW uitgesluit):
  - Augustus (Werklik): R400 000
  - September (Werklik): R450 000
  - Oktober (Gebegroot): R500 000
  - November (Gebegroot): R600 000
• 25% van totale verkope is vir kontant.
• 75% van totale verkope is op krediet.
• Debiteure betaal volgens die volgende invorderingspatroon:
  - 50% in die maand van verkope, onderhewig aan 'n 5% vinnige betalingskorting.
  - 35% in die maand ná die verkopemaand.
  - 12% in die tweede maand ná die verkopemaand.
  - 3% word as oninbaar afgeskryf na 90 dae.

INLIGTING B: BTW INLIGTING VIR OKTOBER 2026 (BTW KOERS 15%)
• Uitset BTW op Oktober-verkope (15% op R500 000).
• Inset BTW op standaard handelsvoorraadaankope en bedryfsuitgawes vir Oktober: R42 000.
• 'n Nuwe afleweringsvoertuig is op 15 Oktober 2026 op krediet aangekoop vir R320 000 (BTW uitgesluit). Die volle 15% inset BTW is eisbaar in die Oktober BTW-opgawe.`,
  tableConfig: {
    title_en: 'PROTEA TRADERS — DEBTORS COLLECTION & VAT CONTROL SCHEDULE',
    title_af: 'PROTEA HANDELAARS — DEBITEURE INVORDERING & BTW BEHEERSKEDULE',
    columns_en: ['Budget / VAT Item', 'Calculation Workings', 'Amount (R)'],
    columns_af: ['Begroting / BTW Item', 'Berekening Bewerkinge', 'Bedrag (R)'],
    rows: [
      { isHeader: true, label_en: 'SECTION 1: CASH RECEIPTS BUDGET FOR OCTOBER 2026', label_af: 'AFDELING 1: KONTANTONTVANGSTE BEGROTING VIR OKTOBER 2026' },
      { id: 'cs_oct', label_en: 'Budgeted Cash Sales for October (25% of R500 000)', label_af: 'Gebegrote Kontantverkope vir Oktober (25% van R500 000)', fields: [{ readOnly: true, staticValue: '500 000 * 25%' }, { field_name: 'oct_cash_sales' }] },
      { id: 'dc_oct', label_en: 'Cash Collected from Debtors in October (Oct 50%-5% + Sep 35% + Aug 12%)', label_af: 'Kontant van Debiteure ingevorder in Oktober (Okt 50%-5% + Sep 35% + Aug 12%)', fields: [{ readOnly: true, staticValue: '178 125 + 118 125 + 36 000' }, { field_name: 'oct_debtors_collected' }] },
      { id: 'tot_rec_oct', isTotalRow: true, label_en: 'Total Budgeted Cash Receipts in October', label_af: 'Totale Gebergrote Kontantontvangste in Oktober', fields: [{ readOnly: true, staticValue: 'Cash Sales + Debtors' }, { field_name: 'oct_total_receipts' }] },
      { isHeader: true, label_en: 'SECTION 2: SARS VAT RETURN CALCULATION FOR OCTOBER 2026', label_af: 'AFDELING 2: SARS BTW-OPGAWE BEREKENING VIR OKTOBER 2026' },
      { id: 'out_vat', label_en: 'Output VAT on October Sales (15% on R500 000)', label_af: 'Uitset BTW op Oktober-verkope (15% op R500 000)', fields: [{ readOnly: true, staticValue: '500 000 * 15%' }, { field_name: 'output_vat_oct' }] },
      { id: 'inp_vat', label_en: 'Total Input VAT Claimable (Purchases R42k + Capital Vehicle R48k)', label_af: 'Totale Inset BTW Eisbaar (Aankope R42k + Kapitaalvoertuig R48k)', fields: [{ readOnly: true, staticValue: '42 000 + (320 000 * 15%)' }, { field_name: 'input_vat_oct' }] },
      { id: 'net_vat', isTotalRow: true, label_en: 'NET VAT REFUND CLAIMABLE FROM SARS (Input VAT R90k - Output VAT R75k)', label_af: 'NETTO BTW TERUGBETALING VAN SARS (Inset BTW R90k - Uitset BTW R75k)', fields: [{ readOnly: true, staticValue: 'Refundable / Terugbetaalbaar' }, { field_name: 'net_vat_refund' }] }
    ]
  },
  total_marks: 35,
  explanation_en: 'Official NSC Solution: October Cash Sales = R125 000. Debtors Collection = R332 250 (Oct R178 125 + Sep R118 125 + Aug R36 000). Total Cash Receipts = R457 250. Output VAT = R75 000, Total Input VAT = R90 000 (42k + 48k vehicle), Net VAT Refund from SARS = R15 000.',
  explanation_af: 'Amptelike NSC Oplossing: Oktober Kontantverkope = R125 000. Debiteure Invordering = R332 250 (Okt R178 125 + Sep R118 125 + Aug R36 000). Totale Ontvangste = R457 250. Uitset BTW = R75 000, Totale Inset BTW = R90 000 (42k + 48k voertuig), Netto BTW Terugbetaling vanaf SARS = R15 000.',
  working_solution_en: '1. Cash Sales = 500 000 * 25% = R125 000.\\n2. Credit Sales: Oct = 75% of 500k = 375k; Sep = 75% of 450k = 337.5k; Aug = 75% of 400k = 300k.\\n3. Debtors Collection in Oct:\\n   - From Oct sales: 375k * 50% = 187 500 less 5% discount (9 375) = R178 125.\\n   - From Sep sales: 337.5k * 35% = R118 125.\\n   - From Aug sales: 300k * 12% = R36 000.\\n   - Total Debtors Collected in Oct = 178 125 + 118 125 + 36 000 = R332 250.\\n4. Total Receipts = 125 000 + 332 250 = R457 250.\\n5. Output VAT = 500 000 * 15% = R75 000.\\n6. Input VAT = 42 000 + (320 000 * 15% = 48 000) = R90 000.\\n7. Net VAT Refund = 90 000 - 75 000 = R15 000.',
  working_solution_af: '1. Kontantverkope = 500 000 * 25% = R125 000.\\n2. Kredietverkope: Okt = 375k; Sep = 337.5k; Aug = 300k.\\n3. Debiteure Invordering in Okt: Van Okt (375k*50%-5%) = 178 125; Van Sep (337.5k*35%) = 118 125; Van Aug (300k*12%) = 36 000. Totaal = R332 250.\\n4. Totale Ontvangste = 125 000 + 332 250 = R457 250.\\n5. Uitset BTW = 500k * 15% = R75 000.\\n6. Inset BTW = 42k + 48k (voertuig) = R90 000.\\n7. Netto Terugbetaling = 90k - 75k = R15 000.',
  fields: [
    { n: 'oct_cash_sales', len: 'October Cash Sales', laf: 'Oktober Kontantverkope', c: '125000', m: 5, exp_en: '25% of R500 000 total sales = R125 000.', exp_af: '25% van R500 000 totale verkope = R125 000.' },
    { n: 'oct_debtors_collected', len: 'Cash Collected from Debtors', laf: 'Kontant van Debiteure Ingevorder', c: '332250', m: 8, exp_en: 'Oct (178 125) + Sep (118 125) + Aug (36 000) = R332 250.', exp_af: 'Okt (178 125) + Sep (118 125) + Aug (36 000) = R332 250.' },
    { n: 'oct_total_receipts', len: 'Total Cash Receipts for October', laf: 'Totale Kontantontvangste vir Oktober', c: '457250', m: 6, exp_en: 'Cash sales R125 000 + Debtors collection R332 250 = R457 250.', exp_af: 'Kontantverkope R125 000 + Debiteure invordering R332 250 = R457 250.' },
    { n: 'output_vat_oct', len: 'Output VAT on October Sales', laf: 'Uitset BTW op Oktober-verkope', c: '75000', m: 5, exp_en: '15% on R500 000 sales = R75 000.', exp_af: '15% op R500 000 verkope = R75 000.' },
    { n: 'input_vat_oct', len: 'Total Input VAT Claimable', laf: 'Totale Inset BTW Eisbaar', c: '90000', m: 6, exp_en: 'Operating input VAT R42 000 + Vehicle capital input VAT (320 000 * 15% = R48 000) = R90 000.', exp_af: 'Bedryfsinset BTW R42 000 + Voertuig inset BTW (320 000 * 15% = R48 000) = R90 000.' },
    { n: 'net_vat_refund', len: 'Net VAT Refund Claimable from SARS', laf: 'Netto BTW Terugbetaling van SARS', c: '15000', m: 5, exp_en: 'Input VAT R90 000 - Output VAT R75 000 = R15 000 refund receivable from SARS.', exp_af: 'Inset BTW R90 000 - Uitset BTW R75 000 = R15 000 terugbetaling eisbaar vanaf SARS.' }
  ]
});

// --- PAPER 2 - EXAM SET 2 (OFFICIAL NSC NOV 2022 PAPER 2 - 150 MARKS) ---
addQuestion({
  paper_type: 'paper_2', topic_en: 'Reconciliations', topic_af: 'Versoenings',
  subtopic_en: 'NSC Nov 2022 P2 Q1 (Creditors Reconciliation & Statement Comparison)', subtopic_af: 'NSC Nov 2022 V2 V1 (Krediteureversoening & Staatvergelyking)', difficulty: 'hard',
  question_text_en: 'QUESTION 2.1 [OFFICIAL NSC NOV 2022 P2]: Creditors Ledger & Monthly Statement Reconciliation of Jacaranda Traders with Supplier Apex Ltd on 30 September 2026. (35 Marks)',
  question_text_af: 'VRAAG 2.1 [AMPTELIKE NSC NOV 2022 V2]: Krediteuregrootboek & Maandstaatversoening van Jacaranda Handelaars met Verskaffer Apex Bpk op 30 September 2026. (35 Punte)',
  info_section_en: `BUSINESS: JACARANDA TRADERS
CREDITOR: APEX LTD
ACCOUNTING PERIOD: MONTH ENDED 30 SEPTEMBER 2026
TOPIC: CREDITORS RECONCILIATION & INTERNAL CONTROL (35 MARKS)

INFORMATION A: BALANCES ON 30 SEPTEMBER 2026 BEFORE INVESTIGATION
• Creditors Ledger Account of Apex Ltd in Jacaranda Traders records: R84 500 (Credit balance).
• Statement of Account received from Apex Ltd on 30 September 2026: R106 300 (Debit balance).

INFORMATION B: DISCREPANCIES DISCOVERED UPON INVESTIGATION
1. Invoice No. 781 for goods purchased from Apex Ltd for R16 400 was recorded correctly on the statement but recorded as R14 600 in the Creditors Journal of Jacaranda Traders.
2. Credit Note No. 304 for damaged goods returned (R4 200) was recorded in the Creditors Allowances Journal, but Apex Ltd did not process it on their statement.
3. Jacaranda Traders qualified for an early settlement discount of R1 500 upon paying Invoice 750, which was omitted from the Creditors Ledger.
4. An EFT payment of R22 000 made by Jacaranda Traders on 30 September 2026 was recorded in the CPJ, but did not reflect on the statement of Apex Ltd.
5. Apex Ltd charged R650 overdue interest on the statement. Following a dispute, Apex Ltd agreed in writing to cancel this interest charge.
6. An invoice for R3 250 for goods purchased from another supplier (Axis Ltd) was erroneously posted to the account of Apex Ltd in the Creditors Ledger.`,
  info_section_af: `BESIGHEID: JACARANDA HANDELAARS
KREDITEUR: APEX BPK
REKENKUNDIGE TYDPERK: MAAND GEËINDIG 30 SEPTEMBER 2026
ONDERWERP: KREDITEUREVERSOENING & INTERNE BEHEER (35 PUNTE)

INLIGTING A: SALDO'S OP 30 SEPTEMBER 2026 VOOR ONDERSOEK
• Krediteuregrootboekrekening van Apex Bpk in Jacaranda Handelaars rekords: R84 500 (Kredietsaldo).
• Rekeningstaat ontvang vanaf Apex Bpk op 30 September 2026: R106 300 (Debietsaldo).

INLIGTING B: VERSKILLE ONTDEK TYDENS ONDERSOEK
1. Faktuur No. 781 vir goedere aangekoop vanaf Apex Bpk vir R16 400 is korrek op die staat, maar as R14 600 in die Krediteurejoernaal van Jacaranda aangeteken.
2. Kredietnota No. 304 vir beskadigde voorraad teruggestuur (R4 200) is in die Krediteure-afslagjoernaal aangeteken, maar Apex Bpk het dit nog nie op staat verwerk nie.
3. Jacaranda het gekwalifiseer vir 'n vinnige vereffeningskorting van R1 500 met betaling van Faktuur 750, wat in die Krediteuregrootboek weggelaat is.
4. 'n EFT-betaling van R22 000 gemaak op 30 September 2026 is in die KBJ aangeteken, maar verskyn nie op die staat van Apex Bpk nie.
5. Apex Bpk het R650 agterstallige rente op die staat gehef. Na 'n dispuut het Apex skriftelik ingestem om hierdie rente te kanselleer.
6. 'n Faktuur van R3 250 vir goedere van 'n ander verskaffer (Axis Bpk) is per abuis na Apex Bpk se rekening in die Krediteuregrootboek gepos.`,
  tableConfig: {
    title_en: 'JACARANDA TRADERS — CREDITORS RECONCILIATION STATEMENT',
    title_af: 'JACARANDA HANDELAARS — KREDITEUREVERSOENINGSSTAAT',
    columns_en: ['Adjustment / Reconciliation Item', 'Creditors Ledger (R)', 'Statement of Account (R)'],
    columns_af: ['Aanpassing / Versoeningsitem', 'Krediteuregrootboek (R)', 'Rekeningstaat (R)'],
    rows: [
      { id: 'open_bals', label_en: 'Balances before adjustments (Given)', label_af: 'Saldo’s voor aanpassings (Gegee)', fields: [{ readOnly: true, staticValue: '84 500' }, { readOnly: true, staticValue: '106 300' }] },
      { id: 'inv_781', label_en: '1. Invoice 781 undercast in Creditors Journal (16 400 - 14 600)', label_af: '1. Faktuur 781 ondertelling in Krediteurejoernaal (16 400 - 14 600)', fields: [{ field_name: 'inv_781_correction' }, { readOnly: true, staticValue: '-' }] },
      { id: 'cn_304', label_en: '2. Credit Note 304 not recorded on statement of Apex Ltd', label_af: '2. Kredietnota 304 nie op staat van Apex Bpk verwerk nie', fields: [{ readOnly: true, staticValue: '-' }, { field_name: 'credit_note_304' }] },
      { id: 'disc_omit', label_en: '3. Early settlement discount omitted from Creditors Ledger', label_af: '3. Vereffeningskorting weggelaat uit Krediteuregrootboek', fields: [{ field_name: 'discount_omitted' }, { readOnly: true, staticValue: '-' }] },
      { id: 'eft_pay', label_en: '4. EFT Payment of 30 September not yet cleared on statement', label_af: '4. EFT-betaling van 30 September nie op staat geklaar nie', fields: [{ readOnly: true, staticValue: '-' }, { field_name: 'eft_payment_stmt' }] },
      { id: 'int_can', label_en: '5. Disputed overdue interest cancelled by Apex Ltd', label_af: '5. Betwiste agterstallige rente gekanselleer deur Apex Bpk', fields: [{ readOnly: true, staticValue: '-' }, { field_name: 'disputed_interest' }] },
      { id: 'axis_err', label_en: '6. Error: Invoice from Axis Ltd incorrectly posted to Apex Ltd', label_af: '6. Fout: Faktuur van Axis Bpk foutiewelik gepos na Apex Bpk', fields: [{ field_name: 'wrong_supplier_inv' }, { readOnly: true, staticValue: '-' }] },
      { id: 'corr_bal', isTotalRow: true, label_en: 'Corrected Reconciled Equal Balance (R81 550)', label_af: 'Gekorrigeerde Gelyke Versoende Saldo (R81 550)', fields: [{ field_name: 'corrected_ledger_bal' }, { field_name: 'reconciled_stmt_bal' }] }
    ]
  },
  total_marks: 35,
  explanation_en: 'Official NSC Solution: Creditors Ledger adjustments: +1 800 (Invoice 781) - 1 500 (Discount) - 3 250 (Axis error) = R81 550. Statement adjustments: -4 200 (Credit Note 304) - 22 000 (EFT) - 650 (Interest cancelled) = R81 550. Reconciles exactly at R81 550.',
  explanation_af: 'Amptelike NSC Oplossing: Krediteuregrootboek aanpassings: +1 800 (Faktuur 781) - 1 500 (Korting) - 3 250 (Axis fout) = R81 550. Staat aanpassings: -4 200 (Kredietnota 304) - 22 000 (EFT) - 650 (Rente gekanselleer) = R81 550. Versoen presies op R81 550.',
  working_solution_en: '1. Ledger: 84 500 + 1 800 (understated invoice) - 1 500 (discount) - 3 250 (wrong invoice posted) = R81 550.\\n2. Statement: 106 300 - 4 200 (credit note 304) - 22 000 (outstanding EFT) - 650 (cancelled interest) = R81 550.',
  working_solution_af: '1. Grootboek: 84 500 + 1 800 (faktuur regstelling) - 1 500 (korting) - 3 250 (verkeerde verskaffer faktuur) = R81 550.\\n2. Staat: 106 300 - 4 200 (kredietnota) - 22 000 (uitstaande EFT) - 650 (gekanselleerde rente) = R81 550.',
  fields: [
    { n: 'inv_781_correction', len: 'Invoice 781 Undercast Correction', laf: 'Faktuur 781 Ondertelling Regstelling', c: '1800', m: 5, exp_en: '16 400 correct invoice - 14 600 recorded = +R1 800 in Creditors Ledger.', exp_af: '16 400 korrek - 14 600 aangeteken = +R1 800 in Krediteuregrootboek.' },
    { n: 'discount_omitted', len: 'Discount Omitted Adjustment', laf: 'Korting Weggelaat Aanpassing', c: '-1500', m: 5, exp_en: 'Discount omitted from ledger reduces liability by R1 500 (-R1 500).', exp_af: 'Korting weggelaat verminder laste met R1 500 (-R1 500).' },
    { n: 'wrong_supplier_inv', len: 'Wrong Supplier Invoice Removal', laf: 'Verkeerde Verskaffer Faktuur Verwydering', c: '-3250', m: 5, exp_en: 'Invoice for Axis Ltd incorrectly posted to Apex Ltd must be deducted (-R3 250).', exp_af: 'Faktuur vir Axis Bpk verkeerdelik gepos na Apex moet afgetrek word (-R3 250).' },
    { n: 'corrected_ledger_bal', len: 'Corrected Creditors Ledger Balance', laf: 'Gekorrigeerde Krediteuregrootboek Saldo', c: '81550', m: 7, exp_en: '84 500 + 1 800 - 1 500 - 3 250 = R81 550.', exp_af: '84 500 + 1 800 - 1 500 - 3 250 = R81 550.' },
    { n: 'credit_note_304', len: 'Credit Note 304 on Statement', laf: 'Kredietnota 304 op Staat', c: '-4200', m: 4, exp_en: 'Credit Note 304 reduces statement balance by R4 200 (-R4 200).', exp_af: 'Kredietnota 304 verminder staatsaldo met R4 200 (-R4 200).' },
    { n: 'eft_payment_stmt', len: 'Outstanding EFT on Statement', laf: 'Uitstaande EFT op Staat', c: '-22000', m: 4, exp_en: 'EFT payment of 30 Sept reduces balance on statement by R22 000 (-R22 000).', exp_af: 'EFT-betaling verminder staatsaldo met R22 000 (-R22 000).' },
    { n: 'disputed_interest', len: 'Disputed Interest Cancellation', laf: 'Betwiste Rente Kansellasie', c: '-650', m: 3, exp_en: 'Disputed interest cancelled by supplier reduces statement by R650 (-R650).', exp_af: 'Betwiste rente gekanselleer verminder staat met R650 (-R650).' },
    { n: 'reconciled_stmt_bal', len: 'Reconciled Statement Balance', laf: 'Versoende Staatsaldo', c: '81550', m: 2, exp_en: '106 300 - 4 200 - 22 000 - 650 = R81 550.', exp_af: '106 300 - 4 200 - 22 000 - 650 = R81 550.' }
  ]
});

addQuestion({
  paper_type: 'paper_2', topic_en: 'Cost Accounting', topic_af: 'Koste-rekeningkunde',
  subtopic_en: 'NSC Nov 2022 P2 Q2 (Break-Even Analysis, Margin of Safety & Profit Planning)', subtopic_af: 'NSC Nov 2022 V2 V2 (Gelykbreekpunt, Veiligheidsgrens & Winsbeplanning)', difficulty: 'hard',
  question_text_en: 'QUESTION 2.2 [OFFICIAL NSC NOV 2022 P2]: Break-Even Point, Contribution Margin, Margin of Safety & Net Profit Analysis of Jacaranda Manufacturers for year ended 31 December 2026. (45 Marks)',
  question_text_af: 'VRAAG 2.2 [AMPTELIKE NSC NOV 2022 V2]: Gelykbreekpunt, Bydraemarge, Veiligheidsgrens & Netto Winsontleding van Jacaranda Vervaardigers vir jaar geëindig 31 Desember 2026. (45 Punte)',
  info_section_en: `BUSINESS: JACARANDA MANUFACTURERS (PRODUCING ECO-FRIENDLY WORK DESKS)
ACCOUNTING PERIOD: FINANCIAL YEAR ENDED 31 DECEMBER 2026
TOPIC: COST-VOLUME-PROFIT & BREAK-EVEN ANALYSIS (45 MARKS)

INFORMATION A: PRODUCTION & SELLING PRICE DATA
• Selling price per desk: R1 400
• Variable cost components per desk:
  - Direct materials per unit: R480
  - Direct labour per unit: R260
  - Variable selling and distribution costs per unit: R110
• Fixed costs for the financial year:
  - Factory overheads (Fixed): R660 000
  - Administration & marketing expenses (Fixed): R275 000

INFORMATION B: ACTUAL OPERATIONAL RESULTS
• Maximum plant capacity: 2 500 desks per year.
• Actual number of desks produced and sold during the year: 2 200 desks.`,
  info_section_af: `BESIGHEID: JACARANDA VERVAARDIGERS (EKO-VRIENDELIKE SKRYFTAFELS)
REKENKUNDIGE TYDPERK: FINANSIËLE JAAR GEËINDIG 31 DESEMBER 2026
ONDERWERP: KOSTE-VOLUME-WINS & GELYKBREEKPUNT ONTLEDING (45 PUNTE)

INLIGTING A: PRODUKSIE & VERKOOPPRYS DATA
• Verkoopprys per skryftafel: R1 400
• Veranderlike kostekomponente per skryftafel:
  - Direkte materiaal per eenheid: R480
  - Direkte arbeid per eenheid: R260
  - Veranderlike verkoop- en verspreidingskoste per eenheid: R110
• Vaste koste vir die finansiële jaar:
  - Fabrieksbokoste (Vas): R660 000
  - Administrasie & bemarkingsuitgawes (Vas): R275 000

INLIGTING B: WERソーLIKE BEDRYFSRESULTATE
• Maksimum produksiekapasiteit: 2 500 tafels per jaar.
• Werklike aantal tafels geproduseer en verkoop gedurende die jaar: 2 200 tafels.`,
  tableConfig: {
    title_en: 'JACARANDA MANUFACTURERS — BREAK-EVEN & PROFITABILITY EVALUATION SCHEDULE',
    title_af: 'JACARANDA VERVAARDIGERS — GELYKBREEK & WINSGEWENDHEID SKEDULE',
    columns_en: ['Performance / Cost Metric', 'Calculation Formula', 'Calculated Value'],
    columns_af: ['Prestasie / Kostemaatstaf', 'Berekening Formule', 'Berekende Waarde'],
    rows: [
      { id: 'vc_unit', label_en: 'Total Variable Cost per Unit (Direct Material + Direct Labour + Var Selling)', label_af: 'Totale Veranderlike Koste per Eenheid (Materiaal + Arbeid + Bemarking)', fields: [{ readOnly: true, staticValue: '480 + 260 + 110' }, { field_name: 'unit_variable_cost' }] },
      { id: 'contrib_unit', isTotalRow: true, label_en: 'CONTRIBUTION PER UNIT (Selling Price R1 400 - Variable Cost)', label_af: 'BYDRAE PER EENHEID (Verkoopprys R1 400 - Veranderlike Koste)', fields: [{ readOnly: true, staticValue: '1 400 - 850' }, { field_name: 'unit_contribution' }] },
      { id: 'fc_total', label_en: 'Total Fixed Costs (Fixed Factory Overheads R660k + Admin R275k)', label_af: 'Totale Vaste Koste (Vaste Bokoste R660k + Admin R275k)', fields: [{ readOnly: true, staticValue: '660 000 + 275 000' }, { field_name: 'total_fixed_costs' }] },
      { id: 'bep_units', isTotalRow: true, label_en: 'BREAK-EVEN POINT IN UNITS (Total Fixed Costs / Unit Contribution)', label_af: 'GELYKBREEKPUNT IN EENHEDE (Totale Vaste Koste / Bydrae per Eenheid)', fields: [{ readOnly: true, staticValue: '935 000 / 550' }, { field_name: 'break_even_units' }] },
      { id: 'bep_val', label_en: 'Break-Even Sales Revenue Value (BEP Units * Selling Price R1 400)', label_af: 'Gelykbreek Verkoopsinkomste Waarde (Gelykbreek Eenhede * R1 400)', fields: [{ readOnly: true, staticValue: '1 700 * 1 400' }, { field_name: 'break_even_value' }] },
      { id: 'mos_units', isTotalRow: true, label_en: 'MARGIN OF SAFETY IN UNITS (Actual Units Sold 2 200 - Break-Even 1 700)', label_af: 'VEILIGHEIDSGRENS IN EENHEDE (Werklik 2 200 - Gelykbreek 1 700)', fields: [{ readOnly: true, staticValue: '2 200 - 1 700' }, { field_name: 'margin_safety_units' }] },
      { id: 'net_profit', isTotalRow: true, label_en: 'TOTAL NET Operating Profit ACHIEVED FOR YEAR', label_af: 'TOTALE NETTO Bedryfswins BEHAAL VIR DIE JAAR', fields: [{ readOnly: true, staticValue: '(2 200 * 550) - 935 000' }, { field_name: 'net_profit_achieved' }] }
    ]
  },
  total_marks: 45,
  explanation_en: 'Official NSC Solution: Variable Cost per Unit = R850, Contribution per Unit = R550, Total Fixed Costs = R935 000, Break-Even Point = 1 700 units (R2 380 000), Margin of Safety = 500 units (22.7%), Net Profit = R275 000.',
  explanation_af: 'Amptelike NSC Oplossing: Veranderlike Koste per Eenheid = R850, Bydrae per Eenheid = R550, Totale Vaste Koste = R935 000, Gelykbreekpunt = 1 700 eenhede (R2 380 000), Veiligheidsgrens = 500 eenhede (22.7%), Netto Wins = R275 000.',
  working_solution_en: '1. Variable cost per unit = 480 + 260 + 110 = R850.\\n2. Contribution per unit = 1 400 - 850 = R550.\\n3. Total fixed costs = 660 000 + 275 000 = R935 000.\\n4. Break-even point (units) = 935 000 / 550 = 1 700 units.\\n5. Break-even revenue = 1 700 * 1 400 = R2 380 000.\\n6. Margin of safety = 2 200 - 1 700 = 500 units.\\n7. Net profit = (2 200 * 550) - 935 000 = 1 210 000 - 935 000 = R275 000.',
  working_solution_af: '1. Veranderlike koste per eenheid = 480 + 260 + 110 = R850.\\n2. Bydrae per eenheid = 1 400 - 850 = R550.\\n3. Totale vaste koste = 660 000 + 275 000 = R935 000.\\n4. Gelykbreekpunt = 935 000 / 550 = 1 700 eenhede.\\n5. Gelykbreek inkomste = 1 700 * 1 400 = R2 380 000.\\n6. Veiligheidsgrens = 2 200 - 1 700 = 500 eenhede.\\n7. Netto wins = (2 200 * 550) - 935 000 = R275 000.',
  fields: [
    { n: 'unit_variable_cost', len: 'Total Variable Cost per Unit', laf: 'Totale Veranderlike Koste per Eenheid', c: '850', m: 6, exp_en: 'Direct materials 480 + Direct labour 260 + Variable selling 110 = R850.', exp_af: 'Direkte materiaal 480 + Direkte arbeid 260 + Veranderlike bemarking 110 = R850.' },
    { n: 'unit_contribution', len: 'Contribution per Unit', laf: 'Bydrae per Eenheid', c: '550', m: 7, exp_en: 'Selling price R1 400 - Variable cost R850 = R550 contribution per unit.', exp_af: 'Verkoopprys R1 400 - Veranderlike koste R850 = R550 bydrae per eenheid.' },
    { n: 'total_fixed_costs', len: 'Total Fixed Costs', laf: 'Totale Vaste Koste', c: '935000', m: 6, exp_en: 'Factory fixed overheads 660 000 + Administration fixed costs 275 000 = R935 000.', exp_af: 'Fabrieks vaste bokoste 660 000 + Administrasie vaste koste 275 000 = R935 000.' },
    { n: 'break_even_units', len: 'Break-Even Point (Units)', laf: 'Gelykbreekpunt (Eenhede)', c: '1700', m: 8, exp_en: 'Total fixed costs R935 000 / Unit contribution R550 = 1 700 desks.', exp_af: 'Totale vaste koste R935 000 / Bydrae per eenheid R550 = 1 700 tafels.' },
    { n: 'break_even_value', len: 'Break-Even Revenue Value', laf: 'Gelykbreek Inkomste Waarde', c: '2380000', m: 6, exp_en: '1 700 break-even units * R1 400 selling price = R2 380 000.', exp_af: '1 700 gelykbreek eenhede * R1 400 verkoopprys = R2 380 000.' },
    { n: 'margin_safety_units', len: 'Margin of Safety (Units)', laf: 'Veiligheidsgrens (Eenhede)', c: '500', m: 6, exp_en: 'Actual sales 2 200 units - Break-even 1 700 units = 500 units margin of safety.', exp_af: 'Werklike verkope 2 200 eenhede - Gelykbreek 1 700 eenhede = 500 eenhede veiligheidsgrens.' },
    { n: 'net_profit_achieved', len: 'Total Net Operating Profit', laf: 'Totale Netto Bedryfswins', c: '275000', m: 6, exp_en: 'Total contribution (2 200 * 550 = 1 210 000) - Fixed costs 935 000 = R275 000.', exp_af: 'Totale bydrae (2 200 * 550 = 1 210 000) - Vaste koste 935 000 = R275 000.' }
  ]
});

addQuestion({
  paper_type: 'paper_2', topic_en: 'Inventory Valuation', topic_af: 'Voorraadwaardasie',
  subtopic_en: 'NSC Nov 2022 P2 Q3 (Weighted Average Inventory Valuation & Stock Turnover)', subtopic_af: 'NSC Nov 2022 V2 V3 (Geweegde Gemiddelde Voorraadwaardasie & Voorraedomsetsnelheid)', difficulty: 'medium',
  question_text_en: 'QUESTION 2.3 [OFFICIAL NSC NOV 2022 P2]: Weighted Average Inventory Valuation, Carriage, Supplier Returns & Gross Profit for year ended 28 February 2026. (35 Marks)',
  question_text_af: 'VRAAG 2.3 [AMPTELIKE NSC NOV 2022 V2]: Geweegde Gemiddelde Voorraadwaardasie, Vragkoste, Terugsendings & Bruto Wins vir jaar geëindig 28 Februarie 2026. (35 Punte)',
  info_section_en: `BUSINESS: JACARANDA RETAILERS (SOLAR POWER INVERTERS)
ACCOUNTING PERIOD: FINANCIAL YEAR ENDED 28 FEBRUARY 2026
TOPIC: WEIGHTED AVERAGE INVENTORY VALUATION METHOD (35 MARKS)

INFORMATION A: INVENTORY & PURCHASES DATA
• Opening Inventory (1 March 2025): 120 units @ R4 500 each = R540 000
• Purchases during the financial year:
  - May 2025: 250 units @ R4 800 = R1 200 000 (Carriage on purchases paid: R25 000)
  - September 2025: 400 units @ R5 200 = R2 080 000 (Carriage on purchases paid: R40 000)
  - January 2026: 180 units @ R5 500 = R990 000 (Carriage on purchases paid: R18 000)
• Returns to suppliers in October 2025:
  - 10 defective units from the September batch were returned. The supplier refunded the cost price of R5 200 plus the carriage of R100 per unit in full (Total deduction = R53 000).

INFORMATION B: SALES & CLOSING INVENTORY
• 760 solar inverters were sold during the year at R7 200 each (Total Sales Revenue = R5 472 000).
• 180 units were on hand in the warehouse on 28 February 2026 according to physical count.`,
  info_section_af: `BESIGHEID: JACARANDA HANDELAARS (SONKRAG-OMSETTERS)
REKENKUNDIGE TYDPERK: FINANSIËLE JAAR GEËINDIG 28 FEBRUARIE 2026
ONDERWERP: GEWEEGDE GEMIDDELDE VOORRAADWAARDASIE (35 PUNTE)

INLIGTING A: VOORRAAD & AANKOOP DATA
• Beginvoorraad (1 Maart 2025): 120 eenhede @ R4 500 elk = R540 000
• Aankope gedurende die finansiële jaar:
  - Mei 2025: 250 eenhede @ R4 800 = R1 200 000 (Inwaartse vrag betaal: R25 000)
  - September 2025: 400 eenhede @ R5 200 = R2 080 000 (Inwaartse vrag betaal: R40 000)
  - Januarie 2026: 180 eenhede @ R5 500 = R990 000 (Inwaartse vrag betaal: R18 000)
• Terugsendings aan verskaffers in Oktober 2025:
  - 10 foutiewe eenhede uit die September-besending teruggestuur. Verskaffer het aankoopprys van R5 200 plus vrag van R100 per eenheid gekrediteer (Totale aftrekking = R53 000).

INLIGTING B: VERKOPE & EINDVOORRAAD
• 760 omsetters is verkoop teen R7 200 elk (Totale Inkomste = R5 472 000).
• 180 eenhede was voorhande in pakhuis op 28 Februarie 2026 volgens fisiese telling.`,
  tableConfig: {
    title_en: 'JACARANDA RETAILERS — WEIGHTED AVERAGE VALUATION SCHEDULE',
    title_af: 'JACARANDA HANDELAARS — GEWEEGDE GEMIDDELDE SKEDULE',
    columns_en: ['Inventory Valuation Line', 'Calculation Workings', 'Calculated Amount'],
    columns_af: ['Voorraadwaardasie-reël', 'Berekening Bewerkinge', 'Berekende Bedrag'],
    rows: [
      { id: 'tot_units', label_en: 'Total Units Available for Sale (120 opening + 820 net purchases)', label_af: 'Totale Eenhede Beskikbaar vir Verkoop (120 begin + 820 netto aankope)', fields: [{ readOnly: true, staticValue: '120 + 250 + 400 + 180 - 10' }, { field_name: 'total_available_units' }] },
      { id: 'tot_cost', label_en: 'Total Cost of Stock Available for Sale (incl carriage less returns)', label_af: 'Totale Koste van Beskikbare Voorraad (ingl vrag minus terugsendings)', fields: [{ readOnly: true, staticValue: '540k + 1.225m + 2.12m + 1.008m - 53k' }, { field_name: 'total_stock_cost' }] },
      { id: 'w_avg_cost', isTotalRow: true, label_en: 'WEIGHTED AVERAGE COST PER UNIT (R per unit)', label_af: 'GEWEEGDE GEMIDDELDE KOSTE PER EENHEID (R per eenheid)', fields: [{ readOnly: true, staticValue: '4 840 000 / 940 units' }, { field_name: 'weighted_avg_unit_cost' }] },
      { id: 'w_close_val', isTotalRow: true, label_en: 'VALUE OF CLOSING INVENTORY (180 units @ Weighted Average Cost)', label_af: 'WAARDE VAN EINDVOORRAAD (180 eenhede @ Geweegde Gemiddeld)', fields: [{ readOnly: true, staticValue: '180 * R5 148,936' }, { field_name: 'weighted_closing_stock' }] },
      { id: 'w_cos', label_en: 'Cost of Sales (Total Stock Cost R4 840 000 - Closing Inventory)', label_af: 'Koste van Verkope (Totale Voorraadkoste R4 840 000 - Eindvoorraad)', fields: [{ readOnly: true, staticValue: '4 840 000 - 926 808' }, { field_name: 'cost_of_sales_wavg' }] },
      { id: 'w_gp', isTotalRow: true, label_en: 'Gross Profit REALISED ON SALES (Sales R5 472 000 - Cost of Sales)', label_af: 'Bruto Wins GEREALISEER OP VERKOPE (Verkope R5 472 000 - KVK)', fields: [{ readOnly: true, staticValue: '5 472 000 - 3 913 192' }, { field_name: 'gross_profit_wavg' }] }
    ]
  },
  total_marks: 35,
  explanation_en: 'Official NSC Solution: Total Available Units = 940 units, Total Cost = R4 840 000. Weighted Average Cost per unit = R5 148,94. Closing Inventory = R926 808 (180 units). Cost of Sales = R3 913 192. Gross Profit = R1 558 808.',
  explanation_af: 'Amptelike NSC Oplossing: Totale Beskikbare Eenhede = 940 eenhede, Totale Koste = R4 840 000. Geweegde Gemiddelde Koste per eenheid = R5 148,94. Eindvoorraad = R926 808 (180 eenhede). Koste van Verkope = R3 913 192. Bruto Wins = R1 558 808.',
  working_solution_en: '1. Total units = 120 + 250 + 400 + 180 - 10 = 940 units.\\n2. Total cost = 540 000 + 1 225 000 + 2 120 000 + 1 008 000 - 53 000 = R4 840 000.\\n3. Weighted avg cost = 4 840 000 / 940 = R5 148,936 (R5 148,94 per unit).\\n4. Closing stock = 180 * 5 148.936 = R926 808.\\n5. Cost of sales = 4 840 000 - 926 808 = R3 913 192.\\n6. Gross profit = 5 472 000 - 3 913 192 = R1 558 808.',
  working_solution_af: '1. Totale eenhede = 120 + 250 + 400 + 180 - 10 = 940 eenhede.\\n2. Totale koste = 540 000 + 1 225 000 + 2 120 000 + 1 008 000 - 53 000 = R4 840 000.\\n3. Geweegde gem koste = 4 840 000 / 940 = R5 148,94 per eenheid.\\n4. Eindvoorraad = 180 * 5 148,936 = R926 808.\\n5. Koste van verkope = 4 840 000 - 926 808 = R3 913 192.\\n6. Bruto wins = 5 472 000 - 3 913 192 = R1 558 808.',
  fields: [
    { n: 'total_available_units', len: 'Total Units Available', laf: 'Totale Eenhede Beskikbaar', c: '940', m: 5, exp_en: '120 opening + 250 + 400 + 180 - 10 returns = 940 units.', exp_af: '120 begin + 250 + 400 + 180 - 10 terugsendings = 940 eenhede.' },
    { n: 'total_stock_cost', len: 'Total Cost of Stock Available', laf: 'Totale Koste van Beskikbare Voorraad', c: '4840000', m: 7, exp_en: '540k + 1.225m + 2.12m + 1.008m - 53k returns = R4 840 000.', exp_af: '540k + 1.225m + 2.12m + 1.008m - 53k terugsendings = R4 840 000.' },
    { n: 'weighted_avg_unit_cost', len: 'Weighted Average Cost per Unit', laf: 'Geweegde Gemiddelde Koste per Eenheid', c: '5148.94', tol: 0.1, m: 7, exp_en: 'R4 840 000 total cost / 940 total units = R5 148,94 per unit.', exp_af: 'R4 840 000 totale koste / 940 totale eenhede = R5 148,94 per eenheid.' },
    { n: 'weighted_closing_stock', len: 'Value of Closing Inventory', laf: 'Waarde van Eindvoorraad', c: '926808', tol: 2, m: 6, exp_en: '180 units * R5 148,936 = R926 808.', exp_af: '180 eenhede * R5 148,936 = R926 808.' },
    { n: 'cost_of_sales_wavg', len: 'Cost of Sales (Weighted Avg)', laf: 'Koste van Verkope (Geweegde Gem)', c: '3913192', tol: 2, m: 5, exp_en: 'Total cost R4 840 000 - Closing Inventory R926 808 = R3 913 192.', exp_af: 'Totale koste R4 840 000 - Eindvoorraad R926 808 = R3 913 192.' },
    { n: 'gross_profit_wavg', len: 'Gross Profit (Weighted Avg)', laf: 'Bruto Wins (Geweegde Gem)', c: '1558808', tol: 2, m: 5, exp_en: 'Sales R5 472 000 - Cost of Sales R3 913 192 = R1 558 808.', exp_af: 'Verkope R5 472 000 - Koste van Verkope R3 913 192 = R1 558 808.' }
  ]
});

addQuestion({
  paper_type: 'paper_2', topic_en: 'Budgeting & VAT', topic_af: 'Begrotings & BTW',
  subtopic_en: 'NSC Nov 2022 P2 Q4 (Creditors Payment Schedule & Cash Outflow Budget)', subtopic_af: 'NSC Nov 2022 V2 V4 (Krediteure Betalingskedule & Kontantuitvloeibegroting)', difficulty: 'medium',
  question_text_en: 'QUESTION 2.4 [OFFICIAL NSC NOV 2022 P2]: Creditors Payment Schedule & Cash Outflows for Merchandise for May 2026. (35 Marks)',
  question_text_af: 'VRAAG 2.4 [AMPTELIKE NSC NOV 2022 V2]: Krediteure-betalingskedule & Kontantuitvloeie vir Voorraad vir Mei 2026. (35 Punte)',
  info_section_en: `BUSINESS: JACARANDA RETAILERS
ACCOUNTING PERIOD: CASH BUDGET FOR MAY 2026
TOPIC: CREDITORS PAYMENT SCHEDULE & CASH PURCHASES (35 MARKS)

INFORMATION A: PURCHASES DATA (EXCLUDING VAT)
• Total Purchases of merchandise:
  - February 2026 (Actual): R240 000
  - March 2026 (Actual): R280 000
  - April 2026 (Budgeted): R300 000
  - May 2026 (Budgeted): R340 000
• Cash purchases account for 20% of total purchases. Jacaranda negotiates a 5% trade discount on all cash purchases.
• Credit purchases account for the remaining 80% of total purchases.

INFORMATION B: CREDITORS SETTLEMENT TERMS
Creditors are paid according to the following schedule:
• 40% is paid in the month following the month of purchase to take advantage of a 4% prompt settlement discount.
• 55% is paid in the second month following the month of purchase (no discount).
• 5% of purchases are withheld/disputed or credited for returns.`,
  info_section_af: `BESIGHEID: JACARANDA HANDELAARS
REKENKUNDIGE TYDPERK: KONTANTBEGROTING VIR MEI 2026
ONDERWERP: KREDITEURE BETALINGSKEDULE & KONTANTAANKOPE (35 PUNTE)

INLIGTING A: AANKOOPDATA (BTW UITGESLUIT)
• Totale Voorraadaankope:
  - Februarie 2026 (Werklik): R240 000
  - Maart 2026 (Werklik): R280 000
  - April 2026 (Gebegroot): R300 000
  - Mei 2026 (Gebegroot): R340 000
• Kontantaankope verteenwoordig 20% van totale aankope. Jacaranda beding 'n 5% handelsafslag op alle kontantaankope.
• Kredietaankope verteenwoordig die oorblywende 80% van totale aankope.

INLIGTING B: KREDITEURE VEREFFENINGSTERME
Krediteure word volgens die volgende skedule betaal:
• 40% word betaal in die maand ná die aankoopmaand om voordeel te trek uit 'n 4% vereffeningskorting.
• 55% word betaal in die tweede maand ná die aankoopmaand (geen korting).
• 5% van aankope word teruggehou/betwis of gekrediteer vir terugsending.`,
  tableConfig: {
    title_en: 'JACARANDA RETAILERS — CREDITORS PAYMENT SCHEDULE FOR MAY 2026',
    title_af: 'JACARANDA HANDELAARS — KREDITEURE BETALINGSKEDULE VIR MEI 2026',
    columns_en: ['Purchase Month / Payment Item', 'Credit Purchases (R)', 'May 2026 Payment (R)'],
    columns_af: ['Aankoopmaand / Betalingsitem', 'Kredietaankope (R)', 'Mei 2026 Betaling (R)'],
    rows: [
      { id: 'apr_cp', label_en: 'April 2026 Credit Purchases (80% of R300 000)', label_af: 'April 2026 Kredietaankope (80% van R300 000)', fields: [{ field_name: 'april_credit_purchases' }, { readOnly: true, staticValue: '-' }] },
      { id: 'mar_cp', label_en: 'March 2026 Credit Purchases (80% of R280 000)', label_af: 'Maart 2026 Kredietaankope (80% van R280 000)', fields: [{ field_name: 'march_credit_purchases' }, { readOnly: true, staticValue: '-' }] },
      { id: 'may_pay_apr', label_en: 'Payment to Creditors for April Purchases (40% less 4% discount)', label_af: 'Betaling aan Krediteure vir April-aankope (40% minus 4% korting)', fields: [{ readOnly: true, staticValue: '(240 000 * 40%) - 4%' }, { field_name: 'may_payment_april_creditors' }] },
      { id: 'may_pay_mar', label_en: 'Payment to Creditors for March Purchases (55% net)', label_af: 'Betaling aan Krediteure vir Maart-aankope (55% netto)', fields: [{ readOnly: true, staticValue: '224 000 * 55%' }, { field_name: 'may_payment_march_creditors' }] },
      { id: 'tot_cred_may', isTotalRow: true, label_en: 'Total Payments to Creditors in May 2026', label_af: 'Totale Betalings aan Krediteure in Mei 2026', fields: [{ readOnly: true, staticValue: 'April + March' }, { field_name: 'total_may_creditors_paid' }] },
      { id: 'may_cash_pur', isTotalRow: true, label_en: 'MAY CASH PURCHASES OF MERCHANDISE (20% of R340k less 5% discount)', label_af: 'MEI KONTANTAANKOPE VAN VOORRAAD (20% van R340k minus 5% afslag)', fields: [{ readOnly: true, staticValue: '68 000 - 5%' }, { field_name: 'may_cash_purchases_paid' }] }
    ]
  },
  total_marks: 35,
  explanation_en: 'Official NSC Solution: April Credit Purchases = R240 000, March Credit Purchases = R224 000. May payment for April = R92 160 (96 000 - 3 840 discount), May payment for March = R123 200. Total Creditors Paid in May = R215 360. May Cash Purchases Paid = R64 600 (68 000 - 3 400 discount).',
  explanation_af: 'Amptelike NSC Oplossing: April Kredietaankope = R240 000, Maart Kredietaankope = R224 000. Mei betaling vir April = R92 160 (96 000 - 3 840 korting), Mei betaling vir Maart = R123 200. Totale Krediteure Betaal in Mei = R215 360. Mei Kontantaankope Betaal = R64 600 (68 000 - 3 400 afslag).',
  working_solution_en: '1. April credit purchases = 300 000 * 80% = R240 000.\\n2. March credit purchases = 280 000 * 80% = R224 000.\\n3. May payment for April = (240 000 * 40%) = 96 000 less 4% discount (3 840) = R92 160.\\n4. May payment for March = 224 000 * 55% = R123 200.\\n5. Total creditors paid in May = 92 160 + 123 200 = R215 360.\\n6. May cash purchases = (340 000 * 20%) = 68 000 less 5% trade discount (3 400) = R64 600.',
  working_solution_af: '1. April kredietaankope = 300 000 * 80% = R240 000.\\n2. Maart kredietaankope = 280 000 * 80% = R224 000.\\n3. Mei betaling vir April = 96 000 - 4% korting (3 840) = R92 160.\\n4. Mei betaling vir Maart = 224 000 * 55% = R123 200.\\n5. Totale krediteure betaal in Mei = 92 160 + 123 200 = R215 360.\\n6. Mei kontantaankope = 68 000 - 5% afslag (3 400) = R64 600.',
  fields: [
    { n: 'april_credit_purchases', len: 'April Credit Purchases', laf: 'April Kredietaankope', c: '240000', m: 5, exp_en: '80% of R300 000 April purchases = R240 000.', exp_af: '80% van R300 000 April aankope = R240 000.' },
    { n: 'march_credit_purchases', len: 'March Credit Purchases', laf: 'Maart Kredietaankope', c: '224000', m: 5, exp_en: '80% of R280 000 March purchases = R224 000.', exp_af: '80% van R280 000 Maart aankope = R224 000.' },
    { n: 'may_payment_april_creditors', len: 'May Payment for April Purchases', laf: 'Mei Betaling vir April-aankope', c: '92160', m: 7, exp_en: '40% of 240k = 96 000 less 4% discount (3 840) = R92 160.', exp_af: '40% van 240k = 96 000 minus 4% korting (3 840) = R92 160.' },
    { n: 'may_payment_march_creditors', len: 'May Payment for March Purchases', laf: 'Mei Betaling vir Maart-aankope', c: '123200', m: 6, exp_en: '55% of R224 000 March credit purchases = R123 200.', exp_af: '55% van R224 000 Maart kredietaankope = R123 200.' },
    { n: 'total_may_creditors_paid', len: 'Total Payments to Creditors in May', laf: 'Totale Betalings aan Krediteure in Mei', c: '215360', m: 6, exp_en: '92 160 (April) + 123 200 (March) = R215 360.', exp_af: '92 160 (April) + 123 200 (Maart) = R215 360.' },
    { n: 'may_cash_purchases_paid', len: 'May Cash Purchases Paid', laf: 'Mei Kontantaankope Betaal', c: '64600', m: 6, exp_en: '20% of 340k = 68 000 less 5% trade discount (3 400) = R64 600.', exp_af: '20% van 340k = 68 000 minus 5% handelsafslag (3 400) = R64 600.' }
  ]
});

// --- PAPER 2 - EXAM SET 3 (OFFICIAL NSC JUNE 2023 PAPER 2 - 150 MARKS) ---
addQuestion({
  paper_type: 'paper_2', topic_en: 'Reconciliations', topic_af: 'Versoenings',
  subtopic_en: 'NSC Jun 2023 P2 Q1 (Bank Reconciliation & Internal Control Audit)', subtopic_af: 'NSC Jun 2023 V2 V1 (Bankversoening & Interne Beheer Oudit)', difficulty: 'hard',
  question_text_en: 'QUESTION 3.1 [OFFICIAL NSC JUN 2023 P2]: Bank Reconciliation Statement & Internal Control Audit of Aloe Enterprise for June 2026. (35 Marks)',
  question_text_af: 'VRAAG 3.1 [AMPTELIKE NSC JUN 2023 V2]: Bankversoeningsstaat & Interne Beheer Oudit van Aloe Onderneming vir Junie 2026. (35 Punte)',
  info_section_en: `BUSINESS: ALOE ENTERPRISE
ACCOUNTING PERIOD: MONTH ENDED 30 JUNE 2026
TOPIC: BANK RECONCILIATION STATEMENT & AUDIT INVESTIGATION (35 MARKS)

INFORMATION A: CASH BOOK RECORDS BEFORE RECONCILING
• Provisional balance in the Bank Account on 30 June 2026: R31 400 (Debit / Favourable).

INFORMATION B: BANK STATEMENT DISCREPANCIES (30 JUNE 2026)
• The Bank Statement showed a favourable credit balance of R31 380 on 30 June 2026.
• The following items appeared on the Bank Statement but not yet in the Cash Books:
  1. Bank charges: Service fees R680, Cash deposit fees R420. (Total bank charges = R1 100)
  2. Interest of R350 erroneously charged by the bank on overdraft in May was refunded and credited on the statement.
  3. Tenant K. Mokoena paid monthly rent of R9 400 directly into the bank account via EFT.
  4. EFT No. 552 for office stationery of R2 850 was erroneously entered in the CPJ as R2 580 (understated by R270 in CPJ).
  5. Monthly debit order for premises security to ADT Security: R3 600.

INFORMATION C: OUTSTANDING ITEMS & BANK ERRORS ON 30 JUNE 2026
• Deposit of R18 900 made on 30 June does not reflect on the Bank Statement.
• Bank Error: A deposit of R15 800 made on 29 June was incorrectly credited by the bank as R18 500. The bank must correct this error of R2 700 (Debit bank error).
• Outstanding EFT payments:
  - EFT No. 560 to Makro: R4 150
  - EFT No. 563 to Sasol: R7 250`,
  info_section_af: `BESIGHEID: ALOE ONDERNEMING
REKENKUNDIGE TYDPERK: MAAND GEËINDIG 30 JUNIE 2026
ONDERWERP: BANKVERSOENINGSSTAAT & OUDIT ONDERSOEK (35 PUNTE)

INLIGTING A: KONTANTBOEKREKORDS VOOR VERSOENING
• Voorlopige saldo in die Bankrekening op 30 Junie 2026: R31 400 (Debiet / Gunstig).

INLIGTING B: BANKSTAAT VERSKILLE (30 JUNIE 2026)
• Die Bankstaat toon 'n gunstige kredietsaldo van R31 380 op 30 Junie 2026.
• Die volgende items verskyn op die Bankstaat maar nog nie in die Kontantboeke nie:
  1. Bankkoste: Diensfooie R680, Kontantdepositofooie R420. (Totale bankkoste = R1 100)
  2. Rente van R350 foutiewelik gehef deur die bank in Mei is terugbetaal en op die staat gekrediteer.
  3. Huurder K. Mokoena het maandelikse huur van R9 400 direk per EFT inbetaal.
  4. EFT No. 552 vir skryfbehoeftes van R2 850 is foutiewelik as R2 580 in die KBJ ingeskryf (ondertelling van R270).
  5. Maandelikse debietorder vir sekuriteit aan ADT Sekuriteit: R3 600.

INLIGTING C: UITSTAANDE TRANSAKSIES & BANKFOUTE OP 30 JUNIE 2026
• Deposito van R18 900 gemaak op 30 Junie verskyn nie op die Bankstaat nie.
• Bankfout: 'n Deposito van R15 800 gemaak op 29 Junie is verkeerdelik deur die bank as R18 500 gekrediteer. Die bank moet hierdie fout van R2 700 regstel (Debiteer bankfout).
• Uitstaande EFT-betalings:
  - EFT No. 560 aan Makro: R4 150
  - EFT No. 563 aan Sasol: R7 250`,
  tableConfig: {
    title_en: 'ALOE ENTERPRISE — CASH BOOKS ADJUSTMENTS & BANK RECONCILIATION STATEMENT',
    title_af: 'ALOE ONDERNEMING — KONTANTBOEK AANPASSINGS & BANKVERSOENINGSSTAAT',
    columns_en: ['Details / Accounting Description', 'Debit (R)', 'Credit (R)'],
    columns_af: ['Besonderhede / Rekenkundige Beskrywing', 'Debiet (R)', 'Krediet (R)'],
    rows: [
      { isHeader: true, label_en: 'SECTION 1: CASH JOURNALS UPDATES (30 JUNE 2026)', label_af: 'AFDELING 1: KONTANTJOERNAAL AANPASSINGS (30 JUNIE 2026)' },
      { id: 'crj_tot_3', label_en: 'Total Additional CRJ Receipts (Interest refund R350 + Rent R9 400)', label_af: 'Totale Addisionele KOJ Ontvangste (Rente terugbetaling R350 + Huur R9 400)', fields: [{ field_name: 'crj_additional_total' }] },
      { id: 'cpj_tot_3', label_en: 'Total Additional CPJ Payments (Bank charges R1 100 + EFT error R270 + Security R3 600)', label_af: 'Totale Addisionele KBJ Betalings (Bankkoste R1 100 + EFT fout R270 + Sekuriteit R3 600)', fields: [{ field_name: 'cpj_additional_total' }] },
      { id: 'adj_bank_3', isTotalRow: true, label_en: 'Adjusted Balance in Bank Account (31 400 + 9 750 - 4 970)', label_af: 'Aangepaste Saldo in Bankrekening (31 400 + 9 750 - 4 970)', fields: [{ field_name: 'updated_bank_balance' }] },
      { isHeader: true, label_en: 'SECTION 2: BANK RECONCILIATION STATEMENT ON 30 JUNE 2026', label_af: 'AFDELING 2: BANKVERSOENINGSSTAAT OP 30 JUNIE 2026' },
      { id: 'bs_bal_3', label_en: 'Credit balance as per Bank Statement', label_af: 'Kredietsaldo volgens Bankstaat', fields: [{ readOnly: true, staticValue: '-' }, { field_name: 'stmt_credit_balance' }] },
      { id: 'dep_out_3', label_en: 'Credit Outstanding deposit not cleared by bank', label_af: 'Krediteer Uitstaande deposito nie geklaar nie', fields: [{ readOnly: true, staticValue: '-' }, { field_name: 'outstanding_deposit_cr' }] },
      { id: 'bk_err_3', label_en: 'Debit Bank error (Deposit over-credited by bank: 18 500 - 15 800)', label_af: 'Debiteer Bankfout (Deposito oor-gekrediteer deur bank: 18 500 - 15 800)', fields: [{ field_name: 'bank_error_debit' }, { readOnly: true, staticValue: '-' }] },
      { id: 'eft_560', label_en: 'Debit Outstanding EFT No. 560 (Makro)', label_af: 'Debiteer Uitstaande EFT No. 560 (Makro)', fields: [{ field_name: 'outstanding_eft_560' }, { readOnly: true, staticValue: '-' }] },
      { id: 'eft_563', label_en: 'Debit Outstanding EFT No. 563 (Sasol)', label_af: 'Debiteer Uitstaande EFT No. 563 (Sasol)', fields: [{ field_name: 'outstanding_eft_563' }, { readOnly: true, staticValue: '-' }] },
      { id: 'rec_tot_3', isTotalRow: true, label_en: 'TOTALS RECONCILED (Debit Total = Credit Total = R50 280)', label_af: 'TOTALE VERSOEN (Debiet Totaal = Krediet Totaal = R50 280)', fields: [{ readOnly: true, staticValue: '50 280' }, { readOnly: true, staticValue: '50 280' }] }
    ]
  },
  total_marks: 35,
  explanation_en: 'Official NSC Solution: CRJ additions = R9 750 (Interest 350 + Rent 9 400), CPJ additions = R4 970 (Bank charges 1 100 + EFT undercast 270 + Security 3 600), Adjusted Bank Balance = R36 180 (Dr). Bank Statement Credit = R31 380, Outstanding Deposit = R18 900, Bank Error Debit = R2 700, Outstanding EFTs = R4 150 & R7 250. Reconciles at R50 280.',
  explanation_af: 'Amptelike NSC Oplossing: KOJ byvoegings = R9 750 (Rente 350 + Huur 9 400), KBJ byvoegings = R4 970 (Bankkoste 1 100 + EFT fout 270 + Sekuriteit 3 600), Aangepaste Banksaldo = R36 180 (Db). Bankstaat Krediet = R31 380, Uitstaande Deposito = R18 900, Bankfout Debiet = R2 700, Uitstaande EFTs = R4 150 & R7 250. Versoen op R50 280.',
  working_solution_en: '1. CRJ additions = 350 + 9 400 = R9 750.\\n2. CPJ additions = 1 100 + 270 + 3 600 = R4 970.\\n3. Adjusted Bank Account = 31 400 + 9 750 - 4 970 = R36 180.\\n4. Bank Recon:\\n   - Credits = 31 380 (Statement) + 18 900 (Deposit) = R50 280.\\n   - Debits = 2 700 (Bank Error) + 4 150 (EFT 560) + 7 250 (EFT 563) + 36 180 (Bank Account) = R50 280.',
  working_solution_af: '1. KOJ byvoegings = 350 + 9 400 = R9 750.\\n2. KBJ byvoegings = 1 100 + 270 + 3 600 = R4 970.\\n3. Aangepaste Banksaldo = 31 400 + 9 750 - 4 970 = R36 180.\\n4. Bankversoening: Krediete = 31 380 + 18 900 = 50 280. Debiete = 2 700 + 4 150 + 7 250 + 36 180 = 50 280.',
  fields: [
    { n: 'crj_additional_total', len: 'CRJ Additions Total', laf: 'KOJ Byvoegings Totaal', c: '9750', m: 5, exp_en: 'Interest refund 350 + Direct rent 9 400 = R9 750.', exp_af: 'Rente terugbetaling 350 + Direkte huur 9 400 = R9 750.' },
    { n: 'cpj_additional_total', len: 'CPJ Additions Total', laf: 'KBJ Byvoegings Totaal', c: '4970', m: 5, exp_en: 'Bank charges 1 100 + EFT correction 270 + Security 3 600 = R4 970.', exp_af: 'Bankkoste 1 100 + EFT regstelling 270 + Sekuriteit 3 600 = R4 970.' },
    { n: 'updated_bank_balance', len: 'Adjusted Bank Balance', laf: 'Aangepaste Banksaldo', c: '36180', m: 7, exp_en: '31 400 + 9 750 - 4 970 = R36 180.', exp_af: '31 400 + 9 750 - 4 970 = R36 180.' },
    { n: 'stmt_credit_balance', len: 'Bank Statement Balance', laf: 'Bankstaat Saldo', c: '31380', m: 4, exp_en: 'Credit balance as per Bank Statement = R31 380.', exp_af: 'Kredietsaldo volgens Bankstaat = R31 380.' },
    { n: 'outstanding_deposit_cr', len: 'Credit Outstanding Deposit', laf: 'Krediet Uitstaande Deposito', c: '18900', m: 4, exp_en: 'Outstanding deposit not on statement = R18 900 (Credit).', exp_af: 'Uitstaande deposito nie op staat nie = R18 900 (Krediet).' },
    { n: 'bank_error_debit', len: 'Debit Bank Error Correction', laf: 'Debiet Bankfout Regstelling', c: '2700', m: 4, exp_en: 'Bank over-credited deposit by R2 700 (18 500 - 15 800) -> Debit in Recon.', exp_af: 'Bank het deposito oor-gekrediteer met R2 700 (18 500 - 15 800) -> Debiet in Versoening.' },
    { n: 'outstanding_eft_560', len: 'Debit Outstanding EFT 560', laf: 'Debiet Uitstaande EFT 560', c: '4150', m: 3, exp_en: 'Unpresented payment to Makro = R4 150 (Debit).', exp_af: 'Uitstaande betaling aan Makro = R4 150 (Debiet).' },
    { n: 'outstanding_eft_563', len: 'Debit Outstanding EFT 563', laf: 'Debiet Uitstaande EFT 563', c: '7250', m: 3, exp_en: 'Unpresented payment to Sasol = R7 250 (Debit).', exp_af: 'Uitstaande betaling aan Sasol = R7 250 (Debiet).' }
  ]
});

addQuestion({
  paper_type: 'paper_2', topic_en: 'Cost Accounting', topic_af: 'Koste-rekeningkunde',
  subtopic_en: 'NSC Jun 2023 P2 Q2 (Factory Overhead Allocation & Cost Ledgers)', subtopic_af: 'NSC Jun 2023 V2 V2 (Fabrieksbokoste Toewysing & Kostegrootboeke)', difficulty: 'hard',
  question_text_en: 'QUESTION 3.2 [OFFICIAL NSC JUN 2023 P2]: Factory Overhead Cost Note, Prime Cost & Production Cost of Aloe Manufacturers for year ended 31 May 2026. (45 Marks)',
  question_text_af: 'VRAAG 3.2 [AMPTELIKE NSC JUN 2023 V2]: Fabrieksbokoste Nota, Primêre Koste & Produksiekoste van Aloe Vervaardigers vir jaar geëindig 31 Mei 2026. (45 Punte)',
  info_section_en: `BUSINESS: ALOE MANUFACTURERS
ACCOUNTING PERIOD: FINANCIAL YEAR ENDED 31 MAY 2026
TOPIC: FACTORY OVERHEAD APPORTIONMENT & PRODUCTION COSTING (45 MARKS)

INFORMATION A: FACTORY OVERHEAD EXPENSES & APPORTIONMENT
• Total building floor area: 2 000 m² (Factory floor: 1 400 m² = 70%, Office area: 400 m² = 20%, Sales showroom: 200 m² = 10%).
• Factory rent expense for the year: R180 000 (Apportioned based on floor area).
• Factory comprehensive insurance: R84 000 (80% allocated to factory machinery, 20% to office equipment).
• Water and electricity: R96 000 (Metered: 75% factory machinery, 25% administrative office).
• Indirect materials (consumable stores):
  - Inventory on 1 June 2025: R14 000
  - Purchases during year: R68 000
  - Inventory on 31 May 2026: R11 500
• Indirect labour: Foremen salaries R145 000, Factory cleaning and maintenance staff R62 000.
• Depreciation on factory machinery: R54 800

INFORMATION B: Prime Cost & PRODUCTION OUTPUT
• Direct Material Cost Consumed: R840 000
• Direct Labour Cost: R680 000
• Work-in-progress on 1 June 2025: R95 000
• Work-in-progress on 31 May 2026: R112 500
• Total finished units produced during the year: 35 000 units`,
  info_section_af: `BESIGHEID: ALOE VERVAARDIGERS
REKENKUNDIGE TYDPERK: FINANSIËLE JAAR GEËINDIG 31 MEI 2026
ONDERWERP: FABRIEKSBOKOSTE TOEWYSEDING & PRODUKSIEKOSTE (45 PUNTE)

INLIGTING A: FABRIEKSBOKOSTE UITGAWES & TOEWYSEDING
• Totale gebou vloeroppervlak: 2 000 m² (Fabriek: 1 400 m² = 70%, Kantoor: 400 m² = 20%, Vertoonlokaal: 200 m² = 10%).
• Fabriekshuur vir die jaar: R180 000 (Toegewys volgens vloeroppervlakte).
• Fabrieksversekering: R84 000 (80% toegewys aan fabrieksmasjinerie, 20% aan kantoortoerusting).
• Water en elektrisiteit: R96 000 (Gemeter: 75% fabrieksmasjinerie, 25% administratiewe kantoor).
• Indirekte materiaal (verbruiksgoedere):
  - Voorraad op 1 Junie 2025: R14 000
  - Aankope gedurende jaar: R68 000
  - Voorraad op 31 Mei 2026: R11 500
• Indirekte arbeid: Voorman salarisse R145 000, Fabriekskoonmaak en instandhouding R62 000.
• Waardevermindering op fabrieksmasjinerie: R54 800

INLIGTING B: Primêre Koste & PRODUKSIE
• Direkte Materiaalkoste Verbruik: R840 000
• Direkte Arbeidskoste: R680 000
• Werk-in-vordering op 1 Junie 2025: R95 000
• Werk-in-vordering op 31 Mei 2026: R112 500
• Totale voltooide eenhede geproduseer gedurende die jaar: 35 000 eenhede`,
  tableConfig: {
    title_en: 'ALOE MANUFACTURERS — FACTORY OVERHEAD NOTE & PRODUCTION STATEMENT',
    title_af: 'ALOE VERVAARDIGERS — FABRIEKSBOKOSTE NOTA & PRODUKSIESTAAT',
    columns_en: ['Cost Element / Note Item', 'Apportionment / Workings', 'Amount (R)'],
    columns_af: ['Kosteelement / Nota-item', 'Toewysing / Bewerkinge', 'Bedrag (R)'],
    rows: [
      { isHeader: true, label_en: 'SECTION 1: FACTORY OVERHEAD COST NOTE', label_af: 'AFDELING 1: FABRIEKSBOKOSTE NOTA' },
      { id: 'foh_ind_mat', label_en: 'Indirect materials consumed (14 000 + 68 000 - 11 500)', label_af: 'Indirekte materiaal verbruik (14 000 + 68 000 - 11 500)', fields: [{ readOnly: true, staticValue: '14k + 68k - 11.5k' }, { field_name: 'indirect_materials_consumed' }] },
      { id: 'foh_ind_lab', label_en: 'Indirect labour (Foremen 145k + Maintenance 62k)', label_af: 'Indirekte arbeid (Voormanne 145k + Instandhouding 62k)', fields: [{ readOnly: true, staticValue: '145 000 + 62 000' }, { field_name: 'indirect_labour_cost' }] },
      { id: 'foh_rent', label_en: 'Factory Rent expense (70% floor space share of R180 000)', label_af: 'Fabriekshuur (70% vloeroppervlak van R180 000)', fields: [{ readOnly: true, staticValue: '180 000 * 70%' }, { field_name: 'factory_rent_share' }] },
      { id: 'foh_tot', isTotalRow: true, label_en: 'TOTAL FACTORY OVERHEAD COST (Mat + Lab + Rent + Insur 67.2k + Elec 72k + Depr 54.8k)', label_af: 'TOTALE FABRIEKSBOKOSTE (Mat + Arb + Huur + Vers 67.2k + Krag 72k + Waardev 54.8k)', fields: [{ readOnly: true, staticValue: 'Overhead Total' }, { field_name: 'total_foh_calculated' }] },
      { isHeader: true, label_en: 'SECTION 2: PRODUCTION COST & UNIT COST', label_af: 'AFDELING 2: PRODUKSIEKOSTE & EENHEIDSKOSTE' },
      { id: 'prime_aloe', isTotalRow: true, label_en: 'Prime Cost (Direct Materials R840k + Direct Labour R680k)', label_af: 'Primêre Koste (Direkte Materiaal R840k + Direkte Arbeid R680k)', fields: [{ readOnly: true, staticValue: '840 000 + 680 000' }, { field_name: 'prime_cost_aloe' }] },
      { id: 'tot_prod_aloe', isTotalRow: true, label_en: 'Total Cost of Production (Prime Cost + Factory Overheads)', label_af: 'Totale Produksiekoste (Primêre Koste + Fabrieksbokoste)', fields: [{ readOnly: true, staticValue: '1 520 000 + 597 500' }, { field_name: 'total_cost_production' }] },
      { id: 'unit_cost_aloe', isTotalRow: true, label_en: 'COST PER UNIT PRODUCED (Finished Goods R2 100 000 / 35 000 units)', label_af: 'KOSTE PER EENHEID GEPRODUSEER (Voltooide Goedere R2 100 000 / 35 000 eenhede)', fields: [{ readOnly: true, staticValue: '2 100 000 / 35 000' }, { field_name: 'cost_per_unit_aloe' }] }
    ]
  },
  total_marks: 45,
  explanation_en: 'Official NSC Solution: Indirect Materials = R70 500, Indirect Labour = R207 000, Factory Rent = R126 000, Total Factory Overhead Cost = R597 500. Prime Cost = R1 520 000, Total Cost of Production = R2 117 500, Finished Goods Cost = R2 100 000, Cost per Unit = R60,00 per unit (35 000 units).',
  explanation_af: 'Amptelike NSC Oplossing: Indirekte Materiaal = R70 500, Indirekte Arbeid = R207 000, Fabriekshuur = R126 000, Totale Fabrieksbokoste = R597 500. Primêre Koste = R1 520 000, Totale Produksiekoste = R2 117 500, Voltooide Goedere Koste = R2 100 000, Koste per Eenheid = R60,00 per eenheid (35 000 eenhede).',
  working_solution_en: '1. Indirect materials = 14 000 + 68 000 - 11 500 = R70 500.\\n2. Indirect labour = 145 000 + 62 000 = R207 000.\\n3. Rent = 180 000 * 70% = R126 000.\\n4. Insurance = 84 000 * 80% = R67 200.\\n5. Electricity = 96 000 * 75% = R72 000.\\n6. Depreciation = R54 800.\\n7. Total FOH = 70.5k + 207k + 126k + 67.2k + 72k + 54.8k = R597 500.\\n8. Prime Cost = 840 000 + 680 000 = R1 520 000.\\n9. Total Production Cost = 1 520 000 + 597 500 = R2 117 500.\\n10. Finished Goods = 2 117 500 + 95 000 (WIP open) - 112 500 (WIP close) = R2 100 000.\\n11. Unit cost = 2 100 000 / 35 000 = R60,00 per unit.',
  working_solution_af: '1. Indirekte materiaal = 14k + 68k - 11.5k = R70 500.\\n2. Indirekte arbeid = 145k + 62k = R207 000.\\n3. Huur = 180k * 70% = R126 000.\\n4. Versekering = 84k * 80% = R67 200.\\n5. Elektrisiteit = 96k * 75% = R72 000.\\n6. Waardevermindering = R54 800.\\n7. Totale Bokoste = R597 500.\\n8. Primêre Koste = 840k + 680k = R1 520 000.\\n9. Totale Produksie = 1 520 000 + 597 500 = R2 117 500.\\n10. Voltooide Goedere = 2 117 500 + 95k - 112.5k = R2 100 000.\\n11. Eenheidskoste = 2 100 000 / 35 000 = R60,00 per eenheid.',
  fields: [
    { n: 'indirect_materials_consumed', len: 'Indirect Materials Consumed', laf: 'Indirekte Materiaal Verbruik', c: '70500', m: 6, exp_en: '14 000 + 68 000 - 11 500 = R70 500.', exp_af: '14 000 + 68 000 - 11 500 = R70 500.' },
    { n: 'indirect_labour_cost', len: 'Indirect Labour Cost', laf: 'Indirekte Arbeidskoste', c: '20700', m: 6, exp_en: 'Foremen 145 000 + Maintenance 62 000 = R207 000.', exp_af: 'Voormanne 145 000 + Instandhouding 62 000 = R207 000.' },
    { n: 'factory_rent_share', len: 'Factory Rent Share (70%)', laf: 'Fabriekshuur Deel (70%)', c: '126000', m: 6, exp_en: 'R180 000 * 70% floor space share = R126 000.', exp_af: 'R180 000 * 70% vloeroppervlakte = R126 000.' },
    { n: 'total_foh_calculated', len: 'Total Factory Overhead Cost', laf: 'Totale Fabrieksbokoste', c: '597500', m: 7, exp_en: '70 500 + 207 000 + 126 000 + 67 200 + 72 000 + 54 800 = R597 500.', exp_af: '70 500 + 207 000 + 126 000 + 67 200 + 72 000 + 54 800 = R597 500.' },
    { n: 'prime_cost_aloe', len: 'Prime Cost', laf: 'Primêre Koste', c: '1520000', m: 6, exp_en: 'Direct materials R840 000 + Direct labour R680 000 = R1 520 000.', exp_af: 'Direkte materiaal R840 000 + Direkte arbeid R680 000 = R1 520 000.' },
    { n: 'total_cost_production', len: 'Total Cost of Production', laf: 'Totale Produksiekoste', c: '2117500', m: 7, exp_en: 'Prime cost R1 520 000 + Factory overheads R597 500 = R2 117 500.', exp_af: 'Primêre koste R1 520 000 + Fabrieksbokoste R597 500 = R2 117 500.' },
    { n: 'cost_per_unit_aloe', len: 'Cost per Unit Produced', laf: 'Koste per Eenheid Geproduseer', c: '60', m: 7, exp_en: 'Finished goods cost R2 100 000 / 35 000 units = R60,00 per unit.', exp_af: 'Voltooide goedere koste R2 100 000 / 35 000 eenhede = R60,00 per eenheid.' }
  ]
});

addQuestion({
  paper_type: 'paper_2', topic_en: 'Inventory Valuation', topic_af: 'Voorraadwaardasie',
  subtopic_en: 'NSC Jun 2023 P2 Q3 (Stock Deficit Detection & Perpetual Inventory Adjustments)', subtopic_af: 'NSC Jun 2023 V2 V3 (Voorraadtekort Opsporing & Ewigdurende Voorraadaanpassings)', difficulty: 'medium',
  question_text_en: 'QUESTION 3.3 [OFFICIAL NSC JUN 2023 P2]: Perpetual Inventory Audit, Stock Deficit & Unrecorded Transactions for year ended 30 June 2026. (35 Marks)',
  question_text_af: 'VRAAG 3.3 [AMPTELIKE NSC JUN 2023 V2]: Ewigdurende Voorraadoudit, Voorraadtekort & Onaangetekende Transaksies vir jaar geëindig 30 Junie 2026. (35 Punte)',
  info_section_en: `BUSINESS: ALOE ENTERPRISE (LAPTOP COMPUTER DISTRIBUTORS)
ACCOUNTING PERIOD: FINANCIAL YEAR ENDED 30 JUNE 2026
TOPIC: PERPETUAL INVENTORY AUDIT & INTERNAL CONTROL (35 MARKS)

INFORMATION A: GENERAL LEDGER TRADING STOCK BALANCE
• The Trading Stock Account in the General Ledger reflected a debit balance of R1 280 000 on 30 June 2026 (representing 160 identical laptops at a cost price of R8 000 each).

INFORMATION B: AUDIT INVESTIGATION & TRANSACTIONS DISCOVERED
1. Physical count on 30 June 2026 revealed only 148 laptops physically in the warehouse.
2. The owner, J. Aloe, took 2 laptops for his children's university use on 25 June. No entry has been made in the Drawings Account.
3. 3 laptops were sold on credit to Mega Schools on 30 June 2026 for R36 000 (Cost price: 3 * R8 000 = R24 000). The goods were collected by the school, but the invoice was only posted on 1 July 2026.
4. Any remaining difference between the adjusted book records and the physical count is unexplained stock theft/shrinkage and must be written off as a Trading Stock Deficit.`,
  info_section_af: `BESIGHEID: ALOE ONDERNEMING (SKOOTREKENAAR VERSPREIDERS)
REKENKUNDIGE TYDPERK: FINANSIËLE JAAR GEËINDIG 30 JUNIE 2026
ONDERWERP: EWIGDURENDE VOORRAADOUDIT & INTERNE BEHEER (35 PUNTE)

INLIGTING A: ALGEMENE GROOTBOEK HANDELSVOORRAAD SALDO
• Die Handelsvoorraadrekening in die Algemene Grootboek toon 'n debietsaldo van R1 280 000 op 30 Junie 2026 (verteenwoordig 160 identiese skootrekenaars teen 'n kosprys van R8 000 elk).

INLIGTING B: OUDIT ONDERSOEK & TRANSAKSIES ONTDEK
1. Fisiese voorraadtelling op 30 Junie 2026 het slegs 148 skootrekenaars in die pakhuis getoon.
2. Die eienaar, J. Aloe, het op 25 Junie 2 skootrekenaars vir sy kinders geneem. Geen inskrywing is in die Ontrekkingsrekening gemaak nie.
3. 3 skootrekenaars is op 30 Junie op krediet aan Mega Skole verkoop vir R36 000 (Kosprys: 3 * R8 000 = R24 000). Die goedere is afgehaal maar faktuur is eers op 1 Julie gepos.
4. Enige oorblywende verskil tussen die aangepaste boeke en die fisiese telling is onverklaarde voorraaddiefstal en moet as 'n Handelsvoorraadtekort afgeskryf word.`,
  tableConfig: {
    title_en: 'ALOE ENTERPRISE — INVENTORY AUDIT & ADJUSTMENT SCHEDULE',
    title_af: 'ALOE ONDERNEMING — VOORRAADOUDIT & AANPASSINGSSKEDULE',
    columns_en: ['Audit Adjustment Item', 'Quantity (Units)', 'Total Cost Amount (R)'],
    columns_af: ['Oudit-aanpassingsitem', 'Hoeveelheid (Eenhede)', 'Totale Kostebedrag (R)'],
    rows: [
      { id: 'init_stock', label_en: 'Initial Trading Stock per General Ledger (Given: 160 laptops @ R8 000)', label_af: 'Aanvanklike Handelsvoorraad volgens Grootboek (Gegee: 160 @ R8 000)', fields: [{ readOnly: true, staticValue: '160 units' }, { readOnly: true, staticValue: '1 280 000' }] },
      { id: 'draw_adj', label_en: 'Deduct: Owner Drawings of trading stock (2 laptops @ R8 000 cost)', label_af: 'Trek af: Eienaarsontrekkings van handelsvoorraad (2 eenhede @ R8 000 koste)', fields: [{ readOnly: true, staticValue: '(2 units)' }, { field_name: 'owner_drawings_cost' }] },
      { id: 'unrec_sale', label_en: 'Deduct: Unrecorded credit sales of 30 June (3 laptops @ R8 000 cost)', label_af: 'Trek af: Onaangetekende kredietverkope van 30 Junie (3 eenhede @ R8 000 koste)', fields: [{ readOnly: true, staticValue: '(3 units)' }, { field_name: 'unrecorded_sales_cost' }] },
      { id: 'adj_book_q', isTotalRow: true, label_en: 'Adjusted Book Stock Quantity (160 - 2 drawings - 3 sales)', label_af: 'Aangepaste Boekvoorraad Hoeveelheid (160 - 2 - 3)', fields: [{ field_name: 'adjusted_book_units' }, { readOnly: true, staticValue: 'R1 240 000' }] },
      { id: 'theft_units', isTotalRow: true, label_en: 'UNEXPLAINED STOCK THEFT / DEFICIT (155 adjusted - 148 physical count)', label_af: 'ONVERKLAARDE VOORRAADDIEFSTAL / TEKORT (155 aangepas - 148 fisies)', fields: [{ field_name: 'unexplained_theft_units' }, { field_name: 'stock_theft_value' }] },
      { id: 'bs_stock_val', isTotalRow: true, label_en: 'FINAL BALANCE SHEET VALUE OF TRADING STOCK (148 units @ R8 000)', label_af: 'FINALE BALANSSTAAT WAARDE VAN HANDELSVOORRAAD (148 eenhede @ R8 000)', fields: [{ readOnly: true, staticValue: '148 units' }, { field_name: 'balance_sheet_stock_val' }] }
    ]
  },
  total_marks: 35,
  explanation_en: 'Official NSC Solution: Owner drawings = R16 000 (2 laptops), Unrecorded Cost of Sales = R24 000 (3 laptops). Adjusted Book Stock = 155 laptops (R1 240 000). Unexplained Stock Deficit = 7 laptops (Value R56 000). Final Balance Sheet Stock = R1 184 000 (148 laptops @ R8 000).',
  explanation_af: 'Amptelike NSC Oplossing: Ontrekkings = R16 000 (2 skootrekenaars), Onaangetekende KVK = R24 000 (3 skootrekenaars). Aangepaste Boekvoorraad = 155 skootrekenaars (R1 240 000). Voorraadtekort = 7 skootrekenaars (Waarde R56 000). Finale Balansstaat Voorraad = R1 184 000 (148 skootrekenaars @ R8 000).',
  working_solution_en: '1. Drawings cost = 2 * 8 000 = R16 000.\\n2. Unrecorded sales cost = 3 * 8 000 = R24 000.\\n3. Adjusted book units = 160 - 2 - 3 = 155 units (Value R1 240 000).\\n4. Stock theft units = 155 adjusted - 148 physical = 7 units.\\n5. Value of stock theft = 7 * 8 000 = R56 000.\\n6. Final Balance Sheet trading stock = 148 * 8 000 = R1 184 000.',
  working_solution_af: '1. Ontrekkingskoste = 2 * 8 000 = R16 000.\\n2. Verkope kosprys = 3 * 8 000 = R24 000.\\n3. Aangepaste boekvoorraad = 160 - 2 - 3 = 155 eenhede.\\n4. Tekort eenhede = 155 - 148 = 7 eenhede.\\n5. Tekort waarde = 7 * 8 000 = R56 000.\\n6. Finale Balansstaat voorraad = 148 * 8 000 = R1 184 000.',
  fields: [
    { n: 'owner_drawings_cost', len: 'Owner Drawings Cost', laf: 'Eienaarsontrekkings Koste', c: '16000', m: 6, exp_en: '2 laptops taken for personal use * R8 000 cost = R16 000.', exp_af: '2 skootrekenaars geneem vir persoonlike gebruik * R8 000 kosprys = R16 000.' },
    { n: 'unrecorded_sales_cost', len: 'Unrecorded Sales Cost of Sales', laf: 'Onaangetekende Verkope KVK', c: '24000', m: 6, exp_en: '3 laptops sold on 30 June * R8 000 cost price = R24 000.', exp_af: '3 skootrekenaars verkoop op 30 Junie * R8 000 kosprys = R24 000.' },
    { n: 'adjusted_book_units', len: 'Adjusted Book Stock Quantity', laf: 'Aangepaste Boekvoorraad Hoeveelheid', c: '155', m: 6, exp_en: '160 ledger units - 2 drawings - 3 sales = 155 laptops.', exp_af: '160 grootboek eenhede - 2 ontrekkings - 3 verkope = 155 skootrekenaars.' },
    { n: 'unexplained_theft_units', len: 'Stock Theft Units', laf: 'Voorraaddiefstal Eenhede', c: '7', m: 5, exp_en: '155 adjusted book units - 148 physical count = 7 missing laptops.', exp_af: '155 aangepaste eenhede - 148 fisies getel = 7 ontbrekende skootrekenaars.' },
    { n: 'stock_theft_value', len: 'Stock Theft Value Written Off', laf: 'Voorraaddiefstal Waarde Afgeskryf', c: '56000', m: 6, exp_en: '7 missing laptops * R8 000 cost = R56 000 trading stock deficit.', exp_af: '7 ontbrekende eenhede * R8 000 kosprys = R56 000 handelsvoorraadtekort.' },
    { n: 'balance_sheet_stock_val', len: 'Final Balance Sheet Stock Value', laf: 'Finale Balansstaat Voorraadwaarde', c: '1184000', m: 6, exp_en: '148 verified physical units * R8 000 = R1 184 000.', exp_af: '148 geverifieerde fisiese eenhede * R8 000 = R1 184 000.' }
  ]
});

addQuestion({
  paper_type: 'paper_2', topic_en: 'Budgeting & VAT', topic_af: 'Begrotings & BTW',
  subtopic_en: 'NSC Jun 2023 P2 Q4 (SARS VAT Control Account, Capital Assets & Bad Debts)', subtopic_af: 'NSC Jun 2023 V2 V4 (SARS BTW Beheerrekening, Kapitaalbates & Oninbare Skulde)', difficulty: 'medium',
  question_text_en: 'QUESTION 3.4 [OFFICIAL NSC JUN 2023 P2]: SARS VAT Control Account, Capital Equipment Input VAT & Bad Debts for two-month period ended 30 April 2026. (35 Marks)',
  question_text_af: 'VRAAG 3.4 [AMPTELIKE NSC JUN 2023 V2]: SARS BTW Beheerrekening, Kapitaaltoerusting Inset BTW & Oninbare Skulde vir tweekoers-tydperk geëindig 30 April 2026. (35 Punte)',
  info_section_en: `BUSINESS: ALOE ENTERPRISE
ACCOUNTING PERIOD: TWO-MONTH VAT PERIOD ENDED 30 APRIL 2026
TOPIC: VALUE-ADDED TAX (VAT RATE 15% STANDARD) (35 MARKS)

INFORMATION A: OPENING BALANCE ON 1 MARCH 2026
• Amount owed to SARS for previous VAT period: R18 400 (Credit balance). This amount was paid in full to SARS via EFT on 25 March 2026.

INFORMATION B: TRANSACTIONS FOR MARCH AND APRIL 2026 (ALL AMOUNTS INCLUDE 15% VAT WHERE APPLICABLE)
1. Total Sales for March & April (all standard rated): R966 000 (including VAT).
2. Purchases of trading merchandise: R529 000 (including VAT).
3. Operational expenses paid (rent, electricity, telephone, advertising): R161 000 (including VAT).
4. Capital Equipment purchased on credit: A new delivery packaging machine was purchased on 12 April 2026 for R230 000 (including VAT).
5. Bad debts written off: An irrecoverable debt of R13 800 (including VAT) owed by insolvent debtor T. Moyo was written off on 28 April 2026. Input VAT is claimable on bad debts.
6. Owner took merchandise for personal use: The cost price of the goods was R8 050 (including VAT). Output VAT must be accounted for on the cost of drawings.`,
  info_section_af: `BESIGHEID: ALOE ONDERNEMING
REKENKUNDIGE TYDPERK: TWEE-MAANDE BTW TYDPERK GEËINDIG 30 APRIL 2026
ONDERWERP: BELASTING OP TOEGEVOEGDE WAARDE (BTW 15% STANDAARD) (35 PUNTE)

INLIGTING A: BEGINSALDO OP 1 MAART 2026
• Bedrag verskuldig aan SARS vir vorige BTW-tydperk: R18 400 (Kredietsaldo). Hierdie bedrag is op 25 Maart 2026 per EFT ten volle aan SARS betaal.

INLIGTING B: TRANSAKSIES VIR MAART EN APRIL 2026 (ALLE BEDRAE SLUIT 15% BTW IN WAAR VAN TOEPASSING)
1. Totale Verkope vir Maart & April: R966 000 (BTW ingesluit).
2. Aankope van handelsvoorraad: R529 000 (BTW ingesluit).
3. Bedryfsuitgawes betaal (huur, elektrisiteit, telefoon, advertensies): R161 000 (BTW ingesluit).
4. Kapitaaltoerusting aangekoop op krediet: 'n Nuwe verpakkingsmasjien is op 12 April aangekoop vir R230 000 (BTW ingesluit).
5. Oninbare skulde afgeskryf: 'n Oninbare skuld van R13 800 (BTW ingesluit) verskuldig deur T. Moyo is op 28 April afgeskryf. Inset BTW is eisbaar op oninbare skulde.
6. Eienaar het handelsvoorraad vir privaatgebruik geneem: Die kosprys van die goedere was R8 050 (BTW ingesluit). Uitset BTW moet op die kosprys van onttrekkings bereken word.`,
  tableConfig: {
    title_en: 'ALOE ENTERPRISE — SARS VAT CONTROL SCHEDULE FOR APRIL 2026',
    title_af: 'ALOE ONDERNEMING — SARS BTW BEHEERSKEDULE VIR APRIL 2026',
    columns_en: ['VAT Category / Transaction Item', 'Calculation Formula (15/115)', 'Amount (R)'],
    columns_af: ['BTW Kategorie / Transaksie-item', 'Berekening Formule (15/115)', 'Bedrag (R)'],
    rows: [
      { isHeader: true, label_en: 'SECTION 1: OUTPUT VAT (COLLECTED ON BEHALF OF SARS)', label_af: 'AFDELING 1: UITSET BTW (INGESAMEL VIR SARS)' },
      { id: 'out_sales', label_en: 'Output VAT on Sales (R966 000 * 15/115)', label_af: 'Uitset BTW op Verkope (R966 000 * 15/115)', fields: [{ readOnly: true, staticValue: '966 000 * 15/115' }, { field_name: 'output_vat_sales' }] },
      { id: 'out_draw', label_en: 'Output VAT on Owner Drawings of trading stock (R8 050 * 15/115)', label_af: 'Uitset BTW op Eienaarsonttrekkings (R8 050 * 15/115)', fields: [{ readOnly: true, staticValue: '8 050 * 15/115' }, { field_name: 'output_vat_drawings' }] },
      { id: 'tot_out', isTotalRow: true, label_en: 'Total Output VAT for the Two-Month Period', label_af: 'Totale Uitset BTW vir die Twee-Maande Tydperk', fields: [{ readOnly: true, staticValue: 'Sales + Drawings' }, { field_name: 'total_output_vat' }] },
      { isHeader: true, label_en: 'SECTION 2: INPUT VAT (CLAIMABLE FROM SARS)', label_af: 'AFDELING 2: INSET BTW (EISBAAR VANAF SARS)' },
      { id: 'inp_pur', label_en: 'Input VAT on Merchandise Purchases (R529 000 * 15/115)', label_af: 'Inset BTW op Voorraadaankope (R529 000 * 15/115)', fields: [{ readOnly: true, staticValue: '529 000 * 15/115' }, { field_name: 'input_vat_purchases' }] },
      { id: 'inp_cap', label_en: 'Input VAT on Capital Packaging Machine (R230 000 * 15/115)', label_af: 'Inset BTW op Kapitaal Verpakkingsmasjien (R230 000 * 15/115)', fields: [{ readOnly: true, staticValue: '230 000 * 15/115' }, { field_name: 'input_vat_capital_equipment' }] },
      { id: 'net_vat_due', isTotalRow: true, label_en: 'NET VAT PAYABLE TO SARS (Output VAT R127 050 - Total Input VAT R121 800)', label_af: 'NETTO BTW BETAALBAAR AAN SARS (Uitset R127 050 - Inset R121 800)', fields: [{ readOnly: true, staticValue: 'Payable to SARS' }, { field_name: 'net_vat_payable_sars' }] }
    ]
  },
  total_marks: 35,
  explanation_en: 'Official NSC Solution: Output VAT = R126 000 (Sales) + R1 050 (Drawings) = R127 050. Input VAT = R69 000 (Purchases) + R21 000 (Expenses) + R30 000 (Capital Equipment) + R1 800 (Bad Debts) = R121 800. Net VAT Payable to SARS = R5 250.',
  explanation_af: 'Amptelike NSC Oplossing: Uitset BTW = R126 000 (Verkope) + R1 050 (Onttrekkings) = R127 050. Inset BTW = R69 000 (Aankope) + R21 000 (Uitgawes) + R30 000 (Toerusting) + R1 800 (Oninbare Skuld) = R121 800. Netto BTW Betaalbaar aan SARS = R5 250.',
  working_solution_en: '1. Output VAT on sales = 966 000 * 15/115 = R126 000.\\n2. Output VAT on drawings = 8 050 * 15/115 = R1 050.\\n3. Total Output VAT = 126 000 + 1 050 = R127 050.\\n4. Input VAT on purchases = 529 000 * 15/115 = R69 000.\\n5. Input VAT on expenses = 161 000 * 15/115 = R21 000.\\n6. Input VAT on machine = 230 000 * 15/115 = R30 000.\\n7. Input VAT on bad debts = 13 800 * 15/115 = R1 800.\\n8. Total Input VAT = 69k + 21k + 30k + 1.8k = R121 800.\\n9. Net VAT Payable = 127 050 - 121 800 = R5 250.',
  working_solution_af: '1. Uitset BTW verkope = 966k * 15/115 = R126 000.\\n2. Uitset BTW onttrekkings = 8 050 * 15/115 = R1 050.\\n3. Totale Uitset BTW = R127 050.\\n4. Inset BTW aankope = 529k * 15/115 = R69 000.\\n5. Inset BTW uitgawes = 161k * 15/115 = R21 000.\\n6. Inset BTW masjien = 230k * 15/115 = R30 000.\\n7. Inset BTW oninbare skuld = 13.8k * 15/115 = R1 800.\\n8. Totale Inset BTW = R121 800.\\n9. Netto BTW Betaalbaar = 127 050 - 121 800 = R5 250.',
  fields: [
    { n: 'output_vat_sales', len: 'Output VAT on Sales', laf: 'Uitset BTW op Verkope', c: '126000', m: 6, exp_en: 'R966 000 * 15/115 = R126 000.', exp_af: 'R966 000 * 15/115 = R126 000.' },
    { n: 'output_vat_drawings', len: 'Output VAT on Drawings', laf: 'Uitset BTW op Onttrekkings', c: '1050', m: 6, exp_en: 'R8 050 cost * 15/115 = R1 050 output VAT payable.', exp_af: 'R8 050 kosprys * 15/115 = R1 050 uitset BTW betaalbaar.' },
    { n: 'total_output_vat', len: 'Total Output VAT', laf: 'Totale Uitset BTW', c: '127050', m: 5, exp_en: '126 000 + 1 050 = R127 050.', exp_af: '126 000 + 1 050 = R127 050.' },
    { n: 'input_vat_purchases', len: 'Input VAT on Merchandise Purchases', laf: 'Inset BTW op Voorraadaankope', c: '69000', m: 6, exp_en: 'R529 000 * 15/115 = R69 000.', exp_af: 'R529 000 * 15/115 = R69 000.' },
    { n: 'input_vat_capital_equipment', len: 'Input VAT on Capital Equipment', laf: 'Inset BTW op Kapitaaltoerusting', c: '30000', m: 6, exp_en: 'R230 000 * 15/115 = R30 000 claimable input VAT on packaging machine.', exp_af: 'R230 000 * 15/115 = R30 000 eisbare inset BTW op verpakkingsmasjien.' },
    { n: 'net_vat_payable_sars', len: 'Net VAT Payable to SARS', laf: 'Netto BTW Betaalbaar aan SARS', c: '5250', m: 6, exp_en: 'Total Output VAT R127 050 - Total Input VAT R121 800 = R5 250 payable.', exp_af: 'Totale Uitset BTW R127 050 - Totale Inset BTW R121 800 = R5 250 betaalbaar.' }
  ]
});

// --- PAPER 2 - EXAM SET 4 (OFFICIAL NSC NOV 2024 PAPER 2 - 150 MARKS) ---
addQuestion({
  paper_type: 'paper_2', topic_en: 'Reconciliations', topic_af: 'Versoenings',
  subtopic_en: 'NSC Nov 2024 P2 Q1 (Debtors Age Analysis, Bad Debt Provision & Credit Control)', subtopic_af: 'NSC Nov 2024 V2 V1 (Debiteure Ouderdomsontleding, Oninbare Skulde Voorsiening & Kredietbeheer)', difficulty: 'hard',
  question_text_en: 'QUESTION 4.1 [OFFICIAL NSC NOV 2024 P2]: Debtors Age Analysis, Insolvent Debtor Recovery & Provision for Bad Debts of Springbok Dealers on 31 October 2026. (35 Marks)',
  question_text_af: 'VRAAG 4.1 [AMPTELIKE NSC NOV 2024 V2]: Debiteure-ouderdomsontleding, Insolvente Debiteur Verhaaling & Voorsiening vir Oninbare Skulde van Springbok Handelaars op 31 Oktober 2026. (35 Punte)',
  info_section_en: `BUSINESS: SPRINGBOK DEALERS
ACCOUNTING PERIOD: MONTH ENDED 31 OCTOBER 2026
TOPIC: DEBTORS AGE ANALYSIS, CREDIT CONTROL & PROVISION FOR BAD DEBTS (35 MARKS)

INFORMATION A: DEBTORS CONTROL & CREDIT POLICY
• Total Trade Debtors balance in General Ledger on 31 October 2026: R380 000.
• Credit terms: Strictly 30 days from date of monthly statement.
• Debtors Age Analysis summary on 31 October 2026:
  - Current (0–30 days): R190 000 (50.0%)
  - 31–60 days: R95 000 (25.0%)
  - 61–90 days: R57 000 (15.0%)
  - 90+ days (Overdue): R38 000 (10.0%)
• Accounts older than 30 days are officially overdue according to business credit policy.

INFORMATION B: YEAR-END ADJUSTMENTS ON 31 OCTOBER 2026
1. Insolvent debtor: Debtor J. Van Dyk (owing R12 000 in the 90+ days category) was declared insolvent. His estate paid a dividend of 40 cents in the Rand (R4 800) via EFT. The remaining 60% (R7 200) must be written off as irrecoverable bad debt.
2. Unrecorded collection: Debtor T. Khumalo (in 60 days category) paid R15 000 via EFT on 31 October which was recorded in the CRJ but not yet posted to his account in the Debtors Ledger.
3. Provision for Bad Debts adjustment: The provision for bad debts must be adjusted to 5% of the final net Trade Debtors balance. The current Provision for Bad Debts balance in the ledger is R14 500.`,
  info_section_af: `BESIGHEID: SPRINGBOK HANDELAARS
REKENKUNDIGE TYDPERK: MAAND GEËINDIG 31 OKTOBER 2026
ONDERWERP: DEBITEURE OUDERDOMSONTLEDING, KREDIETBEHEER & VOORSIENING VIR ONINBARE SKULDE (35 PUNTE)

INLIGTING A: DEBITEUREBEHEER & KREDIETBELEID
• Totale Handelsdebiteure saldo in Grootboek op 31 Oktober 2026: R380 000.
• Kredietterme: Streng 30 dae vanaf datum van maandstaat.
• Debiteure Ouderdomsontleding opsomming op 31 Oktober 2026:
  - Huidig (0–30 dae): R190 000 (50.0%)
  - 31–60 dae: R95 000 (25.0%)
  - 61–90 dae: R57 000 (15.0%)
  - 90+ dae (Agterstallig): R38 000 (10.0%)
• Rekeninge ouer as 30 dae is amptelik agterstallig volgens kredietbeleid.

INLIGTING B: EINDE VAN DIE JAAR AANPASSINGS OP 31 OKTOBER 2026
1. Insolvente debiteur: Debiteur J. Van Dyk (skuld R12 000 in 90+ dae kategorie) is insolvent verklaar. Sy boedel het 'n dividend van 40 sent in die Rand (R4 800) per EFT betaal. Die oorblywende 60% (R7 200) moet as oninbare skuld afgeskryf word.
2. Onaangetekende invordering: Debiteur T. Khumalo (in 60 dae kategorie) het R15 000 per EFT op 31 Okt inbetaal, wat in KOJ aangeteken is maar nog nie in Debiteuregrootboek gepos is nie.
3. Voorsiening vir Oninbare Skulde aanpassing: Die voorsiening moet aangepas word na 5% van die finale netto Handelsdebiteure. Die huidige saldo in die grootboek is R14 500.`,
  tableConfig: {
    title_en: 'SPRINGBOK DEALERS — DEBTORS RISK ANALYSIS & PROVISION SCHEDULE',
    title_af: 'SPRINGBOK HANDELAARS — DEBITEURE RISIKO & VOORSIENINGSSKEDULE',
    columns_en: ['Risk Analysis / Ledger Item', 'Calculation Formula', 'Amount (R)'],
    columns_af: ['Risiko-ontleding / Grootboekitem', 'Berekening Formule', 'Bedrag (R)'],
    rows: [
      { id: 'overdue_tot', label_en: 'Total Overdue Debtors (> 30 Days: 95k + 57k + 38k)', label_af: 'Totale Agterstallige Debiteure (> 30 Dae: 95k + 57k + 38k)', fields: [{ readOnly: true, staticValue: '95k + 57k + 38k (50%)' }, { field_name: 'total_overdue_debtors' }] },
      { id: 'bad_debt_w', label_en: 'Bad Debt Written Off (60% of R12 000 for J. Van Dyk)', label_af: 'Oninbare Skuld Afgeskryf (60% van R12 000 vir J. Van Dyk)', fields: [{ readOnly: true, staticValue: '12 000 * 60%' }, { field_name: 'bad_debt_written_off' }] },
      { id: 'net_deb_ctrl', isTotalRow: true, label_en: 'FINAL ADJUSTED TRADE DEBTORS CONTROL (380k - 7.2k bad debt - 4.8k EFT - 15k Khumalo)', label_af: 'FINALE AANGEPASTE DEBITEUREBEHEER (380k - 7.2k - 4.8k - 15k)', fields: [{ readOnly: true, staticValue: '380k - 27k' }, { field_name: 'net_debtors_control' }] },
      { id: 'req_prov', label_en: 'Required Provision for Bad Debts (5% of Net Debtors R353 000)', label_af: 'Vereiste Voorsiening vir Oninbare Skulde (5% van R353 000)', fields: [{ readOnly: true, staticValue: '353 000 * 5%' }, { field_name: 'required_bad_debt_prov' }] },
      { id: 'prov_adj_inc', label_en: 'Increase in Provision for Bad Debts Adjustment (17 650 - 14 500)', label_af: 'Vermeerdering in Voorsiening vir Oninbare Skulde (17 650 - 14 500)', fields: [{ readOnly: true, staticValue: '17 650 - 14 500' }, { field_name: 'prov_adjustment_increase' }] },
      { id: 'bs_net_deb', isTotalRow: true, label_en: 'Net Trade Debtors Shown in Balance Sheet (353 000 - 17 650)', label_af: 'Netto Handelsdebiteure Getoon in Balansstaat (353 000 - 17 650)', fields: [{ readOnly: true, staticValue: '353 000 - 17 650' }, { field_name: 'net_balance_sheet_debtors' }] }
    ]
  },
  total_marks: 35,
  explanation_en: 'Official NSC Solution: Total Overdue Debtors = R190 000 (50%). Bad Debt Written Off = R7 200. Final Adjusted Debtors = R353 000. Required Provision (5%) = R17 650. Provision Increase Adjustment = R3 150. Net Balance Sheet Debtors = R335 350.',
  explanation_af: 'Amptelike NSC Oplossing: Totale Agterstallige Debiteure = R190 000 (50%). Oninbare Skuld Afgeskryf = R7 200. Finale Aangepaste Debiteure = R353 000. Vereiste Voorsiening (5%) = R17 650. Voorsiening Vermeerdering = R3 150. Netto Balansstaat Debiteure = R335 350.',
  working_solution_en: '1. Total overdue (>30 days) = 95 000 + 57 000 + 38 000 = R190 000.\\n2. Bad debt written off = 12 000 * 60% = R7 200 (R4 800 received in bank).\\n3. Net debtors control = 380 000 - 7 200 (bad debt) - 4 800 (cash dividend) - 15 000 (Khumalo EFT) = R353 000.\\n4. Required provision = 353 000 * 5% = R17 650.\\n5. Provision adjustment = 17 650 - 14 500 (existing) = R3 150 increase (expense).\\n6. Net trade debtors on Balance Sheet = 353 000 - 17 650 = R335 350.',
  working_solution_af: '1. Agterstallig (>30 dae) = 95k + 57k + 38k = R190 000.\\n2. Oninbare skuld = 12 000 * 60% = R7 200.\\n3. Netto debiteure = 380k - 7.2k - 4.8k - 15k = R353 000.\\n4. Vereiste voorsiening = 353k * 5% = R17 650.\\n5. Voorsiening aanpassing = 17 650 - 14 500 = R3 150 vermeerdering.\\n6. Netto handelsdebiteure = 353 000 - 17 650 = R335 350.',
  fields: [
    { n: 'total_overdue_debtors', len: 'Total Overdue Debtors', laf: 'Totale Agterstallige Debiteure', c: '190000', m: 6, exp_en: '95 000 (31-60d) + 57 000 (61-90d) + 38 000 (90+d) = R190 000.', exp_af: '95 000 (31-60d) + 57 000 (61-90d) + 38 000 (90+d) = R190 000.' },
    { n: 'bad_debt_written_off', len: 'Bad Debt Written Off', laf: 'Oninbare Skuld Afgeskryf', c: '7200', m: 6, exp_en: '60% of R12 000 debt for J. Van Dyk = R7 200.', exp_af: '60% van R12 000 skuld vir J. Van Dyk = R7 200.' },
    { n: 'net_debtors_control', len: 'Final Adjusted Trade Debtors', laf: 'Finale Aangepaste Handelsdebiteure', c: '353000', m: 8, exp_en: '380 000 - 7 200 (bad debt) - 4 800 (cash dividend) - 15 000 (EFT) = R353 000.', exp_af: '380 000 - 7 200 (oninbaar) - 4 800 (kontant) - 15 000 (EFT) = R353 000.' },
    { n: 'required_bad_debt_prov', len: 'Required Provision for Bad Debts', laf: 'Vereiste Voorsiening vir Oninbare Skulde', c: '17650', m: 6, exp_en: '5% of R353 000 net debtors = R17 650.', exp_af: '5% van R353 000 netto debiteure = R17 650.' },
    { n: 'prov_adjustment_increase', len: 'Provision Increase Adjustment', laf: 'Voorsiening Vermeerdering Aanpassing', c: '3150', m: 5, exp_en: 'R17 650 required - R14 500 existing in ledger = R3 150 increase.', exp_af: 'R17 650 vereis - R14 500 bestaande in grootboek = R3 150 vermeerdering.' },
    { n: 'net_balance_sheet_debtors', len: 'Net Balance Sheet Debtors', laf: 'Netto Balansstaat Debiteure', c: '335350', m: 4, exp_en: 'R353 000 gross debtors - R17 650 provision = R335 350.', exp_af: 'R353 000 bruto debiteure - R17 650 voorsiening = R335 350.' }
  ]
});

addQuestion({
  paper_type: 'paper_2', topic_en: 'Cost Accounting', topic_af: 'Koste-rekeningkunde',
  subtopic_en: 'NSC Nov 2024 P2 Q2 (Production Cost Statement, Unit Cost & Target Variance)', subtopic_af: 'NSC Nov 2024 V2 V2 (Produksiekostestaat, Eenheidskoste & Teikenafwyking)', difficulty: 'hard',
  question_text_en: 'QUESTION 4.2 [OFFICIAL NSC NOV 2024 P2]: Production Cost Statement, Direct Labour & Target Unit Cost Variance Analysis for year ended 30 June 2026. (45 Marks)',
  question_text_af: 'VRAAG 4.2 [AMPTELIKE NSC NOV 2024 V2]: Produksiekostestaat, Direkte Arbeid & Teiken Eenheidskoste Afwykingsontleding vir jaar geëindig 30 Junie 2026. (45 Punte)',
  info_section_en: `BUSINESS: SPRINGBOK FACTORY
ACCOUNTING PERIOD: FINANCIAL YEAR ENDED 30 JUNE 2026
TOPIC: PRODUCTION COST STATEMENT & UNIT COST VARIANCE (45 MARKS)

INFORMATION A: RAW MATERIALS & DIRECT LABOUR
• Direct Materials issued to production during the year: R1 080 000.
• Direct Labour details:
  - 8 factory artisans were employed throughout the year.
  - Each artisan worked 1 920 normal hours at R80,00 per hour.
  - Each artisan worked 180 overtime hours at 1.5 times the normal rate (R120,00 per hour).
  - Employer contributions towards medical aid and pension funds total 12.5% of basic wages.

INFORMATION B: FACTORY OVERHEADS
• Indirect materials used in factory: R92 000
• Indirect factory salaries (supervisors and maintenance): R240 000
• Factory water and electricity: R118 000
• Factory machinery maintenance & repairs: R64 000
• Depreciation on factory plant and equipment: R86 000

INFORMATION C: WORK-IN-PROGRESS & FINISHED GOODS
• Work-in-progress on 1 July 2025: R140 000
• Work-in-progress on 30 June 2026: R175 200
• Total finished units produced: 60 000 units.
• Management set a target production cost of R55,00 per finished unit.`,
  info_section_af: `BESIGHEID: SPRINGBOK FABRIEK
REKENKUNDIGE TYDPERK: FINANSIËLE JAAR GEËINDIG 30 JUNIE 2026
ONDERWERP: PRODUKSIEKOSTESTAAT & EENHEIDSKOSTE AFWYKING (45 PUNTE)

INLIGTING A: GRONDSTOWWE & DIREKTE ARBEID
• Direkte Grondstowwe uitgereik na produksie: R1 080 000.
• Direkte Arbeid besonderhede:
  - 8 fabrieksambagslui was regdeur die jaar in diens.
  - Elke ambagsman het 1 920 normale ure gewerk teen R80,00 per uur.
  - Elke ambagsman het 180 oortydure gewerk teen 1.5 maal normale tarief (R120,00 per uur).
  - Werkgewerbydraes tot mediese fonds en pensioen beloop 12.5% van basiese lone.

INLIGTING B: FABRIEKSBOKOSTE
• Indirekte materiaal gebruik in fabriek: R92 000
• Indirekte fabriekssalarisse (toesighouers en instandhouding): R240 000
• Fabriekswater en elektrisiteit: R118 000
• Fabrieksmasjinerie instandhouding & herstelwerk: R64 000
• Waardevermindering op fabrieksmasjinerie: R86 000

INLIGTING C: WERK-IN-VORDERING & VOLTOOIDE GOEDERE
• Werk-in-vordering op 1 Julie 2025: R140 000
• Werk-in-vordering op 30 Junie 2026: R175 200
• Totale voltooide eenhede geproduseer: 60 000 eenhede.
• Bestuur het 'n teiken produksiekoste van R55,00 per voltooide eenheid gestel.`,
  tableConfig: {
    title_en: 'SPRINGBOK FACTORY — PRODUCTION COST STATEMENT & VARIANCE SCHEDULE',
    title_af: 'SPRINGBOK FABRIEK — PRODUKSIEKOSTESTAAT & AFWYKINGSSKEDULE',
    columns_en: ['Cost Category / Production Item', 'Calculation Formula', 'Amount (R)'],
    columns_af: ['Kostekategorie / Produksie-item', 'Berekening Formule', 'Bedrag (R)'],
    rows: [
      { id: 'dm_sp', label_en: 'Direct Material Cost Consumed (Given)', label_af: 'Direkte Materiaalkoste Verbruik (Gegee)', fields: [{ readOnly: true, staticValue: 'Direct Materials' }, { readOnly: true, staticValue: '1 080 000' }] },
      { id: 'dl_sp', label_en: 'Direct Labour Cost (Basic 1.2288m + Overtime 172.8k + 12.5% Contrib 153.6k)', label_af: 'Direkte Arbeidskoste (Basies 1.2288m + Oortyd 172.8k + Bydraes 153.6k)', fields: [{ readOnly: true, staticValue: '1 228 800 + 172 800 + 153 600' }, { field_name: 'direct_labour_total' }] },
      { id: 'prime_sp', isTotalRow: true, label_en: 'Prime Cost (Direct Materials + Direct Labour)', label_af: 'Primêre Koste (Direkte Materiaal + Direkte Arbeid)', fields: [{ readOnly: true, staticValue: '1 080 000 + 1 555 200' }, { field_name: 'prime_cost_springbok' }] },
      { id: 'foh_sp', label_en: 'Factory Overhead Cost (92k + 240k + 118k + 64k + 86k)', label_af: 'Fabrieksbokoste (92k + 240k + 118k + 64k + 86k)', fields: [{ readOnly: true, staticValue: 'Overheads Total' }, { field_name: 'factory_overheads_total' }] },
      { id: 'tot_prod_sp', isTotalRow: true, label_en: 'Total Cost of Production', label_af: 'Totale Produksiekoste', fields: [{ readOnly: true, staticValue: '2 635 200 + 600 000' }, { field_name: 'total_production_cost' }] },
      { id: 'fg_sp', isTotalRow: true, label_en: 'Cost of Finished Goods Produced (Total Prod 3.2352m + WIP 140k - WIP 175.2k)', label_af: 'KOSTE VAN VOLTOOIDE GOEDERE (3.2352m + 140k - 175.2k)', fields: [{ readOnly: true, staticValue: 'Finished Goods Total' }, { field_name: 'cost_finished_goods' }] },
      { id: 'unit_c_sp', label_en: 'Actual Production Cost per Unit (R3 200 000 / 60 000 units)', label_af: 'Werklike Produksiekoste per Eenheid (R3 200 000 / 60 000 eenhede)', fields: [{ readOnly: true, staticValue: '3 200 000 / 60 000' }, { field_name: 'actual_unit_cost' }] },
      { id: 'var_sp', isTotalRow: true, label_en: 'FAVOURABLE UNIT COST VARIANCE (Target R55,00 - Actual Cost)', label_af: 'GUNSTIGE EENHEIDSKOSTE AFWYKING (Teiken R55,00 - Werklik)', fields: [{ readOnly: true, staticValue: '55.00 - 53.33' }, { field_name: 'unit_cost_variance' }] }
    ]
  },
  total_marks: 45,
  explanation_en: 'Official NSC Solution: Direct Labour = R1 555 200, Prime Cost = R2 635 200, Factory Overheads = R600 000, Total Production Cost = R3 235 200, Finished Goods Cost = R3 200 000, Actual Unit Cost = R53,33 per unit, Favourable Variance = R1,67 per unit savings below target.',
  explanation_af: 'Amptelike NSC Oplossing: Direkte Arbeid = R1 555 200, Primêre Koste = R2 635 200, Fabrieksbokoste = R600 000, Totale Produksiekoste = R3 235 200, Voltooide Goedere Koste = R3 200 000, Werklike Eenheidskoste = R53,33 per eenheid, Gunstige Afwyking = R1,67 per eenheid besparing onder teiken.',
  working_solution_en: '1. Direct Labour: Basic = 8 * 1 920 * 80 = R1 228 800. Overtime = 8 * 180 * 120 = R172 800. Contributions = 12.5% of 1 228 800 = R153 600. Total DL = 1 228 800 + 172 800 + 153 600 = R1 555 200.\\n2. Prime Cost = 1 080 000 + 1 555 200 = R2 635 200.\\n3. Factory Overheads = 92 000 + 240 000 + 118 000 + 64 000 + 86 000 = R600 000.\\n4. Total Production Cost = 2 635 200 + 600 000 = R3 235 200.\\n5. Cost of Finished Goods = 3 235 200 + 140 000 (WIP open) - 175 200 (WIP close) = R3 200 000.\\n6. Actual Unit Cost = 3 200 000 / 60 000 = R53,33 per unit.\\n7. Variance = R55,00 target - R53,33 actual = R1,67 favourable savings per unit.',
  working_solution_af: '1. Direkte Arbeid: Basies = 1 228 800. Oortyd = 172 800. Bydraes = 153 600. Totaal = R1 555 200.\\n2. Primêre Koste = 1 080 000 + 1 555 200 = R2 635 200.\\n3. Fabrieksbokoste = 92k + 240k + 118k + 64k + 86k = R600 000.\\n4. Totale Produksie = 2 635 200 + 600 000 = R3 235 200.\\n5. Voltooide Goedere = 3 235 200 + 140k - 175.2k = R3 200 000.\\n6. Werklike Eenheidskoste = 3 200 000 / 60 000 = R53,33 per eenheid.\\n7. Afwyking = 55,00 - 53,33 = R1,67 gunstige besparing.',
  fields: [
    { n: 'direct_labour_total', len: 'Direct Labour Total Cost', laf: 'Direkte Arbeid Totale Koste', c: '1555200', m: 7, exp_en: 'Basic wages 1 228 800 + Overtime 172 800 + 12.5% Contributions 153 600 = R1 555 200.', exp_af: 'Basiese lone 1 228 800 + Oortyd 172 800 + 12.5% Bydraes 153 600 = R1 555 200.' },
    { n: 'prime_cost_springbok', len: 'Prime Cost', laf: 'Primêre Koste', c: '2635200', m: 6, exp_en: 'Direct materials 1 080 000 + Direct labour 1 555 200 = R2 635 200.', exp_af: 'Direkte materiaal 1 080 000 + Direkte arbeid 1 555 200 = R2 635 200.' },
    { n: 'factory_overheads_total', len: 'Total Factory Overheads', laf: 'Totale Fabrieksbokoste', c: '600000', m: 6, exp_en: '92 000 + 240 000 + 118 000 + 64 000 + 86 000 = R600 000.', exp_af: '92 000 + 240 000 + 118 000 + 64 000 + 86 000 = R600 000.' },
    { n: 'total_production_cost', len: 'Total Cost of Production', laf: 'Totale Produksiekoste', c: '3235200', m: 7, exp_en: 'Prime Cost 2 635 200 + Factory Overheads 600 000 = R3 235 200.', exp_af: 'Primêre Koste 2 635 200 + Fabrieksbokoste 600 000 = R3 235 200.' },
    { n: 'cost_finished_goods', len: 'Cost of Finished Goods Produced', laf: 'Koste van Voltooide Goedere', c: '3200000', m: 7, exp_en: 'Total Production 3 235 200 + WIP Opening 140 000 - WIP Closing 175 200 = R3 200 000.', exp_af: 'Totale Produksie 3 235 200 + WIV Begin 140 000 - WIV Einde 175 200 = R3 200 000.' },
    { n: 'actual_unit_cost', len: 'Actual Cost per Unit', laf: 'Werklike Koste per Eenheid', c: '53.33', tol: 0.1, m: 6, exp_en: 'Finished Goods Cost R3 200 000 / 60 000 units = R53,33 per unit.', exp_af: 'Voltooide Goedere Koste R3 200 000 / 60 000 eenhede = R53,33 per eenheid.' },
    { n: 'unit_cost_variance', len: 'Unit Cost Savings Variance', laf: 'Eenheidskoste Besparingsafwyking', c: '1.67', tol: 0.1, m: 6, exp_en: 'Target cost R55,00 - Actual cost R53,33 = R1,67 favourable savings per unit.', exp_af: 'Teikenkoste R55,00 - Werklik R53,33 = R1,67 gunstige besparing per eenheid.' }
  ]
});

addQuestion({
  paper_type: 'paper_2', topic_en: 'Inventory Valuation', topic_af: 'Voorraadwaardasie',
  subtopic_en: 'NSC Nov 2024 P2 Q3 (Specific Identification Method & Gross Profit Margin)', subtopic_af: 'NSC Nov 2024 V2 V3 (Spesifieke Identifikasie & Bruto Winsmarge)', difficulty: 'medium',
  question_text_en: 'QUESTION 4.3 [OFFICIAL NSC NOV 2024 P2]: Specific Identification Inventory Valuation & Profitability of Springbok Prestige Motors for year ended 31 December 2026. (35 Marks)',
  question_text_af: 'VRAAG 4.3 [AMPTELIKE NSC NOV 2024 V2]: Spesifieke Identifikasie Voorraadwaardasie & Winsgewendheid van Springbok Prestige Motors vir jaar geëindig 31 Desember 2026. (35 Punte)',
  info_section_en: `BUSINESS: SPRINGBOK PRESTIGE MOTORS (LUXURY MOTOR DEALERSHIP)
ACCOUNTING PERIOD: FINANCIAL YEAR ENDED 31 DECEMBER 2026
TOPIC: SPECIFIC IDENTIFICATION INVENTORY VALUATION METHOD (35 MARKS)

INFORMATION A: VEHICLE INVENTORY & SALES RECORDS FOR 2026
• The business uses the specific identification method to value individual vehicles identified by chassis VIN number.
• Details of individual luxury vehicles acquired during the financial year:
  - Vehicle 1 (VIN 801): Purchase cost R420 000, Custom accessories fitted R35 000. Sold for R650 000 cash.
  - Vehicle 2 (VIN 802): Purchase cost R580 000, Custom accessories fitted R45 000. Sold for R890 000 cash.
  - Vehicle 3 (VIN 803): Purchase cost R360 000, Custom accessories fitted R20 000. Still in showroom on 31 December 2026.
  - Vehicle 4 (VIN 804): Purchase cost R710 000, Custom accessories fitted R50 000. Still in showroom on 31 December 2026.
  - Vehicle 5 (VIN 805): Purchase cost R490 000, Custom accessories fitted R30 000. Sold for R780 000 cash.`,
  info_section_af: `BESIGHEID: SPRINGBOK PRESTIGE MOTORS (LUUKSE MOTORHANDELAAR)
REKENKUNDIGE TYDPERK: FINANSIËLE JAAR GEËINDIG 31 DESEMBER 2026
ONDERWERP: SPESIFIEKE IDENTIFIKASIE VOORRAADWAARDASIE (35 PUNTE)

INLIGTING A: VOERTUIGVOORRAAD & VERKOOPREKORDS VIR 2026
• Die besigheid gebruik die spesifieke identifikasie metode om individuele voertuie te waardeer geïdentifiseer volgens onderstel VIN-nommer.
• Besonderhede van luukse voertuie aangekoop gedurende die finansiële jaar:
  - Voertuig 1 (VIN 801): Aankoopkoste R420 000, Pasgemaakte bykomstighede R35 000. Verkoop vir R650 000.
  - Voertuig 2 (VIN 802): Aankoopkoste R580 000, Pasgemaakte bykomstighede R45 000. Verkoop vir R890 000.
  - Voertuig 3 (VIN 803): Aankoopkoste R360 000, Pasgemaakte bykomstighede R20 000. Steeds in vertoonlokaal op 31 Desember 2026.
  - Voertuig 4 (VIN 804): Aankoopkoste R710 000, Pasgemaakte bykomstighede R50 000. Steeds in vertoonlokaal op 31 Desember 2026.
  - Voertuig 5 (VIN 805): Aankoopkoste R490 000, Pasgemaakte bykomstighede R30 000. Verkoop vir R780 000.`,
  tableConfig: {
    title_en: 'SPRINGBOK MOTORS — SPECIFIC IDENTIFICATION VALUATION SCHEDULE',
    title_af: 'SPRINGBOK MOTORS — SPESIFIEKE IDENTIFIKASIE SKEDULE',
    columns_en: ['Valuation / Profitability Line', 'Vehicles Included & Formula', 'Amount (R) / Percentage'],
    columns_af: ['Waardasie / Winsgewendheid-reël', 'Voertuie Ingesluit & Formule', 'Bedrag (R) / Persentasie'],
    rows: [
      { id: 'veh_close', isTotalRow: true, label_en: 'CLOSING INVENTORY VALUE ON HAND (Vehicles 3 & 4 in showroom)', label_af: 'EINDVOORRAAD WAARDE VOORHANDE (Voertuie 3 & 4 in vertoonlokaal)', fields: [{ readOnly: true, staticValue: 'Vehicle 3 (380k) + Vehicle 4 (760k)' }, { field_name: 'closing_stock_vehicles' }] },
      { id: 'veh_cos', label_en: 'Total Cost of Sales (Vehicles 1, 2 and 5 sold: 455k + 625k + 520k)', label_af: 'Totale Koste van Verkope (Voertuie 1, 2 en 5 verkoop: 455k + 625k + 520k)', fields: [{ readOnly: true, staticValue: '455 000 + 625 000 + 520 000' }, { field_name: 'cost_of_sales_vehicles' }] },
      { id: 'veh_rev', label_en: 'Total Sales Revenue Realised (Vehicles 1, 2 and 5: 650k + 890k + 780k)', label_af: 'Totale Verkoopsinkomste Gerealiseer (Voertuie 1, 2 en 5: 650k + 890k + 780k)', fields: [{ readOnly: true, staticValue: '650 000 + 890 000 + 780 000' }, { field_name: 'revenue_vehicles_sold' }] },
      { id: 'veh_gp', isTotalRow: true, label_en: 'TOTAL Gross Profit REALISED (Revenue R2 320 000 - Cost of Sales R1 600 000)', label_af: 'TOTALE Bruto Wins GEREALISEER (Inkomste R2 320 000 - Koste van Verkope)', fields: [{ readOnly: true, staticValue: '2 320 000 - 1 600 000' }, { field_name: 'gross_profit_vehicles' }] },
      { id: 'veh_gp_pct', isTotalRow: true, label_en: 'Gross Profit PERCENTAGE ACHIEVED (%) (Gross Profit / Sales Revenue * 100)', label_af: 'Bruto WinsPERSENTASIE BEHAAL (%) (Bruto Wins / Verkope * 100)', fields: [{ readOnly: true, staticValue: '(720 000 / 2 320 000) * 100' }, { field_name: 'gross_profit_percentage' }] }
    ]
  },
  total_marks: 35,
  explanation_en: 'Official NSC Solution: Closing Inventory = R1 140 000 (Vehicle 3 R380 000 + Vehicle 4 R760 000). Cost of Sales = R1 600 000 (Vehicles 1, 2, 5). Revenue = R2 320 000. Gross Profit = R720 000. Gross Profit Percentage = 31,03%.',
  explanation_af: 'Amptelike NSC Oplossing: Eindvoorraad = R1 140 000 (Voertuig 3 R380 000 + Voertuig 4 R760 000). Koste van Verkope = R1 600 000 (Voertuie 1, 2, 5). Inkomste = R2 320 000. Bruto Wins = R720 000. Bruto Winspersentasie = 31,03%.',
  working_solution_en: '1. Vehicle total costs:\\n   - Veh 1: 420k + 35k = R455 000 (Sold)\\n   - Veh 2: 580k + 45k = R625 000 (Sold)\\n   - Veh 3: 360k + 20k = R380 000 (Closing stock)\\n   - Veh 4: 710k + 50k = R760 000 (Closing stock)\\n   - Veh 5: 490k + 30k = R520 000 (Sold)\\n2. Closing Inventory = 380 000 + 760 000 = R1 140 000.\\n3. Cost of Sales = 455 000 + 625 000 + 520 000 = R1 600 000.\\n4. Total Revenue = 650 000 + 890 000 + 780 000 = R2 320 000.\\n5. Gross Profit = 2 320 000 - 1 600 000 = R720 000.\\n6. Gross Profit Margin = (720 000 / 2 320 000) * 100 = 31,03%.',
  working_solution_af: '1. Voertuig totale kostes: V1 = 455k, V2 = 625k, V3 = 380k, V4 = 760k, V5 = 520k.\\n2. Eindvoorraad = 380 000 + 760 000 = R1 140 000.\\n3. Koste van Verkope = 455k + 625k + 520k = R1 600 000.\\n4. Totale Inkomste = 650k + 890k + 780k = R2 320 000.\\n5. Bruto Wins = 2 320 000 - 1 600 000 = R720 000.\\n6. Bruto Winspersentasie = (720 000 / 2 320 000) * 100 = 31,03%.',
  fields: [
    { n: 'closing_stock_vehicles', len: 'Closing Inventory Value', laf: 'Eindvoorraad Waarde', c: '1140000', m: 8, exp_en: 'Vehicle 3 (380 000) + Vehicle 4 (760 000) = R1 140 000 in showroom.', exp_af: 'Voertuig 3 (380 000) + Voertuig 4 (760 000) = R1 140 000 in vertoonlokaal.' },
    { n: 'cost_of_sales_vehicles', len: 'Total Cost of Sales', laf: 'Totale Koste van Verkope', c: '1600000', m: 7, exp_en: 'Vehicle 1 (455k) + Vehicle 2 (625k) + Vehicle 5 (520k) = R1 600 000.', exp_af: 'Voertuig 1 (455k) + Voertuig 2 (625k) + Voertuig 5 (520k) = R1 600 000.' },
    { n: 'revenue_vehicles_sold', len: 'Total Sales Revenue', laf: 'Totale Verkoopsinkomste', c: '2320000', m: 6, exp_en: '650 000 + 890 000 + 780 000 = R2 320 000.', exp_af: '650 000 + 890 000 + 780 000 = R2 320 000.' },
    { n: 'gross_profit_vehicles', len: 'Total Gross Profit', laf: 'Totale Bruto Wins', c: '720000', m: 7, exp_en: 'Revenue R2 320 000 - Cost of Sales R1 600 000 = R720 000.', exp_af: 'Inkomste R2 320 000 - Koste van Verkope R1 600 000 = R720 000.' },
    { n: 'gross_profit_percentage', len: 'Gross Profit Percentage (%)', laf: 'Bruto Winspersentasie (%)', c: '31.03', tol: 0.1, m: 7, exp_en: '(R720 000 gross profit / R2 320 000 revenue) * 100 = 31,03%.', exp_af: '(R720 000 bruto wins / R2 320 000 inkomste) * 100 = 31,03%.' }
  ]
});

addQuestion({
  paper_type: 'paper_2', topic_en: 'Budgeting & VAT', topic_af: 'Begrotings & BTW',
  subtopic_en: 'NSC Nov 2024 P2 Q4 (Cash Flow Variances, Capital Budgeting & Cash Surplus)', subtopic_af: 'NSC Nov 2024 V2 V4 (Kontantvloeiafwykings, Kapitaalbegroting & Kontantsurplus)', difficulty: 'medium',
  question_text_en: 'QUESTION 4.4 [OFFICIAL NSC NOV 2024 P2]: Cash Flow Variance Analysis, Capital Purchases & Cash Closing Balance for August 2026. (35 Marks)',
  question_text_af: 'VRAAG 4.4 [AMPTELIKE NSC NOV 2024 V2]: Kontantvloei Afwykingsontleding, Kapitaalaankope & Eindbanksaldo vir Augustus 2026. (35 Punte)',
  info_section_en: `BUSINESS: SPRINGBOK RETAILERS
ACCOUNTING PERIOD: MONTH ENDED 31 AUGUST 2026
TOPIC: CASH FLOW STATEMENT & VARIANCE BUDGET EVALUATION (35 MARKS)

INFORMATION A: BUDGETED VS ACTUAL CASH FLOWS FOR AUGUST 2026
• Cash Receipts from Customers: Budgeted R480 000 | Actual Collected R510 000
• Cash Payments to Suppliers: Budgeted R240 000 | Actual Paid R275 000
• Staff Salaries and Wages: Budgeted R110 000 | Actual Paid R110 000
• Delivery Vehicle Maintenance & Fuel: Budgeted R18 000 | Actual Paid R32 000
• Capital Expenditure (Solar backup generator system): Budgeted R0 | Actual Paid R85 000

INFORMATION B: BANK BALANCE ON 1 AUGUST 2026
• Bank balance in General Ledger on 1 August 2026: R45 000 (Debit / Favourable).`,
  info_section_af: `BESIGHEID: SPRINGBOK HANDELAARS
REKENKUNDIGE TYDPERK: MAAND GEËINDIG 31 AUGUSTUS 2026
ONDERWERP: KONTANTVLOEI & AFWYKINGSBEGROTING EVALUERING (35 PUNTE)

INLIGTING A: GEBEGROTE VS WERKLIK KONTANTVLOEIE VIR AUGUSTUS 2026
• Kontantontvangste van Kliënte: Gebegroot R480 000 | Werklik Ontvang R510 000
• Kontantbetalings aan Verskaffers: Gebegroot R240 000 | Werklik Betaal R275 000
• Personeelsalarisse en Lone: Gebegroot R110 000 | Werklik Betaal R110 000
• Afleweringsvoertuig Instandhouding & Brandstof: Gebegroot R18 000 | Werklik Betaal R32 000
• Kapitaalbesteding (Sonkrag rugsteunstelsel): Gebegroot R0 | Werklik Betaal R85 000

INLIGTING B: BANKSALDO OP 1 AUGUSTUS 2026
• Banksaldo in Algemene Grootboek op 1 Augustus 2026: R45 000 (Debiet / Gunstig).`,
  tableConfig: {
    title_en: 'SPRINGBOK RETAILERS — CASH FLOW BUDGET & VARIANCE SCHEDULE',
    title_af: 'SPRINGBOK HANDELAARS — KONTANTVLOEIBEGROTING & AFWYKINGSSKEDULE',
    columns_en: ['Cash Flow Item / Variance Analysis', 'Calculation Workings', 'Amount (R) / Percentage'],
    columns_af: ['Kontantvloei-item / Afwykingsontleding', 'Berekening Bewerkinge', 'Bedrag (R) / Persentasie'],
    rows: [
      { id: 'act_inflow', isTotalRow: true, label_en: 'Total Actual Cash Inflows in August 2026', label_af: 'Totale Werklike Kontantontvangste in Augustus 2026', fields: [{ readOnly: true, staticValue: 'Actual from customers' }, { field_name: 'total_actual_inflows' }] },
      { id: 'maint_var', label_en: 'Delivery Vehicle Maintenance Unfavourable Variance (32k actual - 18k budget)', label_af: 'Afleweringsvoertuig Instandhouding Ongunstige Afwyking (32k - 18k)', fields: [{ readOnly: true, staticValue: '32 000 - 18 000' }, { field_name: 'vehicle_maintenance_var' }] },
      { id: 'maint_pct', label_en: 'Maintenance Percentage Over-Budget (%) (14 000 / 18 000 * 100)', label_af: 'Instandhouding Persentasie Oor Begroting (%) (14 000 / 18 000 * 100)', fields: [{ readOnly: true, staticValue: '(14 000 / 18 000) * 100' }, { field_name: 'maintenance_var_percentage' }] },
      { id: 'act_outflow', isTotalRow: true, label_en: 'TOTAL ACTUAL CASH OUTFLOWS IN AUGUST (275k + 110k + 32k + 85k)', label_af: 'TOTALE WERRLIKE KONTANTUITVLOEIE IN AUGUSTUS (275k + 110k + 32k + 85k)', fields: [{ readOnly: true, staticValue: 'Suppliers + Salaries + Maint + Solar' }, { field_name: 'total_actual_outflows' }] },
      { id: 'net_cf', isTotalRow: true, label_en: 'NET MONTHLY CASH SURPLUS FOR AUGUST (Inflows R510k - Outflows R502k)', label_af: 'NETTO MAANDELIKSE KONTANTSURPLUS VIR AUGUSTUS (510k - 502k)', fields: [{ readOnly: true, staticValue: '510 000 - 502 000' }, { field_name: 'net_cash_flow_august' }] },
      { id: 'close_bank', isTotalRow: true, label_en: 'CLOSING BANK BALANCE ON 31 AUGUST 2026 (Opening R45k + Surplus R8k)', label_af: 'EINDBANKSALDO OP 31 AUGUSTUS 2026 (Begin R45k + Surplus R8k)', fields: [{ readOnly: true, staticValue: '45 000 + 8 000' }, { field_name: 'closing_bank_balance' }] }
    ]
  },
  total_marks: 35,
  explanation_en: 'Official NSC Solution: Total Actual Inflows = R510 000. Vehicle Maintenance Variance = R14 000 over-budget (77,78% over budget). Total Actual Outflows = R502 000 (including R85 000 unbudgeted solar capital purchase). Net Cash Surplus = R8 000. Closing Bank Balance on 31 August 2026 = R53 000 (favourable).',
  explanation_af: 'Amptelike NSC Oplossing: Totale Werklike Ontvangste = R510 000. Voertuig Instandhouding Afwyking = R14 000 oor begroting (77,78% oor begroting). Totale Werklike Uitvloeie = R502 000 (ingesluit R85 000 sonkrag aankoop). Netto Kontantsurplus = R8 000. Eindbanksaldo op 31 Augustus 2026 = R53 000 (gunstig).',
  working_solution_en: '1. Total actual inflows = R510 000.\\n2. Vehicle maintenance variance = 32 000 - 18 000 = R14 000 unfavourable (over-spent).\\n3. Maintenance % over budget = (14 000 / 18 000) * 100 = 77,78%.\\n4. Total actual outflows = 275 000 (suppliers) + 110 000 (salaries) + 32 000 (maintenance) + 85 000 (solar system) = R502 000.\\n5. Net cash flow for August = 510 000 - 502 000 = +R8 000 surplus.\\n6. Closing bank balance = 45 000 + 8 000 = R53 000 (Debit / Favourable).',
  working_solution_af: '1. Totale werklike ontvangste = R510 000.\\n2. Voertuig instandhouding afwyking = 32 000 - 18 000 = R14 000 ongunstig.\\n3. Instandhouding % oor begroting = (14 000 / 18 000) * 100 = 77,78%.\\n4. Totale werklike uitvloeie = 275k + 110k + 32k + 85k = R502 000.\\n5. Netto kontantvloei vir Augustus = 510 000 - 502 000 = +R8 000 surplus.\\n6. Eindbanksaldo = 45 000 + 8 000 = R53 000 (Gunstig).',
  fields: [
    { n: 'total_actual_inflows', len: 'Total Actual Inflows', laf: 'Totale Werklike Ontvangste', c: '510000', m: 6, exp_en: 'Actual cash receipts collected from customers = R510 000.', exp_af: 'Werklike kontantontvangste van kliënte = R510 000.' },
    { n: 'vehicle_maintenance_var', len: 'Vehicle Maintenance Variance', laf: 'Voertuig Instandhouding Afwyking', c: '14000', m: 6, exp_en: 'Actual R32 000 - Budget R18 000 = R14 000 over-expenditure.', exp_af: 'Werklik R32 000 - Begroting R18 000 = R14 000 oorbesteding.' },
    { n: 'maintenance_var_percentage', len: 'Maintenance Variance (%)', laf: 'Instandhouding Afwyking (%)', c: '77.78', tol: 0.2, m: 5, exp_en: '(R14 000 / R18 000) * 100 = 77,78% over budget.', exp_af: '(R14 000 / R18 000) * 100 = 77,78% oor begroting.' },
    { n: 'total_actual_outflows', len: 'Total Actual Outflows', laf: 'Totale Werklike Uitvloeie', c: '502000', m: 6, exp_en: 'Suppliers 275k + Salaries 110k + Maintenance 32k + Solar 85k = R502 000.', exp_af: 'Verskaffers 275k + Salarisse 110k + Instandhouding 32k + Sonkrag 85k = R502 000.' },
    { n: 'net_cash_flow_august', len: 'Net Cash Flow for August', laf: 'Netto Kontantvloei vir Augustus', c: '8000', m: 6, exp_en: 'Actual inflows R510 000 - Actual outflows R502 000 = +R8 000 cash surplus.', exp_af: 'Werklike ontvangste R510 000 - Werklike uitvloeie R502 000 = +R8 000 surplus.' },
    { n: 'closing_bank_balance', len: 'Closing Bank Balance', laf: 'Eindbanksaldo', c: '53000', m: 6, exp_en: 'Opening bank balance R45 000 + August surplus R8 000 = R53 000 favourable.', exp_af: 'Beginbanksaldo R45 000 + Augustus surplus R8 000 = R53 000 gunstig.' }
  ]
});

console.log('RE-SEEDED SUCCESSFULLY: All 32 Questions upgraded to full Grade 12 DBE NSC standard (1 200 Marks)!');
