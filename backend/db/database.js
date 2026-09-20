const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const dbPath = process.env.DATABASE_FILE 
  ? path.resolve(__dirname, '../../', process.env.DATABASE_FILE)
  : path.join(__dirname, 'database.sqlite');

const db = new DatabaseSync(dbPath);

// Enable pragmas
db.exec('PRAGMA foreign_keys = ON;');

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS licenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key_code TEXT UNIQUE NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      license_key TEXT UNIQUE NOT NULL,
      language TEXT DEFAULT 'en',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paper_type TEXT NOT NULL CHECK(paper_type IN ('paper_1', 'paper_2')),
      exam_type TEXT NOT NULL CHECK(exam_type IN ('prelims', 'final')),
      topic_en TEXT NOT NULL,
      topic_af TEXT NOT NULL,
      subtopic_en TEXT,
      subtopic_af TEXT,
      difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')),
      question_text_en TEXT NOT NULL,
      question_text_af TEXT NOT NULL,
      info_section_en TEXT,
      info_section_af TEXT,
      table_config_json TEXT,
      question_type TEXT DEFAULT 'multi_field',
      total_marks INTEGER NOT NULL,
      explanation_en TEXT,
      explanation_af TEXT,
      working_solution_en TEXT,
      working_solution_af TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS answer_fields (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      field_name_en TEXT NOT NULL,
      field_name_af TEXT NOT NULL,
      field_label_en TEXT,
      field_label_af TEXT,
      answer_type TEXT CHECK(answer_type IN ('number', 'text', 'mcq', 'table_cell')),
      correct_answer TEXT NOT NULL,
      accepted_alternatives_json TEXT DEFAULT '[]',
      tolerance REAL DEFAULT 0,
      marks INTEGER NOT NULL DEFAULT 1,
      explanation_en TEXT,
      explanation_af TEXT,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      question_id INTEGER NOT NULL,
      paper_type TEXT NOT NULL,
      exam_type TEXT NOT NULL,
      submitted_answers_json TEXT NOT NULL,
      marks_earned REAL NOT NULL,
      total_marks REAL NOT NULL,
      percentage REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS mock_exams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      paper_type TEXT NOT NULL,
      exam_type TEXT NOT NULL,
      score REAL NOT NULL,
      total_marks REAL NOT NULL,
      percentage REAL NOT NULL,
      duration_seconds INTEGER DEFAULT 0,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );
  `);

  try { db.exec('ALTER TABLE questions ADD COLUMN info_section_en TEXT;'); } catch (e) {}
  try { db.exec('ALTER TABLE questions ADD COLUMN info_section_af TEXT;'); } catch (e) {}
  try { db.exec('ALTER TABLE questions ADD COLUMN table_config_json TEXT;'); } catch (e) {}
  try { db.exec('ALTER TABLE students ADD COLUMN email TEXT;'); } catch (e) {}
  try { db.exec('ALTER TABLE students ADD COLUMN name TEXT;'); } catch (e) {}
  try { db.exec('ALTER TABLE students ADD COLUMN picture TEXT;'); } catch (e) {}
  try { db.exec('ALTER TABLE students ADD COLUMN google_id TEXT;'); } catch (e) {}
  try { db.exec('ALTER TABLE students ADD COLUMN whop_user_id TEXT;'); } catch (e) {}
  try { db.exec("ALTER TABLE students ADD COLUMN whop_membership_id TEXT;"); } catch (e) {}
  try { db.exec("ALTER TABLE students ADD COLUMN whop_product_id TEXT;"); } catch (e) {}
  try { db.exec("ALTER TABLE students ADD COLUMN whop_plan_id TEXT;"); } catch (e) {}
  try { db.exec("ALTER TABLE students ADD COLUMN access_status TEXT DEFAULT 'active';"); } catch (e) {}
  try { db.exec("ALTER TABLE students ADD COLUMN expires_at DATETIME;"); } catch (e) {}
  try { db.exec("ALTER TABLE students ADD COLUMN last_verified_at DATETIME;"); } catch (e) {}

  console.log('Database initialized successfully at:', dbPath);
}

initDatabase();

module.exports = db;
