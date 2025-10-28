import { ethers } from 'ethers'

// Contract ABI - in production, import this from artifacts
export const SUPPLY_CHAIN_ABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "string",
                "name": "batchId",
                "type": "string"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "producer",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "productType",
                "type": "string"
            }
        ],
        "name": "BatchCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "string",
                "name": "batchId",
                "type": "string"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "string",
                "name": "batchId",
                "type": "string"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "inspector",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint8",
                "name": "score",
                "type": "uint8"
            }
        ],
        "name": "QualityReported",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "userAddress",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "enum SupplyChain.UserRole",
                "name": "role",
                "type": "uint8"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "name",
                "type": "string"
            }
        ],
        "name": "UserRegistered",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_batchId",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_productType",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_origin",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "_harvestDate",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "_additionalInfo",
                "type": "string"
            }
        ],
        "name": "createBatch",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_batchId",
                "type": "string"
            }
        ],
        "name": "getBatch",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "string",
                        "name": "batchId",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "productType",
                        "type": "string"
                    },
                    {
                        "internalType": "address",
                        "name": "currentOwner",
                        "type": "address"
                    },
                    {
                        "internalType": "string",
                        "name": "origin",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "harvestDate",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "createdAt",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "additionalInfo",
                        "type": "string"
                    },
                    {
                        "internalType": "bool",
                        "name": "exists",
                        "type": "bool"
                    }
                ],
                "internalType": "struct SupplyChain.Batch",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_batchId",
                "type": "string"
            }
        ],
        "name": "getBatchHistory",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "from",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "to",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "timestamp",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "additionalInfo",
                        "type": "string"
                    }
                ],
                "internalType": "struct SupplyChain.OwnershipHistory[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_batchId",
                "type": "string"
            }
        ],
        "name": "getQualityReports",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "inspector",
                        "type": "address"
                    },
                    {
                        "internalType": "uint8",
                        "name": "score",
                        "type": "uint8"
                    },
                    {
                        "internalType": "string",
                        "name": "notes",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "timestamp",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct SupplyChain.QualityReport[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_userAddress",
                "type": "address"
            }
        ],
        "name": "getUser",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "userAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "enum SupplyChain.UserRole",
                        "name": "role",
                        "type": "uint8"
                    },
                    {
                        "internalType": "string",
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "location",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "registeredAt",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "isActive",
                        "type": "bool"
                    }
                ],
                "internalType": "struct SupplyChain.User",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_name",
                "type": "string"
            },
            {
                "internalType": "enum SupplyChain.UserRole",
                "name": "_role",
                "type": "uint8"
            },
            {
                "internalType": "string",
                "name": "_location",
                "type": "string"
            }
        ],
        "name": "registerUser",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_batchId",
                "type": "string"
            },
            {
                "internalType": "uint8",
                "name": "_score",
                "type": "uint8"
            },
            {
                "internalType": "string",
                "name": "_notes",
                "type": "string"
            }
        ],
        "name": "reportQuality",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_batchId",
                "type": "string"
            },
            {
                "internalType": "address",
                "name": "_newOwner",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "_additionalInfo",
                "type": "string"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xYourContractAddressHere'
export const isContractConfigured = ethers.isAddress(CONTRACT_ADDRESS) && CONTRACT_ADDRESS !== '0xYourContractAddressHere'

// Contract instance creation
export const getContract = (provider: ethers.Provider | ethers.Signer) => {
    if (!isContractConfigured) {
        throw new Error('Smart contract address is not configured. Update NEXT_PUBLIC_CONTRACT_ADDRESS or blockchain.ts before calling blockchain helpers.')
    }

    return new ethers.Contract(CONTRACT_ADDRESS, SUPPLY_CHAIN_ABI, provider)
}

// Helper functions for blockchain interactions
export const blockchainHelpers = {
    // User registration
    async registerUser(
        signer: ethers.Signer,
        name: string,
        role: number, // 0: Producer, 1: Intermediary, 2: Retailer, 3: Consumer
        location: string
    ) {
        const contract = getContract(signer)
        const tx = await contract.registerUser(name, role, location)
        return await tx.wait()
    },

    // Get user information
    async getUser(provider: ethers.Provider, address: string) {
        const contract = getContract(provider)
        return await contract.getUser(address)
    },

    // Create a new batch
    async createBatch(
        signer: ethers.Signer,
        batchId: string,
        productType: string,
        origin: string,
        harvestDate: number,
        additionalInfo: string
    ) {
        const contract = getContract(signer)
        const tx = await contract.createBatch(batchId, productType, origin, harvestDate, additionalInfo)
        return await tx.wait()
    },

    // Get batch information
    async getBatch(provider: ethers.Provider, batchId: string) {
        const contract = getContract(provider)
        return await contract.getBatch(batchId)
    },

    // Get batch history
    async getBatchHistory(provider: ethers.Provider, batchId: string) {
        const contract = getContract(provider)
        return await contract.getBatchHistory(batchId)
    },

    // Transfer ownership
    async transferOwnership(
        signer: ethers.Signer,
        batchId: string,
        newOwner: string,
        additionalInfo: string
    ) {
        const contract = getContract(signer)
        const tx = await contract.transferOwnership(batchId, newOwner, additionalInfo)
        return await tx.wait()
    },

    // Report quality
    async reportQuality(
        signer: ethers.Signer,
        batchId: string,
        score: number,
        notes: string
    ) {
        const contract = getContract(signer)
        const tx = await contract.reportQuality(batchId, score, notes)
        return await tx.wait()
    },

    // Get quality reports
    async getQualityReports(provider: ethers.Provider, batchId: string) {
        const contract = getContract(provider)
        return await contract.getQualityReports(batchId)
    },

    // Utility function to format user role
    formatUserRole(role: number): string {
        const roles = ['Producer', 'Intermediary', 'Retailer', 'Consumer']
        return roles[role] || 'Unknown'
    },

    // Utility function to generate batch ID
    generateBatchId(productType: string, location: string): string {
        const prefix = productType.substring(0, 3).toUpperCase()
        const locationCode = location.substring(0, 2).toUpperCase()
        const timestamp = Date.now().toString().slice(-6)
        return `KA-${prefix}-${locationCode}-${timestamp}`
    },

    // Utility function to validate batch ID format
    isValidBatchId(batchId: string): boolean {
        return /^KA-[A-Z]{3}-[A-Z]{2}-\d{6}$/.test(batchId)
    }
}

// Event listeners for contract events
export const setupEventListeners = (contract: ethers.Contract) => {
    // Listen for new batch creation
    contract.on('BatchCreated', (batchId, producer, productType) => {
        console.log('New batch created:', { batchId, producer, productType })
    })

    // Listen for ownership transfers
    contract.on('OwnershipTransferred', (batchId, from, to, timestamp) => {
        console.log('Ownership transferred:', { batchId, from, to, timestamp })
    })

    // Listen for quality reports
    contract.on('QualityReported', (batchId, inspector, score) => {
        console.log('Quality reported:', { batchId, inspector, score })
    })

    // Listen for user registrations
    contract.on('UserRegistered', (userAddress, role, name) => {
        console.log('User registered:', { userAddress, role, name })
    })
}

// Network configuration
export const NETWORKS = {
    sepolia: {
        chainId: 11155111,
        name: 'Sepolia Testnet',
        rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
        blockExplorer: 'https://sepolia.etherscan.io'
    },
    mumbai: {
        chainId: 80001,
        name: 'Polygon Mumbai',
        rpcUrl: 'https://rpc-mumbai.maticvigil.com',
        blockExplorer: 'https://mumbai.polygonscan.com'
    }
}

// Error handling
export const handleContractError = (error: any): string => {
    if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        return 'Transaction may fail. Please check your inputs and try again.'
    }
    if (error.code === 'INSUFFICIENT_FUNDS') {
        return 'Insufficient funds for transaction. Please add ETH to your wallet.'
    }
    if (error.message?.includes('user rejected transaction')) {
        return 'Transaction was cancelled by user.'
    }
    if (error.message?.includes('already exists')) {
        return 'This batch ID already exists. Please use a different ID.'
    }

    return error.message || 'An unknown error occurred.'
}