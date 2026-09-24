import type { AppState } from '../types'

const STORAGE_KEY = 'ai-hub:state:v1'

export const emptyState: AppState = {
  apiKeys: { anthropic: '', openai: '', google: '' },
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
