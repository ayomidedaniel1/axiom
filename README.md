# Axiom - AI Research Agent

An autonomous AI research agent powered by Gemini that searches the web, scrapes pages, and generates verified research reports.

## Features

- 🔍 **Web Search** - Searches the web for relevant information
- 📄 **Page Scraping** - Extracts content from web pages
- 🤖 **Multi-step Reasoning** - Uses agentic AI to gather and synthesize information
- ✨ **Real-time Streaming** - See the agent's thought process as it works

## Tech Stack

- **Framework**: Next.js 16
- **AI SDK**: Vercel AI SDK (Core + React)
- **Model**: Google Gemini 1.5 Flash (via Google Generative AI Provider)
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.local.example .env.local
```

Add your Google AI API key to `.env.local`:

```
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to start researching.

## Project Structure

```
axiom/
├── app/
│   ├── api/chat/       # AI chat endpoint
│   └── page.tsx        # Main research interface
├── components/
│   ├── research/       # Research-specific components
│   └── ui/             # Reusable UI components
├── hooks/
│   └── use-research.ts # Custom hook for research chat
├── lib/
│   └── tools/          # AI agent tools (search, scraper)
└── types/
    └── research.ts     # TypeScript type definitions
```

## How It Works

1. User submits a research query
2. The AI agent uses `webSearch` to find relevant sources
3. It uses `readPage` to extract details from promising URLs
4. The agent synthesizes findings into a Markdown report with citations

## License

MIT
