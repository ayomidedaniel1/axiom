# Axiom: AI Research Agent

Axiom is a premium, autonomous AI research assistant powered by Google Gemini. It searches the web, extracts content from web pages, tracks reasoning steps in real-time, and compiles well-cited markdown research reports that can be exported directly as PDF or Microsoft Word documents.

---

## 🌟 Key Features
- **Autonomous Agentic Flow:** Uses the Vercel AI SDK to chain Google Gemini reasoning steps with active search and scrape tools (up to 5 iterative steps).
- **Web Search & Scraping Integration:** Connects to **Tavily Search API** for deep web queries and **Jina Reader** for extracting text content from individual pages.
- **Live Reasoning Logs:** Real-time visual timeline showing the model's inner thoughts and active tool invocations.
- **Interactive Citation Tracking:** Automatically parses inline footnotes (`[1]`, `[2]`, etc.) from the assistant's replies into clickable elements that highlight their respective sources in a side panel.
- **History Management:** Fully persistent user accounts and conversations powered by Supabase with React Query cache synchronization.
- **Export Formats:** Generates formatted downloads for research papers as either **PDF** (via `jsPDF`) or **Word DOCX** (via `docx`).

---

## 🛠️ Technology Stack
- **Framework:** Next.js 16 (App Router) & React 19
- **Styling:** Vanilla CSS & Tailwind CSS v4 (designed with high-fidelity glassmorphic cards, custom animations, and a polished dark mode theme)
- **AI Core:** Vercel AI SDK (`ai`), Google AI SDK (`@ai-sdk/google`) using the Gemini 3 Flash model (`gemini-3-flash-preview` with thinking configurations)
- **State Management:** Zustand (for theme and sidebar UI states), TanStack React Query v5 (for Supabase cache state)
- **Database & Auth:** Supabase (PostgreSQL, pgvector, Row-Level Security)
- **Export Engines:** `jspdf` & `docx`

---

## 📂 Codebase Architecture
```
axiom/
├── app/
│   ├── api/chat/route.ts      # Research agent API route (streams model response & coordinates Tavily/Jina tools)
│   ├── auth/callback/route.ts # Supabase oauth/email confirmation callback handler
│   ├── login/page.tsx         # User authentication page
│   ├── layout.tsx             # Root page provider layouts
│   ├── page.tsx               # Main chat and research interface
│   └── globals.css            # Base styles and animations
├── components/
│   ├── auth/                  # AuthProvider & LoginForm component
│   ├── layout/                # Global Header component
│   ├── providers/             # React Query providers
│   ├── research/              # ChatHistory, MessageBubble, ThoughtLog, SourcesPanel, ExportDialog components
│   └── ui/                    # Reusable shadcn-like design tokens (Badge, Button, Card, Input, ScrollArea)
├── hooks/
│   ├── use-conversations.ts   # React Query mutations and queries for managing conversation sessions
│   ├── use-messages.ts        # React Query mutations and queries for saving user and assistant replies
│   └── use-research.ts        # Hook wrapping Vercel useChat and parsing live thought/tool steps
├── lib/
│   ├── supabase/              # Server, Client, and Middleware integrations for Supabase ssr
│   ├── tools/                 # Scraper (Jina Reader) & Search (Tavily API) implementations
│   ├── export-utils.ts        # Word (DOCX) and PDF converters and sanitizers
│   └── utils.ts               # Tailwinds class merges (clsx, tailwind-merge)
├── stores/
│   ├── citations-store.ts     # Client-side Zustand store for parsing and highlighting citation sources
│   └── ui-store.ts            # UI visibility states, mobile layout detectors, and theme persistence
├── supabase/
│   └── schema.sql             # DB initialization script (Profiles, Conversations, Messages, and RLS rules)
└── package.json               # Node dependency mappings and scripts
```

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have Node.js and `pnpm` installed.

### 2. Installation
Install the project dependencies:
```bash
pnpm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:
```env
# Google Gemini API key (from Google AI Studio)
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key

# Tavily API key (from Tavily Dashboard)
TAVILY_API_KEY=your_tavily_api_key

# Supabase Credentials (from Supabase Project Settings)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Initialization
Run the SQL queries in `supabase/schema.sql` inside the Supabase SQL Editor to initialize:
- **`profiles`** table (automatically populated upon sign-up via triggers).
- **`conversations`** & **`messages`** tables.
- **Row-Level Security (RLS)** policies ensuring user data privacy.
- Performance indexes on foreign keys.

*(Note: The old `reports` and `citations` tables in schema.sql are deprecated in the current codebase and have been commented out as state is managed in-memory or inside `messages`).*

### 5. Running the Application
Start the development server:
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to access the research portal.

---

## 🧼 Code Quality and Maintenance
To check for syntax, type safety, and coding violations:
- **TypeScript Verification:**
  ```bash
  npx tsc --noEmit
  ```
- **Linting:**
  ```bash
  npx eslint .
  ```
