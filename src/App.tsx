import { useState } from 'react'
import ChatView from './components/ChatView'
import SettingsModal from './components/SettingsModal'
import Sidebar from './components/Sidebar'
import { useApp } from './store/AppContext'

function App() {
  const { state } = useApp()
  const [settingsOpen, setSettingsOpen] = useState(() => !Object.values(state.apiKeys).some(Boolean))

  return (
    <div className="flex h-screen w-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar onOpenSettings={() => setSettingsOpen(true)} />
      <ChatView />
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  )
}

export default App
