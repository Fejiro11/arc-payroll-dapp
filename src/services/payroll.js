import { ethers } from 'ethers'
import { CONTRACTS, ERC20_ABI, USYC_TELLER_ABI } from '../config/contracts'

export class PayrollService {
  constructor(signer) {
    this.signer = signer
    this.usdcContract = new ethers.Contract(CONTRACTS.USDC, ERC20_ABI, signer)
    this.usycContract = new ethers.Contract(CONTRACTS.USYC, ERC20_ABI, signer)
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

    // For single staff: check preference and pay accordingly
    if (staffList.length === 1) {
      const staff = staffList[0]
      const salaryWei = ethers.parseUnits(staff.salary.toString(), 6)

      if (staffPreferences[staff.wallet]) {
        // Staff prefers USYC - swap to USYC first, then transfer
        const swapResult = await this.swapUSDCtoUSYC(staff.salary)
        // Transfer the USYC to staff (assuming USYC contract allows transfers)
        const tx = await this.usycContract.transfer(staff.wallet, ethers.parseUnits(swapResult.usycReceived, 6))
        const receipt = await tx.wait()

        return {
          hash: receipt.hash,
          staffPaid: 1,
          totalAmount: ethers.formatUnits(totalUSDC, 6),
          paymentType: 'USYC'
        }
      } else {
        // Regular USDC transfer
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

    // For multiple staff: execute individual transfers sequentially based on preferences
    // This approach is more reliable on Arc network with USDC as gas
    // Sequential execution avoids nonce collisions
    const results = []
    for (const staff of staffList) {
      const salaryWei = ethers.parseUnits(staff.salary.toString(), 6)
      
      if (staffPreferences[staff.wallet]) {
        // Staff prefers USYC - swap and transfer USYC
        const swapResult = await this.swapUSDCtoUSYC(staff.salary)
        const tx = await this.usycContract.transfer(staff.wallet, ethers.parseUnits(swapResult.usycReceived, 6))
        results.push({ receipt: await tx.wait(), type: 'USYC' })
      } else {
        // Regular USDC transfer
        const tx = await this.usdcContract.transfer(staff.wallet, salaryWei)
        results.push({ receipt: await tx.wait(), type: 'USDC' })
      }
    }
    // Count payment types
    const usycCount = results.filter(r => r.type === 'USYC').length
    const usdcCount = results.filter(r => r.type === 'USDC').length

    // Get transaction hash from first receipt
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
