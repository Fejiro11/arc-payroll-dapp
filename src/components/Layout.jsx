import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { usePrivy } from '@privy-io/react-auth'
import { useApp } from '../context/AppContext'
import { Wallet, LogOut, Building2, User, ExternalLink, Copy, Check } from 'lucide-react'

export default function Layout({ children }) {
  const { authenticated, login, logout } = usePrivy()
  const { walletAddress, balances } = useApp()
  const location = useLocation()

  const isBusinessView = location.pathname.startsWith('/business') || location.pathname.startsWith('/dashboard')
  const isStaffView = location.pathname.startsWith('/staff')
  const [addressCopied, setAddressCopied] = useState(false)

  const handleCopyAddress = async () => {
    if (!walletAddress) return
    await navigator.clipboard.writeText(walletAddress)
    setAddressCopied(true)
    setTimeout(() => setAddressCopied(false), 2000)
  }

  const truncateAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo / Home Link */}
            {(isBusinessView || isStaffView) ? (
              <Link to="/" className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors group">
                <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">Home</span>
              </Link>
            ) : (
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="font-semibold text-gray-900">Arc Payroll</span>
              </Link>
            )}

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/business"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isBusinessView
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4" />
                  <span>Business</span>
                </div>
              </Link>
              <Link
                to="/staff"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isStaffView
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Staff</span>
                </div>
              </Link>
            </nav>

            {/* Wallet Connection */}
            <div className="flex items-center space-x-3">
              {authenticated && walletAddress ? (
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                    <span className="text-xs text-gray-500">Balance:</span>
                    <span className="text-sm font-mono font-medium text-gray-900">
                      ${parseFloat(balances.usdc).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 rounded-lg">
                    <Wallet className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-mono text-gray-700">
                      {truncateAddress(walletAddress)}
                    </span>
                    <button
                      onClick={handleCopyAddress}
                      className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                      title="Copy address"
                    >
                      {addressCopied ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                    <a
                      href={`https://testnet.arcscan.app/address/${walletAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                      title="View on explorer"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Disconnect"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={login}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-100">
          <div className="flex">
            <Link
              to="/business"
              className={`flex-1 px-4 py-3 text-center text-sm font-medium ${
                isBusinessView
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600'
              }`}
            >
              Business
            </Link>
            <Link
              to="/staff"
              className={`flex-1 px-4 py-3 text-center text-sm font-medium ${
                isStaffView
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600'
              }`}
            >
              Staff
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
