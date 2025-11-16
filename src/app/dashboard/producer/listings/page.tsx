'use client';

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Check,
  Download,
  Loader2,
  Pencil,
  PlusCircle,
  RefreshCcw,
  Trash2,
  X
} from "lucide-react";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  CubeIcon,
  CurrencyRupeeIcon
} from "@heroicons/react/24/outline";
import type { Product } from "@/types/product";
import { useWeb3 } from "@/components/Providers";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";
import { blockchainHelpers } from "@/lib/blockchain";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/hooks/useLanguage";

type StatusFilter = "all" | Product["status"];

type EditDraft = {
  price: number;
  quantity: number;
  description: string;
  unit: string;
  status: Product["status"];
};

const statusLabels: Record<Product["status"], { en: string; hi: string }> = {
  active: { en: "Active", hi: "सक्रिय" },
  sold: { en: "Sold", hi: "बिक चुका" },
  cancelled: { en: "Cancelled", hi: "रद्द" }
};

const statusClasses: Record<Product["status"], string> = {
  active: "bg-green-100 text-green-800",
  sold: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800"
};

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
}

function formatCurrency(value?: number | null) {
  if (!value) return INR.format(0);
  return INR.format(value);
}

function buildCsv(rows: Product[]) {
  const header: Array<keyof Product> = [
    "id",
    "name",
    "category",
    "quantity",
    "unit",
    "price",
    "status",
    "createdAt",
    "updatedAt"
  ];
  const body = rows.map((row) =>
    header
      .map((key) => {
        const rawValue = row[key] ?? "";
        return `"${String(rawValue).replace(/"/g, '""')}"`;
      })
      .join(",")
  );
  return [header.join(","), ...body].join("\n");
}

type MarketplaceDocument = Partial<Product> & Record<string, unknown>;

const getRefId = (ref: unknown): string | undefined => {
  if (typeof ref === 'object' && ref !== null && 'id' in ref) {
    const rawId = (ref as { id?: unknown }).id;
    return typeof rawId === 'string' ? rawId : undefined;
  }
  return undefined;
};

const getNestedString = (value: unknown, field: string): string | undefined => {
  if (typeof value === 'object' && value !== null && field in value) {
    const nested = (value as Record<string, unknown>)[field];
    return typeof nested === 'string' ? nested : undefined;
  }
  return undefined;
};

const asOptionalString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined;

export default function ListingsPage() {
  const { language: currentLang } = useLanguage();
  const { user, signer, isConnected, connectWallet } = useWeb3();
  const pathname = usePathname();
  const dashboardBasePath = pathname?.includes("/dashboard/intermediary") ? "/dashboard/intermediary" : "/dashboard/producer";
  const actorRole: "producer" | "intermediary" = dashboardBasePath.includes("/dashboard/intermediary") ? "intermediary" : "producer";

  const [listings, setListings] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [resolvedAddress, setResolvedAddress] = useState("");
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft>({
    price: 0,
    quantity: 0,
    description: "",
    unit: "kg",
    status: "active"
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [transferModal, setTransferModal] = useState<{
    product: Product;
    otp: string;
    recipientRole: "intermediary" | "retailer";
  } | null>(null);
  const [transferForm, setTransferForm] = useState({
    recipientAddress: "",
    otp: "",
    note: ""
  });
  const [isTransferring, setIsTransferring] = useState(false);

  const profileAddress = useMemo(
    () => (user?.address ? String(user.address).toLowerCase() : ""),
    [user?.address]
  );

  useEffect(() => {
    let cancelled = false;

    async function resolveAddress() {
      if (signer) {
        try {
          const address = (await signer.getAddress()).toLowerCase();
          if (!cancelled) {
            setResolvedAddress(address);
            return;
          }
        } catch (err) {
          console.warn("Failed to read signer address:", err);
        }
      }

      if (!cancelled) {
        setResolvedAddress(profileAddress);
      }
    }

    void resolveAddress();
    return () => {
      cancelled = true;
    };
  }, [signer, profileAddress]);

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/marketplace/products", { method: "GET" });
      if (!resp.ok) {
        throw new Error(`Marketplace API returned ${resp.status}`);
      }
      const payload = (await resp.json()) as MarketplaceDocument[];
      if (Array.isArray(payload)) {
        const normalized = payload.map((raw) => {
          const createdAt = raw.createdAt ?? new Date().toISOString();
          const updatedAt = raw.updatedAt ?? createdAt;
          const fallbackId = `${createdAt}-${Math.random().toString(36).slice(2, 8)}`;
          const resolvedId = raw.id ?? raw.documentId ?? raw._id ?? getRefId((raw as Record<string, unknown>).ref) ?? fallbackId;
          const batchIdentifier = raw.batchId ?? raw.batch_id ?? raw.batchID ?? null;
          const producer = raw.producer && typeof raw.producer === 'object'
            ? {
              address: String(raw.producer.address ?? ''),
              name: String(raw.producer.name ?? '')
            }
            : {
              address: String(raw.producer ?? ''),
              name: ''
            };

          const workflowActor = (() => {
            const candidate = raw.workflowActor ?? (raw as Record<string, unknown>).workflow_actor;
            return candidate === 'producer' || candidate === 'intermediary' ? candidate : undefined;
          })();

          return {
            id: String(resolvedId),
            name: String(raw.name ?? ''),
            category: String(raw.category ?? ''),
            description: String(raw.description ?? ''),
            quantity: Number(raw.quantity ?? 0),
            unit: String(raw.unit ?? 'kg'),
            price: Number(raw.price ?? raw.pricePerUnit ?? 0),
            harvestDate: raw.harvestDate ?? null,
            producer,
            status: (raw.status ?? 'active') as Product['status'],
            createdAt,
            updatedAt,
            images: Array.isArray(raw.images) ? raw.images : [],
            batchId: batchIdentifier ? String(batchIdentifier) : undefined,
            metadataHash: asOptionalString(raw.metadataHash) ?? asOptionalString((raw as Record<string, unknown>).metadata_hash) ?? getNestedString(raw.metadata, 'hash'),
            metadataPath: asOptionalString(raw.metadataPath) ?? asOptionalString((raw as Record<string, unknown>).metadata_path) ?? getNestedString(raw.metadata, 'path'),
            workflowActor
          } satisfies Product;
        });
        setListings(normalized);
      } else {
        setListings([]);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load listings";
      setError(message);
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings().catch(console.error);
  }, [fetchListings]);

  useEffect(() => {
    if (editingProduct) {
      setEditDraft({
        price: editingProduct.price,
        quantity: editingProduct.quantity,
        description: editingProduct.description || "",
        unit: editingProduct.unit,
        status: editingProduct.status
      });
    }
  }, [editingProduct]);

  const activeAddress = resolvedAddress || profileAddress;

  const producerListings = useMemo(() => {
    if (!activeAddress) return [];
    return listings.filter((listing) => {
      const listingAddress = listing?.producer?.address
        ? String(listing.producer.address).toLowerCase()
        : "";
      return listingAddress === activeAddress;
    });
  }, [listings, activeAddress]);

  const filteredListings = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return producerListings.filter((listing) => {
      if (statusFilter !== "all" && listing.status !== statusFilter) {
        return false;
      }

      if (!query) return true;

      return (
        listing.name.toLowerCase().includes(query) ||
        listing.category.toLowerCase().includes(query) ||
        (listing.description || "").toLowerCase().includes(query)
      );
    });
  }, [producerListings, statusFilter, searchTerm]);

  const listingStats = useMemo(
    () =>
      producerListings.reduce(
        (acc, listing) => {
          acc.total += 1;
          acc.quantity += listing.quantity;
          acc.value += listing.quantity * listing.price;
          acc.byStatus[listing.status] += 1;
          return acc;
        },
        {
          total: 0,
          quantity: 0,
          value: 0,
          byStatus: {
            active: 0,
            sold: 0,
            cancelled: 0
          } as Record<Product["status"], number>
        }
      ),
    [producerListings]
  );

  const exportCsv = () => {
    if (producerListings.length === 0) return;
    const csv = buildCsv(producerListings);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `marketplace_listings_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const updateListingStatus = async (
    listing: Product,
    status: Product["status"]
  ) => {
    if (listing.status === status) return;
    setStatusUpdatingId(listing.id);
    setError(null);
    try {
      const resp = await fetch(`/api/marketplace/products/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (!resp.ok) {
        throw new Error(`Failed to update listing (${resp.status})`);
      }
      const updated = (await resp.json()) as Product;
      setListings((prev) =>
        prev.map((item) => (item.id === listing.id ? { ...item, ...updated } : item))
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update listing";
      setError(message);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const removeListing = async (listing: Product) => {
    if (
      !window.confirm(
        currentLang === "en"
          ? "Delete this listing?"
          : "इस लिस्टिंग को हटाना चाहते हैं?"
      )
    ) {
      return;
    }
    setDeletingId(listing.id);
    setError(null);
    try {
      const resp = await fetch(`/api/marketplace/products/${listing.id}`, {
        method: "DELETE"
      });
      if (!resp.ok) {
        throw new Error(`Failed to delete listing (${resp.status})`);
      }
      setListings((prev) => prev.filter((item) => item.id !== listing.id));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete listing";
      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingProduct) return;

    setIsSavingEdit(true);
    setError(null);

    try {
      const payload = {
        price: Number(editDraft.price),
        quantity: Number(editDraft.quantity),
        description: editDraft.description,
        unit: editDraft.unit,
        status: editDraft.status
      };

      const resp = await fetch(`/api/marketplace/products/${editingProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        throw new Error(`Failed to save changes (${resp.status})`);
      }

      const updated = (await resp.json()) as Product;
      setListings((prev) =>
        prev.map((item) =>
          item.id === editingProduct.id ? { ...item, ...updated } : item
        )
      );
      setEditingProduct(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save changes";
      setError(message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const renderStatusActions = (listing: Product) => {
    const actions: Array<{
      label: string;
      next: Product["status"];
      hidden?: boolean;
    }> = [
        {
          label: currentLang === "en" ? "Mark Sold" : "बिक चुका",
          next: "sold",
          hidden: listing.status === "sold"
        },
        {
          label: currentLang === "en" ? "Cancel" : "रद्द",
          next: "cancelled",
          hidden: listing.status === "cancelled"
        },
        {
          label: currentLang === "en" ? "Activate" : "सक्रिय करें",
          next: "active",
          hidden: listing.status === "active"
        }
      ];

    return actions
      .filter((action) => !action.hidden)
      .map((action) => (
        <button
          key={action.next}
          onClick={() => updateListingStatus(listing, action.next)}
          disabled={statusUpdatingId === listing.id}
          className="inline-flex items-center gap-1 rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {statusUpdatingId === listing.id ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : action.next === "active" ? (
            <Check className="h-3 w-3" />
          ) : action.next === "sold" ? (
            <Check className="h-3 w-3" />
          ) : (
            <X className="h-3 w-3" />
          )}
          <span>{action.label}</span>
        </button>
      ));
  };

  const allowedRecipientRole = actorRole === "producer" ? "intermediary" : "retailer";

  const openTransferModal = (product: Product) => {
    if (!product.batchId) {
      alert(
        currentLang === "en"
          ? "This listing is missing its batch ID. Create the batch again before transferring ownership."
          : "इस सूची में बैच आईडी उपलब्ध नहीं है। स्वामित्व स्थानांतरण से पहले बैच दोबारा बनाएं।"
      );
      return;
    }
    const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
    setTransferForm({ recipientAddress: "", otp: "", note: "" });
    setTransferModal({ product, otp, recipientRole: allowedRecipientRole });
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
          ? "Please enter the recipient wallet address or ID."
          : "कृपया प्राप्तकर्ता वॉलेट पता या आईडी दर्ज करें।"
      );
      return;
    }

    if (transferForm.otp.trim() !== transferModal.otp) {
      alert(
        currentLang === "en"
          ? "OTP does not match the generated code."
          : "OTP उत्पन्न कोड से मेल नहीं खाता।"
      );
      return;
    }

    if (!transferModal.product.batchId) {
      alert(
        currentLang === "en"
          ? "Batch ID missing."
          : "बैच आईडी उपलब्ध नहीं है।"
      );
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
        approval: "demo-otp",
        actorRole,
        recipientRole: transferModal.recipientRole,
        note: transferForm.note || null
      });

      const receipt = await blockchainHelpers.transferOwnership(
        activeSigner,
        transferModal.product.batchId,
        transferForm.recipientAddress,
        additionalInfo
      );

      try {
        const db = getClientDb();
        const metadataRef = doc(db, "batchMetadata", transferModal.product.batchId);
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
            timestamp: nowIso
          })
        });
      } catch (logErr) {
        console.warn("Failed to persist ownership history:", logErr);
      }

      alert(
        currentLang === "en"
          ? "Ownership transferred successfully."
          : "स्वामित्व सफलतापूर्वक स्थानांतरित हुआ।"
      );

      closeTransferModal();
      await fetchListings();
    } catch (transferErr) {
      console.error("Ownership transfer failed:", transferErr);
      alert(
        currentLang === "en"
          ? "Unable to transfer ownership."
          : "स्वामित्व स्थानांतरण असफल रहा।"
      );
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href={dashboardBasePath}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span className={currentLang === "hi" ? "font-hindi" : ""}>
                {currentLang === "en" ? "Back to dashboard" : "डैशबोर्ड पर वापस"}
              </span>
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <LanguageToggle />
              <button
                onClick={fetchListings}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                {currentLang === "en" ? "Refresh" : "रिफ्रेश करें"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <section className="bg-white border rounded-xl shadow-sm p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-100">
                <ClipboardDocumentCheckIcon className="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold text-gray-900 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                  {currentLang === "en" ? "Marketplace listings" : "बाज़ार सूचियाँ"}
                </h1>
                <p className={`text-sm text-gray-600 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                  {currentLang === "en"
                    ? "Monitor live listings, update buyer commitments, and keep traceability records export-ready."
                    : "लाइव इन्वेंट्री पर नज़र रखें, खरीदार प्रतिबद्धताएँ अपडेट करें और ट्रेसेबिलिटी रिकॉर्ड निर्यात के लिए तैयार रखें।"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={exportCsv}
                disabled={producerListings.length === 0}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Download className="h-4 w-4" />
                {currentLang === "en" ? "Export CSV" : "CSV निर्यात करें"}
              </button>
              <Link
                href={`${dashboardBasePath}/list`}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                <PlusCircle className="h-4 w-4" />
                {currentLang === "en" ? "List new product" : "नया उत्पाद सूचीबद्ध करें"}
              </Link>
            </div>
          </div>
        </section>

        {!activeAddress && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {currentLang === "en"
              ? "Connect your wallet or complete registration to manage marketplace listings."
              : "बाज़ार सूचियाँ प्रबंधित करने के लिए अपना वॉलेट कनेक्ट करें या पंजीकरण पूर्ण करें।"}
            {!isConnected && (
              <button
                onClick={() => connectWallet().catch(console.error)}
                className="ml-4 inline-flex items-center gap-2 rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
              >
                <PlusCircle className="h-3 w-3" />
                {currentLang === "en" ? "Connect wallet" : "वॉलेट जोड़ें"}
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-100">
                <ClipboardDocumentCheckIcon className="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {currentLang === "en" ? "Total listings" : "कुल लिस्टिंग्स"}
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{listingStats.total}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
                <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {currentLang === "en" ? "Active listings" : "सक्रिय लिस्टिंग"}
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{listingStats.byStatus.active}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <CubeIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {currentLang === "en" ? "Total quantity" : "कुल मात्रा"}
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{listingStats.quantity}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                <CurrencyRupeeIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {currentLang === "en" ? "Potential value" : "संभावित मूल्य"}
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{formatCurrency(listingStats.value)}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border bg-white shadow-sm p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-wrap gap-3">
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={
                  currentLang === "en" ? "Search listings..." : "लिस्टिंग खोजें..."
                }
                className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">
                  {currentLang === "en" ? "All statuses" : "सभी स्थिति"}
                </option>
                <option value="active">{statusLabels.active[currentLang]}</option>
                <option value="sold">{statusLabels.sold[currentLang]}</option>
                <option value="cancelled">{statusLabels.cancelled[currentLang]}</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              {currentLang === "en"
                ? `Showing ${filteredListings.length} of ${producerListings.length} listings`
                : `${producerListings.length} में से ${filteredListings.length} लिस्टिंग दिखा रहे हैं`}
            </div>
          </div>
        </section>

        <section className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    {currentLang === "en" ? "Product" : "उत्पाद"}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    {currentLang === "en" ? "Quantity" : "मात्रा"}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    {currentLang === "en" ? "Price / unit" : "प्रति इकाई मूल्य"}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    {currentLang === "en" ? "Status" : "स्थिति"}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    {currentLang === "en" ? "Created" : "निर्मित"}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    {currentLang === "en" ? "Actions" : "क्रियाएँ"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    </td>
                  </tr>
                ) : filteredListings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                      {currentLang === "en"
                        ? "No listings found."
                        : "कोई लिस्टिंग नहीं मिली।"}
                    </td>
                  </tr>
                ) : (
                  filteredListings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{listing.name}</div>
                        <div className="text-xs text-gray-500">{listing.category}</div>
                      </td>
                      <td className="px-4 py-3">
                        {listing.quantity} {listing.unit}
                      </td>
                      <td className="px-4 py-3">{formatCurrency(listing.price)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses[listing.status]}`}
                        >
                          {statusLabels[listing.status][currentLang]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(listing.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => setEditingProduct(listing)}
                            className="inline-flex items-center gap-1 rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            <Pencil className="h-3 w-3" />
                            {currentLang === "en" ? "Edit" : "संपादित करें"}
                          </button>
                          {renderStatusActions(listing)}
                          <button
                            onClick={() => openTransferModal(listing)}
                            disabled={!listing.batchId}
                            className="inline-flex items-center gap-1 rounded border border-blue-200 px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <ArrowLeftIcon className="h-3 w-3 rotate-180" />
                            {currentLang === "en" ? "Transfer" : "हस्तांतरण"}
                          </button>
                          <button
                            onClick={() => removeListing(listing)}
                            disabled={deletingId === listing.id}
                            className="inline-flex items-center gap-1 rounded border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingId === listing.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                            <span>{currentLang === "en" ? "Delete" : "हटाएँ"}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {currentLang === "en" ? "Edit listing" : "लिस्टिंग संपादित करें"}
                </h2>
                <p className="text-xs text-gray-500">{editingProduct.name}</p>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="rounded p-1 text-gray-500 hover:bg-gray-100"
                aria-label={currentLang === "en" ? "Close editor" : "संपादन बंद करें"}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4 px-5 py-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-gray-700">
                  {currentLang === "en"
                    ? "Price per unit"
                    : "प्रति इकाई मूल्य"}
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editDraft.price}
                    onChange={(event) =>
                      setEditDraft((state) => ({
                        ...state,
                        price: Number(event.target.value)
                      }))
                    }
                    className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-gray-700">
                  {currentLang === "en" ? "Quantity" : "मात्रा"}
                  <input
                    type="number"
                    min="0"
                    value={editDraft.quantity}
                    onChange={(event) =>
                      setEditDraft((state) => ({
                        ...state,
                        quantity: Number(event.target.value)
                      }))
                    }
                    className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-gray-700">
                  {currentLang === "en" ? "Unit" : "इकाई"}
                  <input
                    value={editDraft.unit}
                    onChange={(event) =>
                      setEditDraft((state) => ({
                        ...state,
                        unit: event.target.value
                      }))
                    }
                    className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-gray-700">
                  {currentLang === "en" ? "Status" : "स्थिति"}
                  <select
                    value={editDraft.status}
                    onChange={(event) =>
                      setEditDraft((state) => ({
                        ...state,
                        status: event.target.value as Product["status"]
                      }))
                    }
                    className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="active">
                      {statusLabels.active[currentLang]}
                    </option>
                    <option value="sold">
                      {statusLabels.sold[currentLang]}
                    </option>
                    <option value="cancelled">
                      {statusLabels.cancelled[currentLang]}
                    </option>
                  </select>
                </label>
              </div>
              <label className="flex flex-col gap-1 text-sm text-gray-700">
                {currentLang === "en" ? "Description" : "विवरण"}
                <textarea
                  value={editDraft.description}
                  onChange={(event) =>
                    setEditDraft((state) => ({
                      ...state,
                      description: event.target.value
                    }))
                  }
                  className="min-h-[120px] rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </label>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {currentLang === "en" ? "Cancel" : "रद्द करें"}
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="inline-flex items-center gap-2 rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {isSavingEdit ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {currentLang === "en" ? "Save changes" : "परिवर्तन सहेजें"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {transferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {currentLang === "en" ? "Transfer ownership" : "स्वामित्व हस्तांतरण"}
                </h2>
                <p className="text-xs text-gray-500">
                  {currentLang === "en" ? "Batch" : "बैच"}: {transferModal.product.batchId}
                </p>
              </div>
              <button
                onClick={closeTransferModal}
                className="rounded p-1 text-gray-500 hover:bg-gray-100"
                aria-label={currentLang === "en" ? "Close transfer dialog" : "संवाद बंद करें"}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleTransferSubmit} className="space-y-5 px-5 py-5">
              <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50/60 p-5 text-center">
                <p className={`text-xs font-semibold uppercase tracking-wide text-blue-600 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                  {currentLang === "en" ? "Demo OTP to share with buyer" : "खरीदार के साथ साझा करने के लिए डेमो OTP"}
                </p>
                <p className="mt-2 font-mono text-3xl text-blue-800">{transferModal.otp}</p>
                <p className={`mt-2 text-xs text-blue-700 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                  {currentLang === "en"
                    ? "Share this code with the next party. Enter it below once they confirm."
                    : "यह कोड अगली पार्टी को साझा करें। पुष्टि मिलने पर नीचे दर्ज करें।"}
                </p>
              </div>

              <div className="space-y-3">
                <label className={`flex flex-col gap-1 text-sm font-medium text-gray-700 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                  {currentLang === "en" ? "Recipient wallet / ID" : "प्राप्तकर्ता वॉलेट / आईडी"}
                  <input
                    value={transferForm.recipientAddress}
                    onChange={(event) =>
                      setTransferForm((state) => ({ ...state, recipientAddress: event.target.value }))
                    }
                    placeholder={currentLang === "en" ? "0xABC... or phone-based ID" : "0xABC... या फोन आधारित आईडी"}
                    className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </label>
                <label className={`flex flex-col gap-1 text-sm font-medium text-gray-700 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                  {currentLang === "en" ? "Notes (optional)" : "नोट्स (वैकल्पिक)"}
                  <textarea
                    value={transferForm.note}
                    onChange={(event) =>
                      setTransferForm((state) => ({ ...state, note: event.target.value }))
                    }
                    className="min-h-[72px] rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder={currentLang === "en"
                      ? "Add context like truck number, storage handover, etc."
                      : "ट्रक नंबर, गोदाम हस्तांतरण आदि जैसे विवरण जोड़ें"}
                  />
                </label>
                <label className={`flex flex-col gap-1 text-sm font-medium text-gray-700 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                  {currentLang === "en" ? "Enter OTP from buyer" : "खरीदार से प्राप्त OTP दर्ज करें"}
                  <input
                    value={transferForm.otp}
                    onChange={(event) =>
                      setTransferForm((state) => ({ ...state, otp: event.target.value }))
                    }
                    placeholder="123456"
                    className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </label>
                <div className="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
                  <p className={currentLang === "hi" ? "font-hindi" : ""}>
                    {currentLang === "en"
                      ? `You are transferring this lot to the ${transferModal.recipientRole}.`
                      : `आप यह लॉट ${transferModal.recipientRole === "intermediary" ? "मध्यस्थ" : "खुदरा विक्रेता"} को स्थानांतरित कर रहे हैं।`}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={closeTransferModal}
                  className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  {currentLang === "en" ? "Cancel" : "रद्द"}
                </button>
                <button
                  type="submit"
                  disabled={isTransferring}
                  className="inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isTransferring && <Loader2 className="h-4 w-4 animate-spin" />}
                  {currentLang === "en" ? "Confirm transfer" : "हस्तांतरण पुष्टि करें"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
