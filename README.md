# CodeFixer

CodeFixer solves a recurring student problem: losing time interpreting assignment errors, searching for causes, and deciding how to correct code without accidentally rewriting the whole solution.

Paste code, choose a language, and describe the error. CodeFixer returns what is wrong, a focused corrected version, and why that correction works.

## AI integration

- Provider: OpenRouter
- Model: `openai/gpt-4o-mini`
- Backend call: [`backend/server.js`](backend/server.js), in the `POST /api/fix` handler using Node's built-in `fetch`.
- The API key is read only by the backend from `process.env.OPENROUTER_API_KEY`; it is never sent to the frontend.

The debugger prompt requests structured JSON (`problem`, `fixedCode`, and `explanation`) and asks for the smallest correction that retains the student's intended behavior. The backend also removes common Markdown fences before parsing the response.

## Deliberately excluded

This MVP excludes authentication, databases and saved history, code execution, GitHub/VS Code integrations, chat, model selection, analytics, payments, and decorative animation. Each would broaden the product beyond its focused purpose: helping a student understand one debugging issue at a time.

## Cost calculation

Pricing should be confirmed against the selected model's current OpenRouter listing before launch. Fill in the current input/output token prices here rather than relying on stale values:

- Input price: `[current price per 1M tokens]`
- Output price: `[current price per 1M tokens]`
- Estimated cost per fix: `((average input tokens × input price) + (average output tokens × output price)) / 1,000,000`

## Local setup

Requirements: Node.js 18+ (Node 24 is also supported) and an OpenRouter API key.

1. Copy `backend/.env.example` to `backend/.env` and set `OPENROUTER_API_KEY`.
2. In one terminal, run `cd backend && npm install && node server.js`.
3. In another terminal, run `cd frontend && npm install && npm run dev`.
4. Open the local Vite URL. During development, Vite proxies `/api` requests to the backend at port 3000.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | Yes | OpenRouter credential; backend-only |
| `PORT` | No | Backend port; defaults to `3000` |

## Deployment notes

Deploy the frontend and Express backend separately or serve them behind one reverse proxy. Configure the frontend host to proxy `/api` to the backend so the browser only calls CodeFixer's own API.

- Frontend URL: `[add deployed frontend URL]`
- Backend URL: `[add deployed backend URL]`
- Ensure `OPENROUTER_API_KEY` is configured only in the backend deployment environment.
