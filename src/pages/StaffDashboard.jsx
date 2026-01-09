import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePrivy } from '@privy-io/react-auth'
import { useApp } from '../context/AppContext'
import { 
  Building2, 
  CheckCircle, 
  Clock, 
  Wallet, 
  TrendingUp,
  Calendar,
  DollarSign,
  ArrowRight,
  Info,
  LogOut
} from 'lucide-react'

export default function StaffDashboard() {
  const navigate = useNavigate()
  const { authenticated, login } = usePrivy()
  const { staffData, balances, walletAddress, updateStaffPreference, loadStaffData, leaveJob } = useApp()
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  // Load staff data when wallet connects
  useEffect(() => {
    if (walletAddress && authenticated) {
      loadStaffData(walletAddress)
    }
  }, [walletAddress, authenticated])

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-6">
          <Wallet className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Staff Dashboard</h2>
        <p className="text-gray-600 mb-6 max-w-md">
          Sign in to view your employment status and manage preferences.
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

  // Check if staff has registered
  if (!staffData.employerName) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Not Registered</h2>
          <p className="text-gray-600 mb-6">
            You haven't joined any organization yet. Get an invite code from your employer to get started.
          </p>
          <Link
            to="/staff/register"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            <span>Enter Invite Code</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Employment Status Card - Primary Focus for Mobile */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-primary-200 text-sm mb-1">Employment Status</p>
            <h2 className="text-2xl font-bold">
              Employed by: {staffData.employerName}
            </h2>
          </div>
          {staffData.status === 'active' ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white/20 backdrop-blur rounded-full text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>Active</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500/30 backdrop-blur rounded-full text-sm font-medium">
              <Clock className="w-4 h-4" />
              <span>Pending Approval</span>
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <p className="text-primary-200 text-xs mb-1">Monthly Salary</p>
            <p className="text-xl font-mono font-bold">
              ${parseFloat(staffData.salary).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-primary-200 text-xs mb-1">Last Payment</p>
            <p className="text-lg font-medium">
              {formatDate(staffData.lastPayment)}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">USD Balance</span>
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-gray-900">
            ${parseFloat(balances.usdc).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">USYC Balance</span>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-gray-900">
            {parseFloat(balances.usyc).toLocaleString()}
            <span className="text-base font-normal text-gray-500 ml-1">USYC</span>
          </p>
          <p className="text-xs text-green-600 mt-1">Earning yield</p>
        </div>
      </div>

      {/* USYC Preference Toggle */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-gray-900">Auto-Invest in USYC</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4 max-w-lg">
              Switch this on to automatically convert your incoming salary into USYC, 
              earning yield immediately. Your preference is private and hidden from your employer.
            </p>
            <div className="flex items-center space-x-3 p-3 bg-primary-50 rounded-lg">
              <Info className="w-4 h-4 text-primary-600 flex-shrink-0" />
              <p className="text-xs text-primary-700">
                USYC is a yield-bearing stablecoin. When enabled, your salary is 
                automatically converted to USYC to start earning yield immediately.
              </p>
            </div>
          </div>
          <div className="ml-6">
            <button
              onClick={() => updateStaffPreference(!staffData.preferUSYC)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                staffData.preferUSYC ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
                  staffData.preferUSYC ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
        
        {staffData.preferUSYC && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                USYC conversion enabled - your salary will be auto-converted
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Payment History Placeholder */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Payment History</h3>
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
        {staffData.lastPayment ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Monthly Salary</p>
                <p className="text-sm text-gray-500">{formatDate(staffData.lastPayment)}</p>
              </div>
              <div className="text-right">
                <p className="font-mono font-medium text-gray-900">
                  +${parseFloat(staffData.salary).toLocaleString()}
                </p>
                <p className="text-xs text-green-600">Completed</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No payments yet</p>
          </div>
        )}
      </div>

      {/* Leave Job Section */}
      <div className="bg-white rounded-xl border border-red-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Leave Job</h3>
            <p className="text-sm text-gray-600">
              Leave your current position at {staffData.employerName}. This will remove you from their payroll.
            </p>
          </div>
          <button
            onClick={() => setShowLeaveConfirm(true)}
            className="flex items-center space-x-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Leave</span>
          </button>
        </div>
      </div>

      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Leave {staffData.employerName}?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to leave? You will be removed from their payroll and will need a new invite code to rejoin or join another business.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setIsLeaving(true)
                  const success = await leaveJob()
                  setIsLeaving(false)
                  setShowLeaveConfirm(false)
                  if (success) {
                    navigate('/staff/register')
                  }
                }}
                disabled={isLeaving}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isLeaving ? 'Leaving...' : 'Yes, Leave'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
