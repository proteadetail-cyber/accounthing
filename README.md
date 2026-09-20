# SA Grade 12 Accounting Vault (100% NSC Past Paper Platform)

Welcome to the **South African Grade 12 NSC Accounting Practice Platform**.

## 🚀 How to Start the App

### Option 1: Double-Click Launcher (Recommended)
- **macOS**: Double-click `start-app.command`
- **Windows**: Double-click `start-app.bat`

This will start the backend server and open your web browser automatically at `http://localhost:5001`.

### Option 2: Terminal Command
```bash
npm start
```
or
```bash
node backend/index.js
```

## Public Hosting

The frontend can be deployed to GitHub Pages by the workflow in
`.github/workflows/deploy-pages.yml`. In the repository settings, enable
GitHub Actions as the Pages source and add these repository variables:

- `VITE_BACKEND_URL`: the public URL of the deployed backend, without a trailing slash.
- `VITE_WHOP_CHECKOUT_URL`: the public Whop checkout URL.

GitHub Pages hosts the frontend only. The backend and database must run on a
separate service such as Render and Supabase.

The repository also includes `render.yaml` for creating the backend on Render.
After connecting the repository at Render, choose **Blueprint** and fill in
the secret environment variables when prompted. Render will provide the public
backend URL; use that URL as `VITE_BACKEND_URL` in the GitHub repository
variables, then rerun the Pages workflow.

---

## 🌟 Features Included

1. **100% Authentic Official DBE NSC Dataset**:
   - **32 Full Past Paper Questions** from DBE NSC 2021, 2022, 2023 & 2024.
   - **1 200 Total Marks** across Paper 1 (Financial Accounting & Corporate Reporting) & Paper 2 (Managerial Accounting, Costing & Controls).
   - **Full Line Item Answer Sheets**: Complete multi-row Income Statements (21 rows), Balance Sheets (16 rows), Cash Flow Statements (12 rows), and Working Tables matching official DBE answer booklets.

2. **Google Sign-In & Authentication**:
   - Real Google OAuth integration with GIS SDK (`/api/auth/google`) and user profile persistence in SQLite (`database.sqlite`).

3. **Practice Hub**:
   - Clean **MARK** / **MERK** action button with instant auto-marking, line-by-line mark breakdown, and official step-by-step NSC working solutions.

4. **Interactive Exam Utilities**:
   - Zero-lag draggable Financial Calculator and Accounting Notepad.
   - Exam Information Booklet drawer & vertical text wrapping (no horizontal sliders).

---

## 📁 Directory Overview
- `backend/`: Node.js Express API server (`index.js`), SQLite database connection (`database.js`), seed script (`seed.js`), marking engine (`markingEngine.js`).
- `frontend/`: React + TypeScript + Vite UI with Tailwind CSS and Framer Motion.
- `database.sqlite`: Pre-seeded database ready to use.
- `start-app.command` / `start-app.bat`: One-click startup scripts.
