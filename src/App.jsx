import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import BusinessDashboard from './pages/BusinessDashboard'
import StaffDashboard from './pages/StaffDashboard'
import StaffRegister from './pages/StaffRegister'

function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/business" element={<Layout><BusinessDashboard /></Layout>} />
        <Route path="/staff" element={<Layout><StaffDashboard /></Layout>} />
        <Route path="/staff/register" element={<Layout><StaffRegister /></Layout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppProvider>
  )
}

export default App
