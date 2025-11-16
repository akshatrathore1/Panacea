# KrashiAalok

Transparent, multilingual agricultural supply-chain platform that tokenizes crop batches on-chain, tracks every hand‑off with QR/RFID metadata and gives each stakeholder a purpose-built dashboard.

---

# Highlights

- **Wallet-aware onboarding** via MetaMask + context state management in [`src/components/Providers.tsx`](src/components/Providers.tsx)
- **Role-specific dashboards** (producer, intermediary, retailer, consumer) under [`src/app/dashboard`](src/app/dashboard) with live stats, quick actions, listings and alerts
- **Traceability explorer** at [`src/app/trace/[batchId]/page.tsx`](src/app/trace/%5BbatchId%5D/page.tsx) showing every transaction, quality report and integrity proof
- **Analytics & marketplace insights** backed by locale-aware data visualizations in [`src/app/analytics/page.tsx`](src/app/analytics/page.tsx)
- **Smart-contract layer** ([`contracts/SupplyChain.sol`](contracts/SupplyChain.sol)) with helper bindings in [`src/lib/blockchain.ts`](src/lib/blockchain.ts)
- **In-memory forum API** ([`src/app/api/forum/route.ts`](src/app/api/forum/route.ts)) for community Q&A prototypes
- **Responsive Next.js 15 design** with Tailwind, hero slideshows and bilingual content sourced from [`src/lib/i18n.ts`](src/lib/i18n.ts)

---

# Architecture Overview

| Layer                             | Responsibilities                                    | Key Files                                                                                                              |
| --------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Frontend (Next.js App Router)** | Pages, layouts, hooks, UI widgets                   | [`src/app`](src/app), [`src/components`](src/components)                                                               |
| **State & Context**               | Wallet connectivity, user session, language         | [`src/components/Providers.tsx`](src/components/Providers.tsx), [`src/hooks/useLanguage.ts`](src/hooks/useLanguage.ts) |
| **Blockchain**                    | Batch creation, ownership transfer, quality updates | [`contracts/SupplyChain.sol`](contracts/SupplyChain.sol), [`src/lib/blockchain.ts`](src/lib/blockchain.ts)             |
| **Data mocks / services**         | Forum seed data, analytics seeds                    | [`src/app/api/forum/route.ts`](src/app/api/forum/route.ts), [`src/app/dashboard/*`](src/app/dashboard)                 |

---

# Project Structure

```
src/
├─ app/                  # Pages, layouts, API routes
│  ├─ dashboard/…        # Role dashboards & tooling
│  ├─ marketplace/       # Listings marketplace
│  ├─ trace/[batchId]/   # Traceability explorer
│  └─ api/forum/         # Dev forum route (mock)
├─ components/           # Providers, UI atoms/molecules
├─ hooks/                # Language, toast, wallet helpers
├─ lib/                  # Blockchain + utility modules
└─ styles/               # Tailwind/global styles
contracts/               # Hardhat Solidity sources
scripts/                 # Deployment helpers
public/                  # Static image assets
```

---

# Getting Started

1. **Install**

```bash
npm install
```

2. **Environment**

Create `.env.local`:

```bash
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
WEATHER_API_KEY=...
NEXT_PUBLIC_CONTRACT_ADDRESS=...
SEPOLIA_RPC_URL=...
```

3. **Run**

```bash
npm run dev
```

Visit `http://localhost:3000`.

4. **Lint & Build**

```bash
npm run lint
npm run build
npm start
```

---

# Core Workflows

## Registration & Wallet Connect

- UI: [`src/app/register/page.tsx`](src/app/register/page.tsx)
- Context: [`Providers.connectWallet`](src/components/Providers.tsx) & [`Providers.registerUser`](src/components/Providers.tsx)
- Persists user profile to local storage, ready for MetaMask signer upgrades.

## Batch Tokenization

- Contract: [`SupplyChain.createBatch`](contracts/SupplyChain.sol)
- Helper: [`blockchainHelpers.createBatch`](src/lib/blockchain.ts)
- UI flows: [`src/app/dashboard/producer/create-batch/page.tsx`](src/app/dashboard/producer/create-batch/page.tsx) and intermediary quick actions.

## Traceability & QR/RFID

- Consumer trace view: [`src/app/trace/[batchId]/page.tsx`](src/app/trace/%5BbatchId%5D/page.tsx) reconstructs ownership transfers, quality reports, media and integrity proofs.

## Analytics & Insights

- Global analytics page: [`src/app/analytics/page.tsx`](src/app/analytics/page.tsx)
- Producer: [`src/app/dashboard/producer/analytics/page.tsx`](src/app/dashboard/producer/analytics/page.tsx)
- Intermediary: [`src/app/dashboard/intermediary/analytics/page.tsx`](src/app/dashboard/intermediary/analytics/page.tsx)
- Retailer: [`src/app/dashboard/retailer/analytics/page.tsx`](src/app/dashboard/retailer/analytics/page.tsx)

---

# UI Touchpoints

| Page                                                                                 | Description                                                                           |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| [`src/app/page.tsx`](src/app/page.tsx)                                               | Landing page with hero slideshow, featured workflows, role tiles, process walkthrough |
| [`src/app/dashboard/producer/page.tsx`](src/app/dashboard/producer/page.tsx)         | Producer cockpit: stats, quick actions, forum highlights, schemes                     |
| [`src/app/dashboard/intermediary/page.tsx`](src/app/dashboard/intermediary/page.tsx) | Procurement pipelines, inventory lots, retail commitments                             |
| [`src/app/dashboard/retailer/page.tsx`](src/app/dashboard/retailer/page.tsx)         | Order management, inventory tracking, supplier verification, sales analytics          |
| [`src/app/dashboard/consumer/page.tsx`](src/app/dashboard/consumer/page.tsx)         | Loyalty stats, trusted batches, alerts, quick scan actions                            |

---
