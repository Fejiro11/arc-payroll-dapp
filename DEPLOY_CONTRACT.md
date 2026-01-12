# Deploy BatchPayroll Contract to Arc Testnet

This guide walks you through deploying the BatchPayroll smart contract to Arc Testnet using Foundry.

## Why Deploy This Contract?

The BatchPayroll contract solves the **multiple wallet approval problem**:
- **Before:** 100 staff = 100 wallet confirmations 😫
- **After:** 100 staff = 1 wallet confirmation 🎉

## Quick Start (Recommended)

### Option 1: Using Foundry (Command Line)

#### 1. Install Foundry

**On Windows (PowerShell as Administrator):**
```powershell
# Install using the official installer
irm https://foundry.paradigm.xyz | iex
foundryup
```

**On macOS/Linux:**
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

Restart your terminal after installation.

#### 2. Generate a Deployment Wallet

```bash
cast wallet new
```

You'll see output like:
```
Successfully created new keypair.
Address:     0xB815A0c4bC23930119324d4359dB65e27A846A2d
Private key: 0xcc1b30a6af68ea9a9917f1dd...
```

**⚠️ IMPORTANT:** Save your private key securely!

#### 3. Fund Your Wallet

1. Visit https://faucet.circle.com
2. Select **Arc Testnet**
3. Paste your wallet address
4. Request testnet USDC (Arc's gas token)

#### 4. Deploy the Contract

**On Windows PowerShell:**
```powershell
forge create contracts/BatchPayroll.sol:BatchPayroll `
  --rpc-url https://rpc.testnet.arc.network `
  --private-key YOUR_PRIVATE_KEY_HERE `
  --broadcast
```

**On macOS/Linux/Git Bash:**
```bash
forge create contracts/BatchPayroll.sol:BatchPayroll \
  --rpc-url https://rpc.testnet.arc.network \
  --private-key YOUR_PRIVATE_KEY_HERE \
  --broadcast
```

Replace `YOUR_PRIVATE_KEY_HERE` with your actual private key.

#### 5. Save the Contract Address

After successful deployment, you'll see:
```
Deployer: 0xYourAddress...
Deployed to: 0x1234567890abcdef...  ← COPY THIS!
Transaction hash: 0xabc123...
```

**Copy the "Deployed to" address!**

#### 6. Update Your App

Open `src/config/contracts.js` and update:

```javascript
export const CONTRACTS = {
  USDC: '0x3600000000000000000000000000000000000000',
  USYC: '0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C',
  USYC_TELLER: '0x9fdF14c5B14173D74C08Af27AebFf39240dC105A',
  USYC_ENTITLEMENTS: '0xcc205224862c7641930c87679e98999d23c26113',
  MULTICALL3: '0xcA11bde05977b3631167028862bE2a173976CA11',
  PERMIT2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  BATCH_PAYROLL: '0x1234567890abcdef...', // ← PASTE YOUR ADDRESS HERE
}
```

#### 7. Restart Your Dev Server

```bash
npm run dev
```

### Option 2: Using Remix IDE (Browser-Based)

If you prefer not to use command line tools:

1. Visit https://remix.ethereum.org
2. Create new file: `BatchPayroll.sol`
3. Copy contents from `contracts/BatchPayroll.sol`
4. Compile with Solidity `^0.8.20`
5. Connect MetaMask to Arc Testnet:
   - Network: Arc Testnet
   - RPC: https://rpc.testnet.arc.network
   - Chain ID: 5042002
   - Currency: USDC
6. Deploy the contract
7. Copy the deployed address
8. Update `src/config/contracts.js` as shown above

## Verify Your Deployment

1. Visit https://testnet.arcscan.app
2. Search for your contract address
3. You should see the deployment transaction

## Test the Integration

1. Go to your business dashboard
2. Select 2 or more staff members
3. Click "Run Payroll"
4. You should now see:
   - **First time:** 2 approvals (approve contract + execute batch)
   - **Subsequent times:** 1 approval only! 🎉

## Troubleshooting

### "Insufficient funds" error
- Make sure you funded your wallet with testnet USDC from https://faucet.circle.com
- USDC is the gas token on Arc, not ETH

### "forge: command not found"
- Restart your terminal after installing Foundry
- On Windows, make sure you ran PowerShell as Administrator

### Contract not being used by app
- Verify the address in `src/config/contracts.js` is correct
- Make sure you restarted your dev server after updating the config
- Check browser console for any errors

### Still seeing multiple approvals
- The batch contract only works for 2+ staff
- For single staff, it uses direct transfer (1 approval)
- Make sure `BATCH_PAYROLL` address is set in config

## What Happens After Deployment?

Once deployed and configured, your app will:
1. **Automatically detect** the batch contract is available
2. **Use batch transfers** for 2+ staff (1 approval)
3. **Fall back** to individual transfers for single staff
4. **Handle approvals** intelligently (checks allowance first)

## Security Notes

- ✅ Contract uses standard ERC20 `transferFrom` pattern
- ✅ No funds stored in contract (pass-through only)
- ✅ Owner can recover stuck tokens (emergency only)
- ✅ All transfers are atomic (all succeed or all fail)

## Need Help?

- Check Arc documentation: https://docs.arc.network
- View contract source: `contracts/BatchPayroll.sol`
- See detailed guides: `contracts/README.md`
