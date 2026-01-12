# Deploy BatchPayroll Contract to Arc Testnet using Foundry

## Prerequisites

1. **Install Foundry** (if not already installed):

```powershell
# On Windows, use WSL or Git Bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

Or download from: https://getfoundry.sh/

## Step 1: Set up environment variables

1. Create a `.env` file in the project root (if it doesn't exist)
2. Add the following variables:

```ini
ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network
PRIVATE_KEY=your_private_key_here
```

3. **Generate a wallet** (if you don't have one):

```bash
cast wallet new
```

Save the private key to your `.env` file.

4. **Fund your wallet** with testnet USDC:
   - Visit: https://faucet.circle.com
   - Select "Arc Testnet"
   - Paste your wallet address
   - Request testnet USDC

## Step 2: Deploy the contract

Run the following command from the project root:

```bash
forge create contracts/BatchPayroll.sol:BatchPayroll \
  --rpc-url $ARC_TESTNET_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```

**On Windows PowerShell**, use:

```powershell
$env:ARC_TESTNET_RPC_URL = "https://rpc.testnet.arc.network"
$env:PRIVATE_KEY = "your_private_key_here"

forge create contracts/BatchPayroll.sol:BatchPayroll --rpc-url $env:ARC_TESTNET_RPC_URL --private-key $env:PRIVATE_KEY --broadcast
```

## Step 3: Save the deployed address

After successful deployment, you'll see output like:

```
Deployer: 0xYourAddress...
Deployed to: 0xContractAddress...
Transaction hash: 0xTxHash...
```

**Copy the "Deployed to" address** and update `src/config/contracts.js`:

```javascript
export const CONTRACTS = {
  // ... other contracts
  BATCH_PAYROLL: '0xYourDeployedContractAddress',
}
```

## Step 4: Verify deployment

Check your transaction on Arc Testnet Explorer:
https://testnet.arcscan.app

Search for your transaction hash or contract address.

## Step 5: Test the contract

You can test calling the contract:

```bash
cast call 0xYourContractAddress "owner()(address)" --rpc-url https://rpc.testnet.arc.network
```

This should return your deployer address.

## Troubleshooting

**"Insufficient funds" error:**
- Make sure your wallet has testnet USDC from the faucet
- USDC is the gas token on Arc

**"Contract creation failed" error:**
- Check that your Solidity version matches (^0.8.20)
- Verify the contract compiles: `forge build`

**Foundry not found:**
- Restart your terminal after installation
- On Windows, use WSL or Git Bash

## Alternative: Deploy via Remix IDE

If you prefer not to use Foundry, you can deploy via Remix:
1. Visit https://remix.ethereum.org
2. Upload `contracts/BatchPayroll.sol`
3. Compile with Solidity 0.8.20+
4. Connect MetaMask to Arc Testnet
5. Deploy and copy the address

See `contracts/DEPLOYMENT.md` for detailed Remix instructions.
