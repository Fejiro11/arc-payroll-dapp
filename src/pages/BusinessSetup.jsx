import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePrivy } from '@privy-io/react-auth'
import { useApp } from '../context/AppContext'
import { Building2, Wallet, AlertCircle } from 'lucide-react'

export default function BusinessSetup() {
  const navigate = useNavigate()
  const { authenticated, login } = usePrivy()
  const { 
    walletAddress, 
    loadOrCreateBusiness, 
    businessId,
    checkExistingBusiness
  } = useApp()

  const [businessName, setBusinessName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(true)

  // Check if user already has a business
  useEffect(() => {
    const checkBusiness = async () => {
      if (walletAddress && authenticated) {
        setChecking(true)
        const existingBusiness = await checkExistingBusiness(walletAddress)
        if (existingBusiness) {
          // Redirect to dashboard if business exists
          navigate('/dashboard')
        }
        setChecking(false)
      } else {
        setChecking(false)
      }
    }
    checkBusiness()
  }, [walletAddress, authenticated])

  const handleSetupBusiness = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!businessName.trim()) {
      setError('Please enter a business name')
      return
    }

    setIsLoading(true)
    
    // Check again if business exists (prevent race condition)
    const existingBusiness = await checkExistingBusiness(walletAddress)
    if (existingBusiness) {
      setError('You already have a business registered. One wallet can only have one business.')
      setIsLoading(false)
      return
    }

    const business = await loadOrCreateBusiness(walletAddress, businessName.trim())
    
    if (business) {
      navigate('/dashboard')
    } else {
      setError('Failed to create business. Please try again.')
    }
    
    setIsLoading(false)
  }

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-6">
          <Wallet className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In to Create Business</h2>
        <p className="text-gray-600 mb-6 max-w-md">
          Sign in to register your business and start managing payroll.
        </p>
        <button
          onClick={login}
          className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          <Wallet className="w-5 h-5" />
          <span>Sign In</span>
        </button>
      </div>
    )
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
          <Building2 className="w-6 h-6 text-primary-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Register Your Business</h2>
        <p className="text-gray-600 mb-6">
          Enter your business name to get started with Arc Payroll.
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSetupBusiness}>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g., Acme Corp"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none mb-4"
          />
          <button
            type="submit"
            disabled={!businessName.trim() || isLoading}
            className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              'Create Business'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
