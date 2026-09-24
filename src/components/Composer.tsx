import { Square, ArrowUp } from 'lucide-react'
import { useRef, useState, type KeyboardEvent } from 'react'

export default function Composer({
  disabled,
  isStreaming,
  onSend,
  onStop,
}: {
  disabled: boolean
  isStreaming: boolean
  onSend: (text: string) => void
  onStop: () => void
}) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function submit() {
    const text = value.trim()
    if (!text || disabled) return
    onSend(text)
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  function autoGrow() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }

  return (
    <div className="border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-slate-300 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            autoGrow()
          }}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Nachricht schreiben… (Umschalt+Enter für neue Zeile)"
          className="max-h-[200px] flex-1 resize-none bg-transparent px-2 py-1.5 text-[15px] text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
        />
        {isStreaming ? (
          <button
            onClick={onStop}
            title="Stoppen"
            className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900"
          >
            <Square size={14} fill="currentColor" />
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={!value.trim() || disabled}
            title="Senden"
            className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-30"
          >
            <ArrowUp size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
