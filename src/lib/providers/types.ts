import type { ProviderId } from '../../types'

export interface PlainMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface StreamChatParams {
  apiKey: string
  model: string
  /** overrides the adapter's default API base URL, e.g. a region endpoint or proxy */
  baseUrl?: string
  systemPrompt?: string
  messages: PlainMessage[]
  signal: AbortSignal
  onDelta: (text: string) => void
}

/** Thrown by adapters so the UI can recognize "you hit your usage limit". */
export class ProviderLimitError extends Error {}

export interface ProviderAdapter {
  id: ProviderId
  label: string
  helpUrl: string
  defaultModel: string
  modelSuggestions: string[]
  /** shown as the placeholder for the optional base-URL override in Settings */
  defaultBaseUrl: string
  streamChat(params: StreamChatParams): Promise<void>
}
