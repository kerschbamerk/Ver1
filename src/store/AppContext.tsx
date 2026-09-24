import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { v4 as uuid } from 'uuid'
import { loadState, saveState } from '../lib/storage'
import { providers } from '../lib/providers'
import type { AppState, ChatMessage, Conversation, Project, ProviderId } from '../types'

type Action =
  | { type: 'SET_API_KEY'; provider: ProviderId; key: string }
  | { type: 'SET_BASE_URL'; provider: ProviderId; url: string }
  | { type: 'NEW_CONVERSATION'; projectId: string | null; provider: ProviderId; model: string }
  | { type: 'DELETE_CONVERSATION'; id: string }
  | { type: 'RENAME_CONVERSATION'; id: string; title: string }
  | { type: 'SET_ACTIVE_CONVERSATION'; id: string | null }
  | { type: 'SET_CONVERSATION_PROVIDER'; id: string; provider: ProviderId; model: string }
  | { type: 'MOVE_CONVERSATION'; id: string; projectId: string | null }
  | { type: 'ADD_MESSAGE'; conversationId: string; message: ChatMessage }
  | { type: 'UPDATE_MESSAGE'; conversationId: string; messageId: string; patch: Partial<ChatMessage> }
  | { type: 'DELETE_MESSAGE'; conversationId: string; messageId: string }
  | { type: 'NEW_PROJECT'; project: Project }
  | { type: 'UPDATE_PROJECT'; id: string; patch: Partial<Project> }
  | { type: 'DELETE_PROJECT'; id: string }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_API_KEY':
      return { ...state, apiKeys: { ...state.apiKeys, [action.provider]: action.key } }

    case 'SET_BASE_URL':
      return { ...state, baseUrls: { ...state.baseUrls, [action.provider]: action.url } }

    case 'NEW_PROJECT':
      return { ...state, projects: [action.project, ...state.projects] }

    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map((p) => (p.id === action.id ? { ...p, ...action.patch } : p)),
      }

    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== action.id),
        conversations: state.conversations.map((c) =>
          c.projectId === action.id ? { ...c, projectId: null } : c,
        ),
      }

    case 'NEW_CONVERSATION': {
      const conversation: Conversation = {
        id: uuid(),
        projectId: action.projectId,
        title: 'Neuer Chat',
        provider: action.provider,
        model: action.model,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
      }
      return {
        ...state,
        conversations: [conversation, ...state.conversations],
        activeConversationId: conversation.id,
      }
    }

    case 'DELETE_CONVERSATION': {
      const conversations = state.conversations.filter((c) => c.id !== action.id)
      const activeConversationId =
        state.activeConversationId === action.id ? null : state.activeConversationId
      return { ...state, conversations, activeConversationId }
    }

    case 'RENAME_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.id ? { ...c, title: action.title } : c,
        ),
      }

    case 'SET_ACTIVE_CONVERSATION':
      return { ...state, activeConversationId: action.id }

    case 'SET_CONVERSATION_PROVIDER':
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.id ? { ...c, provider: action.provider, model: action.model } : c,
        ),
      }

    case 'MOVE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.id ? { ...c, projectId: action.projectId } : c,
        ),
      }

    case 'ADD_MESSAGE':
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId
            ? {
                ...c,
                messages: [...c.messages, action.message],
                updatedAt: Date.now(),
                title:
                  c.title === 'Neuer Chat' && action.message.role === 'user'
                    ? action.message.content.slice(0, 60)
                    : c.title,
              }
            : c,
        ),
      }

    case 'UPDATE_MESSAGE':
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === action.messageId ? { ...m, ...action.patch } : m,
                ),
              }
            : c,
        ),
      }

    case 'DELETE_MESSAGE':
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId
            ? { ...c, messages: c.messages.filter((m) => m.id !== action.messageId) }
            : c,
        ),
      }

    default:
      return state
  }
}

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<Action>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  const value = useMemo(() => ({ state, dispatch }), [state])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}

export function firstAvailableProvider(apiKeys: AppState['apiKeys']): ProviderId {
  const configured = (Object.keys(providers) as ProviderId[]).find((id) => apiKeys[id])
  return configured ?? 'anthropic'
}
