import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Chat from './pages/Chat'
import Dashboard from './pages/Dashboard'
import Intelligence from './pages/Intelligence'
import Analytics from './pages/Analytics'
import Layout from './components/Layout'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:conversationId" element={<Chat />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/intelligence" element={<Layout><Intelligence /></Layout>} />
        <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
      </Routes>
    </Router>
  )
}

export default App

