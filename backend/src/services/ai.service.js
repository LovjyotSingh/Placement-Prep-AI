const axios = require('axios');

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1';

function isQuotaError(err) {
  const text = String(err?.message || '').toLowerCase();
  return (
    text.includes('quota') ||
    text.includes('rate limit') ||
    text.includes('resource_exhausted') ||
    text.includes('too many requests') ||
    text.includes('429')
  );
}

function getProvider() {
  return String(process.env.AI_PROVIDER || 'gemini').toLowerCase();
}

function getApiKey() {
  return process.env.AI_API_KEY || process.env.OPENROUTER_API_KEY || '';
}

function normalizeQuestionText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function dedupeQuestions(questions = [], previous = []) {
  const seen = new Set(previous.map(normalizeQuestionText));
  const unique = [];

  for (const q of questions) {
    const text = q?.question;
    if (!text) continue;
    const key = normalizeQuestionText(text);
    if (seen.has(key)) continue;
    unique.push(q);
    seen.add(key);
  }
  return unique;
}

function hashString(input) {
  const text = String(input || '');
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function selectQuestionFocus(role, difficulty, uniquenessSeed = '', previousCount = 0) {
  const themes = [
    'arrays and strings',
    'hash maps and sets',
    'stacks and queues',
    'linked lists and pointers',
    'trees and traversals',
    'graphs and BFS/DFS',
    'dynamic programming',
    'system design fundamentals',
    'database design and indexing',
    'APIs, scaling, and caching'
  ];
  const index = hashString(`${role}|${difficulty}|${uniquenessSeed}|${previousCount}`) % themes.length;
  return themes[index];
}

function clampScore(value, fallback = 60) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function normalizeEvaluation(parsed) {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('AI returned invalid evaluation JSON');
  }

  const technicalScore = clampScore(parsed.technicalScore, NaN);
  const clarityScore = clampScore(parsed.clarityScore, NaN);
  const confidenceScore = clampScore(parsed.confidenceScore, NaN);
  const hasAllScores = [technicalScore, clarityScore, confidenceScore].every(Number.isFinite);
  if (!hasAllScores) {
    throw new Error('AI evaluation missing required component scores');
  }

  // Keep overall score deterministic and consistent with weighted breakdown.
  const score = clampScore((technicalScore * 0.4) + (clarityScore * 0.3) + (confidenceScore * 0.3), 0);

  const strengths = Array.isArray(parsed.strengths) ? parsed.strengths.filter(Boolean).slice(0, 4) : [];
  const improvements = Array.isArray(parsed.improvements) ? parsed.improvements.filter(Boolean).slice(0, 4) : [];
  const feedback = typeof parsed.feedback === 'string' ? parsed.feedback.trim() : '';
  if (!strengths.length || !improvements.length || !feedback) {
    throw new Error('AI evaluation missing qualitative feedback fields');
  }

  return { score, technicalScore, clarityScore, confidenceScore, strengths, improvements, feedback };
}

async function callGemini(prompt, options = {}) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('AI_API_KEY not set in .env file');

  const model = process.env.AI_MODEL || 'gemini-2.0-flash';
  const temperature = Number.isFinite(options.temperature) ? options.temperature : 0.7;
  const maxOutputTokens = Number.isFinite(options.maxOutputTokens) ? options.maxOutputTokens : 2000;
  const url = `${GEMINI_API_BASE}/models/${model}:generateContent?key=${apiKey}`;

  try {
    const res = await axios.post(
      url,
      {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature,
          maxOutputTokens
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      }
    );

    let text = res?.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    if (!text) {
      throw new Error('Gemini returned an empty response');
    }
    return text;
  } catch (err) {
    const apiError = err?.response?.data?.error;
    const message = apiError?.message || err.message || 'Gemini request failed';
    throw new Error(`Gemini API error (${model}): ${message}`);
  }
}

async function callOpenRouter(prompt, options = {}) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('AI_API_KEY not set in .env file');

  const model = process.env.AI_MODEL || 'openai/gpt-4o-mini';
  const temperature = Number.isFinite(options.temperature) ? options.temperature : 0.7;
  const maxTokens = Number.isFinite(options.maxTokens) ? options.maxTokens : 2000;
  const url = `${OPENROUTER_API_BASE}/chat/completions`;

  try {
    const res = await axios.post(
      url,
      {
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens: maxTokens
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
          'X-Title': 'placement-prep-platform'
        },
        timeout: 30000
      }
    );

    let text = res?.data?.choices?.[0]?.message?.content || '';
    if (Array.isArray(text)) {
      text = text.map(p => (typeof p === 'string' ? p : p?.text || '')).join('\n');
    }
    text = String(text).replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    if (!text) {
      throw new Error('OpenRouter returned an empty response');
    }
    return text;
  } catch (err) {
    const apiError = err?.response?.data?.error;
    const message = apiError?.message || err.message || 'OpenRouter request failed';
    throw new Error(`OpenRouter API error (${model}): ${message}`);
  }
}

async function callAI(prompt, options = {}) {
  const provider = getProvider();
  if (provider === 'openrouter') return callOpenRouter(prompt, options);
  if (provider === 'gemini') return callGemini(prompt, options);
  throw new Error(`Unsupported AI_PROVIDER: ${provider}`);
}

function safeParseJSON(text, fallback) {
  try { return JSON.parse(text); }
  catch { return fallback; }
}

function withSource(questions = [], source = 'ai') {
  return questions.map(q => ({ ...q, source }));
}

async function getAIStatus() {
  const provider = getProvider();
  const model = process.env.AI_MODEL || (provider === 'openrouter' ? 'openai/gpt-4o-mini' : 'gemini-2.0-flash');
  const apiKey = getApiKey();

  if (!apiKey) {
    return {
      provider,
      model,
      configured: false,
      working: false,
      reason: 'AI_API_KEY not set in .env'
    };
  }

  try {
    await callAI('Reply with exactly: OK');
    return {
      provider,
      model,
      configured: true,
      working: true,
      reason: `${provider} API reachable`
    };
  } catch (err) {
    return {
      provider,
      model,
      configured: true,
      working: false,
      reason: err.message
    };
  }
}

// Generate interview questions
async function generateQuestions(role, difficulty = 'medium', count = 1, previous = [], options = {}) {
  const uniquenessSeed = options?.uniquenessSeed || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const focusArea = selectQuestionFocus(role, difficulty, uniquenessSeed, previous.length);
  const avoid = previous.length > 0
    ? `\nDo NOT repeat these questions:\n${previous.map(q => `- ${q}`).join('\n')}`
    : '';

  const prompt = `You are an expert technical interviewer. Generate ${count} unique interview question(s) for a ${role} role at ${difficulty} difficulty.
For this specific request, focus on: ${focusArea}.
Use this uniqueness token internally to diversify outputs: ${uniquenessSeed}-${previous.length}.
${avoid}

Return ONLY valid JSON (no markdown, no extra text):
{
  "questions": [
    {
      "question": "the full question text",
      "category": "technical",
      "context": "brief context or tip",
      "expectedKeywords": ["keyword1", "keyword2"]
    }
  ]
}`;

  try {
    const raw = await callAI(prompt);
    const parsed = safeParseJSON(raw, { questions: [] });
    const unique = dedupeQuestions(parsed.questions || [], previous);
    if (unique.length >= count) return withSource(unique.slice(0, count), getProvider());
    throw new Error('AI returned insufficient unique questions');
  } catch (err) {
    if (isQuotaError(err)) {
      throw new Error('AI quota exceeded and offline question fallback is disabled');
    }
    throw err;
  }
}

// Evaluate a response
async function evaluateResponse(question, answer, role) {
  const prompt = `You are evaluating a ${role} interview answer. Be fair and constructive.

Question: ${question}
Candidate's Answer: ${answer}

Score on these criteria (0-100 each):
- Technical correctness (40% weight)
- Communication clarity (30% weight)  
- Confidence and depth (30% weight)

Scoring calibration (important):
- 90-100: Exceptional, complete, and well-justified.
- 75-89: Technically correct with minor gaps.
- 60-74: Mostly correct but missing key details.
- 40-59: Partially correct or unclear core reasoning.
- 0-39: Incorrect or largely irrelevant.

Rules:
- If the core solution is technically correct, technicalScore should usually be >= 70.
- Do not over-penalize brevity if the answer is clear and correct.
- Keep scores consistent with written strengths/improvements.

Return ONLY valid JSON (no markdown):
{
  "score": <number 0-100, weighted by the criteria above>,
  "technicalScore": <number 0-100>,
  "clarityScore": <number 0-100>,
  "confidenceScore": <number 0-100>,
  "strengths": ["specific strength 1", "specific strength 2"],
  "improvements": ["specific improvement 1", "specific improvement 2"],
  "feedback": "2-3 sentences of constructive feedback"
}`;

  const raw = await callAI(prompt, { temperature: 0.2, maxTokens: 1200, maxOutputTokens: 1200 });
  const parsed = safeParseJSON(raw, null);
  return normalizeEvaluation(parsed);
}

// Generate overall feedback
async function generateOverallFeedback(role, overallScore, scores) {
  const prompt = `Generate encouraging interview feedback for a ${role} candidate.

Overall Score: ${overallScore}/100
Technical: ${scores.technical}/100
Communication: ${scores.communication}/100
Confidence: ${scores.confidence}/100

Return ONLY valid JSON:
{
  "summary": "2-3 sentence summary",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvementAreas": ["area 1", "area 2", "area 3"],
  "recommendations": ["rec 1", "rec 2", "rec 3"],
  "motivation": "1 encouraging sentence"
}`;

  const raw = await callAI(prompt);
  const parsed = safeParseJSON(raw, null);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('AI returned invalid overall feedback JSON');
  }
  return parsed;
}

// Analyze resume
async function analyzeResume(resumeText, role) {
  const prompt = `Analyze this resume for a ${role} position. Be helpful.

Resume:
${resumeText.slice(0, 2500)}

Return ONLY valid JSON:
{
  "atsScore": 75,
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "missingKeywords": ["keyword1", "keyword2"],
  "recommendations": ["rec 1", "rec 2"],
  "sectionFeedback": {
    "education": "feedback",
    "experience": "feedback",
    "skills": "feedback",
    "projects": "feedback"
  }
}`;

  const raw = await callAI(prompt);
  const parsed = safeParseJSON(raw, null);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('AI returned invalid resume analysis JSON');
  }
  return parsed;
}

module.exports = { generateQuestions, evaluateResponse, generateOverallFeedback, analyzeResume, getAIStatus };
