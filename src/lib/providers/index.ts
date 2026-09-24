import type { ProviderId } from '../../types'
import { anthropicAdapter } from './anthropic'
import { googleAdapter } from './google'
import { kimiAdapter } from './kimi'
import { openaiAdapter } from './openai'
import { qwenAdapter } from './qwen'
import type { ProviderAdapter } from './types'

export const providers: Record<ProviderId, ProviderAdapter> = {
  anthropic: anthropicAdapter,
  openai: openaiAdapter,
  google: googleAdapter,
  qwen: qwenAdapter,
  kimi: kimiAdapter,
}

export const providerList = Object.values(providers)

export { ProviderLimitError } from './types'
export type { ProviderAdapter, PlainMessage, StreamChatParams } from './types'
