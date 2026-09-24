import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import { X } from 'lucide-react'
import { useApp } from '../store/AppContext'
import type { Project } from '../types'

export default function ProjectModal({
  project,
  onClose,
}: {
  project: Project | null
  onClose: () => void
}) {
  const { dispatch } = useApp()
  const [name, setName] = useState(project?.name ?? '')
  const [instructions, setInstructions] = useState(project?.instructions ?? '')

  function save() {
    if (!name.trim()) return
    if (project) {
      dispatch({ type: 'UPDATE_PROJECT', id: project.id, patch: { name: name.trim(), instructions } })
    } else {
      dispatch({
        type: 'NEW_PROJECT',
        project: { id: uuid(), name: name.trim(), instructions, createdAt: Date.now() },
      })
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {project ? 'Projekt bearbeiten' : 'Neues Projekt'}
          </h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={16} />
          </button>
        </div>

        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Name</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="z.B. Website-Relaunch"
          className="mb-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />

        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
          Anweisungen (System-Prompt, für alle Anbieter gleich)
        </label>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={5}
          placeholder="Kontext, Ton, Regeln – wird bei jeder Nachricht mitgeschickt, egal welcher Anbieter gerade aktiv ist."
          className="mb-4 w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Abbrechen
          </button>
          <button
            onClick={save}
            disabled={!name.trim()}
            className="rounded-lg bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-40"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  )
}
