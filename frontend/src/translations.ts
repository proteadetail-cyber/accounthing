import { Language } from './types';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    welcome_back: "Welcome back.",
    enter_license: "Enter your license key to continue.",
    license_placeholder: "Enter license key...",
    continue: "CONTINUE",
    verifying: "Verifying access...",
    access_granted: "Access granted.",
    invalid_license: "Invalid license key.",
    master_access: "Master Access Active",

    dashboard: "Dashboard",
    practice: "Practice",
    mock_exams: "Mock Exams",
    progress: "Progress",
    question_bank: "Question Bank",
    admin: "Admin",
    settings: "Settings",
    switch_paper: "SWITCH PAPER",

    good_morning: "INFORMATION",
    ready_to_improve: "Practice, mock examinations, and real-time performance analytics.",

    estimated_next_paper: "ESTIMATED NEXT PAPER",
    based_on_performance: "Based on recent practice metrics",
    not_enough_data: "Not enough data yet",
    complete_more_questions: "Complete more questions to build your estimate.",

    questions_completed: "QUESTIONS COMPLETED",
    overall_average: "OVERALL AVERAGE",
    correct_answers: "CORRECT ANSWERS",
    incorrect_answers: "INCORRECT ANSWERS",
    current_streak: "CURRENT STREAK",

    what_do_you_want_to_study: "SELECT STUDY ENVIRONMENT",
    paper_1_title: "PAPER 1 — FINANCIAL REPORTING",
    paper_1_subtitle: "Financial Statements, Cash Flow, Analysis & Ratios",
    paper_2_title: "PAPER 2 — MANAGERIAL ACCOUNTING",
    paper_2_subtitle: "Cost Accounting, Inventory, VAT & Budgets",
    active_paper: "Active Paper",

    topic_performance: "TOPIC PERFORMANCE",
    focus_areas: "FOCUS AREAS (WEAK TOPICS)",
    practice_these: "PRACTICE THESE",
    recent_activity: "RECENT PRACTICE ACTIVITY",
    no_activity_yet: "No practice activity recorded yet.",

    filter_all: "All Exams",
    filter_prelims: "Prelims",
    filter_final: "Finals",

    quick_practice: "Quick Practice (10 Qs)",
    topic_practice: "Topic Practice",
    random_practice: "Random Practice",
    weak_topics_practice: "Weak Topics",
    mock_exam: "Mock Exam",

    check_answer: "MARK",
    submitting: "Submitting...",
    next_question: "NEXT QUESTION",
    try_again: "TRY AGAIN",
    your_answer: "YOUR ANSWER",
    correct_answer: "CORRECT ANSWER",
    why: "EXPLANATION",

    submit_exam: "SUBMIT EXAM",
    confirm_submit: "Are you sure you want to submit your exam?",
    exam_completed: "MOCK EXAM COMPLETED",

    import_questions: "BULK QUESTION IMPORT",
    export_questions: "EXPORT QUESTION BANK",
    admin_panel: "Admin Management Portal",
    paste_json: "Paste JSON Question Bank Array",
    import_btn: "PROCESS BULK IMPORT",
    
    logout: "Logout",
    current_paper_label: "Selected Paper Environment"
  },
  af: {
    welcome_back: "Welkom terug.",
    enter_license: "Voer jou lisensiesleutel in om voort te gaan.",
    license_placeholder: "Voer lisensiesleutel in...",
    continue: "GAAN VOORT",
    verifying: "Verifieer toegang...",
    access_granted: "Toegang verleen.",
    invalid_license: "Ongeldige lisensiesleutel.",
    master_access: "Hoofsleutel Toegang Aktief",

    dashboard: "Kontroleskerm",
    practice: "Oefen",
    mock_exams: "Proefeksamens",
    progress: "Vordering",
    question_bank: "Vrae Bank",
    admin: "Administrasie",
    settings: "Instellings",
    switch_paper: "SKAKEL VRAESTEL",

    good_morning: "INFORMATION",
    ready_to_improve: "Oefening, proefeksamens, en intydse prestasie-ontleding.",

    estimated_next_paper: "GESKATTE VOLGENDE VRAESTEL",
    based_on_performance: "Gebaseer op onlangse oefenresultate",
    not_enough_data: "Nog nie genoeg data nie",
    complete_more_questions: "Voltooi meer vrae om jou skatting te bou.",

    questions_completed: "VRAE VOLTOOI",
    overall_average: "ALGEHELE GEMIDDELD",
    correct_answers: "KORREKTE ANTWOORDE",
    incorrect_answers: "VERKEERDE ANTWOORDE",
    current_streak: "HUIDIGE REEKS",

    what_do_you_want_to_study: "KIES STUDIE-OMGEWING",
    paper_1_title: "VRAESTEL 1 — FINANSIËLE VERSLAGDOENING",
    paper_1_subtitle: "Finansiële State, Kontantvloei, Ontleding & Verhoudings",
    paper_2_title: "VRAESTEL 2 — BESTUURSREKENINGKUNDE",
    paper_2_subtitle: "Kosterekeningkunde, Voorraad, BTW & Begrotings",
    active_paper: "Aktiewe Vraestel",

    topic_performance: "ONDERWERP PRESTASIE",
    focus_areas: "FOKUSAREAS (SWAK ONDERWERPE)",
    practice_these: "OEFEN HIERDIE",
    recent_activity: "ONLANGSE OEFENAKTIWITEIT",
    no_activity_yet: "Nog geen oefenaktiwiteit aangeteken nie.",

    filter_all: "Alle Eksamens",
    filter_prelims: "Proefeksamen",
    filter_final: "Eindeksamen",

    quick_practice: "Vinnige Oefening (10 Vrae)",
    topic_practice: "Onderwerp Oefening",
    random_practice: "Ewekansige Oefening",
    weak_topics_practice: "Swak Onderwerpe",
    mock_exam: "Proefeksamen",

    check_answer: "MERK",
    submitting: "Indiening...",
    next_question: "VOLGENDE VRAAG",
    try_again: "PROBEER WEER",
    your_answer: "JOU ANTWOORD",
    correct_answer: "KORREKTE ANTWOORD",
    why: "VERDUIDELIKING",

    submit_exam: "DIEN EKSAMEN IN",
    confirm_submit: "Is jy seker jy wil jou eksamen indien?",
    exam_completed: "PROEFEKSAMEN VOLTOOI",

    import_questions: "MASSA-VRAAG INVOER",
    export_questions: "VOER VRAEBANK UIT",
    admin_panel: "Administrasie Portaal",
    paste_json: "Plak JSON Vraebank Skikking",
    import_btn: "VERWERK MASSA-INVOER",

    logout: "Meld af",
    current_paper_label: "Gekose Vraestel Omgewing"
  }
};
