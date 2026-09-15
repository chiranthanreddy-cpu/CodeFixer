const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-4o-mini";

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => res.json({ status: "ok" }));

function extractJson(content) {
  if (typeof content !== "string") throw new Error("The AI returned an empty response.");
  const cleaned = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  const parsed = JSON.parse(first >= 0 && last > first ? cleaned.slice(first, last + 1) : cleaned);
  if (!parsed.problem || !parsed.fixedCode || !parsed.explanation) throw new Error("The AI response was incomplete.");
  return { problem: String(parsed.problem).trim(), fixedCode: String(parsed.fixedCode), explanation: String(parsed.explanation).trim() };
}

function createDebuggerPrompt({ language, code, error }) {
  return `You are CodeFixer, a precise coding debugger helping a student with a ${language} assignment.

Identify the actual error or problem. Make the smallest sensible correction that preserves the student's intended behavior. Do not redesign, add unrelated features, or rewrite the solution unnecessarily.

Return ONLY valid JSON with exactly these string fields:
{"problem":"A concise description of what is wrong","fixedCode":"The complete corrected code","explanation":"Why this specific correction works"}

Student code:\n---\n${code}\n---\n\nError or problem reported by the student:\n---\n${error}\n---`;
}

app.post("/api/fix", async (req, res) => {
  const { language, code, error, problem } = req.body || {};
  const issue = typeof error === "string" ? error : problem;
  if (typeof language !== "string" || !language.trim()) return res.status(400).json({ error: "Please select a programming language." });
  if (typeof code !== "string" || !code.trim()) return res.status(400).json({ error: "Please paste the code you want to fix." });
  if (typeof issue !== "string" || !issue.trim()) return res.status(400).json({ error: "Please describe the error or problem." });
  if (code.length > 50000 || issue.length > 10000) return res.status(413).json({ error: "That submission is too large. Please shorten the code or error details." });
  if (!process.env.OPENROUTER_API_KEY) {
    console.error("OPENROUTER_API_KEY is not configured.");
    return res.status(503).json({ error: "The AI service is not configured yet. Please try again later." });
  }

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, messages: [{ role: "user", content: createDebuggerPrompt({ language: language.trim(), code, error: issue.trim() }) }], temperature: 0.2 }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      console.error("OpenRouter request failed:", response.status, data?.error?.message || "Unknown error");
      return res.status(502).json({ error: "The AI service could not process this request. Please try again." });
    }
    return res.json(extractJson(data?.choices?.[0]?.message?.content));
  } catch (error) {
    console.error("Code fix request failed:", error.message);
    return res.status(502).json({ error: "We could not create a fix right now. Please try again." });
  }
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && "body" in error) return res.status(400).json({ error: "Request body must be valid JSON." });
  return next(error);
});

app.listen(PORT, () => console.log(`CodeFixer backend running on port ${PORT}`));
