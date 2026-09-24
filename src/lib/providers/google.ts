import { readSSE } from '../sse'
import { ProviderLimitError, type ProviderAdapter, type StreamChatParams } from './types'

async function streamChat({
  apiKey,
  model,
  systemPrompt,
  messages,
  signal,
  onDelta,
}: StreamChatParams): Promise<void> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model,
  )}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`

  const response = await fetch(url, {
    method: 'POST',
    signal,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
      contents: messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    }),
  })

  if (!response.ok) {
    const bodyText = await response.text()
    if (response.status === 429) throw new ProviderLimitError(bodyText || 'Nutzungslimit erreicht.')
    throw new Error(`Google-Fehler (${response.status}): ${bodyText || response.statusText}`)
  }

  for await (const payload of readSSE(response)) {
    let event: any
    try {
      event = JSON.parse(payload)
    } catch {
      continue
    }
    const parts = event.candidates?.[0]?.content?.parts
    if (Array.isArray(parts)) {
      for (const part of parts) {
        if (typeof part.text === 'string') onDelta(part.text)
      }
    }
    const blockReason = event.promptFeedback?.blockReason
    if (blockReason) throw new Error(`Von Google blockiert: ${blockReason}`)
  }
}

export const googleAdapter: ProviderAdapter = {
  id: 'google',
  label: 'Google (Gemini)',
  helpUrl: 'https://aistudio.google.com/apikey',
  defaultModel: 'gemini-2.5-pro',
  modelSuggestions: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash'],
  streamChat,
}
