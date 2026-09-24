import { useEffect, useRef } from 'react'
import { firstAvailableProvider, useApp } from '../store/AppContext'
import { useChatActions } from '../hooks/useChatActions'
import { providers } from '../lib/providers'
import Composer from './Composer'
import MessageBubble from './MessageBubble'
import ProviderSwitcher from './ProviderSwitcher'
import type { ProviderId } from '../types'

export default function ChatView() {
  const { state, dispatch } = useApp()
  const { sendMessage, retryLastWithProvider, stopStreaming, isStreaming } = useChatActions()
  const bottomRef = useRef<HTMLDivElement>(null)

  const conversation = state.conversations.find((c) => c.id === state.activeConversationId)
  const messageCount = conversation?.messages.length ?? 0
  const lastMessageContent = conversation?.messages.at(-1)?.content ?? ''

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messageCount, lastMessageContent])

  const hasAnyKey = Object.values(state.apiKeys).some(Boolean)

  if (!conversation) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
          Womit kann ich helfen?
        </h1>
        <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          {hasAnyKey
            ? 'Starte links einen neuen Chat.'
            : 'Hinterlege zuerst mindestens einen API-Key in den Einstellungen (Zahnrad oben links).'}
        </p>
        <button
          onClick={() => {
            const provider = firstAvailableProvider(state.apiKeys)
            dispatch({ type: 'NEW_CONVERSATION', projectId: null, provider, model: providers[provider].defaultModel })
          }}
          className="mt-4 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
        >
          Neuen Chat starten
        </button>
      </div>
    )
  }

  const streaming = isStreaming(conversation.id)

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5 dark:border-slate-800">
        <input
          value={conversation.title}
          onChange={(e) =>
            dispatch({ type: 'RENAME_CONVERSATION', id: conversation.id, title: e.target.value })
          }
          className="w-full max-w-sm truncate bg-transparent text-sm font-medium text-slate-700 outline-none focus:text-slate-900 dark:text-slate-200 dark:focus:text-slate-100"
        />
        <ProviderSwitcher conversation={conversation} />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
          {conversation.messages.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-400">
              Schreib deine erste Nachricht an {providers[conversation.provider].label}.
            </p>
          )}
          {conversation.messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              conversation={conversation}
              onRetryWithProvider={(providerId: ProviderId) =>
                retryLastWithProvider(conversation, providerId)
              }
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <Composer
        disabled={streaming}
        isStreaming={streaming}
        onSend={(text) => sendMessage(conversation, text)}
        onStop={() => stopStreaming(conversation.id)}
      />
    </div>
  )
}
