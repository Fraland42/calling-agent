# Calling Agent

AI-powered communication platform for real estate agents, teams, and brokerages.

## Vision
Turn every lead into a conversation — automatically. Calling Agent combines AI voice, SMS, chat, and email to qualify real estate leads, book appointments, and nurture contacts over time.

## MVP Features
- **AI SMS assistant** — two-way SMS with AI replies
- **Website chatbot** — embeddable chat widget
- **AI lead nurturing campaigns** — scheduled SMS/call sequences
- **Facebook lead ads integration** — webhook ingestion
- **Multi-language AI calling** — Vapi-powered outbound calls

## Tech Stack
- Next.js 16 + React 19 + TypeScript
- Tailwind CSS + shadcn/ui
- Prisma + PostgreSQL
- Vercel AI SDK + OpenAI
- Twilio (SMS)
- Vapi (voice AI)

## Project Structure
```
apps/web/           Next.js app (frontend + API)
docs/               PRD and architecture docs
```

## Getting Started

### 1. Start PostgreSQL
```bash
docker compose up -d
```

### 2. Install dependencies
```bash
cd apps/web
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env with your API keys
```

### 4. Set up the database
```bash
npm run db:migrate
npm run db:seed
```

### 5. Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables
See `apps/web/.env.example` for required variables.

## Docs
- [Product Requirements](docs/PRD.md)
- [Architecture](docs/ARCHITECTURE.md)
