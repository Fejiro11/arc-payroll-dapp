import { ethers } from 'ethers'
import { CONTRACTS, ERC20_ABI, USYC_TELLER_ABI, BATCH_PAYROLL_ABI } from '../config/contracts'

export class PayrollService {
  constructor(signer) {
    this.signer = signer
    this.usdcContract = new ethers.Contract(CONTRACTS.USDC, ERC20_ABI, signer)
    this.usycContract = new ethers.Contract(CONTRACTS.USYC, ERC20_ABI, signer)
    this.usycTeller = new ethers.Contract(CONTRACTS.USYC_TELLER, USYC_TELLER_ABI, signer)
    this.batchPayroll = CONTRACTS.BATCH_PAYROLL 
      ? new ethers.Contract(CONTRACTS.BATCH_PAYROLL, BATCH_PAYROLL_ABI, signer)
      : null
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
    
    // If batch contract is deployed, use it for efficient batch transfers
    if (this.batchPayroll && staffList.length > 1) {
      return await this.runBatchPayroll(staffList, staffPreferences)
    }
    
    // Fallback to individual transfers for single staff or if contract not deployed
    return await this.runIndividualPayroll(staffList, staffPreferences)
  }

  async runBatchPayroll(staffList, staffPreferences) {
    const signerAddress = await this.signer.getAddress()
    let totalUSDC = 0n

    // Build payment array for batch contract
    const payments = []
    for (const staff of staffList) {
      const salaryWei = ethers.parseUnits(staff.salary.toString(), 6)
      payments.push({
        recipient: staff.wallet,
        amount: salaryWei
      })
      totalUSDC += salaryWei
    }

    // Check current allowance
    const currentAllowance = await this.usdcContract.allowance(signerAddress, CONTRACTS.BATCH_PAYROLL)
    
    // Approve batch contract if needed (only once or when allowance is low)
    if (currentAllowance < totalUSDC) {
      console.log('Approving batch contract to spend USDC...')
      const approveTx = await this.usdcContract.approve(CONTRACTS.BATCH_PAYROLL, totalUSDC)
      await approveTx.wait()
      console.log('Approval confirmed')
    }

    // Execute batch payroll - SINGLE TRANSACTION for all staff!
    console.log(`Executing batch payroll for ${staffList.length} staff...`)
    const tx = await this.batchPayroll.executeBatchPayroll(CONTRACTS.USDC, payments)
    const receipt = await tx.wait()

    return {
      hash: receipt.hash || receipt.transactionHash,
      staffPaid: staffList.length,
      totalAmount: ethers.formatUnits(totalUSDC, 6),
      paymentSummary: `Batch transfer to ${staffList.length} staff`
    }
  }

  async runIndividualPayroll(staffList, staffPreferences) {
    let totalUSDC = 0n

    // Calculate total USDC needed
    for (const staff of staffList) {
      const salaryWei = ethers.parseUnits(staff.salary.toString(), 6)
      totalUSDC += salaryWei
    }

    // For single staff: direct transfer
    if (staffList.length === 1) {
      const staff = staffList[0]
      const salaryWei = ethers.parseUnits(staff.salary.toString(), 6)

      if (staffPreferences[staff.wallet]) {
        const swapResult = await this.swapUSDCtoUSYC(staff.salary)
        const tx = await this.usycContract.transfer(staff.wallet, ethers.parseUnits(swapResult.usycReceived, 6))
        const receipt = await tx.wait()

        return {
          hash: receipt.hash,
          staffPaid: 1,
          totalAmount: ethers.formatUnits(totalUSDC, 6),
          paymentType: 'USYC'
        }
      } else {
        const tx = await this.usdcContract.transfer(staff.wallet, salaryWei)
        const receipt = await tx.wait()

        return {
          hash: receipt.hash,
          staffPaid: 1,
          totalAmount: ethers.formatUnits(totalUSDC, 6),
          paymentType: 'USDC'
        }
      }
    }

    // For multiple staff without batch contract: sequential transfers
    const results = []
    for (const staff of staffList) {
      const salaryWei = ethers.parseUnits(staff.salary.toString(), 6)
      
      if (staffPreferences[staff.wallet]) {
        const swapResult = await this.swapUSDCtoUSYC(staff.salary)
        const tx = await this.usycContract.transfer(staff.wallet, ethers.parseUnits(swapResult.usycReceived, 6))
        results.push({ receipt: await tx.wait(), type: 'USYC' })
      } else {
        const tx = await this.usdcContract.transfer(staff.wallet, salaryWei)
        results.push({ receipt: await tx.wait(), type: 'USDC' })
      }
    }

    const usycCount = results.filter(r => r.type === 'USYC').length
    const usdcCount = results.filter(r => r.type === 'USDC').length
    const firstReceipt = results[0]?.receipt
    const txHash = firstReceipt?.hash || firstReceipt?.transactionHash || '0x'

    return {
      hash: txHash,
      staffPaid: staffList.length,
      totalAmount: ethers.formatUnits(totalUSDC, 6),
      paymentSummary: `${usdcCount} USDC, ${usycCount} USYC`
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
