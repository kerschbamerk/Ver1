import { useState } from 'react'
import ChatView from './components/ChatView'
import SettingsModal from './components/SettingsModal'
import Sidebar from './components/Sidebar'
import { useApp } from './store/AppContext'

function App() {
  const { state } = useApp()
  const [settingsOpen, setSettingsOpen] = useState(() => !Object.values(state.apiKeys).some(Boolean))

  return (
    <div
      className="flex h-dvh w-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      <Sidebar onOpenSettings={() => setSettingsOpen(true)} />
      <ChatView />
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  )
}

export default App
