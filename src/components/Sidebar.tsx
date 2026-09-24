import { FolderPlus, MessageSquarePlus, Settings, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useApp, firstAvailableProvider } from '../store/AppContext'
import { providers } from '../lib/providers'
import type { Project } from '../types'
import ProjectModal from './ProjectModal'

interface SidebarProps {
  onOpenSettings: () => void
}

export default function Sidebar({ onOpenSettings }: SidebarProps) {
  const { state, dispatch } = useApp()
  const [editingProject, setEditingProject] = useState<Project | null | 'new'>(null)

  function createConversation(projectId: string | null) {
    const provider = firstAvailableProvider(state.apiKeys)
    dispatch({
      type: 'NEW_CONVERSATION',
      projectId,
      provider,
      model: providers[provider].defaultModel,
    })
  }

  const unfiled = state.conversations.filter((c) => !c.projectId)

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <span className="px-1 text-sm font-semibold text-slate-900 dark:text-slate-100">AI Hub</span>
        <button
          onClick={onOpenSettings}
          title="Einstellungen"
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <Settings size={17} />
        </button>
      </div>

      <div className="flex flex-col gap-1.5 px-2">
        <button
          onClick={() => createConversation(null)}
          className="flex items-center gap-2 rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium text-white hover:bg-purple-700"
        >
          <MessageSquarePlus size={16} /> Neuer Chat
        </button>
        <button
          onClick={() => setEditingProject('new')}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <FolderPlus size={16} /> Neues Projekt
        </button>
      </div>

      <div className="mt-3 flex-1 overflow-y-auto px-2 pb-3">
        {state.projects.map((project) => (
          <ProjectGroup
            key={project.id}
            project={project}
            onNewChat={() => createConversation(project.id)}
            onEdit={() => setEditingProject(project)}
          />
        ))}

        {unfiled.length > 0 && (
          <div className="mt-2">
            {state.projects.length > 0 && (
              <div className="px-2 pt-2 pb-1 text-xs font-medium tracking-wide text-slate-400 uppercase">
                Chats
              </div>
            )}
            {unfiled.map((c) => (
              <ConversationRow key={c.id} id={c.id} />
            ))}
          </div>
        )}

        {state.projects.length === 0 && unfiled.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-slate-400">
            Noch keine Chats. Leg oben los.
          </p>
        )}
      </div>

      {editingProject !== null && (
        <ProjectModal
          project={editingProject === 'new' ? null : editingProject}
          onClose={() => setEditingProject(null)}
        />
      )}
    </aside>
  )
}

function ProjectGroup({
  project,
  onNewChat,
  onEdit,
}: {
  project: Project
  onNewChat: () => void
  onEdit: () => void
}) {
  const { state, dispatch } = useApp()
  const [open, setOpen] = useState(true)
  const conversations = state.conversations.filter((c) => c.projectId === project.id)

  return (
    <div className="mb-1">
      <div className="group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-800">
        <button className="flex-1 truncate text-left" onClick={() => setOpen((o) => !o)}>
          {project.name}
        </button>
        <button
          onClick={onNewChat}
          title="Neuer Chat in diesem Projekt"
          className="rounded p-1 opacity-0 group-hover:opacity-100 hover:bg-slate-300 dark:hover:bg-slate-700"
        >
          <MessageSquarePlus size={13} />
        </button>
        <button
          onClick={onEdit}
          title="Projekt bearbeiten"
          className="rounded p-1 opacity-0 group-hover:opacity-100 hover:bg-slate-300 dark:hover:bg-slate-700"
        >
          <Settings size={13} />
        </button>
        <button
          onClick={() => {
            if (confirm(`Projekt "${project.name}" löschen? Chats bleiben erhalten.`)) {
              dispatch({ type: 'DELETE_PROJECT', id: project.id })
            }
          }}
          title="Projekt löschen"
          className="rounded p-1 opacity-0 group-hover:opacity-100 hover:bg-slate-300 dark:hover:bg-slate-700"
        >
          <Trash2 size={13} />
        </button>
      </div>
      {open && (
        <div className="ml-2 border-l border-slate-200 pl-1 dark:border-slate-800">
          {conversations.length === 0 && (
            <p className="px-3 py-1 text-xs text-slate-400">Noch keine Chats</p>
          )}
          {conversations.map((c) => (
            <ConversationRow key={c.id} id={c.id} />
          ))}
        </div>
      )}
    </div>
  )
}

function ConversationRow({ id }: { id: string }) {
  const { state, dispatch } = useApp()
  const conversation = state.conversations.find((c) => c.id === id)
  if (!conversation) return null
  const active = state.activeConversationId === id

  return (
    <div
      className={`group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm ${
        active
          ? 'bg-purple-100 text-purple-900 dark:bg-purple-900/40 dark:text-purple-100'
          : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800'
      }`}
    >
      <button
        className="flex-1 truncate text-left"
        onClick={() => dispatch({ type: 'SET_ACTIVE_CONVERSATION', id })}
      >
        {conversation.title}
      </button>
      <button
        onClick={() => {
          if (confirm('Diesen Chat löschen?')) {
            dispatch({ type: 'DELETE_CONVERSATION', id })
          }
        }}
        title="Chat löschen"
        className="rounded p-1 opacity-0 group-hover:opacity-100 hover:bg-slate-300 dark:hover:bg-slate-700"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}
