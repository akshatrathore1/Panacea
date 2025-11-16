import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { getFirestore } from '@/lib/firebaseAdmin';
import { SUPPLY_CHAIN_ABI, CONTRACT_ADDRESS, isContractConfigured } from '@/lib/blockchain';

const rpcUrl = process.env.SEPOLIA_RPC_URL || process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL;
const sepoliaNetwork = {
    chainId: Number(process.env.NEXT_PUBLIC_SEPOLIA_CHAIN_ID || 11155111),
    name: 'sepolia'
};
const rpcTimeoutMs = Number(process.env.SEPOLIA_RPC_TIMEOUT_MS || process.env.NEXT_PUBLIC_SEPOLIA_RPC_TIMEOUT_MS || 7000);
let sharedProvider: ethers.JsonRpcProvider | null = null;

const getRpcProvider = () => {
    if (!rpcUrl || !isContractConfigured) return null;
    if (!sharedProvider) {
        sharedProvider = new ethers.JsonRpcProvider(rpcUrl, sepoliaNetwork);
    }
    return sharedProvider;
};

const withRpcTimeout = async <T>(promise: Promise<T>) => {
    if (!rpcTimeoutMs || rpcTimeoutMs <= 0) {
        return promise;
    }
    let timer: ReturnType<typeof setTimeout> | null = null;
    try {
        return await Promise.race([
            promise,
            new Promise<never>((_, reject) => {
                timer = setTimeout(() => {
                    reject(new Error(`RPC timeout after ${rpcTimeoutMs}ms`));
                }, rpcTimeoutMs);
            })
        ]);
    } finally {
        if (timer) {
            clearTimeout(timer);
        }
    }
};

type BatchRouteParams = Promise<{ batchId: string }>; // Next.js 15 makes params async in route handlers
type ContractBatchResponse = {
    batchId: string;
    productType: string;
    currentOwner: string;
    origin: string;
    harvestDate?: { toString(): string } | null;
    createdAt?: { toString(): string } | null;
    additionalInfo?: string | null;
    exists?: boolean;
};

type ContractHistoryEntryResponse = {
    from: string;
    to: string;
    timestamp?: { toString(): string } | null;
    additionalInfo?: string | null;
};

type BatchHistoryEntry = {
    from: string;
    to: string;
    timestamp: string | null;
    additionalInfo: string | null;
};

type BatchOnChainData = {
    batchId: string;
    productType: string;
    currentOwner: string;
    origin: string;
    harvestDate: string | null;
    createdAt: string | null;
    additionalInfo: string | null;
};

const isContractBatchResponse = (payload: unknown): payload is ContractBatchResponse =>
    typeof payload === 'object' &&
    payload !== null &&
    'batchId' in payload &&
    'productType' in payload &&
    'currentOwner' in payload &&
    'origin' in payload;

const isHistoryEntryArray = (payload: unknown): payload is ContractHistoryEntryResponse[] =>
    Array.isArray(payload) && payload.every((entry) =>
        typeof entry === 'object' &&
        entry !== null &&
        'from' in entry &&
        'to' in entry
    );

export async function GET(
    _request: Request,
    context: { params: BatchRouteParams }
) {
    const { batchId } = await context.params;

    if (!batchId) {
        return NextResponse.json({ error: 'Missing batchId' }, { status: 400 });
    }

    const db = getFirestore();
    const metaSnap = await db.collection('batchMetadata').doc(batchId).get();
    const metadata = metaSnap.exists ? metaSnap.data() : null;

    let metadataHash: string | null = null;
    let metadataCanonical: string | null = null;
    let computedHash: string | null = null;
    let metadataValid = false;

    if (metadata) {
        metadataHash = typeof metadata.metadataHash === 'string' ? metadata.metadataHash : null;
        metadataCanonical = typeof metadata.metadataCanonical === 'string' ? metadata.metadataCanonical : null;
        if (metadataCanonical) {
            computedHash = ethers.keccak256(ethers.toUtf8Bytes(metadataCanonical));
            metadataValid = !!metadataHash && computedHash === metadataHash;
        }
    }

    let onChainBatch: BatchOnChainData | null = null;
    let onChainHistory: BatchHistoryEntry[] = [];

    const provider = getRpcProvider();
    if (provider) {
        try {
            const contract = new ethers.Contract(CONTRACT_ADDRESS, SUPPLY_CHAIN_ABI, provider);
            const batch = await withRpcTimeout(contract.getBatch(batchId));
            if (isContractBatchResponse(batch) && batch.exists) {
                onChainBatch = {
                    batchId: batch.batchId,
                    productType: batch.productType,
                    currentOwner: batch.currentOwner,
                    origin: batch.origin,
                    harvestDate: batch.harvestDate ? batch.harvestDate.toString() : null,
                    createdAt: batch.createdAt ? batch.createdAt.toString() : null,
                    additionalInfo: batch.additionalInfo ?? null
                };
            }
            const history = await withRpcTimeout(contract.getBatchHistory(batchId));
            onChainHistory = isHistoryEntryArray(history)
                ? history.map((entry) => ({
                    from: entry.from,
                    to: entry.to,
                    timestamp: entry.timestamp ? entry.timestamp.toString() : null,
                    additionalInfo: entry.additionalInfo ?? null
                }))
                : [];
        } catch (err) {
            console.warn('Failed to fetch on-chain data for batch', batchId, err);
        }
    }

    return NextResponse.json({
        batchId,
        metadata,
        metadataHash,
        metadataCanonical,
        computedHash,
        metadataValid,
        onChainBatch,
        onChainHistory
    });
}
