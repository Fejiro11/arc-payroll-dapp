import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import BusinessSetup from './pages/BusinessSetup'
import BusinessDashboard from './pages/BusinessDashboard'
import StaffDashboard from './pages/StaffDashboard'
import StaffRegister from './pages/StaffRegister'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/business" element={<Layout><BusinessSetup /></Layout>} />
          <Route path="/dashboard" element={<Layout><BusinessDashboard /></Layout>} />
          <Route path="/staff" element={<Layout><StaffDashboard /></Layout>} />
          <Route path="/staff/register" element={<Layout><StaffRegister /></Layout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </ErrorBoundary>
  )
}

export default App
