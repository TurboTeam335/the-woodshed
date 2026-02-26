import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import AppLayout from './components/Layout/AppLayout'
import DashboardView from './views/DashboardView'
import SessionView from './views/SessionView'
import ProgressView from './views/ProgressView'
import SettingsView from './views/SettingsView'
import { useStore } from './stores/useStore'

export default function App(): JSX.Element {
  const { initApp } = useStore()

  useEffect(() => {
    initApp()
  }, [initApp])

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardView />} />
        <Route path="/session" element={<SessionView />} />
        <Route path="/progress" element={<ProgressView />} />
        <Route path="/settings" element={<SettingsView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  )
}
