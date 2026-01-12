# Batch Payroll Contract

## Overview
The `BatchPayroll.sol` contract enables businesses to pay multiple staff members in a **single transaction** with **only one wallet approval**, regardless of the number of employees.

## Key Benefits
✅ **One approval for unlimited staff** - No more approving each individual payment  
✅ **Single transaction** - All payments execute together  
✅ **Gas efficient** - Saves gas costs for large payrolls  
✅ **Secure** - Uses standard ERC20 `transferFrom` pattern  
✅ **Emergency recovery** - Owner can recover stuck tokens  

## How It Works

### Traditional Approach (Current)
```
For 100 staff:
1. Approve payment 1 → Sign
2. Approve payment 2 → Sign
3. Approve payment 3 → Sign
...
100. Approve payment 100 → Sign
= 100 wallet confirmations 😫
```

### Batch Contract Approach (New)
```
For 100 staff:
1. Approve contract to spend total amount → Sign (one time)
2. Execute batch payroll → Sign
= 2 wallet confirmations total 🎉
```

After initial approval, subsequent payrolls only need **1 signature**!

## Deployment Instructions

### Step 1: Deploy via Remix IDE
1. Visit [Remix IDE](https://remix.ethereum.org)
2. Create new file: `BatchPayroll.sol`
3. Copy contents from `contracts/BatchPayroll.sol`
4. Compile with Solidity `^0.8.20`
5. Connect MetaMask to **Arc Testnet**:
   - Network: Arc Testnet
   - RPC: https://rpc.testnet.arc.network
   - Chain ID: 5042002
   - Currency: USDC
6. Deploy the contract
7. **Copy the deployed contract address**

### Step 2: Update App Configuration
Open `src/config/contracts.js` and add your deployed address:

```javascript
export const CONTRACTS = {
  // ... other contracts
  BATCH_PAYROLL: '0xYourDeployedContractAddress', // Add here
}
```

### Step 3: Test the Integration
1. Restart your dev server
2. Go to business dashboard
3. Select multiple staff
4. Click "Run Payroll"
5. You should see:
   - First time: 2 approvals (approve contract + execute)
   - Subsequent times: 1 approval (execute only)

## Contract Functions

### `executeBatchPayroll(address token, Payment[] payments)`
Executes batch payroll for multiple staff members.

**Parameters:**
- `token`: ERC20 token address (USDC)
- `payments`: Array of `{recipient, amount}` objects

**Process:**
1. Pulls total USDC from employer via `transferFrom`
2. Distributes to each staff member
3. Emits events for tracking

### `emergencyWithdraw(address token)`
Owner-only function to recover stuck tokens.

## Gas Estimates
- Single payment: ~50,000 gas
- 10 staff batch: ~200,000 gas (~20k per staff)
- 100 staff batch: ~1,500,000 gas (~15k per staff)

Batch transfers become more efficient as staff count increases!

## Security Notes
- Contract uses battle-tested ERC20 `transferFrom` pattern
- No funds are stored in the contract (pass-through only)
- Owner can recover stuck tokens in emergencies
- All transfers are atomic (all succeed or all fail)

## Troubleshooting

**"Insufficient allowance" error:**
- The app automatically approves the contract
- If you see this, try running payroll again

**"Transfer failed" error:**
- Ensure you have enough USDC balance
- Check that staff wallet addresses are valid

**Contract not found:**
- Verify `BATCH_PAYROLL` address is set in `contracts.js`
- Ensure contract is deployed to Arc Testnet

## Next Steps
After deployment, the app will automatically:
- Detect the batch contract is available
- Use batch transfers for 2+ staff
- Fall back to individual transfers for single staff
- Handle approvals intelligently
