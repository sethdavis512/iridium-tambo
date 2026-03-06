# Iridium Tambo

A full-stack starter kit for shipping AI-powered products. Clone the repo, configure your environment, and have a working application with authentication, AI chat, and agent tools in minutes.

## Features

- **Authentication** — Email/password sign-up and sign-in via Better Auth with secure HTTP-only sessions and automatic refresh
- **Role-based access control** — USER, EDITOR, and ADMIN roles baked into the schema and session helpers
- **AI chat** — Conversational interface powered by Tambo AI. Threads and messages are managed by Tambo's cloud — no local DB storage for chat
- **Agent tools** — The AI assistant can create, list, and search notes on behalf of the user, with tool invocations rendered inline in the chat
- **Custom UI components** — Tambo renders rich components (InfoCard, StepList, ProsCons, NotesGallery, DataTable) inline in the chat
- **Notes** — A browsable notes page at `/notes` showing all notes saved by the agent, demonstrating the full tool-to-UI vertical slice
- **Form validation** — Client and server-side validation using Zod and React Hook Form with a working example
- **Type-safe end to end** — Prisma generates types from the schema, Zod validates runtime data, React Router 7 types routes and loaders, CVA ensures type-safe component variants

## Tech Stack

| Layer | Technology |
| ------- | ----------- |
| Framework | React Router v7 (SSR, config-based routing) |
| UI | React 19, Tailwind CSS v4, DaisyUI v5 |
| Database | PostgreSQL via Prisma ORM |
| Auth | Better Auth |
| AI | Tambo AI (`@tambo-ai/react`, `@tambo-ai/typescript-sdk`) |
| Validation | Zod, React Hook Form |
| Runtime | Bun (dev), Node 20 Alpine (production) |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed
- PostgreSQL database (local or hosted, e.g. [Railway](https://railway.com))
- Tambo API key ([tambo.co](https://tambo.co))

### Installation

```bash
bun install
```

### Environment

Copy `.env.example` to `.env` and fill in:

```
DATABASE_URL="postgresql://..."
TAMBO_API_KEY="..."
VITE_TAMBO_API_KEY="..."
BETTER_AUTH_BASE_URL="http://localhost:5173"
VITE_BETTER_AUTH_BASE_URL="http://localhost:5173"
```

### Database

```bash
bunx --bun prisma migrate dev   # Apply migrations
bunx --bun prisma db seed       # Seed with demo users
```

### Development

```bash
bun run dev
```

The app will be available at `http://localhost:5173`.

## Project Structure

```
app/
├── components/          # Shared UI + Tambo custom components
├── generated/prisma/    # Generated Prisma client
├── lib/
│   ├── auth.server.ts   # Better Auth server config
│   ├── auth.client.ts   # Better Auth client config
│   ├── prisma.ts        # Prisma client singleton
│   ├── tambo.server.ts  # Tambo SDK server singleton
│   └── tambo.ts         # Tambo tools + component registry
├── middleware/           # Auth middleware
├── models/              # Server-side data access (thread, note, session)
├── routes/              # React Router route modules
└── root.tsx             # App shell, TamboProvider, layout
prisma/
├── schema.prisma        # Database schema
├── migrations/          # Migration history
└── seed.ts              # Database seeder
```

## AI Chat Architecture

Tambo is the source of truth for threads and messages — no local DB storage for chat.

- **Server-side**: `app/lib/tambo.server.ts` creates a singleton `TamboAI` client for thread CRUD
- **Client-side**: `TamboProvider` in `app/root.tsx` with `apiKey` passed via loader
- **Chat UI**: `useTambo()` and `useTamboThreadInput()` hooks from `@tambo-ai/react`
- **Thread CRUD**: loaders/actions go through `app/models/thread.server.ts` → Tambo SDK

### Tools

Tools are defined in `app/lib/tambo.ts` using `defineTool()`:

| Tool | Description |
| ------ | ------------- |
| `create_note` | Saves a note with a title and content for the user |
| `list_notes` | Lists all of the user's saved notes |
| `search_notes` | Searches notes by keyword across titles and content |

### Custom Components

Components registered with `TamboProvider` for rich AI responses:

| Component | Description |
| ----------- | ------------- |
| `InfoCard` | Callout card with variants (info, success, warning, error, tip) |
| `StepList` | Ordered list of steps/tasks for instructions or guides |
| `ProsCons` | Two-column pros and cons comparison |
| `NotesGallery` | Grid display of user notes |
| `DataTable` | Label/value table for structured data |

To add your own tools, follow the pattern in `app/lib/tambo.ts` — use `defineTool()` with a Zod schema, implement the handler, and add it to the `tools` array. For custom components, define a `TamboComponent` entry with a `propsSchema` and add it to the `components` array.

## Troubleshooting

- Chat/tool-calling duplicate provider item IDs (`fc_*`): see [`docs/chat-tool-calling.md`](docs/chat-tool-calling.md)

## Building for Production

```bash
bun run build
```

### Docker

```bash
docker build -t iridium .
docker run -p 3000:3000 iridium
```

Deployable to Railway, Fly.io, AWS ECS, Google Cloud Run, or any Docker-compatible platform.

## Routes

| Route | Description |
|-------|-------------|
| `/` | Home — overview of what Iridium includes |
| `/login` | Sign in or create an account |
| `/chat` | AI chat with thread sidebar |
| `/notes` | Browse saved notes |
| `/profile` | User profile and role |
| `/form` | Form validation example |
| `/api/chat` | Chat API endpoint |
| `/api/auth/*` | Auth API endpoints |
| `/healthcheck` | Health status |
