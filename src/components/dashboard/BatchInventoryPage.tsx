"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowLeftIcon,
    ArrowsRightLeftIcon,
    EyeIcon,
    QrCodeIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    PlusIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "@/hooks/useLanguage";
import { useWeb3 } from "@/components/Providers";
import LanguageToggle from "@/components/LanguageToggle";
import LogoutButton from "@/components/LogoutButton";
import { getClientDb } from "@/lib/firebase/client";
import {
    arrayUnion,
    collection,
    doc,
    onSnapshot,
    query,
    where,
    Unsubscribe,
    updateDoc,
} from "firebase/firestore";
import { blockchainHelpers } from "@/lib/blockchain";
import { ethers } from "ethers";

const normalizeWalletAddress = (value?: string | null) => {
    if (!value) return "";
    const trimmed = value.trim();
    if (!trimmed) return "";
    const isHexAddress = /^0x[a-f0-9]{40}$/i.test(trimmed);
    if (isHexAddress) {
        try {
            return ethers.getAddress(trimmed);
        } catch {
            return trimmed.toLowerCase();
        }
    }
    return trimmed.toLowerCase();
};

interface BatchInventoryPageProps {
    actorRole: "producer" | "intermediary";
}

interface InventoryBatch {
    batchId: string;
    cropType: string;
    variety: string;
    quantityKg: number;
    pricePerKg: number;
    createdAt: string | null;
    currentOwnerAddress: string | null;
    metadataHash?: string | null;
    workflowActor?: string | null;
    qualityGrade?: string | null;
}

type BatchMetadataDocument = {
    cropType?: string
    variety?: string
    quantityKg?: number | string
    pricePerKg?: number | string
    createdAt?: string | null
    currentOwnerAddress?: string | null
    metadataHash?: string | null
    workflowActor?: string | null
    qualityGrade?: string | null
    quality?: string | null
}

export default function BatchInventoryPage({ actorRole }: BatchInventoryPageProps) {
    const basePath = actorRole === "producer" ? "/dashboard/producer" : "/dashboard/intermediary";
    const recipientRole = actorRole === "producer" ? "intermediary" : "retailer";

    const { language: currentLang } = useLanguage();
    const { user, signer, connectWallet } = useWeb3();

    const [resolvedAddress, setResolvedAddress] = useState<string>("");
    const [batches, setBatches] = useState<InventoryBatch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [transferModal, setTransferModal] = useState<{
        batch: InventoryBatch;
        otp: string;
        recipientRole: string;
    } | null>(null);
    const [transferForm, setTransferForm] = useState({ recipientAddress: "", otp: "", note: "" });
    const [isTransferring, setIsTransferring] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const resolveAddress = async () => {
            try {
                let address = user?.address || null;
                if (!address && signer) {
                    try {
                        address = await signer.getAddress();
                    } catch {
                        address = null;
                    }
                }
                const normalized = normalizeWalletAddress(address);
                if (!normalized) {
                    if (!cancelled) {
                        setResolvedAddress("");
                        setIsLoading(false);
                    }
                    return;
                }
                if (!cancelled) {
                    setResolvedAddress(normalized);
                }
            } catch (addrErr) {
                console.warn("Failed to resolve wallet address", addrErr);
                if (!cancelled) {
                    setResolvedAddress("");
                    setIsLoading(false);
                }
            }
        };

        resolveAddress().catch(console.error);
        return () => {
            cancelled = true;
        };
    }, [signer, user?.address]);

    useEffect(() => {
        if (!resolvedAddress) return;
        setIsLoading(true);
        const db = getClientDb();
        const ref = collection(db, "batchMetadata");
        const q = query(ref, where("createdBy.address", "==", resolvedAddress));

        let unsubscribe: Unsubscribe | null = null;
        unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const nextRows: InventoryBatch[] = snapshot.docs.map((docSnap) => {
                    const data = docSnap.data() as BatchMetadataDocument;
                    return {
                        batchId: docSnap.id,
                        cropType: data.cropType || "—",
                        variety: data.variety || "—",
                        quantityKg: typeof data.quantityKg === "number" ? data.quantityKg : Number(data.quantityKg) || 0,
                        pricePerKg: typeof data.pricePerKg === "number" ? data.pricePerKg : Number(data.pricePerKg) || 0,
                        createdAt: data.createdAt || null,
                        currentOwnerAddress: data.currentOwnerAddress || null,
                        metadataHash: data.metadataHash || null,
                        workflowActor: data.workflowActor || null,
                        qualityGrade: data.qualityGrade || data.quality || null,
                    };
                });

                nextRows.sort((a, b) => {
                    const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
                    const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
                    return bTime - aTime;
                });

                setBatches(nextRows);
                setError(null);
                setIsLoading(false);
            },
            (snapshotError) => {
                console.error("Failed to load batches", snapshotError);
                setError(snapshotError.message || "Unable to load batches");
                setIsLoading(false);
            }
        );

        return () => {
            unsubscribe?.();
        };
    }, [resolvedAddress]);

    const emptyStateCopy = useMemo(() => {
        if (!resolvedAddress) {
            return currentLang === "en"
                ? "Connect your wallet to see batches created with this account."
                : "इस खाते से बनाए गए बैच देखने के लिए अपना वॉलेट कनेक्ट करें।";
        }
        return currentLang === "en" ? "No batches found yet." : "अभी कोई बैच उपलब्ध नहीं है।";
    }, [currentLang, resolvedAddress]);

    const openTransferModal = (batch: InventoryBatch) => {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        setTransferForm({ recipientAddress: "", otp: "", note: "" });
        setTransferModal({ batch, otp, recipientRole });
    };

    const closeTransferModal = () => {
        setTransferModal(null);
        setTransferForm({ recipientAddress: "", otp: "", note: "" });
        setIsTransferring(false);
    };

    const handleTransferSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!transferModal) return;

        if (!transferForm.recipientAddress.trim()) {
            alert(
                currentLang === "en"
                    ? "Please enter the recipient wallet address."
                    : "कृपया प्राप्तकर्ता का वॉलेट पता दर्ज करें।"
            );
            return;
        }

        if (transferForm.otp.trim() !== transferModal.otp) {
            alert(currentLang === "en" ? "OTP does not match." : "OTP मेल नहीं खाता।");
            return;
        }

        try {
            setIsTransferring(true);
            let activeSigner = signer;
            if (!activeSigner) {
                activeSigner = await connectWallet();
            }

            if (!activeSigner) {
                alert(
                    currentLang === "en"
                        ? "Connect your wallet to sign the blockchain transaction."
                        : "ब्लॉकचेन लेनदेन पर हस्ताक्षर करने के लिए अपना वॉलेट कनेक्ट करें।"
                );
                setIsTransferring(false);
                return;
            }

            const additionalInfo = JSON.stringify({
                otp: transferModal.otp,
                approval: "inventory-transfer",
                actorRole,
                recipientRole: transferModal.recipientRole,
                note: transferForm.note || null,
            });

            const receipt = await blockchainHelpers.transferOwnership(
                activeSigner,
                transferModal.batch.batchId,
                transferForm.recipientAddress,
                additionalInfo
            );

            try {
                const db = getClientDb();
                const metadataRef = doc(db, "batchMetadata", transferModal.batch.batchId);
                const nowIso = new Date().toISOString();
                await updateDoc(metadataRef, {
                    currentOwnerAddress: transferForm.recipientAddress,
                    lastTransferAt: nowIso,
                    ownershipHistory: arrayUnion({
                        from: resolvedAddress || null,
                        to: transferForm.recipientAddress,
                        actorRole,
                        recipientRole: transferModal.recipientRole,
                        note: transferForm.note || null,
                        otp: transferModal.otp,
                        transactionHash: receipt?.transactionHash ?? null,
                        timestamp: nowIso,
                    }),
                });
            } catch (logErr) {
                console.warn("Failed to persist ownership history", logErr);
            }

            alert(
                currentLang === "en"
                    ? "Ownership transferred successfully."
                    : "स्वामित्व सफलतापूर्वक स्थानांतरित हुआ।"
            );
            closeTransferModal();
        } catch (transferErr) {
            console.error("Ownership transfer failed", transferErr);
            alert(
                currentLang === "en"
                    ? "Unable to transfer ownership. Please check the console for details."
                    : "स्वामित्व स्थानांतरण विफल रहा। विवरण के लिए कंसोल जांचें।"
            );
        } finally {
            setIsTransferring(false);
        }
    };

    const formatOwner = (address?: string | null) => {
        if (!address) return currentLang === "en" ? "Not set" : "सेट नहीं";
        return `${address.slice(0, 6)}…${address.slice(-4)}`;
    };

    const formatDate = (iso: string | null) => {
        if (!iso) return "—";
        const date = new Date(iso);
        if (Number.isNaN(date.getTime())) return iso;
        return date.toLocaleString(currentLang === "en" ? "en-IN" : "hi-IN", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    };

    const summary = useMemo(() => {
        const total = batches.length;
        const active = batches.filter((batch) => batch.workflowActor === actorRole).length;
        const handedOff = total - active;
        return { total, active, handedOff };
    }, [batches, actorRole]);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-4">
                            <Link
                                href={basePath}
                                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeftIcon className="w-5 h-5" />
                                <span>{currentLang === "en" ? "Back to dashboard" : "डैशबोर्ड पर वापस"}</span>
                            </Link>
                        </div>
                        <div className="flex items-center gap-2">
                            <LanguageToggle />
                            <LogoutButton />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <section className="bg-white border rounded-xl shadow-sm p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h1 className={`text-2xl font-bold text-gray-900 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                                {currentLang === "en" ? "Batch Inventory" : "बैच सूची"}
                            </h1>
                            <p className={`text-sm text-gray-600 mt-1 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                                {currentLang === "en"
                                    ? "Track batches you have created and manage ownership transfers."
                                    : "अपने द्वारा बनाए गए बैच का ट्रैक करें और स्वामित्व का प्रबंधन करें।"}
                            </p>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-gray-500">
                                    {currentLang === "en" ? "Total" : "कुल"}
                                </p>
                                <p className="text-2xl font-semibold text-gray-900">{summary.total}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-gray-500">
                                    {currentLang === "en" ? "Active" : "सक्रिय"}
                                </p>
                                <p className="text-2xl font-semibold text-emerald-600">{summary.active}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-gray-500">
                                    {currentLang === "en" ? "Handed Off" : "हस्तांतरित"}
                                </p>
                                <p className="text-2xl font-semibold text-indigo-600">{summary.handedOff}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-white border rounded-xl shadow-sm p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16 text-gray-500">
                            {currentLang === "en" ? "Loading batches..." : "बैच लोड हो रहे हैं..."}
                        </div>
                    ) : error ? (
                        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            <ExclamationTriangleIcon className="h-5 w-5" />
                            <span>{error}</span>
                        </div>
                    ) : batches.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center text-gray-600">
                            <QrCodeIcon className="h-12 w-12 text-gray-300" />
                            <p className={currentLang === "hi" ? "font-hindi" : ""}>{emptyStateCopy}</p>
                            <Link
                                href={`${basePath}/create-batch`}
                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                            >
                                <PlusIcon className="h-4 w-4" />
                                {currentLang === "en" ? "Create batch" : "बैच बनाएं"}
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {batches.map((batch) => (
                                <div key={batch.batchId} className="rounded-lg border border-gray-200 p-4 shadow-sm hover:border-emerald-200">
                                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-gray-500">Batch ID</p>
                                            <p className="text-lg font-semibold text-gray-900">{batch.batchId}</p>
                                            <p className="text-sm text-gray-500">{formatDate(batch.createdAt)}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                                            <div>
                                                <p className="text-xs uppercase tracking-wide text-gray-500">Crop</p>
                                                <p className="font-medium">{batch.cropType}</p>
                                                <p className="text-xs text-gray-500">{batch.variety}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-wide text-gray-500">Quantity</p>
                                                <p className="font-semibold">{batch.quantityKg} kg</p>
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-wide text-gray-500">Price / Kg</p>
                                                <p className="font-semibold">₹{batch.pricePerKg}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-wide text-gray-500">Current Owner</p>
                                                <p className="font-semibold">{formatOwner(batch.currentOwnerAddress)}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <Link
                                                href={`/trace/${batch.batchId}`}
                                                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                            >
                                                <EyeIcon className="h-4 w-4" />
                                                {currentLang === "en" ? "View trace" : "ट्रेस देखें"}
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => openTransferModal(batch)}
                                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                                            >
                                                <ArrowsRightLeftIcon className="h-4 w-4" />
                                                {currentLang === "en" ? "Transfer" : "स्थानांतरण"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {transferModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className={`text-xl font-semibold text-gray-900 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                                    {currentLang === "en" ? "Transfer Ownership" : "स्वामित्व स्थानांतरित करें"}
                                </h2>
                                <p className={`text-sm text-gray-600 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                                    {currentLang === "en"
                                        ? `Share the OTP with the ${recipientRole} to verify the handoff.`
                                        : `हैंडऑफ सत्यापित करने के लिए OTP ${recipientRole === "intermediary" ? "मध्यस्थ" : "खुदरा विक्रेता"} को साझा करें।`}
                                </p>
                            </div>
                            <button onClick={closeTransferModal} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <div className="mt-4 rounded-lg border border-dashed border-emerald-200 bg-emerald-50 p-4 text-center">
                            <p className="text-sm font-medium text-emerald-800">
                                {currentLang === "en" ? "One-Time Passcode" : "वन-टाइम पासकोड"}
                            </p>
                            <p className="mt-1 text-3xl font-mono tracking-widest text-emerald-600">
                                {transferModal.otp}
                            </p>
                        </div>

                        <form onSubmit={handleTransferSubmit} className="mt-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    {currentLang === "en" ? "Recipient wallet address" : "प्राप्तकर्ता वॉलेट पता"}
                                </label>
                                <input
                                    type="text"
                                    value={transferForm.recipientAddress}
                                    onChange={(e) => setTransferForm((prev) => ({ ...prev, recipientAddress: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                                    placeholder="0x..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">OTP</label>
                                <input
                                    type="text"
                                    value={transferForm.otp}
                                    onChange={(e) => setTransferForm((prev) => ({ ...prev, otp: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                                    placeholder="Enter OTP to confirm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    {currentLang === "en" ? "Notes (optional)" : "नोट्स (वैकल्पिक)"}
                                </label>
                                <textarea
                                    rows={3}
                                    value={transferForm.note}
                                    onChange={(e) => setTransferForm((prev) => ({ ...prev, note: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                                />
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
                                <div className="inline-flex items-center gap-2">
                                    <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
                                    {currentLang === "en"
                                        ? "Blockchain transaction required"
                                        : "ब्लॉकचेन लेनदेन आवश्यक"}
                                </div>
                                <div className="inline-flex items-center gap-2 text-amber-600">
                                    <ExclamationTriangleIcon className="h-5 w-5" />
                                    {currentLang === "en"
                                        ? "Fees paid in Sepolia ETH"
                                        : "शुल्क Sepolia ETH में"}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeTransferModal}
                                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    disabled={isTransferring}
                                >
                                    {currentLang === "en" ? "Cancel" : "रद्द करें"}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isTransferring}
                                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                                >
                                    {isTransferring && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                                    {currentLang === "en" ? "Confirm transfer" : "स्थानांतरण पुष्टि करें"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
