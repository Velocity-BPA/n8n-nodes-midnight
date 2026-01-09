# n8n-nodes-midnight

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for the **Midnight blockchain** - a privacy-first network built on zero-knowledge cryptography. This node provides 7 resources and 25+ operations for querying blocks, transactions, contracts, chain state, network information, DUST tokens, and zero-knowledge proofs. Includes real-time WebSocket triggers for blockchain events.

![n8n](https://img.shields.io/badge/n8n-community--node-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)

## Features

- **Block Operations**: Query blocks by hash, height, or list recent blocks
- **Transaction Operations**: Get transaction details, status, and list transactions
- **Contract Operations**: Query smart contracts, their state, and action history
- **Chain Operations**: Get chain info, state, and properties
- **Network Operations**: Monitor node health, peers, and sync status
- **DUST Token Operations**: Check DUST generation and registration status
- **Proof Operations**: Query zero-knowledge proof status and history
- **Real-time Triggers**: Subscribe to new blocks, finalized blocks, and contract actions
- **Multi-network Support**: Testnet, Mainnet, and custom network configurations

## Installation

### Community Nodes (Recommended)

1. Go to **Settings** > **Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-midnight`
4. Accept the risks and install

### Manual Installation

```bash
# Navigate to your n8n installation directory
cd ~/.n8n

# Install the package
npm install n8n-nodes-midnight

# Restart n8n
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-midnight.git
cd n8n-nodes-midnight

# Install dependencies
npm install

# Build the project
npm run build

# Create symlink to n8n custom nodes
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-midnight

# Restart n8n
n8n start
```

## Credentials Setup

The Midnight node supports three network configurations:

| Setting | Description |
|---------|-------------|
| **Network** | Select Testnet, Mainnet, or Custom |
| **Indexer URL** | GraphQL endpoint for querying blockchain data |
| **RPC URL** | WebSocket endpoint for real-time subscriptions |
| **API Key** | Optional API key for private/enterprise deployments |

### Default Endpoints

| Network | Indexer URL | RPC URL |
|---------|-------------|---------|
| Testnet | `https://indexer.testnet-02.midnight.network/api/v3/graphql` | `wss://rpc.testnet-02.midnight.network` |
| Mainnet | `https://indexer.midnight.network/api/v3/graphql` | `wss://rpc.midnight.network` |

## Resources & Operations

### Block

| Operation | Description |
|-----------|-------------|
| Get by Hash | Retrieve a block by its hash |
| Get by Height | Retrieve a block by its height |
| Get Latest | Get the most recent block |
| Get Finalized | Get the latest finalized block |
| List | List recent blocks with pagination |

### Transaction

| Operation | Description |
|-----------|-------------|
| Get | Get transaction details by hash |
| Get Status | Check transaction status and confirmations |
| List | List recent transactions |
| List by Block | List all transactions in a specific block |

### Contract

| Operation | Description |
|-----------|-------------|
| Get | Get contract details by address |
| Get Actions | Get contract action history |
| Get State | Query contract state (optionally by key) |
| List | List deployed contracts |

### Chain

| Operation | Description |
|-----------|-------------|
| Get Info | Get chain name, genesis hash, heights |
| Get State | Get current chain header via RPC |
| Get Properties | Get token symbol, decimals, format |

### Network

| Operation | Description |
|-----------|-------------|
| Get Status | Check node health and sync status |
| Get Peers | List connected peers |
| Get Sync State | Get sync progress and target height |
| Get Version | Get node software version |

### DUST

| Operation | Description |
|-----------|-------------|
| Get Generation Status | Check DUST generation for a stake key |
| Get Registration Status | Check registration status for a stake key |

### Proof

| Operation | Description |
|-----------|-------------|
| Get Status | Get ZK proof verification status |
| List by Contract | List proofs for a specific contract |

## Trigger Node

The Midnight Trigger node provides real-time event subscriptions:

| Event | Description |
|-------|-------------|
| New Block | Triggers on every new block |
| New Block from Height | Triggers on blocks starting from a specific height |
| Finalized Block | Triggers when blocks are finalized |
| Contract Action | Triggers on actions for a specific contract |
| New Head (RPC) | Triggers on new block headers via JSON-RPC |
| Finalized Heads (RPC) | Triggers on finalized headers via JSON-RPC |

### Trigger Options

- **Reconnect on Error**: Automatically reconnect on connection errors
- **Max Reconnect Attempts**: Maximum number of reconnection attempts (default: 5)

## Usage Examples

### Get Latest Block

```json
{
  "nodes": [
    {
      "name": "Midnight",
      "type": "n8n-nodes-midnight.midnight",
      "parameters": {
        "resource": "block",
        "operation": "getLatest"
      }
    }
  ]
}
```

### Monitor Contract Actions

```json
{
  "nodes": [
    {
      "name": "Midnight Trigger",
      "type": "n8n-nodes-midnight.midnightTrigger",
      "parameters": {
        "event": "contractAction",
        "contractAddress": "0x..."
      }
    }
  ]
}
```

## Midnight Concepts

### Zero-Knowledge Proofs
Midnight uses ZK cryptography to enable "rational privacy" - verifying correctness without revealing sensitive data.

### DUST Token
DUST is Midnight's shielded token, generated by staking NIGHT tokens on Cardano.

### Compact Language
Midnight smart contracts are written in Compact, a TypeScript-based language designed for privacy-preserving applications.

### Partner Chain
Midnight operates as a partner chain to Cardano, sharing security while providing privacy features.

## Networks

| Network | Status | Description |
|---------|--------|-------------|
| Testnet | Active | Development and testing |
| Mainnet | Active | Production network |

## Error Handling

The node includes comprehensive error handling:

- **GraphQL Errors**: Properly parsed and displayed with field paths
- **RPC Errors**: Standard JSON-RPC error codes mapped to readable messages
- **Connection Errors**: Automatic reconnection for WebSocket subscriptions
- **Validation Errors**: Input validation with helpful error messages

### Common Error Codes

| Code | Description |
|------|-------------|
| -32700 | Parse error - Invalid JSON |
| -32600 | Invalid request |
| -32601 | Method not found |
| -32602 | Invalid parameters |
| -32603 | Internal error |

## Security Best Practices

1. **API Keys**: Store API keys securely in n8n credentials
2. **Network Selection**: Use testnet for development
3. **Input Validation**: All inputs are validated before API calls
4. **Error Handling**: Sensitive data is not exposed in error messages

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint
npm run lint

# Fix lint issues
npm run lint:fix
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

## Support

- **Documentation**: [Midnight Docs](https://docs.midnight.network/)
- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-midnight/issues)
- **n8n Community**: [n8n Community Forum](https://community.n8n.io/)

## Acknowledgments

- [Midnight Network](https://midnight.network/) - Privacy-first blockchain
- [n8n](https://n8n.io/) - Workflow automation platform
- [Cardano](https://cardano.org/) - Partner blockchain network
