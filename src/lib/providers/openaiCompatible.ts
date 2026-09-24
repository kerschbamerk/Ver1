import { readSSE } from '../sse'
import { ProviderLimitError, type ProviderAdapter, type StreamChatParams } from './types'
import type { ProviderId } from '../../types'

/**
 * Many providers (OpenAI, Moonshot/Kimi, Alibaba/Qwen, ...) expose the same
 * `/chat/completions` request/response shape. This builds one adapter per
 * provider from just its endpoint and model defaults.
 */
export function createOpenAICompatibleAdapter(config: {
  id: ProviderId
  label: string
  helpUrl: string
  defaultBaseUrl: string
  defaultModel: string
  modelSuggestions: string[]
}): ProviderAdapter {
  async function streamChat({
    apiKey,
    model,
    baseUrl,
    systemPrompt,
    messages,
    signal,
    onDelta,
  }: StreamChatParams): Promise<void> {
    const chatMessages = [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ]

    const base = (baseUrl || config.defaultBaseUrl).replace(/\/+$/, '')
    const response = await fetch(`${base}/chat/completions`, {
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
      throw new Error(`${config.label}-Fehler (${response.status}): ${bodyText || response.statusText}`)
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

  return {
    id: config.id,
    label: config.label,
    helpUrl: config.helpUrl,
    defaultModel: config.defaultModel,
    modelSuggestions: config.modelSuggestions,
    defaultBaseUrl: config.defaultBaseUrl,
    streamChat,
  }
}
