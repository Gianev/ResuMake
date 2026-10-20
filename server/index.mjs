import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';

if (existsSync('.env')) {
  for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
}

const systemPrompt = `You are a careful resume coach. Help users improve their resume truthfully.
Never invent employers, projects, tools, dates, achievements, or metrics. When a metric could strengthen a claim but is not supplied, ask a concise question or suggest what to measure.
Assess bullets against STAR (Situation, Task, Action, Result) when relevant. Give specific, actionable advice.
Return ONLY valid JSON. Every suggestion must include replacement and elementId; use empty strings when no safe replacement applies.
Only include a replacement when it is supported by the user's supplied facts. Keep replacements concise and resume-ready.`;

const responseFormat = {
  type: 'json_schema',
  json_schema: {
    name: 'resume_coaching', strict: true,
    schema: {
      type: 'object', additionalProperties: false,
      required: ['summary', 'suggestions', 'questions'],
      properties: {
        summary: { type: 'string' }, questions: { type: 'array', items: { type: 'string' } },
        suggestions: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['title', 'advice', 'replacement', 'elementId'], properties: { title: { type: 'string' }, advice: { type: 'string' }, replacement: { type: 'string' }, elementId: { type: 'string' } } } },
      },
    },
  },
};

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', chunk => { body += chunk; if (body.length > 300_000) request.destroy(); });
    request.on('end', () => { try { resolve(JSON.parse(body || '{}')); } catch { reject(new Error('Invalid JSON request.')); } });
    request.on('error', reject);
  });
}

const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.ASSISTANT_ALLOWED_ORIGIN || 'http://localhost:5173',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
function json(response, status, body) {
  response.writeHead(status, { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(body));
}
function parseAssistantJson(text) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i)?.[1] ?? text;
  const start = fenced.indexOf('{'); const end = fenced.lastIndexOf('}');
  const fallback = { summary: 'Resume feedback', suggestions: [{ title: 'Assistant feedback', advice: text, replacement: '', elementId: '' }], questions: [] };
  if (start === -1 || end === -1) return fallback;
  try { return JSON.parse(fenced.slice(start, end + 1)); } catch { return fallback; }
}

createServer(async (request, response) => {
  if (request.url !== '/api/assistant') return json(response, 404, { error: 'Not found.' });
  // Independent server flag prevents direct callers from bypassing the unavailable UI.
  if (process.env.AI_ENABLED !== 'true') return json(response, 503, { error: 'AI features are unavailable right now.' });
  if (request.method === 'OPTIONS') { response.writeHead(204, corsHeaders); return response.end(); }
  if (request.method !== 'POST') return json(response, 405, { error: 'Method not allowed.' });
  if (!process.env.GROQ_API_KEY) return json(response, 503, { error: 'The assistant is not configured.' });
  try {
    const { mode, prompt, selectedId, resume } = await readBody(request);
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(30_000),
      body: JSON.stringify({ model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b', temperature: 0.35, max_completion_tokens: 1100, response_format: responseFormat, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: JSON.stringify({ task: mode, userRequest: prompt || '', selectedElementId: selectedId || null, resume }) }] }),
    });
    const payload = await groqResponse.json();
    if (!groqResponse.ok) return json(response, groqResponse.status, { error: payload.error?.message || 'Groq could not complete that request.' });
    return json(response, 200, parseAssistantJson(payload.choices?.[0]?.message?.content || ''));
  } catch (error) {
    return json(response, 500, { error: error instanceof Error ? error.message : 'Assistant request failed.' });
  }
}).listen(Number(process.env.PORT || 8787), process.env.HOST || '127.0.0.1', () => console.log('Resume assistant API started'));
