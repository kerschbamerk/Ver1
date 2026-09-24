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
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    signal,
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: systemPrompt || undefined,
      stream: true,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  })

  if (!response.ok) {
    const bodyText = await response.text()
    if (response.status === 429) throw new ProviderLimitError(bodyText || 'Nutzungslimit erreicht.')
    throw new Error(`Anthropic-Fehler (${response.status}): ${bodyText || response.statusText}`)
  }

  for await (const payload of readSSE(response)) {
    let event: any
    try {
      event = JSON.parse(payload)
    } catch {
      continue
    }
    if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
      onDelta(event.delta.text)
    } else if (event.type === 'error') {
      const msg = event.error?.message || 'Unbekannter Fehler'
      if (event.error?.type === 'rate_limit_error' || event.error?.type === 'overloaded_error') {
        throw new ProviderLimitError(msg)
      }
      throw new Error(msg)
    }
  }
}

export const anthropicAdapter: ProviderAdapter = {
  id: 'anthropic',
  label: 'Anthropic (Claude)',
  helpUrl: 'https://console.anthropic.com/settings/keys',
  defaultModel: 'claude-sonnet-5',
  modelSuggestions: ['claude-opus-5-5', 'claude-sonnet-5', 'claude-fable-5-1', 'claude-haiku-4-5-20251001'],
  streamChat,
}
