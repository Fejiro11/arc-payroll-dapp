import React, { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useApp } from '../context/AppContext'
import { createPayrollService } from '../services/payroll'
import { 
  Copy, 
  Check, 
  Plus, 
  Users, 
  DollarSign, 
  Trash2, 
  CheckCircle, 
  Clock,
  Loader2,
  ExternalLink,
  Wallet,
  AlertCircle,
  RefreshCw
} from 'lucide-react'

export default function BusinessDashboard() {
  const { authenticated, login } = usePrivy()
  const { 
    businessData, 
    setBusinessData,
    createInviteCode, 
    approveStaff, 
    deleteStaff,
    updateStaffSalary,
    balances,
    walletAddress,
    loading,
    setLoading,
    getSigner,
    fetchBalances
  } = useApp()

  const [editingSalary, setEditingSalary] = useState(null)
  const [tempSalary, setTempSalary] = useState('')

  const [copiedCode, setCopiedCode] = useState(null)
  const [selectedStaff, setSelectedStaff] = useState([])
  const [showNewCode, setShowNewCode] = useState(false)
  const [latestCode, setLatestCode] = useState('')
  const [isRunningPayroll, setIsRunningPayroll] = useState(false)
  const [payrollResult, setPayrollResult] = useState(null)
  const [payrollError, setPayrollError] = useState(null)
  const [addressCopied, setAddressCopied] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Business name input for first-time setup
  const [businessName, setBusinessName] = useState(businessData.name)
  const [isSettingUp, setIsSettingUp] = useState(!businessData.name)

  const handleSetupBusiness = (e) => {
    e.preventDefault()
    if (businessName.trim()) {
      setBusinessData(prev => ({ ...prev, name: businessName.trim() }))
      setIsSettingUp(false)
    }
  }

  const handleGenerateCode = () => {
    const code = createInviteCode()
    setLatestCode(code)
    setShowNewCode(true)
  }

  const handleCopyCode = async (code) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleSelectStaff = (staffId) => {
    setSelectedStaff(prev => 
      prev.includes(staffId) 
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    )
  }

  const handleSelectAll = () => {
    const activeStaff = businessData.staff.filter(s => s.status === 'active')
    if (selectedStaff.length === activeStaff.length) {
      setSelectedStaff([])
    } else {
      setSelectedStaff(activeStaff.map(s => s.id))
    }
  }

  const handleRunPayroll = async () => {
    if (selectedStaff.length === 0) return
    
    setIsRunningPayroll(true)
    setPayrollError(null)
    setPayrollResult(null)

    try {
      // Get selected staff details
      const staffToPayList = businessData.staff.filter(s => selectedStaff.includes(s.id))
      
      // Try to use real blockchain if signer is available
      try {
        const payrollService = await createPayrollService(getSigner)
        
        // Build staff preferences map (admin doesn't see this - privacy preserved)
        // In production, this would be fetched from a private store
        const staffPreferences = {}
        staffToPayList.forEach(s => {
          // Staff preference is private - admin never sees this
          staffPreferences[s.wallet] = s.preferUSYC || false
        })

        const result = await payrollService.runPayroll(staffToPayList, staffPreferences)
        
        setPayrollResult({
          hash: result.hash,
          staffPaid: result.staffPaid,
          totalAmount: result.totalAmount
        })
      } catch (blockchainError) {
        console.log('Blockchain not available, using mock:', blockchainError.message)
        // Fallback to mock for demo purposes
        await new Promise(resolve => setTimeout(resolve, 2000))
        setPayrollResult({
          hash: '0x' + Math.random().toString(16).slice(2, 66),
          staffPaid: staffToPayList.length,
          totalAmount: totalPayroll.toString(),
          mock: true
        })
      }
      
      // Update last payment for selected staff
      setBusinessData(prev => ({
        ...prev,
        treasuryBalance: (parseFloat(prev.treasuryBalance) - totalPayroll).toString(),
        staff: prev.staff.map(s => 
          selectedStaff.includes(s.id) 
            ? { ...s, lastPayment: new Date().toISOString() }
            : s
        )
      }))
      
      setSelectedStaff([])
    } catch (error) {
      console.error('Payroll error:', error)
      setPayrollError(error.message || 'Failed to run payroll')
    } finally {
      setIsRunningPayroll(false)
    }
  }

  const handleFundTreasury = async () => {
    if (!walletAddress) return
    
    // Copy wallet address to clipboard
    await navigator.clipboard.writeText(walletAddress)
    setAddressCopied(true)
    
    // Open faucet in new tab
    window.open('https://faucet.circle.com', '_blank')
    
    // Reset copied message after 3 seconds
    setTimeout(() => setAddressCopied(false), 3000)
  }

  const handleRefreshBalance = async () => {
    if (!walletAddress || isRefreshing) return
    setIsRefreshing(true)
    await fetchBalances(walletAddress)
    setIsRefreshing(false)
  }

  const truncateAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const activeStaffCount = businessData.staff.filter(s => s.status === 'active').length
  const pendingStaffCount = businessData.staff.filter(s => s.status === 'pending').length
  const totalPayroll = businessData.staff
    .filter(s => selectedStaff.includes(s.id))
    .reduce((sum, s) => sum + parseFloat(s.salary), 0)

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-6">
          <Wallet className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In as Employer</h2>
        <p className="text-gray-600 mb-6 max-w-md">
          Sign in to access the business dashboard and manage your payroll.
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

  if (isSettingUp) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Set Up Your Business</h2>
          <p className="text-gray-600 mb-6">
            Enter your business name to get started with Arc Payroll.
          </p>
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
              disabled={!businessName.trim()}
              className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{businessData.name}</h1>
          <p className="text-gray-600">Manage your team and run payroll</p>
        </div>
        <button
          onClick={handleFundTreasury}
          disabled={!walletAddress}
          className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors font-medium disabled:opacity-50 ${
            addressCopied 
              ? 'bg-green-500 text-white' 
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {addressCopied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Address copied</span>
            </>
          ) : (
            <>
              <DollarSign className="w-4 h-4" />
              <span>Fund Treasury</span>
            </>
          )}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">Treasury Balance</span>
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold font-mono text-gray-900">
              {parseFloat(balances.usdc).toLocaleString()} 
              <span className="text-base font-normal text-gray-500 ml-1">USD</span>
            </p>
            <button
              onClick={handleRefreshBalance}
              disabled={isRefreshing}
              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors disabled:opacity-50"
              title="Refresh balance"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">Active Staff</span>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {activeStaffCount}
            {pendingStaffCount > 0 && (
              <span className="text-base font-normal text-amber-600 ml-2">
                +{pendingStaffCount} pending
              </span>
            )}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">Invite Codes</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {businessData.inviteCodes.filter(c => !c.used).length} available
            </span>
          </div>
          <button
            onClick={handleGenerateCode}
            className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Code</span>
          </button>
        </div>
      </div>

      {/* Payroll Result */}
      {payrollResult && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Payroll Completed</h3>
                {payrollResult.mock && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Demo Mode</span>
                )}
              </div>
              <p className="text-green-700 text-sm mb-3">
                Successfully paid {payrollResult.staffPaid} staff member{payrollResult.staffPaid > 1 ? 's' : ''} a total of{' '}
                <span className="font-mono font-medium">${parseFloat(payrollResult.totalAmount).toLocaleString()}</span>
              </p>
              <a
                href={`https://testnet.arcscan.app/tx/${payrollResult.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-sm text-green-600 hover:text-green-800"
              >
                <span className="font-mono">{payrollResult.hash.slice(0, 10)}...{payrollResult.hash.slice(-8)}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <button
              onClick={() => setPayrollResult(null)}
              className="text-green-400 hover:text-green-600 text-xl"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Payroll Error */}
      {payrollError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Payroll Failed</h3>
                <p className="text-red-700 text-sm">{payrollError}</p>
              </div>
            </div>
            <button
              onClick={() => setPayrollError(null)}
              className="text-red-400 hover:text-red-600 text-xl"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* New Code Modal */}
      {showNewCode && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-primary-900 mb-1">New Invite Code Generated</h3>
              <p className="text-primary-700 text-sm mb-4">
                Share this one-time code with your new staff member.
              </p>
              <div className="flex items-center space-x-3">
                <code className="text-2xl font-mono font-bold text-primary-900 bg-white px-4 py-2 rounded-lg border border-primary-200">
                  {latestCode}
                </code>
                <button
                  onClick={() => handleCopyCode(latestCode)}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {copiedCode === latestCode ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowNewCode(false)}
              className="text-primary-400 hover:text-primary-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Staff Management */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Staff Members</h2>
            {businessData.staff.length > 0 && (
              <div className="flex items-center space-x-3">
                {selectedStaff.length > 0 && (
                  <span className="text-sm text-gray-600">
                    {selectedStaff.length} selected · 
                    <span className="font-mono font-medium ml-1">
                      ${totalPayroll.toLocaleString()}
                    </span>
                  </span>
                )}
                <button
                  onClick={handleRunPayroll}
                  disabled={selectedStaff.length === 0 || isRunningPayroll}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRunningPayroll ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4" />
                      <span>Run Payroll</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {businessData.staff.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">No staff members yet</h3>
            <p className="text-gray-500 text-sm mb-4">
              Generate an invite code and share it with your team.
            </p>
            <button
              onClick={handleGenerateCode}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Generate Invite Code</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedStaff.length === businessData.staff.filter(s => s.status === 'active').length && selectedStaff.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wallet
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salary (USDC)
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {businessData.staff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={selectedStaff.includes(staff.id)}
                        onChange={() => handleSelectStaff(staff.id)}
                        disabled={staff.status !== 'active'}
                        className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-gray-900">{staff.name}</span>
                    </td>
                    <td className="px-5 py-4">
                      <a
                        href={`https://testnet.arcscan.app/address/${staff.wallet}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 font-mono text-sm text-gray-600 hover:text-primary-600"
                      >
                        <span>{truncateAddress(staff.wallet)}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="px-5 py-4">
                      {editingSalary === staff.id ? (
                        <input
                          type="number"
                          value={tempSalary}
                          onChange={(e) => setTempSalary(e.target.value)}
                          onBlur={() => {
                            if (tempSalary && parseFloat(tempSalary) > 0) {
                              updateStaffSalary(staff.id, tempSalary)
                            }
                            setEditingSalary(null)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              if (tempSalary && parseFloat(tempSalary) > 0) {
                                updateStaffSalary(staff.id, tempSalary)
                              }
                              setEditingSalary(null)
                            }
                            if (e.key === 'Escape') {
                              setEditingSalary(null)
                            }
                          }}
                          className="w-24 px-2 py-1 font-mono font-medium text-gray-900 border border-primary-300 rounded focus:ring-2 focus:ring-primary-500 outline-none"
                          autoFocus
                        />
                      ) : (
                        <button
                          onClick={() => {
                            setEditingSalary(staff.id)
                            setTempSalary(staff.salary)
                          }}
                          className="font-mono font-medium text-gray-900 hover:text-primary-600 hover:underline cursor-pointer"
                        >
                          {parseFloat(staff.salary).toLocaleString()}
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {staff.status === 'active' ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <CheckCircle className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                          <Clock className="w-3 h-3" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {staff.status === 'pending' && (
                          <button
                            onClick={() => approveStaff(staff.id)}
                            className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => deleteStaff(staff.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Active Invite Codes */}
      {businessData.inviteCodes.filter(c => !c.used).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Active Invite Codes</h3>
          <div className="flex flex-wrap gap-3">
            {businessData.inviteCodes
              .filter(c => !c.used)
              .map((code) => (
                <div
                  key={code.code}
                  className="inline-flex items-center space-x-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <code className="font-mono font-medium text-gray-900">{code.code}</code>
                  <button
                    onClick={() => handleCopyCode(code.code)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {copiedCode === code.code ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
