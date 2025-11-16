type EthereumRequestArgs = {
    method: string
    params?: unknown[] | Record<string, unknown>
}

interface Window {
    ethereum?: {
        isMetaMask?: boolean
        request: (args: EthereumRequestArgs) => Promise<unknown>
        on?: (event: string, handler: (...args: unknown[]) => void) => void
        removeListener?: (event: string, handler: (...args: unknown[]) => void) => void
        selectedAddress?: string
        chainId?: string
    }
}