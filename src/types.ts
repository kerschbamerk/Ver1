export type ProviderId = 'anthropic' | 'openai' | 'google' | 'qwen' | 'kimi'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  /** provider/model that produced this message (assistant only) */
  provider?: ProviderId
  model?: string
  createdAt: number
  /** set when the message failed to complete (e.g. rate limit) */
  error?: string
  /** true when `error` was caused by hitting a usage/rate limit */
  isLimitError?: boolean
}

export interface Conversation {
  id: string
  projectId: string | null
  title: string
  provider: ProviderId
  model: string
  createdAt: number
  updatedAt: number
  messages: ChatMessage[]
}

export interface Project {
  id: string
  name: string
  instructions: string
  createdAt: number
}

export type ProviderKeys = Record<ProviderId, string>

/** Per-provider API base URL override, e.g. a region-specific endpoint or a proxy. Empty string means "use the adapter's default". */
export type ProviderBaseUrls = Record<ProviderId, string>

export interface AppState {
  apiKeys: ProviderKeys
  baseUrls: ProviderBaseUrls
  projects: Project[]
  conversations: Conversation[]
  activeConversationId: string | null
}
