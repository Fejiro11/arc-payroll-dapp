# BatchPayroll Contract Deployment Guide

## Quick Deployment using Remix IDE

### Step 1: Compile the Contract
1. Go to [Remix IDE](https://remix.ethereum.org)
2. Create a new file called `BatchPayroll.sol`
3. Copy the contents from `contracts/BatchPayroll.sol`
4. Go to the "Solidity Compiler" tab
5. Select compiler version `0.8.20` or higher
6. Click "Compile BatchPayroll.sol"

### Step 2: Deploy to Arc Testnet
1. Go to the "Deploy & Run Transactions" tab
2. In "Environment", select "Injected Provider - MetaMask"
3. Make sure your wallet is connected to Arc Testnet:
   - Network Name: Arc Testnet
   - RPC URL: https://rpc.testnet.arc.network
   - Chain ID: 5042002
   - Currency Symbol: USDC
   - Block Explorer: https://testnet.arcscan.app

4. Click "Deploy"
5. Confirm the transaction in your wallet
6. **Copy the deployed contract address**

### Step 3: Update the App Configuration
1. Open `src/config/contracts.js`
2. Add the deployed contract address:
   ```javascript
   BATCH_PAYROLL: 'YOUR_DEPLOYED_CONTRACT_ADDRESS'
   ```
3. The ABI is already included in the config file

### Step 4: Verify Contract (Optional)
1. Go to https://testnet.arcscan.app
2. Search for your contract address
3. Click "Verify & Publish"
4. Upload the contract source code

## Contract Features
- ✅ Single transaction for multiple payments
- ✅ Only one wallet approval needed
- ✅ Gas efficient for large batches
- ✅ Emergency withdraw function for stuck tokens
- ✅ Event emissions for tracking

## Security Notes
- The contract uses `transferFrom` to pull tokens from your wallet
- You must approve the contract to spend your USDC before running payroll
- The approval only needs to be done once (or when you need more allowance)
