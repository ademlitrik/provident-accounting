import { useState, useRef, useEffect } from 'react'
import {
  Bot, Send, Sparkles, TrendingUp, AlertTriangle, FileText,
  Zap, Key, RotateCcw, Copy, Check, Info, ShieldCheck
} from 'lucide-react'
import { askGemini, getGeminiKey } from '@/ai/gemini'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useAccountingStore, formatCurrency } from '@/store/accountingStore'

const QUICK_PROMPTS = [
  { icon: TrendingUp, text: 'Summarize revenue trends for Q3 2024' },
  { icon: AlertTriangle, text: 'Check for expense anomalies in October' },
  { icon: FileText, text: 'Draft management commentary for financial statements' },
  { icon: Zap, text: 'Forecast next quarter operating cash flows' },
]

const INIT_MESSAGES = [
  {
    role: 'assistant',
    content: `👋 Hello! I am **Provident AI**, your specialized accounting intelligence engine.\n\nI can analyze your **General Ledger**, verify **Working Papers**, audit **Tax Computations**, and draft **IFRS Statement commentary**.\n\nHow can I assist your practice today?`,
  }
]

function parseInlineFormatting(text) {
  if (!text) return ''
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g
  const tokens = text.split(regex)

  return tokens.map((token, i) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-slate-900">
          {token.slice(2, -2)}
        </strong>
      )
    }
    if (token.startsWith('*') && token.endsWith('*')) {
      return (
        <em key={i} className="italic text-slate-600">
          {token.slice(1, -1)}
        </em>
      )
    }
    if (token.startsWith('`') && token.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-slate-200 text-indigo-700 font-mono text-[11px]">
          {token.slice(1, -1)}
        </code>
      )
    }
    return token
  })
}

function FormattedContent({ content, isUser }) {
  if (isUser) {
    return <div className="whitespace-pre-wrap">{content}</div>
  }

  const paragraphs = content.split(/\n\n+/)

  return (
    <div className="space-y-2 text-xs leading-relaxed text-slate-800">
      {paragraphs.map((para, pIdx) => {
        const lines = para.split('\n')
        const isBulletList = lines.some(l => l.trim().startsWith('•') || l.trim().startsWith('-') || l.trim().startsWith('* '))

        if (isBulletList) {
          return (
            <ul key={pIdx} className="space-y-1.5 my-1 pl-1">
              {lines.map((line, lIdx) => {
                const clean = line.replace(/^[•\-\*]\s*/, '').trim()
                return (
                  <li key={lIdx} className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold shrink-0 mt-0.5 leading-none">•</span>
                    <span className="flex-1">{parseInlineFormatting(clean)}</span>
                  </li>
                )
              })}
            </ul>
          )
        }

        return <p key={pIdx}>{parseInlineFormatting(para)}</p>
      })}
    </div>
  )
}

export default function AIAssistant() {
  const [messages, setMessages] = useState(INIT_MESSAGES)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasApiKey, setHasApiKey] = useState(false)
  const [copiedIdx, setCopiedIdx] = useState(null)
  const bottomRef = useRef(null)

  const firm = useAuthStore(s => s.firm)
  const activeClientId = useAccountingStore(s => s.activeClientId)
  const clients = useAccountingStore(s => s.clients)
  const activeClient = clients.find(c => c.id === activeClientId) || clients[0]

  useEffect(() => {
    setHasApiKey(!!getGeminiKey())
  }, [])

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    const newMessages = [...messages, { role: 'user', content: msg }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const apiKey = getGeminiKey()
      let aiReply
      if (apiKey) {
        aiReply = await askGemini(msg, messages)
      } else {
        await new Promise(r => setTimeout(r, 600))
        const rev = formatCurrency(741500, firm?.currency)
        const exp = formatCurrency(12400, firm?.currency)
        aiReply = `📊 **Audit Intelligence Brief: ${activeClient?.name}**\n\nQuery: *"${msg}"*\n\n• **Financial Status:** Current YTD Revenue is **${rev}** (+12.5% vs prior comparative).\n• **Operating Margin:** 31.0% with strong gross margin parity.\n• **Internal Control Assessment:** General Ledger balances conform to ISA 315 trial balance variance thresholds.\n• **Audit Finding:** Marketing expenditure voucher confirm flagged for **${exp}** cut-off verification.\n\n💡 *Note: To run unbounded queries directly with Google Gemini, connect your API key in Settings.*`
      }
      setMessages(m => [...m, { role: 'assistant', content: aiReply }])
    } catch (err) {
      setMessages(m => [...m, { role: 'assistant', content: `❌ Note: ${err.message}` }])
    }

    setLoading(false)
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  const handleReset = () => {
    setMessages(INIT_MESSAGES)
  }

  return (
    <div className="max-w-5xl mx-auto w-full h-full flex flex-col min-h-0 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Bot size={18} />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Provident Accounting AI Copilot
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                hasApiKey ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {hasApiKey ? 'GEMINI LIVE' : 'DEMO MODE'}
              </span>
            </h1>
            <p className="text-[11px] text-slate-500">
              Active Client: <strong className="text-slate-800">{activeClient?.name}</strong> · Financial Statement Review & Variance Auditing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-xs px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-100 transition-colors"
            title="Reset Conversation"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>

          {!hasApiKey && (
            <Link
              to="/settings"
              className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1 rounded text-xs font-semibold transition-colors"
            >
              <Key size={13} />
              <span>Connect Gemini Key</span>
            </Link>
          )}
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
        {QUICK_PROMPTS.map(({ icon: Icon, text }) => (
          <button
            key={text}
            onClick={() => sendMessage(text)}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-300 text-slate-700 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shadow-xs cursor-pointer"
          >
            <Icon size={12} className="text-indigo-600 shrink-0" />
            <span>{text}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages List (Flex-1 Min-H-0 to Scroll Smoothly) */}
      <div className="flex-1 bg-white border border-slate-200 rounded-lg p-4 overflow-y-auto min-h-0 space-y-4 shadow-xs">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                <Sparkles size={14} />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 text-xs leading-relaxed relative group ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-800'
              }`}
            >
              <FormattedContent content={msg.content} isUser={msg.role === 'user'} />

              {/* Copy button */}
              {msg.role === 'assistant' && (
                <button
                  onClick={() => handleCopy(msg.content, idx)}
                  className="absolute top-2 right-2 p-1 rounded hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copy to Clipboard"
                >
                  {copiedIdx === idx ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 animate-pulse">
              <Sparkles size={14} />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-xs text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              <span>Provident AI is analyzing active ledger and working papers...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Box - Permanently Pinned at Bottom */}
      <div className="flex gap-2 shrink-0 pt-1">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask Provident AI about trial balance variances, audit procedures, or account balances..."
          className="flex-1 bg-white border border-slate-300 rounded-md px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-xs"
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Send size={14} />
          <span>Send</span>
        </button>
      </div>
    </div>
  )
}
