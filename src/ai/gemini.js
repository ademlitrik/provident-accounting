/**
 * Provident AI — Gemini integration layer
 * Uses @google/generative-ai SDK.
 * API key is stored in localStorage (set via Settings → API & AI).
 */

const SYSTEM_PROMPT = `You are Provident AI, an expert accounting assistant built into 
Provident Accounting Software. You help accountants and finance teams with:
- Analyzing financial data, journal entries, trial balances, and financial statements
- Detecting anomalies or unusual patterns in transactions
- Generating professional financial narratives and management commentary
- Forecasting financial performance based on historical trends
- Explaining accounting standards (IFRS, GAAP) and tax concepts
- Answering questions about audit working papers and procedures

Always be precise, professional, and structured in your responses.
Format financial numbers clearly. Use tables where helpful.
If asked about specific company data, work with the sample data provided.
`

export function getGeminiKey() {
  return localStorage.getItem('provident_gemini_key') || ''
}

export function setGeminiKey(key) {
  localStorage.setItem('provident_gemini_key', key)
}

export async function askGemini(userMessage, conversationHistory = []) {
  const apiKey = getGeminiKey()
  if (!apiKey) {
    throw new Error('NO_API_KEY')
  }

  // Build request payload for Gemini API (REST — works in browser)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`

  // Build contents array with system prompt + history + new message
  const contents = [
    // Inject system context as first user turn
    {
      role: 'user',
      parts: [{ text: SYSTEM_PROMPT + '\n\nNow the user will ask their accounting questions.' }]
    },
    {
      role: 'model',
      parts: [{ text: 'Understood. I am Provident AI, ready to assist with accounting, financial analysis, audit support, and more. How can I help you today?' }]
    },
    // Prior conversation
    ...conversationHistory
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      })),
    // New message
    {
      role: 'user',
      parts: [{ text: userMessage }]
    }
  ]

  const body = {
    contents,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
    ]
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err?.error?.message || 'Gemini API error')
  }

  const data = await response.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Empty response from Gemini')
  return text
}
