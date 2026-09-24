import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { providerList, providers } from '../lib/providers'
import { useApp } from '../store/AppContext'
import type { Conversation, ProviderId } from '../types'

const providerDotColor: Record<ProviderId, string> = {
  anthropic: 'bg-orange-500',
  openai: 'bg-emerald-500',
  google: 'bg-blue-500',
}

export default function ProviderSwitcher({ conversation }: { conversation: Conversation }) {
  const { state, dispatch } = useApp()
  const [open, setOpen] = useState(false)
  const adapter = providers[conversation.provider]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <span className={`h-2 w-2 rounded-full ${providerDotColor[conversation.provider]}`} />
        <span className="font-medium">{adapter.label}</span>
        <span className="text-slate-400">·</span>
        <span className="text-slate-500 dark:text-slate-400">{conversation.model}</span>
        <ChevronDown size={14} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <p className="px-2 pt-1 pb-2 text-xs text-slate-400">
              Anbieter wechseln – nützlich, wenn du ein Nutzungslimit erreichst. Der bisherige
              Chatverlauf wird als Kontext an den neuen Anbieter mitgegeben.
            </p>
            {providerList.map((p) => {
              const hasKey = Boolean(state.apiKeys[p.id])
              const active = p.id === conversation.provider
              return (
                <button
                  key={p.id}
                  disabled={!hasKey}
                  onClick={() => {
                    dispatch({
                      type: 'SET_CONVERSATION_PROVIDER',
                      id: conversation.id,
                      provider: p.id,
                      model: p.defaultModel,
                    })
                    setOpen(false)
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm ${
                    active
                      ? 'bg-purple-100 text-purple-900 dark:bg-purple-900/40 dark:text-purple-100'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                  } disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  <span className={`h-2 w-2 rounded-full ${providerDotColor[p.id]}`} />
                  <span className="flex-1">{p.label}</span>
                  {!hasKey && <span className="text-xs text-slate-400">kein Key</span>}
                </button>
              )
            })}

            <div className="mt-2 border-t border-slate-200 px-2 pt-2 dark:border-slate-800">
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                Modell für {adapter.label}
              </label>
              <input
                list="model-suggestions"
                value={conversation.model}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_CONVERSATION_PROVIDER',
                    id: conversation.id,
                    provider: conversation.provider,
                    model: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <datalist id="model-suggestions">
                {adapter.modelSuggestions.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
