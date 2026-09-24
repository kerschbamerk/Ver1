import { providerList } from './providers'
import type { AppState, ProviderBaseUrls, ProviderKeys } from '../types'

const STORAGE_KEY = 'ai-hub:state:v1'

function emptyProviderRecord(): Record<string, string> {
  return Object.fromEntries(providerList.map((p) => [p.id, '']))
}

export const emptyState: AppState = {
  apiKeys: emptyProviderRecord() as ProviderKeys,
  baseUrls: emptyProviderRecord() as ProviderBaseUrls,
  projects: [],
  conversations: [],
  activeConversationId: null,
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState
    const parsed = JSON.parse(raw)
    return {
      ...emptyState,
      ...parsed,
      apiKeys: { ...emptyState.apiKeys, ...parsed.apiKeys },
      baseUrls: { ...emptyState.baseUrls, ...parsed.baseUrls },
    }
  } catch {
    return emptyState
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // storage full or unavailable — silently ignore, nothing we can do client-side
  }
}
