import { AlertTriangle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { providerList, providers } from '../lib/providers'
import { useApp } from '../store/AppContext'
import type { ChatMessage, Conversation, ProviderId } from '../types'

export default function MessageBubble({
  message,
  conversation,
  onRetryWithProvider,
}: {
  message: ChatMessage
  conversation: Conversation
  onRetryWithProvider: (provider: ProviderId) => void
}) {
  const { state } = useApp()
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`}>
        {!isUser && message.provider && (
          <div className="mb-1 px-1 text-xs text-slate-400">
            {providers[message.provider].label} · {message.model}
          </div>
        )}

        {message.content && (
          <div
            className={`rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${
              isUser
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
            }`}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div className="markdown">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {message.error && (
          <div className="mt-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">
                  {message.isLimitError ? 'Nutzungslimit erreicht' : 'Fehler bei der Anfrage'}
                </p>
                <p className="mt-0.5 text-xs opacity-90">{message.error}</p>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {providerList
                .filter((p) => p.id !== conversation.provider && state.apiKeys[p.id])
                .map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onRetryWithProvider(p.id)}
                    className="rounded-full border border-amber-400 bg-white px-2.5 py-1 text-xs font-medium text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:bg-transparent dark:text-amber-200 dark:hover:bg-amber-900/40"
                  >
                    Mit {p.label} fortsetzen
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
