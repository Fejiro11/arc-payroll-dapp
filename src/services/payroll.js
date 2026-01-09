import { ethers } from 'ethers'
import { CONTRACTS, ERC20_ABI, MULTICALL3_ABI, USYC_TELLER_ABI } from '../config/contracts'

export class PayrollService {
  constructor(signer) {
    this.signer = signer
    this.usdcContract = new ethers.Contract(CONTRACTS.USDC, ERC20_ABI, signer)
    this.usycContract = new ethers.Contract(CONTRACTS.USYC, ERC20_ABI, signer)
    this.multicall = new ethers.Contract(CONTRACTS.MULTICALL3, MULTICALL3_ABI, signer)
    this.usycTeller = new ethers.Contract(CONTRACTS.USYC_TELLER, USYC_TELLER_ABI, signer)
  }

  async getUSDCBalance(address) {
    const balance = await this.usdcContract.balanceOf(address)
    return ethers.formatUnits(balance, 6)
  }

  async getUSYCBalance(address) {
    const balance = await this.usycContract.balanceOf(address)
    return ethers.formatUnits(balance, 6)
  }

  async approveUSDC(spender, amount) {
    const amountWei = ethers.parseUnits(amount.toString(), 6)
    const tx = await this.usdcContract.approve(spender, amountWei)
    await tx.wait()
    return tx.hash
  }

  async runPayroll(staffList, staffPreferences) {
    const calls = []
    const iface = new ethers.Interface(ERC20_ABI)
    const tellerIface = new ethers.Interface(USYC_TELLER_ABI)

    let totalUSDC = 0n

    for (const staff of staffList) {
      const salaryWei = ethers.parseUnits(staff.salary.toString(), 6)
      totalUSDC += salaryWei

      const prefersUSYC = staffPreferences[staff.wallet] || false

      if (prefersUSYC) {
        // For USYC preference: 
        // 1. Approve USYC Teller to spend USDC
        // 2. Deposit USDC to get USYC
        // 3. Transfer USYC to staff
        // Note: In production, this would be more complex with proper routing
        // For testnet demo, we'll do a direct USDC transfer then mock the swap
        calls.push({
          target: CONTRACTS.USDC,
          allowFailure: false,
          callData: iface.encodeFunctionData('transfer', [staff.wallet, salaryWei])
        })
      } else {
        // Direct USDC transfer
        calls.push({
          target: CONTRACTS.USDC,
          allowFailure: false,
          callData: iface.encodeFunctionData('transfer', [staff.wallet, salaryWei])
        })
      }
    }

    // Check allowance and approve if needed
    const signerAddress = await this.signer.getAddress()
    const currentAllowance = await this.usdcContract.allowance(signerAddress, CONTRACTS.MULTICALL3)
    
    if (currentAllowance < totalUSDC) {
      const approveTx = await this.usdcContract.approve(CONTRACTS.MULTICALL3, totalUSDC)
      await approveTx.wait()
    }

    // Execute batch payroll via Multicall3
    const tx = await this.multicall.aggregate3(calls)
    const receipt = await tx.wait()

    return {
      hash: receipt.hash,
      staffPaid: staffList.length,
      totalAmount: ethers.formatUnits(totalUSDC, 6)
    }
  }

  async swapUSDCtoUSYC(amount) {
    const amountWei = ethers.parseUnits(amount.toString(), 6)
    
    // Approve USYC Teller to spend USDC
    const approveTx = await this.usdcContract.approve(CONTRACTS.USYC_TELLER, amountWei)
    await approveTx.wait()

    // Get expected USYC output
    const expectedShares = await this.usycTeller.previewDeposit(amountWei)
    
    // Deposit USDC to get USYC (with 1% slippage tolerance)
    const minShares = expectedShares * 99n / 100n
    const depositTx = await this.usycTeller.deposit(amountWei, minShares)
    const receipt = await depositTx.wait()

    return {
      hash: receipt.hash,
      usdcSpent: amount,
      usycReceived: ethers.formatUnits(expectedShares, 6)
    }
  }
}

export async function createPayrollService(getSigner) {
  const signer = await getSigner()
  if (!signer) {
    throw new Error('No signer available')
  }
  return new PayrollService(signer)
}
