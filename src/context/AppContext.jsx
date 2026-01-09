import React, { createContext, useContext, useState, useEffect } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { ethers } from 'ethers'
import { CONTRACTS, ERC20_ABI, ARC_TESTNET } from '../config/contracts'
import { supabase } from '../config/supabase'

const AppContext = createContext()

export function AppProvider({ children }) {
  const { authenticated, user, login, logout } = usePrivy()
  const { wallets } = useWallets()
  
  const [userRole, setUserRole] = useState(null) // 'business' | 'staff'
  const [businessId, setBusinessId] = useState(null)
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

  // Load or create business from Supabase
  const loadOrCreateBusiness = async (wallet, name) => {
    try {
      // Check if business exists
      let { data: business } = await supabase
        .from('businesses')
        .select('*')
        .eq('wallet_address', wallet)
        .single()

      if (!business && name) {
        // Create new business
        const { data: newBusiness, error } = await supabase
          .from('businesses')
          .insert({ wallet_address: wallet, name })
          .select()
          .single()
        
        if (error) throw error
        business = newBusiness
      }

      if (business) {
        setBusinessId(business.id)
        setBusinessData(prev => ({ ...prev, name: business.name }))
        await loadBusinessData(business.id)
      }

      return business
    } catch (error) {
      console.error('Error loading business:', error)
      return null
    }
  }

  // Load business invite codes and staff
  const loadBusinessData = async (bizId) => {
    try {
      const [codesRes, staffRes] = await Promise.all([
        supabase.from('invite_codes').select('*').eq('business_id', bizId),
        supabase.from('staff').select('*').eq('business_id', bizId)
      ])

      setBusinessData(prev => ({
        ...prev,
        inviteCodes: codesRes.data?.map(c => ({
          code: c.code,
          createdAt: c.created_at,
          used: c.used,
          usedBy: c.used_by,
        })) || [],
        staff: staffRes.data?.map(s => ({
          id: s.id,
          name: s.name,
          wallet: s.wallet_address,
          salary: s.salary,
          status: s.status,
          preferUSYC: s.prefer_usyc,
          lastPayment: s.last_payment,
        })) || [],
      }))
    } catch (error) {
      console.error('Error loading business data:', error)
    }
  }

  const createInviteCode = async () => {
    const code = generateInviteCode()
    
    if (businessId && walletAddress) {
      const { error } = await supabase
        .from('invite_codes')
        .insert({
          code,
          business_id: businessId,
          business_wallet: walletAddress,
          used: false,
        })
      
      if (error) {
        console.error('Error creating invite code:', error)
        return null
      }
    }

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

  const registerWithCode = async (code, name) => {
    try {
      // Find the invite code in Supabase
      const { data: inviteCode, error: codeError } = await supabase
        .from('invite_codes')
        .select('*, businesses(*)')
        .eq('code', code.toUpperCase())
        .eq('used', false)
        .single()

      if (codeError || !inviteCode) {
        console.error('Invalid invite code:', codeError)
        return false
      }

      const staffWallet = wallets[0]?.address
      if (!staffWallet) return false

      // Create staff record
      const { data: newStaff, error: staffError } = await supabase
        .from('staff')
        .insert({
          wallet_address: staffWallet,
          name,
          business_id: inviteCode.business_id,
          salary: '3000',
          status: 'pending',
          prefer_usyc: false,
        })
        .select()
        .single()

      if (staffError) {
        console.error('Error creating staff:', staffError)
        return false
      }

      // Mark invite code as used
      await supabase
        .from('invite_codes')
        .update({ used: true, used_by: staffWallet })
        .eq('id', inviteCode.id)

      setStaffData({
        id: newStaff.id,
        inviteCode: code,
        employerName: inviteCode.businesses?.name || 'Unknown',
        status: 'pending',
        salary: '3000',
        preferUSYC: false,
        lastPayment: null,
      })

      return true
    } catch (error) {
      console.error('Error registering with code:', error)
      return false
    }
  }

  // Load staff data for current wallet
  const loadStaffData = async (wallet) => {
    try {
      const { data: staff } = await supabase
        .from('staff')
        .select('*, businesses(*)')
        .eq('wallet_address', wallet)
        .single()

      if (staff) {
        setStaffData({
          id: staff.id,
          inviteCode: '',
          employerName: staff.businesses?.name || 'Unknown',
          status: staff.status,
          salary: staff.salary,
          preferUSYC: staff.prefer_usyc,
          lastPayment: staff.last_payment,
        })
      }
    } catch (error) {
      console.error('Error loading staff data:', error)
    }
  }

  const approveStaff = async (staffId) => {
    await supabase
      .from('staff')
      .update({ status: 'active' })
      .eq('id', staffId)

    setBusinessData(prev => ({
      ...prev,
      staff: prev.staff.map(s => 
        s.id === staffId ? { ...s, status: 'active' } : s
      ),
    }))
  }

  const deleteStaff = async (staffId) => {
    await supabase
      .from('staff')
      .delete()
      .eq('id', staffId)

    setBusinessData(prev => ({
      ...prev,
      staff: prev.staff.filter(s => s.id !== staffId),
    }))
  }

  const updateStaffSalary = async (staffId, newSalary) => {
    await supabase
      .from('staff')
      .update({ salary: newSalary })
      .eq('id', staffId)

    setBusinessData(prev => ({
      ...prev,
      staff: prev.staff.map(s => 
        s.id === staffId ? { ...s, salary: newSalary } : s
      ),
    }))
  }

  const updateStaffPreference = async (preferUSYC) => {
    if (staffData.id) {
      await supabase
        .from('staff')
        .update({ prefer_usyc: preferUSYC })
        .eq('id', staffData.id)
    }
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
    businessId,
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
    loadOrCreateBusiness,
    loadBusinessData,
    loadStaffData,
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
