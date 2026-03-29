import { AppProvider, useApp } from './context'
import NavBar from './components/NavBar'
import TodayPage from './components/TodayPage'
import HabitsPage from './components/HabitsPage'
import CalendarPage from './components/CalendarPage'
import StatsPage from './components/StatsPage'
import SettingsPage from './components/SettingsPage'

function PageRouter() {
  const { page } = useApp()
  switch (page) {
    case 'today': return <TodayPage />
    case 'habits': return <HabitsPage />
    case 'calendar': return <CalendarPage />
    case 'stats': return <StatsPage />
    case 'settings': return <SettingsPage />
  }
}

export default function App() {
  return (
    <AppProvider>
      <div className="max-w-lg mx-auto min-h-dvh">
        <PageRouter />
        <NavBar />
      </div>
    </AppProvider>
  )
}
