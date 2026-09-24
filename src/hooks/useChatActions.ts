import { v4 as uuid } from 'uuid'
import { providers, ProviderLimitError } from '../lib/providers'
import { useApp } from '../store/AppContext'
import { useStreaming } from '../store/StreamingContext'
import type { ChatMessage, Conversation, ProviderId } from '../types'

export function useChatActions() {
  const { state, dispatch } = useApp()
  const streaming = useStreaming()

  async function runAssistant(
    conversation: Conversation,
    history: ChatMessage[],
    providerOverride?: ProviderId,
    modelOverride?: string,
  ) {
    const provider = providerOverride ?? conversation.provider
    const model = modelOverride ?? (providerOverride ? providers[providerOverride].defaultModel : conversation.model)

    if (providerOverride) {
      dispatch({ type: 'SET_CONVERSATION_PROVIDER', id: conversation.id, provider, model })
    }

    const adapter = providers[provider]
    const apiKey = state.apiKeys[provider]
    const assistantId = uuid()
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      provider,
      model,
      createdAt: Date.now(),
    }
    dispatch({ type: 'ADD_MESSAGE', conversationId: conversation.id, message: assistantMsg })

    if (!apiKey) {
      dispatch({
        type: 'UPDATE_MESSAGE',
        conversationId: conversation.id,
        messageId: assistantId,
        patch: { error: `Kein API-Key für ${adapter.label} hinterlegt. Öffne die Einstellungen.` },
      })
      return
    }

    const project = state.projects.find((p) => p.id === conversation.projectId)
    const controller = streaming.start(conversation.id)

    let buffer = ''
    let flushTimer: number | null = null
    const flush = () =>
      dispatch({
        type: 'UPDATE_MESSAGE',
        conversationId: conversation.id,
        messageId: assistantId,
        patch: { content: buffer },
      })
    const scheduleFlush = () => {
      if (flushTimer != null) return
      flushTimer = window.setTimeout(() => {
        flush()
        flushTimer = null
      }, 60)
    }

    try {
      await adapter.streamChat({
        apiKey,
        model,
        baseUrl: state.baseUrls[provider] || undefined,
        systemPrompt: project?.instructions,
        messages: history.map((m) => ({ role: m.role, content: m.content })),
        signal: controller.signal,
        onDelta: (delta) => {
          buffer += delta
          scheduleFlush()
        },
      })
      flush()
    } catch (err) {
      flush()
      if (err instanceof DOMException && err.name === 'AbortError') {
        // user pressed stop — keep whatever streamed in so far
      } else if (err instanceof ProviderLimitError) {
        dispatch({
          type: 'UPDATE_MESSAGE',
          conversationId: conversation.id,
          messageId: assistantId,
          patch: { error: err.message || 'Nutzungslimit erreicht.', isLimitError: true },
        })
      } else {
        dispatch({
          type: 'UPDATE_MESSAGE',
          conversationId: conversation.id,
          messageId: assistantId,
          patch: { error: err instanceof Error ? err.message : String(err) },
        })
      }
    } finally {
      streaming.finish(conversation.id)
    }
  }

  function sendMessage(conversation: Conversation, text: string) {
    const userMsg: ChatMessage = { id: uuid(), role: 'user', content: text, createdAt: Date.now() }
    dispatch({ type: 'ADD_MESSAGE', conversationId: conversation.id, message: userMsg })
    void runAssistant(conversation, [...conversation.messages, userMsg])
  }

  function retryLastWithProvider(conversation: Conversation, providerId: ProviderId) {
    const lastAssistant = [...conversation.messages].reverse().find((m) => m.role === 'assistant')
    const history = lastAssistant
      ? conversation.messages.filter((m) => m.id !== lastAssistant.id)
      : conversation.messages
    if (lastAssistant) {
      dispatch({ type: 'DELETE_MESSAGE', conversationId: conversation.id, messageId: lastAssistant.id })
    }
    void runAssistant(conversation, history, providerId)
  }

  function stopStreaming(conversationId: string) {
    streaming.stop(conversationId)
  }

  return { sendMessage, retryLastWithProvider, stopStreaming, isStreaming: streaming.isStreaming }
}
