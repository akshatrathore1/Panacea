import { redirect } from 'next/navigation'

// Redirect root /marketplace to the dashboard marketplace handler which contains
// the full marketplace UI. This avoids a 404 when users click links that point
// to /marketplace while preserving a single canonical UI implementation.
export default function MarketplaceRootPage() {
  redirect('/dashboard/marketplace')
}
