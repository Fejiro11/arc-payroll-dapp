# Arc Payroll DApp

A B2B Payroll DApp on Arc Testnet that enables businesses to pay staff on-chain with privacy-preserving token preferences.

## Features

### Business View (Admin)
- **Wallet Connection**: Connect via Privy as Employer
- **Treasury Management**: Fund treasury with mock USDC
- **Staff Management**: Generate invite codes, approve/delete staff
- **Batch Payroll**: Select staff and run payroll in a single transaction using Multicall3
- **Privacy**: Admin never sees staff token preferences

### Staff View (User)
- **Registration**: Join organization with one-time invite code
- **Employment Status**: View employer, status, and salary
- **USYC Preference**: Privately opt-in to receive salary as USYC (yield-bearing stablecoin)
- **Balance Tracking**: View USDC and USYC balances

## Tech Stack

- **Frontend**: React, Tailwind CSS, Lucide Icons
- **Blockchain**: Arc Testnet (Chain ID: 5042002)
- **Wallet**: Privy SDK
- **Smart Contracts**: ethers.js

## Contract Addresses (Arc Testnet)

| Contract | Address |
|----------|---------|
| USDC | `0x3600000000000000000000000000000000000000` |
| USYC | `0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C` |
| USYC Teller | `0x9fdF14c5B14173D74C08Af27AebFf39240dC105A` |
| Multicall3 | `0xcA11bde05977b3631167028862bE2a173976CA11` |

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure Privy**
   Create a `.env` file:
   ```
   VITE_PRIVY_APP_ID=your-privy-app-id
   ```
   Get your App ID from [Privy Dashboard](https://dashboard.privy.io)

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Fund your wallet**
   Use the [Circle Faucet](https://faucet.circle.com) to get testnet USDC

## Network Configuration

```json
{
  "name": "Arc Testnet",
  "chainId": 5042002,
  "rpcUrl": "https://rpc.testnet.arc.network",
  "currency": "USDC",
  "explorer": "https://testnet.arcscan.app"
}
```

## Usage Flow

### As a Business Owner
1. Connect wallet and set up business name
2. Generate invite codes for staff
3. Approve staff after they register
4. Select staff and click "Run Payroll" to pay

### As a Staff Member
1. Get invite code from employer
2. Connect wallet and enter code
3. Wait for employer approval
4. Toggle USYC preference if desired (private)
5. Receive salary in preferred token

## Key Resources

- [Block Explorer](https://testnet.arcscan.app)
- [USDC Faucet](https://faucet.circle.com)
- [USYC Portal](https://usyc.dev.hashnote.com)
- [Privy Docs](https://docs.privy.io)

## License

MIT
