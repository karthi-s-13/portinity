# Portinity: RAG-based AI Resume Tailoring & Generation Engine

Portinity is a modern resume optimization platform designed to align a candidate's professional profile (first name, last name, skills, experiences, projects, achievements, and certifications) directly to a target Job Description. Using a Retrieval-Augmented Generation (RAG) pipeline combined with dynamic template-specific formatting constraints, it generates high-quality, single-page, ATS-friendly LaTeX-compiled resumes and interactive React UI previews.

---

## 🎨 Layout Templates & Design Blueprint

Portinity offers four distinct, professional resume templates:

1. **Modern Blue Line (`blue-line`):** Two-column corporate template. Narrow left column (contacts, skills, certs) and a wide right column (summary, experiences, projects, achievements). Enforces a strict 30-word summary limit.
2. **Executive Gray Banner (`gray-banner`):** Clean single-column layout with a sophisticated slate/deep charcoal header banner (`#27272A`) and a soft off-white/gray contact sub-bar (`#F4F4F5`). Capped at 50-word summaries.
3. **Elegant Beige (`elegant-beige`):** Classy single-column layout with soft warm gold highlights and structured section dividers. Sharing the same limits as Gray Banner.
4. **Minimal Black Classic (`minimal-classic`):** Timeless, high-contrast, zero-distraction executive single-column template styled with TeX Gyre Heros typography, a soft off-white sub-bar, and balanced `0.5 in` margins. 

---

## 🛠️ Technology Stack

Portinity is built on a modular stack separating real-time React UI preview components from a RAG-driven Python FastAPI generation and XeLaTeX compilation backend:

### Backend (AI & PDF Engine)
* **Framework:** **FastAPI (Python 3.10+)** — High-performance, asynchronous Python web framework for managing profile API endpoints.
* **RAG Pipeline:** **pgvector & Semantic Retrieval** — Queries user database records based on Job Description embeddings to fetch the most relevant experiences, projects, and skills.
* **LLM Integration:** **OpenRouter API** (invoking large language models like `Nemotron-70B`) — Tailors and structures resume JSON outputs to target the job description.
* **PDF Rendering:** **XeLaTeX Engine** — Compiles the Jinja2-rendered LaTeX templates into baseline-aligned, print-ready PDFs.
* **Database:** **PostgreSQL 17** — Manages database records for profiles, history logging, and stores vector embeddings.

### Frontend (Interactive Workspace)
* **Framework:** **React 18 & Vite** — Lightweight React framework for swift hot-reloading and modular component structures.
* **Icons:** **React Icons (Hi2)** — Provides visual contact indicators.
* **Design System:** **Vanilla CSS** — Custom responsive stylesheets calibrated to standard A4 sheet dimensions.

---

## ⚡ Key Features

* **Dynamic Database Limits Adaptation:** Queries database counts for experiences and projects to dynamically adapt the page allocation budget (e.g. `exp_limit`, `proj_limit`) and layout constraints at LLM generation time, ensuring the resume fits perfectly on a single page.
* **Template-Specific Prompt Injections:** Inject template instructions directly into the LLM context to ensure text outputs conform to strict limits (e.g., word count limits for summary paragraphs and bullet count limits for experiences).
* **Zero-Overflow Fallback Guards:** Frontend template components programmatically slice list lengths, trim summary text, and discard unsupported sections on-the-fly, ensuring the preview matches the page budget precisely.
* **Layout Compatibility Suggestions:** Suggest similar templates sharing identical design constraints (e.g., Gray Banner, Elegant Beige, Minimal Black Classic) in the template selector gallery, allowing users to toggle between compatible layouts with one click.
* **Baseline-Aligned PDF Downloads:** Adjusted vertical baselines (`\raisebox{-0.35ex}`) in compiled LaTeX files to ensure fontawesome contact icons (envelope, phone, map-marker, linkedin, github) line up cleanly on the same line as the text.

---

## 📂 Project Structure

```bash
portinity/
├── backend/
│   ├── prompt_management/
│   │   ├── adaptations/              # Dynamic limits adaptor packages
│   │   │   ├── blue_line/
│   │   │   ├── elegant_beige/
│   │   │   ├── gray_banner/
│   │   │   └── minimal_classic/
│   │   ├── template_instructions/     # Strict LLM rules text files
│   │   │   ├── blue-line.txt
│   │   │   ├── elegant-beige.txt
│   │   │   ├── gray-banner.txt
│   │   │   └── minimal-classic.txt
│   │   ├── manager.py                # Template and instruction loading
│   │   └── system_prompt.txt         # Global LLM guidelines
│   ├── rag/
│   │   └── rag_engine.py             # Vector database search & generation
│   ├── tex_templates/                # LaTeX source files compiled to PDF
│   ├── routers/
│   │   └── ai_resume.py              # Generation and history api endpoints
│   ├── main.py                       # FastAPI entry point
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── resume_templates/     # React template layout components
    │   │   │   ├── BlueLineTemplate.jsx
    │   │   │   ├── ElegantBeigeTemplate.jsx
    │   │   │   ├── GrayBannerTemplate.jsx
    │   │   │   ├── MinimalClassicTemplate.jsx
    │   │   │   ├── TemplateSelector.jsx  # Gallery with preview & suggester
    │   │   │   └── index.js              # Template metadata registry
    │   │   └── sections/
    │   │       └── AiResumeSection.jsx   # Tailwind controls & history logger
    │   └── App.jsx
    └── package.json
```

---

## 🚀 Setup & Execution

### 1. Database Setup
Make sure PostgreSQL is running with `pgvector` enabled:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up your `.env` configuration file:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/portinity
   OPENROUTER_API_KEY=your_openrouter_api_key
   ```
5. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

### 3. Frontend Setup
1. Navigate to the `frontend/` directory:
   ```bash
   cd ../frontend
   ```
2. Install npm modules:
   ```bash
   npm install
   ```
3. Run the React local development server:
   ```bash
   npm run dev
   ```
