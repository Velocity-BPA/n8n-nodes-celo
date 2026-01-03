/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Celo network configurations
 */
export const CELO_NETWORKS = {
  mainnet: {
    name: 'Celo Mainnet',
    chainId: 42220,
    rpcUrl: 'https://forno.celo.org',
    explorerUrl: 'https://celoscan.io',
    explorerApiUrl: 'https://api.celoscan.io/api',
  },
  alfajores: {
    name: 'Alfajores Testnet',
    chainId: 44787,
    rpcUrl: 'https://alfajores-forno.celo-testnet.org',
    explorerUrl: 'https://alfajores.celoscan.io',
    explorerApiUrl: 'https://api-alfajores.celoscan.io/api',
  },
  baklava: {
    name: 'Baklava Testnet',
    chainId: 62320,
    rpcUrl: 'https://baklava-forno.celo-testnet.org',
    explorerUrl: 'https://baklava-blockscout.celo-testnet.org',
    explorerApiUrl: 'https://baklava-blockscout.celo-testnet.org/api',
  },
} as const;

/**
 * Celo core contract addresses (Mainnet)
 */
export const CELO_CONTRACTS = {
  mainnet: {
    // Core
    GoldToken: '0x471EcE3750Da237f93B8E339c536989b8978a438',
    StableToken: '0x765DE816845861e75A25fCA122bb6898B8B1282a', // cUSD
    StableTokenEUR: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73', // cEUR
    StableTokenBRL: '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787', // cREAL
    
    // Identity
    Attestations: '0xdC553892cdeeeD9f575aa0FBA099e5847fd88D20',
    FederatedAttestations: '0x0aD5b1d0C25ecF6266Dd951403723B2687d6aff2',
    OdisPayments: '0x9E78E2E49F7B82c6D3cC8A1d4c4e3cdE0A5b2E06',
    
    // Staking/Election
    Election: '0x8D6677192144292870907E3Fa8A5527fE55A7ff6',
    LockedGold: '0x6cC083Aed9e3ebe302A6336dBC7c921C9f03349E',
    Validators: '0xaEb865bCa93DdC8F47b8e29F40C5399cE34d0C58',
    
    // Governance
    Governance: '0xD533Ca259b330c7A88f74E000a3FaEa2d63B7972',
    
    // Reserve/Exchange
    Reserve: '0x9380fA34Fd9e4Fd14c06305fd7B6199089eD4eb9',
    Exchange: '0x67316300f17f063085Ca8bCa4bd3f7a5a3C66275', // cUSD Exchange
    ExchangeEUR: '0xE383394B913d7302c49F794C7d3243c429d53D1d', // cEUR Exchange
    ExchangeBRL: '0x8f2cf9855C919AFAC8Bd2E7acEc0205ed568a4EA', // cREAL Exchange
    
    // Registry
    Registry: '0x000000000000000000000000000000000000ce10',
  },
  alfajores: {
    GoldToken: '0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9',
    StableToken: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
    StableTokenEUR: '0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F',
    StableTokenBRL: '0xE4D517785D091D3c54818832dB6094bcc2744545',
    Attestations: '0xAD5E5722427d79DFf28a4Ab30249729d1F8B4cc0',
    FederatedAttestations: '0x70F9314aF173c246669cFb0EEe79F9Cfd9C34ee3',
    OdisPayments: '0x645170cdB6B5c1bc80847bb728dBa56C50a20a49',
    Election: '0x1c3eDf937CFc2F6F51784D20DEB1af1F9a8655fA',
    LockedGold: '0x6a4CC5693DC5BFA3799C699F3B941bA2Cb00c341',
    Validators: '0x9acF2A99914E083aD0d610672E93d14b0736BBCc',
    Governance: '0xAA963FC97281d9632d96700aB62A4D1340F9a28a',
    Reserve: '0xa7ed835288Aa4524bB6C73DD23c0bF4315D9Fe3e',
    Exchange: '0x17bc3C8798BC1e0718f83EB032DfED2Ee2a6F0a8',
    ExchangeEUR: '0x997B494F17D3c49E66Fafb50F37b5d9Ba693F5dC',
    ExchangeBRL: '0xf391DcaA77B9d5cc28F4815E022B7E95e91A4E16',
    Registry: '0x000000000000000000000000000000000000ce10',
  },
} as const;

/**
 * Stablecoin configurations
 */
export const STABLECOINS = {
  cUSD: {
    symbol: 'cUSD',
    name: 'Celo Dollar',
    decimals: 18,
    mainnet: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
    alfajores: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
  },
  cEUR: {
    symbol: 'cEUR',
    name: 'Celo Euro',
    decimals: 18,
    mainnet: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
    alfajores: '0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F',
  },
  cREAL: {
    symbol: 'cREAL',
    name: 'Celo Brazilian Real',
    decimals: 18,
    mainnet: '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787',
    alfajores: '0xE4D517785D091D3c54818832dB6094bcc2744545',
  },
} as const;

/**
 * Common ABI fragments for Celo contracts
 */
export const ABI_FRAGMENTS = {
  // ERC20 Standard
  erc20: {
    balanceOf: {
      inputs: [{ name: 'account', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    transfer: {
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'amount', type: 'uint256' },
      ],
      name: 'transfer',
      outputs: [{ name: '', type: 'bool' }],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    approve: {
      inputs: [
        { name: 'spender', type: 'address' },
        { name: 'amount', type: 'uint256' },
      ],
      name: 'approve',
      outputs: [{ name: '', type: 'bool' }],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    allowance: {
      inputs: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
      ],
      name: 'allowance',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    decimals: {
      inputs: [],
      name: 'decimals',
      outputs: [{ name: '', type: 'uint8' }],
      stateMutability: 'view',
      type: 'function',
    },
    name: {
      inputs: [],
      name: 'name',
      outputs: [{ name: '', type: 'string' }],
      stateMutability: 'view',
      type: 'function',
    },
    symbol: {
      inputs: [],
      name: 'symbol',
      outputs: [{ name: '', type: 'string' }],
      stateMutability: 'view',
      type: 'function',
    },
    totalSupply: {
      inputs: [],
      name: 'totalSupply',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  },
  
  // LockedGold
  lockedGold: {
    getAccountTotalLockedGold: {
      inputs: [{ name: 'account', type: 'address' }],
      name: 'getAccountTotalLockedGold',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    lock: {
      inputs: [],
      name: 'lock',
      outputs: [],
      stateMutability: 'payable',
      type: 'function',
    },
    unlock: {
      inputs: [{ name: 'value', type: 'uint256' }],
      name: 'unlock',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    withdraw: {
      inputs: [{ name: 'index', type: 'uint256' }],
      name: 'withdraw',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    getPendingWithdrawals: {
      inputs: [{ name: 'account', type: 'address' }],
      name: 'getPendingWithdrawals',
      outputs: [
        { name: '', type: 'uint256[]' },
        { name: '', type: 'uint256[]' },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  },
  
  // Election
  election: {
    getActiveVotesForGroup: {
      inputs: [{ name: 'group', type: 'address' }],
      name: 'getActiveVotesForGroup',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    vote: {
      inputs: [
        { name: 'group', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'lesser', type: 'address' },
        { name: 'greater', type: 'address' },
      ],
      name: 'vote',
      outputs: [{ name: '', type: 'bool' }],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    activate: {
      inputs: [{ name: 'group', type: 'address' }],
      name: 'activate',
      outputs: [{ name: '', type: 'bool' }],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    revokePending: {
      inputs: [
        { name: 'group', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'lesser', type: 'address' },
        { name: 'greater', type: 'address' },
        { name: 'index', type: 'uint256' },
      ],
      name: 'revokePending',
      outputs: [{ name: '', type: 'bool' }],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    revokeActive: {
      inputs: [
        { name: 'group', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'lesser', type: 'address' },
        { name: 'greater', type: 'address' },
        { name: 'index', type: 'uint256' },
      ],
      name: 'revokeActive',
      outputs: [{ name: '', type: 'bool' }],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    getElectableValidators: {
      inputs: [],
      name: 'getElectableValidators',
      outputs: [
        { name: '', type: 'uint256' },
        { name: '', type: 'uint256' },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    electValidatorSigners: {
      inputs: [],
      name: 'electValidatorSigners',
      outputs: [{ name: '', type: 'address[]' }],
      stateMutability: 'view',
      type: 'function',
    },
  },
  
  // Exchange (Mento)
  exchange: {
    getBuyTokenAmount: {
      inputs: [
        { name: 'sellAmount', type: 'uint256' },
        { name: 'sellGold', type: 'bool' },
      ],
      name: 'getBuyTokenAmount',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    getSellTokenAmount: {
      inputs: [
        { name: 'buyAmount', type: 'uint256' },
        { name: 'sellGold', type: 'bool' },
      ],
      name: 'getSellTokenAmount',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    exchange: {
      inputs: [
        { name: 'sellAmount', type: 'uint256' },
        { name: 'minBuyAmount', type: 'uint256' },
        { name: 'sellGold', type: 'bool' },
      ],
      name: 'exchange',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    spread: {
      inputs: [],
      name: 'spread',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    reserveFraction: {
      inputs: [],
      name: 'reserveFraction',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    getBuyAndSellBuckets: {
      inputs: [{ name: 'sellGold', type: 'bool' }],
      name: 'getBuyAndSellBuckets',
      outputs: [
        { name: '', type: 'uint256' },
        { name: '', type: 'uint256' },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  },
  
  // Governance
  governance: {
    proposalCount: {
      inputs: [],
      name: 'proposalCount',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    getProposal: {
      inputs: [{ name: 'proposalId', type: 'uint256' }],
      name: 'getProposal',
      outputs: [
        { name: 'proposer', type: 'address' },
        { name: 'deposit', type: 'uint256' },
        { name: 'timestamp', type: 'uint256' },
        { name: 'transactionCount', type: 'uint256' },
        { name: 'descriptionUrl', type: 'string' },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    vote: {
      inputs: [
        { name: 'proposalId', type: 'uint256' },
        { name: 'index', type: 'uint256' },
        { name: 'value', type: 'uint8' },
      ],
      name: 'vote',
      outputs: [{ name: '', type: 'bool' }],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    getVoteRecord: {
      inputs: [
        { name: 'account', type: 'address' },
        { name: 'index', type: 'uint256' },
      ],
      name: 'getVoteRecord',
      outputs: [
        { name: '', type: 'uint256' },
        { name: '', type: 'uint256' },
        { name: '', type: 'uint256' },
        { name: '', type: 'uint256' },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  },
  
  // Reserve
  reserve: {
    getReserveRatio: {
      inputs: [],
      name: 'getReserveRatio',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    tobinTaxStalenessThreshold: {
      inputs: [],
      name: 'tobinTaxStalenessThreshold',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  },
  
  // Validators
  validators: {
    getRegisteredValidators: {
      inputs: [],
      name: 'getRegisteredValidators',
      outputs: [{ name: '', type: 'address[]' }],
      stateMutability: 'view',
      type: 'function',
    },
    getRegisteredValidatorGroups: {
      inputs: [],
      name: 'getRegisteredValidatorGroups',
      outputs: [{ name: '', type: 'address[]' }],
      stateMutability: 'view',
      type: 'function',
    },
    getValidator: {
      inputs: [{ name: 'account', type: 'address' }],
      name: 'getValidator',
      outputs: [
        { name: 'ecdsaPublicKey', type: 'bytes' },
        { name: 'blsPublicKey', type: 'bytes' },
        { name: 'affiliation', type: 'address' },
        { name: 'score', type: 'uint256' },
        { name: 'signer', type: 'address' },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    getValidatorGroup: {
      inputs: [{ name: 'account', type: 'address' }],
      name: 'getValidatorGroup',
      outputs: [
        { name: '', type: 'address[]' },
        { name: '', type: 'uint256' },
        { name: '', type: 'uint256' },
        { name: '', type: 'uint256[]' },
        { name: '', type: 'uint256' },
        { name: '', type: 'uint256' },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  },
} as const;

/**
 * Default gas limits for different operation types
 */
export const GAS_LIMITS = {
  transfer: 21000,
  tokenTransfer: 65000,
  approve: 50000,
  exchange: 300000,
  lock: 100000,
  unlock: 100000,
  vote: 250000,
  governance: 300000,
  contractCall: 200000,
} as const;

/**
 * Celo fee currency addresses (tokens that can be used to pay gas)
 */
export const FEE_CURRENCIES = {
  mainnet: {
    CELO: null, // Native currency
    cUSD: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
    cEUR: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
    cREAL: '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787',
  },
  alfajores: {
    CELO: null,
    cUSD: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
    cEUR: '0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F',
    cREAL: '0xE4D517785D091D3c54818832dB6094bcc2744545',
  },
} as const;

/**
 * ODIS (Oblivious Decentralized Identifier Service) constants
 */
export const ODIS = {
  mainnet: {
    url: 'https://odis.prod.celo.org',
    publicKey: '7FsWGsFnmVvRfMDpzz95Np76wf/1sPaK0Og9yiB+P8QbjiC8FV67NBans9hzZEkBaQMhiapzgMR6CkZIZPvgwQboAxl65JWRZecGe5V3XO4sdKeNemdAZ2TzQuWkuZoA',
  },
  alfajores: {
    url: 'https://odis.test.celo.org',
    publicKey: 'kPoRxWdEdZ/Nd3uQnp3FJFs54zuiS+ksqvOm9x8vY6KHPG8jrfqysvIRU0wtqYsBKA7SoAsICMBv8C/Fb2ZpDOqhSqvr/sZbZoHmQfvbqrzQ2XX0nF3XKGm+F3tgp+qB',
  },
} as const;
