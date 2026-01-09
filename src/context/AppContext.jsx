import React, { createContext, useContext, useState, useEffect } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { ethers } from 'ethers'
import { CONTRACTS, ERC20_ABI, ARC_TESTNET } from '../config/contracts'

const AppContext = createContext()

export function AppProvider({ children }) {
  const { authenticated, user, login, logout } = usePrivy()
  const { wallets } = useWallets()
  
  const [userRole, setUserRole] = useState(null) // 'business' | 'staff'
  const [businessData, setBusinessData] = useState({
    name: '',
    treasuryBalance: '0',
    inviteCodes: [],
    staff: [],
  })
  const [staffData, setStaffData] = useState({
    inviteCode: '',
    employerName: '',
    status: 'pending', // 'pending' | 'active'
    salary: '0',
    preferUSYC: false,
    lastPayment: null,
  })
  const [balances, setBalances] = useState({ usdc: '0', usyc: '0' })
  const [loading, setLoading] = useState(false)

  const getProvider = async () => {
    if (wallets.length > 0) {
      const wallet = wallets[0]
      await wallet.switchChain(ARC_TESTNET.chainId)
      const provider = await wallet.getEthersProvider()
      return provider
    }
    return new ethers.JsonRpcProvider(ARC_TESTNET.rpcUrl)
  }

  const getSigner = async () => {
    if (wallets.length > 0) {
      const wallet = wallets[0]
      await wallet.switchChain(ARC_TESTNET.chainId)
      const provider = await wallet.getEthersProvider()
      return provider.getSigner()
    }
    return null
  }

  const fetchBalances = async (address) => {
    try {
      const provider = await getProvider()
      const usdcContract = new ethers.Contract(CONTRACTS.USDC, ERC20_ABI, provider)
      const usycContract = new ethers.Contract(CONTRACTS.USYC, ERC20_ABI, provider)
      
      const [usdcBal, usycBal] = await Promise.all([
        usdcContract.balanceOf(address),
        usycContract.balanceOf(address),
      ])
      
      setBalances({
        usdc: ethers.formatUnits(usdcBal, 6),
        usyc: ethers.formatUnits(usycBal, 6),
      })
    } catch (error) {
      console.error('Error fetching balances:', error)
    }
  }

  const generateInviteCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const createInviteCode = () => {
    const code = generateInviteCode()
    const newCode = {
      code,
      createdAt: new Date().toISOString(),
      used: false,
      usedBy: null,
    }
    setBusinessData(prev => ({
      ...prev,
      inviteCodes: [...prev.inviteCodes, newCode],
    }))
    return code
  }

  const registerWithCode = (code, name) => {
    const validCode = businessData.inviteCodes.find(c => c.code === code && !c.used)
    if (!validCode) return false

    const walletAddress = wallets[0]?.address || '0x...'
    
    setBusinessData(prev => ({
      ...prev,
      inviteCodes: prev.inviteCodes.map(c => 
        c.code === code ? { ...c, used: true, usedBy: walletAddress } : c
      ),
      staff: [...prev.staff, {
        id: Date.now().toString(),
        name,
        wallet: walletAddress,
        salary: '3000',
        status: 'pending',
        preferUSYC: false,
        joinedAt: new Date().toISOString(),
      }],
    }))

    setStaffData({
      inviteCode: code,
      employerName: businessData.name || 'Acme Corp',
      status: 'pending',
      salary: '3000',
      preferUSYC: false,
      lastPayment: null,
    })

    return true
  }

  const approveStaff = (staffId) => {
    setBusinessData(prev => ({
      ...prev,
      staff: prev.staff.map(s => 
        s.id === staffId ? { ...s, status: 'active' } : s
      ),
    }))
  }

  const deleteStaff = (staffId) => {
    setBusinessData(prev => ({
      ...prev,
      staff: prev.staff.filter(s => s.id !== staffId),
    }))
  }

  const updateStaffSalary = (staffId, newSalary) => {
    setBusinessData(prev => ({
      ...prev,
      staff: prev.staff.map(s => 
        s.id === staffId ? { ...s, salary: newSalary } : s
      ),
    }))
  }

  const updateStaffPreference = (preferUSYC) => {
    setStaffData(prev => ({ ...prev, preferUSYC }))
  }

  const walletAddress = wallets[0]?.address

  useEffect(() => {
    if (walletAddress) {
      fetchBalances(walletAddress)
    }
  }, [walletAddress])

  const value = {
    authenticated,
    user,
    login,
    logout,
    wallets,
    walletAddress,
    userRole,
    setUserRole,
    businessData,
    setBusinessData,
    staffData,
    setStaffData,
    balances,
    loading,
    setLoading,
    getProvider,
    getSigner,
    fetchBalances,
    createInviteCode,
    registerWithCode,
    approveStaff,
    deleteStaff,
    updateStaffSalary,
    updateStaffPreference,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
