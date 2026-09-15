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

For the assignment estimate, `openai/gpt-4o-mini` is calculated at **$0.15 per 1M input tokens** and **$0.60 per 1M output tokens**.

Assuming an average request uses about **600 input tokens** and **400 output tokens**, and the product receives **300 fix requests per month**:

- Input cost per request: `600 × $0.15 / 1,000,000 = $0.00009`
- Output cost per request: `400 × $0.60 / 1,000,000 = $0.00024`
- Total AI cost per request: `$0.00009 + $0.00024 = $0.00033`
- Estimated monthly AI cost: `300 × $0.00033 = $0.099`
- **Estimated monthly AI cost: approximately $0.10/month**

This estimate covers model inference only. Hosting costs depend on the deployment providers and selected plans.

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

## Deployment

The MVP is deployed as two services:

- **Frontend:** Vercel
- **Backend:** Render

The production frontend uses `VITE_API_URL` to call the deployed Express backend. The browser never receives the OpenRouter API key.

- Frontend: https://frontend-flax-delta-98.vercel.app
- Backend: https://codefixer-backend.onrender.com
- Backend health check: https://codefixer-backend.onrender.com/health

The `OPENROUTER_API_KEY` is configured only in the Render backend deployment environment.
