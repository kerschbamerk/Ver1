import type { ProviderId } from '../../types'
import { anthropicAdapter } from './anthropic'
import { googleAdapter } from './google'
import { openaiAdapter } from './openai'
import type { ProviderAdapter } from './types'

export const providers: Record<ProviderId, ProviderAdapter> = {
  anthropic: anthropicAdapter,
  openai: openaiAdapter,
  google: googleAdapter,
}

export const providerList = Object.values(providers)

export { ProviderLimitError } from './types'
export type { ProviderAdapter, PlainMessage, StreamChatParams } from './types'
