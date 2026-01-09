import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePrivy } from '@privy-io/react-auth'
import { useApp } from '../context/AppContext'
import { 
  Wallet, 
  KeyRound, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react'

export default function StaffRegister() {
  const { authenticated, login } = usePrivy()
  const { registerWithCode, walletAddress } = useApp()
  const navigate = useNavigate()

  const [step, setStep] = useState(1) // 1: code, 2: name, 3: success
  const [inviteCode, setInviteCode] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCodeSubmit = (e) => {
    e.preventDefault()
    setError('')
    
    if (inviteCode.length < 6) {
      setError('Please enter a valid 6-character invite code')
      return
    }
    
    setStep(2)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!name.trim()) {
      setError('Please enter your name')
      setLoading(false)
      return
    }

    const result = await registerWithCode(inviteCode.toUpperCase(), name.trim())
    
    if (result.success) {
      setStep(3)
      setTimeout(() => navigate('/staff'), 2000)
    } else {
      setError(result.error || 'Invalid or expired invite code. Please check with your employer.')
    }
    
    setLoading(false)
  }

  const formatCodeInput = (value) => {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
  }

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Create Your Account</h2>
          <p className="text-gray-600 mb-6">
            Sign up to register with your employer using an invite code.
          </p>
          <button
            onClick={login}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            <Wallet className="w-5 h-5" />
            <span>Sign Up</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
          </div>
          <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            {step > 2 ? <CheckCircle className="w-5 h-5" /> : '2'}
          </div>
          <div className={`w-12 h-0.5 ${step >= 3 ? 'bg-primary-600' : 'bg-gray-200'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            3
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        {step === 1 && (
          <>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-6 h-6 text-primary-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Enter Invite Code</h2>
              <p className="text-gray-600 text-sm">
                Get a one-time invite code from your employer to join their organization.
              </p>
            </div>

            <form onSubmit={handleCodeSubmit}>
              <div className="mb-4">
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(formatCodeInput(e.target.value))}
                  placeholder="e.g., 8X29A1"
                  className="w-full px-4 py-4 text-center text-2xl font-mono font-bold tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none uppercase"
                  maxLength={6}
                />
              </div>

              {error && (
                <div className="flex items-center space-x-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={inviteCode.length < 6}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Complete Registration</h2>
              <p className="text-gray-600 text-sm">
                Enter your name to complete the registration process.
              </p>
            </div>

            <form onSubmit={handleRegister}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., John Smith"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wallet Address
                </label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm text-gray-600 break-all">
                  {walletAddress}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  This wallet will receive your salary payments
                </p>
              </div>

              <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Invite Code:</span>{' '}
                  <span className="font-mono">{inviteCode}</span>
                </p>
              </div>

              {error && (
                <div className="flex items-center space-x-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {step === 3 && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Registration Complete!</h2>
            <p className="text-gray-600 mb-4">
              You've successfully joined the organization. Your employer will approve your account shortly.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to your dashboard...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
