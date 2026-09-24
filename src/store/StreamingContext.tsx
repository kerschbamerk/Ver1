import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

interface StreamingContextValue {
  isStreaming: (conversationId: string) => boolean
  start: (conversationId: string) => AbortController
  stop: (conversationId: string) => void
  finish: (conversationId: string) => void
}

const StreamingContext = createContext<StreamingContextValue | null>(null)

export function StreamingProvider({ children }: { children: ReactNode }) {
  const controllers = useRef(new Map<string, AbortController>())
  const [, forceRender] = useState(0)

  const start = useCallback((conversationId: string) => {
    const controller = new AbortController()
    controllers.current.set(conversationId, controller)
    forceRender((n) => n + 1)
    return controller
  }, [])

  const finish = useCallback((conversationId: string) => {
    controllers.current.delete(conversationId)
    forceRender((n) => n + 1)
  }, [])

  const stop = useCallback((conversationId: string) => {
    controllers.current.get(conversationId)?.abort()
  }, [])

  const isStreaming = useCallback(
    (conversationId: string) => controllers.current.has(conversationId),
    [],
  )

  const value: StreamingContextValue = { isStreaming, start, stop, finish }

  return <StreamingContext.Provider value={value}>{children}</StreamingContext.Provider>
}

export function useStreaming() {
  const ctx = useContext(StreamingContext)
  if (!ctx) throw new Error('useStreaming must be used inside StreamingProvider')
  return ctx
}
