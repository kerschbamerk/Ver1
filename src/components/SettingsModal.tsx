import { ExternalLink, Eye, EyeOff, X } from 'lucide-react'
import { useState } from 'react'
import { providerList } from '../lib/providers'
import { useApp } from '../store/AppContext'
import type { ProviderId } from '../types'

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useApp()
  const [visible, setVisible] = useState<Record<string, boolean>>({})

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">API-Keys</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={16} />
          </button>
        </div>
        <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
          Die Keys werden ausschließlich lokal in deinem Browser gespeichert (localStorage) und
          direkt von hier aus an den jeweiligen Anbieter gesendet. Es gibt keinen eigenen Server.
        </p>

        <div className="flex flex-col gap-4">
          {providerList.map((adapter) => {
            const id = adapter.id as ProviderId
            const show = visible[id] ?? false
            return (
              <div key={id}>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {adapter.label}
                  </label>
                  <a
                    href={adapter.helpUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-purple-600 hover:underline dark:text-purple-400"
                  >
                    Key erstellen <ExternalLink size={11} />
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type={show ? 'text' : 'password'}
                    value={state.apiKeys[id]}
                    onChange={(e) =>
                      dispatch({ type: 'SET_API_KEY', provider: id, key: e.target.value })
                    }
                    placeholder={`${adapter.label} API-Key`}
                    autoComplete="off"
                    spellCheck={false}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <button
                    onClick={() => setVisible((v) => ({ ...v, [id]: !v[id] }))}
                    className="shrink-0 rounded-lg border border-slate-300 p-2 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <input
                  value={state.baseUrls[id]}
                  onChange={(e) => dispatch({ type: 'SET_BASE_URL', provider: id, url: e.target.value })}
                  placeholder={`Basis-URL (Standard: ${adapter.defaultBaseUrl})`}
                  autoComplete="off"
                  spellCheck={false}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 outline-none focus:border-purple-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                />
              </div>
            )
          })}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-purple-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-purple-700"
          >
            Fertig
          </button>
        </div>
      </div>
    </div>
  )
}
