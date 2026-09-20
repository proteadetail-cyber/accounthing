export type PaperType = 'paper_1' | 'paper_2';
export type ExamType = 'all' | 'prelims' | 'final';
export type Language = 'en' | 'af';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type AnswerType = 'number' | 'text' | 'mcq' | 'table_cell';

export interface AnswerField {
  id: number;
  question_id: number;
  field_name_en: string;
  field_name_af: string;
  field_label_en?: string;
  field_label_af?: string;
  answer_type: AnswerType;
  marks: number;
  sort_order: number;
}

export interface FieldResult {
  field_id: number;
  field_name: string;
  field_label?: string;
  submitted: string;
  correct_answer: string;
  is_correct: boolean;
  marks_earned: number;
  total_marks: number;
  explanation?: string;
}

export interface Question {
  id: number;
  paper_type: PaperType;
  exam_type: 'prelims' | 'final';
  topic_en: string;
  topic_af: string;
  subtopic_en?: string;
  subtopic_af?: string;
  difficulty: Difficulty;
  question_text_en: string;
  question_text_af: string;
  info_section_en?: string;
  info_section_af?: string;
  table_config_json?: string;
  question_type: string;
  total_marks: number;
  created_at?: string;
  fields: AnswerField[];
}

export interface AttemptResult {
  attempt_id: number;
  question_id: number;
  paper_type: PaperType;
  exam_type: 'prelims' | 'final';
  marks_earned: number;
  total_marks: number;
  percentage: number;
  field_results: FieldResult[];
  working_solution?: string;
}

export interface TopicStat {
  topic_en: string;
  topic_af: string;
  average_pct: number;
  attempt_count: number;
}

export interface DiagnosticAnalysis {
  message_en: string;
  message_af: string;
  primary_weakness_en: string | null;
  primary_weakness_af: string | null;
}

export interface DashboardStats {
  paper_type: PaperType;
  exam_type: ExamType;
  completed_count: number;
  average_percentage: number;
  correct_count: number;
  incorrect_count: number;
  streak: number;
  estimated_score: number | null;
  estimation_message: string;
  diagnostic_analysis?: DiagnosticAnalysis;
  topic_performance: TopicStat[];
  weak_topics: TopicStat[];
  recent_activity: any[];
}

export interface StudentSession {
  id: number;
  licenseKey: string;
  language: Language;
  isMaster: boolean;
  streakDays?: number;
  email?: string;
  name?: string;
  picture?: string;
  isGoogle?: boolean;
  accessStatus?: string;
  whopMembershipId?: string;
  expiresAt?: string;
}
