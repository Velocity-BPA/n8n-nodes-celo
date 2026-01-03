# n8n-nodes-celo

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for interacting with the Celo blockchain. Celo is a mobile-first, EVM-compatible blockchain focused on financial inclusion, featuring phone number identity mapping, multiple stablecoins (cUSD, cEUR, cREAL), ultra-low transaction fees, and unique features like paying gas fees in stablecoins.

![n8n](https://img.shields.io/badge/n8n-community--node-orange)
![Celo](https://img.shields.io/badge/blockchain-Celo-35D07F)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)

## Features

- **12 Resource Categories** with 60+ operations for complete Celo blockchain interaction
- **Multi-Stablecoin Support**: cUSD, cEUR, and cREAL operations
- **Phone Number Identity**: Look up addresses by phone number hash
- **Fee Currency**: Pay gas fees in stablecoins instead of CELO
- **Staking & Governance**: Full validator election and governance participation
- **Mento Exchange**: Swap between CELO and stablecoins
- **Multi-Network**: Support for Mainnet, Alfajores (testnet), and Baklava
- **Poll-Based Triggers**: 6 event types for workflow automation
- **HTTP-Only**: No external SDK dependencies required

## Installation

### Community Nodes (Recommended)

1. Open your n8n instance
2. Go to **Settings** > **Community Nodes**
3. Click **Install**
4. Enter `n8n-nodes-celo`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n installation directory
cd ~/.n8n

# Install the package
npm install n8n-nodes-celo
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-celo.git
cd n8n-nodes-celo

# Install dependencies
npm install

# Build the project
npm run build

# Link to n8n
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-celo

# Restart n8n
n8n start
```

## Credentials Setup

### Celo API Credentials

| Field | Description | Required |
|-------|-------------|----------|
| Network | Celo network (Mainnet/Alfajores/Baklava/Custom) | Yes |
| RPC Endpoint | JSON-RPC endpoint URL | Yes (auto-filled by network) |
| Private Key | Account private key for transactions | No |
| Celoscan API Key | API key for enhanced explorer features | No |

#### Default RPC Endpoints

| Network | RPC URL | Chain ID |
|---------|---------|----------|
| Mainnet | https://forno.celo.org | 42220 |
| Alfajores | https://alfajores-forno.celo-testnet.org | 44787 |
| Baklava | https://baklava-forno.celo-testnet.org | 62320 |

## Resources & Operations

### Accounts
| Operation | Description |
|-----------|-------------|
| Get Balance | Get CELO balance for an address |
| Get Stable Balance | Get cUSD/cEUR/cREAL balance |
| Get All Balances | Get all token balances at once |
| Get Transaction History | Retrieve account transactions |
| Get Token Transfers | Get ERC20 transfer history |
| Get Phone Number Mapping | Look up identity attestations |

### Transactions
| Operation | Description |
|-----------|-------------|
| Get Transaction | Get transaction details by hash |
| Get Transaction Receipt | Get transaction receipt with logs |
| Send Transaction | Submit a signed transaction |
| Send Stable Payment | Pay using stablecoins with fee currency |
| Estimate Gas | Estimate gas for a transaction |
| Get Fee Currency | Get supported fee payment tokens |

### Identity (Attestations)
| Operation | Description |
|-----------|-------------|
| Lookup Identifier | Find addresses by phone hash |
| Get Attestations | Get identity proofs for address |
| Get Verified Addresses | Get addresses for identifier |
| Request Attestation | Start verification process |
| Complete Attestation | Finish verification |

### Stablecoins (Mento)
| Operation | Description |
|-----------|-------------|
| Get Exchange Rate | Get CELO/stablecoin exchange rate |
| Exchange | Swap CELO ↔ stablecoin |
| Get Bucket Sizes | Get reserve bucket information |
| Get Spread | Get trading spread |
| Get Reserve Ratio | Get backing ratio |

### Staking (Election)
| Operation | Description |
|-----------|-------------|
| Get Validators | Get active validators |
| Get Validator Groups | Get validator groups |
| Get Votes | Get vote distribution |
| Vote For Group | Cast vote for validator group |
| Revoke Votes | Remove votes from a group |
| Get Pending Votes | Get votes in-flight |
| Get Rewards | Get staking rewards |
| Activate Votes | Activate after lockup |

### Locked CELO
| Operation | Description |
|-----------|-------------|
| Get Locked Balance | Get locked CELO amount |
| Lock CELO | Create a new lock |
| Unlock CELO | Request unlock |
| Withdraw | Withdraw after unlock period |
| Get Pending Withdrawals | Get queued withdrawals |

### Governance
| Operation | Description |
|-----------|-------------|
| Get Proposals | Get active governance proposals |
| Get Proposal | Get single proposal details |
| Vote On Proposal | Cast governance vote |
| Get Vote Record | Get voting history |
| Get Constitution | Get governance parameters |

### Reserve
| Operation | Description |
|-----------|-------------|
| Get Reserve Balance | Get multi-asset reserve balance |
| Get Reserve Ratio | Get reserve health metrics |
| Get Reserve Assets | Get reserve composition |
| Get Tobins Tax | Get trading fee rate |

### Smart Contracts
| Operation | Description |
|-----------|-------------|
| Read Contract | Call view/pure functions |
| Write Contract | Send transaction to contract |
| Get Contract Events | Get event logs |

### Tokens
| Operation | Description |
|-----------|-------------|
| Get Token Info | Get ERC20 token details |
| Get Token Holders | Get holder list (requires Celoscan) |
| Get Token Transfers | Get transfer history |

### Network
| Operation | Description |
|-----------|-------------|
| Get Epoch Info | Get current epoch details |
| Get Gas Price | Get current gas price |
| Get Network Stats | Get chain metrics |
| Get Elected Validators | Get current validator set |

### Utility
| Operation | Description |
|-----------|-------------|
| Convert Units | CELO/Wei conversion |
| Hash Identifier | Create phone number hash |
| Get Fee Currency Options | Get tokens for gas payment |
| Get API Health | Check service status |

## Trigger Node

The Celo Trigger node provides poll-based event monitoring:

| Trigger | Description |
|---------|-------------|
| New Transaction To Address | Monitor address for incoming transactions |
| Token Transfer | Track ERC20 token transfers |
| Governance Proposal | New proposal created |
| Validator Election | Epoch changes and elections |
| Staking Reward | Reward distribution events |
| Stablecoin Exchange | Mento exchange events |

### Trigger Configuration

| Field | Description | Default |
|-------|-------------|---------|
| Poll Interval | How often to check for events | 60 seconds |
| Address | Address to monitor | Required |
| Token Address | Token to track (for token transfer) | Optional |
| Start Block | Block to start from | Latest |

## Usage Examples

### Get Account Balances

```javascript
// Workflow: Get all balances for an address
// Node: Celo
// Resource: Accounts
// Operation: Get All Balances
// Address: 0x...

// Returns:
{
  "celo": "10.5",
  "cusd": "100.25",
  "ceur": "50.0",
  "creal": "0"
}
```

### Look Up Phone Number

```javascript
// Workflow: Find address by phone number
// Node: Celo
// Resource: Identity
// Operation: Lookup Identifier
// Phone Number: +1234567890
// Country Code: US

// Returns addresses associated with the phone number
```

### Exchange CELO for cUSD

```javascript
// Workflow: Swap CELO to stablecoin
// Node: Celo
// Resource: Stablecoins
// Operation: Exchange
// From: CELO
// To: cUSD
// Amount: 10

// Returns exchange transaction details
```

### Monitor Incoming Transactions

```javascript
// Workflow: Trigger on new transactions
// Node: Celo Trigger
// Event: New Transaction To Address
// Address: 0x...
// Poll Interval: 30 seconds

// Triggers workflow when new transactions arrive
```

## Celo Concepts

| Concept | Description |
|---------|-------------|
| **CELO** | Native staking and governance token |
| **cUSD/cEUR/cREAL** | Mento algorithmic stablecoins pegged to USD, EUR, BRL |
| **Mento** | Stability mechanism for Celo stablecoins |
| **Attestation** | Phone number identity proof via decentralized verification |
| **Epoch** | Validator election period (~1 day) |
| **Validator Group** | Collective of up to 5 validators |
| **Locked CELO** | CELO locked for staking/governance participation |
| **Reserve** | Multi-asset backing for stablecoins |
| **Forno** | Celo's public RPC service |
| **Fee Currency** | Pay gas in stablecoins instead of CELO |

## Networks

| Network | Purpose | Explorer |
|---------|---------|----------|
| **Mainnet** | Production network | https://celoscan.io |
| **Alfajores** | Primary testnet | https://alfajores.celoscan.io |
| **Baklava** | Validator testing | https://baklava.celoscan.io |

### Getting Test CELO

1. Visit the [Alfajores Faucet](https://faucet.celo.org)
2. Enter your address
3. Receive test CELO and stablecoins

## Error Handling

The node provides descriptive error messages:

| Error | Cause | Solution |
|-------|-------|----------|
| Invalid address | Malformed Ethereum address | Check address format (0x + 40 hex chars) |
| Insufficient balance | Not enough tokens | Check balance before transaction |
| RPC error | Network connectivity | Verify RPC endpoint and network |
| Private key required | Missing credentials | Add private key for write operations |

## Security Best Practices

1. **Never share private keys** - Use environment variables or n8n credentials
2. **Use testnets first** - Test on Alfajores before mainnet
3. **Validate addresses** - Double-check recipient addresses
4. **Monitor transactions** - Use triggers to track activity
5. **Limit permissions** - Use separate accounts for automation

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix lint issues
npm run lint:fix

# Watch mode for development
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
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code:
- Passes all tests
- Follows the existing code style
- Includes appropriate documentation
- Maintains BSL 1.1 licensing

## Support

- **Documentation**: [Celo Docs](https://docs.celo.org)
- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-celo/issues)
- **n8n Community**: [n8n Community Forum](https://community.n8n.io)

## Acknowledgments

- [Celo Foundation](https://celo.org) for the blockchain platform
- [n8n](https://n8n.io) for the workflow automation platform
- [Celoscan](https://celoscan.io) for the block explorer API
