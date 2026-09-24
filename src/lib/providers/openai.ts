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
  const chatMessages = [
    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ]

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    signal,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      stream: true,
      messages: chatMessages,
    }),
  })

  if (!response.ok) {
    const bodyText = await response.text()
    if (response.status === 429) throw new ProviderLimitError(bodyText || 'Nutzungslimit erreicht.')
    throw new Error(`OpenAI-Fehler (${response.status}): ${bodyText || response.statusText}`)
  }

  for await (const payload of readSSE(response)) {
    if (payload === '[DONE]') break
    let event: any
    try {
      event = JSON.parse(payload)
    } catch {
      continue
    }
    const delta = event.choices?.[0]?.delta?.content
    if (delta) onDelta(delta)
  }
}

export const openaiAdapter: ProviderAdapter = {
  id: 'openai',
  label: 'OpenAI (ChatGPT)',
  helpUrl: 'https://platform.openai.com/api-keys',
  defaultModel: 'gpt-4o',
  modelSuggestions: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'o3-mini'],
  streamChat,
}
