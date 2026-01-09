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
    const signerAddress = await this.signer.getAddress()
    let totalUSDC = 0n

    // Calculate total USDC needed
    for (const staff of staffList) {
      const salaryWei = ethers.parseUnits(staff.salary.toString(), 6)
      totalUSDC += salaryWei
    }

    // For single staff: use direct transfer (simpler, less gas)
    if (staffList.length === 1) {
      const staff = staffList[0]
      const salaryWei = ethers.parseUnits(staff.salary.toString(), 6)
      
      const tx = await this.usdcContract.transfer(staff.wallet, salaryWei)
      const receipt = await tx.wait()

      return {
        hash: receipt.hash,
        staffPaid: 1,
        totalAmount: ethers.formatUnits(totalUSDC, 6)
      }
    }

    // For multiple staff: use Multicall3 with transferFrom for batch efficiency
    const iface = new ethers.Interface(ERC20_ABI)
    const calls = []

    // Build batch transfer calls using transferFrom
    for (const staff of staffList) {
      const salaryWei = ethers.parseUnits(staff.salary.toString(), 6)
      
      calls.push({
        target: CONTRACTS.USDC,
        allowFailure: false,
        callData: iface.encodeFunctionData('transferFrom', [signerAddress, staff.wallet, salaryWei])
      })
    }

    // Approve Multicall3 to spend USDC (for transferFrom to work)
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
