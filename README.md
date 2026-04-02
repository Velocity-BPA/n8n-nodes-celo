# n8n-nodes-celo

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

This n8n community node provides comprehensive integration with the Celo blockchain platform, featuring 7 resources for account management, transaction processing, block exploration, validator operations, governance participation, stablecoin interactions, and identity verification. It enables developers to build powerful automation workflows that interact with Celo's mobile-first blockchain ecosystem and dual-token economy.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Celo](https://img.shields.io/badge/Celo-Mainnet-green)
![Blockchain](https://img.shields.io/badge/Blockchain-Ready-orange)
![DeFi](https://img.shields.io/badge/DeFi-Enabled-purple)

## Features

- **Account Management** - Query account balances, transaction history, and account details across Celo addresses
- **Transaction Processing** - Send payments, execute smart contracts, and monitor transaction status on Celo network
- **Block Exploration** - Retrieve block data, analyze network activity, and track blockchain metrics
- **Validator Operations** - Monitor validator performance, voting power, and delegation status
- **Governance Integration** - Participate in proposals, vote on network upgrades, and track governance activities
- **StableCoin Support** - Interact with cUSD, cEUR, and other Celo stablecoins for payments and transfers
- **Identity Verification** - Manage attestations, verify phone numbers, and handle identity claims on Celo
- **Real-time Monitoring** - Track network events, price feeds, and blockchain activity with automated triggers

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
| API Key | Your Celo node API key or service provider key | Yes |
| Network | Target network (mainnet, alfajores, baklava) | Yes |
| Node URL | Custom Celo node endpoint (optional) | No |
| Private Key | Private key for transaction signing (encrypted) | No |

## Resources & Operations

### 1. Account

| Operation | Description |
|-----------|-------------|
| Get Balance | Retrieve CELO and stablecoin balances for an address |
| Get Transaction History | Fetch transaction history for an account |
| Get Account Details | Get comprehensive account information |
| Create Account | Generate new Celo account with private key |
| Import Account | Import existing account using private key or mnemonic |

### 2. Transaction

| Operation | Description |
|-----------|-------------|
| Send Payment | Send CELO or stablecoins to another address |
| Get Transaction | Retrieve transaction details by hash |
| Get Receipt | Get transaction receipt and execution status |
| Estimate Gas | Calculate gas costs for transactions |
| Track Transaction | Monitor transaction status until confirmation |
| Batch Transactions | Execute multiple transactions in sequence |

### 3. Block

| Operation | Description |
|-----------|-------------|
| Get Block | Retrieve block information by number or hash |
| Get Latest Block | Get the most recent block on the network |
| Get Block Range | Fetch multiple blocks within a specified range |
| Get Block Transactions | List all transactions in a specific block |
| Monitor New Blocks | Watch for new blocks and trigger workflows |

### 4. Validator

| Operation | Description |
|-----------|-------------|
| Get Validator Info | Retrieve validator details and performance metrics |
| List Active Validators | Get all active validators in the current epoch |
| Get Validator Group | Fetch validator group information and members |
| Check Voting Power | Monitor validator voting power and delegation |
| Get Rewards | Calculate validator rewards and commission |
| Track Performance | Monitor validator uptime and signing performance |

### 5. Governance

| Operation | Description |
|-----------|-------------|
| Get Proposal | Retrieve governance proposal details |
| List Proposals | Fetch all active and historical proposals |
| Vote on Proposal | Cast votes on governance proposals |
| Get Voting History | Track voting history for an address |
| Monitor Governance | Watch for new proposals and voting events |
| Calculate Voting Power | Determine voting power for locked CELO |

### 6. StableCoin

| Operation | Description |
|-----------|-------------|
| Get Price | Retrieve current exchange rates for Celo stablecoins |
| Transfer Stablecoin | Send cUSD, cEUR, or other stable tokens |
| Get Supply Info | Check total supply and circulation of stablecoins |
| Monitor Stability | Track stability mechanism and reserve ratios |
| Exchange Tokens | Convert between CELO and stablecoins |
| Track Price History | Analyze historical price data and trends |

### 7. Identity

| Operation | Description |
|-----------|-------------|
| Get Attestations | Retrieve identity attestations for an address |
| Verify Phone Number | Verify phone number through SMS attestation |
| Create Claim | Generate identity claims and metadata |
| Verify Claim | Validate existing identity claims |
| Get Identity Metadata | Fetch identity information from registry |
| Monitor Attestations | Track new attestations and verifications |

## Usage Examples

```javascript
// Send CELO payment
{
  "resource": "Transaction",
  "operation": "Send Payment",
  "to": "0x742d35cc6634c0532925a3b8d6ac9c7c5cea7073",
  "amount": "10",
  "currency": "CELO",
  "memo": "Payment for services"
}
```

```javascript
// Check validator performance
{
  "resource": "Validator",
  "operation": "Track Performance",
  "validatorAddress": "0x1234567890123456789012345678901234567890",
  "epochRange": 10
}
```

```javascript
// Monitor governance proposal
{
  "resource": "Governance",
  "operation": "Get Proposal",
  "proposalId": "42",
  "includeVotes": true
}
```

```javascript
// Verify phone number attestation
{
  "resource": "Identity",
  "operation": "Verify Phone Number",
  "phoneNumber": "+1234567890",
  "address": "0x742d35cc6634c0532925a3b8d6ac9c7c5cea7073"
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Invalid API Key | Authentication failed with provided credentials | Verify API key and network configuration |
| Insufficient Balance | Account lacks funds for transaction | Check account balance and add funds |
| Network Timeout | Connection to Celo network failed | Retry request or switch to different node |
| Invalid Address | Provided address format is incorrect | Validate address format and checksum |
| Transaction Failed | Transaction execution reverted | Check gas limits, contract state, and parameters |
| Rate Limit Exceeded | Too many requests to API endpoint | Implement request throttling and retry logic |

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