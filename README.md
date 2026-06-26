# Mastra Interview Prep Agent

An AI interview coach built with [Mastra](https://mastra.ai/) and a React frontend.

The app lets you chat with a GitHub-aware agent that can inspect public repositories, explain code, generate interview questions, and run one-question-at-a-time interview practice.

## What It Does

- Lists public GitHub repositories for a user.
- Reads repository metadata, file trees, and selected source files.
- Generates interview-style explanations and model answers.
- Runs interview simulations with grading and feedback.
- Provides a small React chat UI with dark mode and loading states.
- Includes Mastra observability/storage setup for local development.

## Tech Stack

- Mastra backend
- React 1
- Vite
- TypeScript
- Tailwind CSS
- GitHub REST API
- OpenAI model router via Mastra

## Project Structure

```text
.
├── src/mastra
│   ├── agents
│   │   ├── github-agent.ts      # GitHub interview coach agent
│   │   └── weather-agent.ts     # Starter weather example agent
│   ├── tools
│   │   ├── github-tool.ts       # GitHub repo/list/files/content tools
│   │   └── weather-tool.ts      # Starter weather example tool
│   ├── scorers
│   │   └── weather-scorer.ts    # Example scorers registered in Mastra
│   ├── workflows
│   │   └── weather-workflow.ts  # Starter workflow example
│   ├── types.ts
│   └── index.ts                 # Mastra app registration
└── frontend
    ├── src/components
    │   └── InterviewAgent.tsx   # Chat UI
    ├── src/index.css            # Tailwind + custom UI animation
    └── vite.config.ts           # Proxies /api to the Mastra server
```

## Requirements

- Node.js `>=22.13.0`
- npm
- An OpenAI API key available to the Mastra backend

The frontend Vite version also requires a modern Node release. Using Node 22 keeps both the backend and frontend happy.

## Environment

Create a local environment file or export these variables before starting the backend:

```bash
OPENAI_API_KEY=your_openai_api_key

# Optional: enables Mastra Platform exporting if you use it
MASTRA_PLATFORM_ACCESS_TOKEN=your_mastra_platform_token
```

The GitHub tools currently use the public GitHub API without authentication, so they work for public repositories. GitHub rate limits may apply.

## Install

Install backend dependencies from the repo root:

```bash
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

## Run Locally

Start the Mastra backend from the repo root:

```bash
npm run dev
```

Mastra Studio and the local API run at:

```text
http://localhost:4111
```

In a second terminal, start the frontend:

```bash
cd frontend
npm run dev
```

Open the frontend URL printed by Vite, usually:

```text
http://localhost:5173
```

The frontend sends requests to:

```text
/api/agents/github-interview-agent/generate
```

Vite proxies `/api` to the Mastra backend at `http://localhost:4111`.

## Example Prompts

Try these in the chat UI:

```text
List my repositories
```

```text
Analyze repo sandram92/FeBackMe
```

```text
Start interview on sandram92/FeBackMe
```

```text
Ask me React questions based on my repo
```

If a prompt says "my repositories", the agent defaults to the GitHub user `sandram92`. If a repo is not specified, it defaults to `sandram92/FeBackMe`.

## Available Scripts

Backend scripts, from the repo root:

```bash
npm run dev      # Start Mastra development server
npm run build    # Build the Mastra app
npm run start    # Start the built Mastra app
```

Frontend scripts, from `frontend/`:

```bash
npm run dev      # Start Vite dev server
npm run build    # Type-check and build the frontend
npm run lint     # Run ESLint
npm run preview  # Preview the production frontend build
```

## Registered Mastra Resources

The main Mastra app is configured in `src/mastra/index.ts`.

Registered agents:

- `github-interview-agent`: interview preparation agent that uses GitHub repo tools.
- `weather-agent`: starter Mastra weather assistant.

Registered GitHub tools:

- `list-user-repos`
- `get-repo-details`
- `get-repo-files`
- `get-file-content`

Storage and observability are configured with:

- LibSQL for default local storage at `file:./mastra.db`
- DuckDB for observability storage
- Mastra storage/platform observability exporters
- Sensitive data filtering for spans

## Notes

- Keep Mastra agents, tools, workflows, and scorers registered in `src/mastra/index.ts`.
- Use the npm scripts in `package.json` instead of running Mastra CLI commands directly.
- The current GitHub tools only read public repository data.
- The frontend is a separate Vite app under `frontend/`.

