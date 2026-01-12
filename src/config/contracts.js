export const CONTRACTS = {
  USDC: '0x3600000000000000000000000000000000000000',
  USYC: '0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C',
  USYC_TELLER: '0x9fdF14c5B14173D74C08Af27AebFf39240dC105A',
  USYC_ENTITLEMENTS: '0xcc205224862c7641930c87679e98999d23c26113',
  MULTICALL3: '0xcA11bde05977b3631167028862bE2a173976CA11',
  PERMIT2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  BATCH_PAYROLL: '0xB68fb9aeDAA39eE39Fa4EC15ce9BbD757DF50d32',
}

export const ARC_TESTNET = {
  chainId: 5042002,
  name: 'Arc Testnet',
  rpcUrl: 'https://rpc.testnet.arc.network',
  currency: 'USDC',
  explorer: 'https://testnet.arcscan.app',
}

export const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
]

export const MULTICALL3_ABI = [
  'function aggregate3(tuple(address target, bool allowFailure, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[])',
]

export const USYC_TELLER_ABI = [
  'function deposit(uint256 depositAmount, uint256 minimumMint) external returns (uint256 shares)',
  'function previewDeposit(uint256 assets) external view returns (uint256)',
]

export const BATCH_PAYROLL_ABI = [
  'function executeBatchPayroll(address token, tuple(address recipient, uint256 amount)[] payments) external',
  'function emergencyWithdraw(address token) external',
  'event PayrollExecuted(address indexed employer, uint256 staffCount, uint256 totalAmount)',
  'event PaymentSent(address indexed recipient, uint256 amount)',
]
