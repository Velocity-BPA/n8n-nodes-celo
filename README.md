# n8n-nodes-celo

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

This n8n community node provides comprehensive integration with the Celo blockchain platform, featuring 6 essential resources including Accounts, StableTokens, Identity, ValidatorStaking, Governance, and Exchange. Build powerful DeFi workflows, manage mobile-first financial applications, and interact with Celo's carbon-negative blockchain ecosystem directly from your n8n automation workflows.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Celo](https://img.shields.io/badge/Celo-Blockchain-green)
![DeFi](https://img.shields.io/badge/DeFi-Compatible-yellow)
![Mobile First](https://img.shields.io/badge/Mobile-First-purple)

## Features

- **Account Management** - Create, query, and manage Celo accounts with balance tracking and transaction history
- **StableToken Operations** - Handle cUSD, cEUR, and cREAL stablecoin transfers, minting, and burning operations
- **Identity Verification** - Manage on-chain identity attestations, phone number verification, and reputation scoring
- **Validator Staking** - Interact with Celo's proof-of-stake consensus including delegation, rewards, and governance participation
- **Governance Integration** - Submit proposals, vote on protocol changes, and track governance activity
- **Exchange Operations** - Execute token swaps, provide liquidity, and access DEX functionality on Celo
- **Mobile-Optimized** - Built for Celo's mobile-first approach with lightweight operations and efficient gas usage
- **Carbon Negative** - Leverage Celo's carbon-negative blockchain for environmentally conscious DeFi applications

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-celo`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-celo
```

### Development Installation

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-celo.git
cd n8n-nodes-celo
npm install
npm run build
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-celo
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| API Key | Your Celo API key for authentication | Yes |
| Network | Celo network (mainnet, alfajores, baklava) | Yes |
| RPC URL | Custom RPC endpoint URL (optional) | No |
| Private Key | Account private key for transaction signing | No |
| Testnet Mode | Enable for development and testing | No |

## Resources & Operations

### 1. Accounts

| Operation | Description |
|-----------|-------------|
| Get Account | Retrieve account details including balances and metadata |
| Create Account | Generate new Celo account with private/public key pair |
| Get Balance | Check CELO and stablecoin balances for specific account |
| Get Transaction History | Fetch historical transactions for an account |
| Send Transaction | Execute CELO transfers between accounts |
| Estimate Gas | Calculate gas costs for pending transactions |

### 2. StableTokens

| Operation | Description |
|-----------|-------------|
| Transfer | Send cUSD, cEUR, or cREAL between accounts |
| Get Balance | Check stablecoin balances across all denominations |
| Mint | Create new stablecoin tokens (authorized accounts only) |
| Burn | Destroy stablecoin tokens to maintain price stability |
| Get Total Supply | Retrieve total supply for each stablecoin |
| Get Exchange Rate | Fetch current exchange rates between stablecoins |

### 3. Identity

| Operation | Description |
|-----------|-------------|
| Verify Phone | Initiate phone number verification process |
| Get Attestations | Retrieve identity attestations for an account |
| Request Attestation | Request new identity verification from validators |
| Complete Attestation | Finalize attestation process with verification code |
| Get Reputation Score | Calculate reputation based on verified attestations |
| Revoke Attestation | Remove previously issued attestation |

### 4. ValidatorStaking

| Operation | Description |
|-----------|-------------|
| Get Validators | List all registered validators with performance metrics |
| Delegate Stake | Delegate CELO tokens to validator for staking rewards |
| Undelegate Stake | Remove delegated stake from validator |
| Claim Rewards | Collect accumulated staking rewards |
| Get Delegation | Check delegation status and reward amounts |
| Register Validator | Register new validator node (requires minimum stake) |

### 5. Governance

| Operation | Description |
|-----------|-------------|
| Get Proposals | List all governance proposals with status and details |
| Submit Proposal | Create new governance proposal for protocol changes |
| Vote | Cast vote on active governance proposals |
| Get Votes | Retrieve voting history and results |
| Execute Proposal | Execute approved governance proposal |
| Get Voter Info | Check voting power and participation history |

### 6. Exchange

| Operation | Description |
|-----------|-------------|
| Swap Tokens | Exchange between CELO and stablecoins |
| Get Quote | Calculate swap rates and fees |
| Add Liquidity | Provide liquidity to exchange pools |
| Remove Liquidity | Withdraw liquidity and collect fees |
| Get Pool Info | Retrieve liquidity pool statistics |
| Get Trading History | Fetch historical trades and volume data |

## Usage Examples

```javascript
// Transfer cUSD stablecoins
{
  "resource": "StableTokens",
  "operation": "Transfer",
  "to": "0x742d35Cc6634C0532925a3b8D400e9024C4d45e4",
  "amount": "100.50",
  "token": "cUSD",
  "memo": "Payment for services"
}
```

```javascript
// Delegate CELO to validator
{
  "resource": "ValidatorStaking",
  "operation": "Delegate Stake",
  "validator": "0x8b7649116f169d2d2aebb6ea1a77f0bfb97e1285",
  "amount": "1000",
  "lockupPeriod": "180"
}
```

```javascript
// Vote on governance proposal
{
  "resource": "Governance",
  "operation": "Vote",
  "proposalId": "42",
  "vote": "Yes",
  "weight": "500.75"
}
```

```javascript
// Verify phone number for identity
{
  "resource": "Identity",
  "operation": "Verify Phone",
  "phoneNumber": "+1234567890",
  "account": "0x742d35Cc6634C0532925a3b8D400e9024C4d45e4"
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Insufficient Balance | Account lacks funds for transaction | Check account balance and add funds |
| Invalid Network | Network parameter not recognized | Use mainnet, alfajores, or baklava |
| Gas Estimation Failed | Cannot calculate transaction gas costs | Check network connectivity and try again |
| Attestation Expired | Identity verification code expired | Request new attestation code |
| Proposal Not Found | Governance proposal ID invalid | Verify proposal exists and is active |
| Validator Inactive | Selected validator not accepting delegations | Choose different active validator |

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Documentation is updated for new features
5. Commit messages are descriptive

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-celo/issues)
- **Celo Documentation**: [docs.celo.org](https://docs.celo.org)
- **Celo Community**: [forum.celo.org](https://forum.celo.org)