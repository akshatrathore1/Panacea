"use client"

import { useMemo } from "react"
import type { ElementType, SVGProps } from "react"
import Link from "next/link"
import {
  ArrowLeftIcon,
  ChartBarIcon,
  CurrencyRupeeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  Squares2X2Icon,
  BuildingStorefrontIcon,
  ClipboardDocumentCheckIcon,
  CalendarDaysIcon
} from "@heroicons/react/24/outline"
import LanguageToggle from "@/components/LanguageToggle"
import { useLanguage } from "@/hooks/useLanguage"

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
})

type StatTrend = {
  direction: "up" | "down"
  value: string
}

type IconComponent = ElementType<SVGProps<SVGSVGElement>>

type CommitmentStatus = "fulfilled" | "inProgress" | "planning"

export default function ProducerAnalyticsPage() {
  const { language: currentLang } = useLanguage()

  const summaryMeta = useMemo(
    () => ({
      period: currentLang === "en" ? "Rabi 2024-25 crop cycle" : "रबी 2024-25 फसल चक्र",
      updated: currentLang === "en" ? "Updated 12 Nov, 6:20 PM" : "12 नवम्बर, शाम 6:20 पर अपडेट"
    }),
    [currentLang]
  )

  const stats = useMemo(
    () => [
      {
        label: currentLang === "en" ? "Sell-through rate" : "बिक्री पूर्णता दर",
        value: "86%",
        helper: currentLang === "en" ? "Across confirmed buyer orders" : "पुष्ट खरीदार ऑर्डर में",
        icon: ChartBarIcon,
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-600",
        trend: {
          direction: "up",
          value: currentLang === "en" ? "+6 pts vs last season" : "पिछले सीज़न से +6 अंक"
        } as StatTrend
      },
      {
        label: currentLang === "en" ? "Average sale price" : "औसत बिक्री मूल्य",
        value: INR.format(2650),
        helper: currentLang === "en" ? "Premium wheat & chickpea lots" : "प्रीमियम गेहूं व चना लॉट",
        icon: CurrencyRupeeIcon,
        iconBg: "bg-yellow-100",
        iconColor: "text-yellow-600"
      },
      {
        label: currentLang === "en" ? "Active institutional buyers" : "सक्रिय संस्थागत खरीदार",
        value: "7",
        helper: currentLang === "en" ? "Long-term supply relationships" : "दीर्घकालिक आपूर्ति संबंध",
        icon: BuildingStorefrontIcon,
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600"
      },
      {
        label: currentLang === "en" ? "Cultivated acreage" : "कुल खेती क्षेत्र",
        value: currentLang === "en" ? "42 acres" : "42 एकड़",
        helper: currentLang === "en" ? "Across Kharif & Rabi seasons" : "खरीफ व रबी दोनों सीज़न में",
        icon: Squares2X2Icon,
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600"
      }
    ],
    [currentLang]
  )

  const seasonPerformance = useMemo(
    () => [
      {
        season: currentLang === "en" ? "Kharif 2024" : "खरीफ 2024",
        cropMix: currentLang === "en" ? "Soybean • Tur dal" : "सोयाबीन • तूर दाल",
        acreage: currentLang === "en" ? "18 acres" : "18 एकड़",
        yield: currentLang === "en" ? "62 tonnes" : "62 टन",
        sellThrough: "81%",
        highlight:
          currentLang === "en"
            ? "Primary buyers: AgroBazaar, CityFresh"
            : "मुख्य खरीदार: एग्रोबाज़ार, सिटीफ्रेश"
      },
      {
        season: currentLang === "en" ? "Rabi 2024-25" : "रबी 2024-25",
        cropMix: currentLang === "en" ? "Wheat (Sharbati) • Chickpea" : "गेहूं (शरबती) • चना",
        acreage: currentLang === "en" ? "24 acres" : "24 एकड़",
        yield: currentLang === "en" ? "86 tonnes" : "86 टन",
        sellThrough: "92%",
        highlight:
          currentLang === "en"
            ? "Repeat demand from city retailers"
            : "शहर के रिटेलरों से लगातार मांग"
      },
      {
        season: currentLang === "en" ? "Summer 2025" : "ग्रीष्म 2025",
        cropMix: currentLang === "en" ? "Okra • Cucumber (net-house)" : "भिंडी • खीरा (नेट-हाउस)",
        acreage: currentLang === "en" ? "6 acres" : "6 एकड़",
        yield: currentLang === "en" ? "18 tonnes" : "18 टन",
        sellThrough: "79%",
        highlight:
          currentLang === "en"
            ? "Traceability enabled premium pricing"
            : "ट्रेसेबिलिटी से प्रीमियम मूल्य प्राप्त"
      }
    ],
    [currentLang]
  )

  const commitmentStatusMeta: Record<CommitmentStatus, { badge: string; label: string }> = {
    fulfilled: {
      badge: "bg-emerald-100 text-emerald-700",
      label: currentLang === "en" ? "Dispatched" : "प्रेषित"
    },
    inProgress: {
      badge: "bg-amber-100 text-amber-700",
      label: currentLang === "en" ? "In transit" : "रास्ते में"
    },
    planning: {
      badge: "bg-blue-100 text-blue-700",
      label: currentLang === "en" ? "Scheduled" : "निर्धारित"
    }
  }

  const buyerCommitments = useMemo(
    () => [
      {
        buyer: "Annapurna Mart (Delhi)",
        volume: currentLang === "en" ? "18 tonnes wheat (Grade A)" : "18 टन गेहूं (ग्रेड A)",
        price: INR.format(2520),
        status: "fulfilled" as CommitmentStatus,
        nextAction:
          currentLang === "en"
            ? "Collect weighment receipts by 16 Nov"
            : "16 नवम्बर तक वजन पर्चियां प्राप्त करें"
      },
      {
        buyer: "FreshBasket Wholesale (Mumbai)",
        volume: currentLang === "en" ? "12 tonnes chickpea (Kabuli)" : "12 टन चना (काबुली)",
        price: INR.format(2860),
        status: "inProgress" as CommitmentStatus,
        nextAction:
          currentLang === "en"
            ? "Upload final moisture report by 14 Nov"
            : "14 नवम्बर तक अंतिम नमी रिपोर्ट अपलोड करें"
      },
      {
        buyer: "CityFresh Stores (Bengaluru)",
        volume: currentLang === "en" ? "6 tonnes net-house vegetables" : "6 टन नेट-हाउस सब्ज़ियाँ",
        price: INR.format(1980),
        status: "planning" as CommitmentStatus,
        nextAction:
          currentLang === "en"
            ? "Confirm staggered dispatch slots"
            : "स्तरीय डिस्पैच स्लॉट की पुष्टि करें"
      }
    ],
    [currentLang]
  )

  const inputUsage = useMemo(
    () => [
      {
        label: currentLang === "en" ? "Organic compost applied" : "लगाया गया जैविक कंपोस्ट",
        value: 82,
        target: 90,
        helper:
          currentLang === "en"
            ? "82 of 90 planned tonnes applied"
            : "90 नियोजित टन में से 82 लगाया गया",
        colorClass: "bg-emerald-500"
      },
      {
        label: currentLang === "en" ? "Drip irrigation hours" : "ड्रिप सिंचाई घंटे",
        value: 118,
        target: 140,
        helper:
          currentLang === "en"
            ? "Need 22 additional hours this fortnight"
            : "इस पखवाड़े में 22 अतिरिक्त घंटे आवश्यक",
        colorClass: "bg-sky-500"
      },
      {
        label: currentLang === "en" ? "Bio-pesticide coverage" : "जैव-कीटनाशक कवरेज",
        value: 64,
        target: 80,
        helper:
          currentLang === "en"
            ? "Next spray cycle scheduled for Field-3"
            : "अगला छिड़काव फ़ील्ड-3 के लिए निर्धारित",
        colorClass: "bg-amber-500"
      }
    ],
    [currentLang]
  )

  const upcomingTasks = useMemo(
    () => [
      {
        date: currentLang === "en" ? "15 Nov" : "15 नव.",
        activity:
          currentLang === "en"
            ? "Soil micronutrient test report review"
            : "मृदा सूक्ष्म पोषक रिपोर्ट समीक्षा",
        location: currentLang === "en" ? "Field 2" : "फ़ील्ड 2",
        owner: currentLang === "en" ? "Agronomist Nisha" : "एग्रोनोमिस्ट निशा"
      },
      {
        date: currentLang === "en" ? "18 Nov" : "18 नव.",
        activity:
          currentLang === "en"
            ? "Drip line flushing & filter service"
            : "ड्रिप लाइन फ्लशिंग व फ़िल्टर सेवा",
        location: currentLang === "en" ? "Entire farm" : "पूरे खेत",
        owner: currentLang === "en" ? "Irrigation team" : "सिंचाई टीम"
      },
      {
        date: currentLang === "en" ? "21 Nov" : "21 नव.",
        activity:
          currentLang === "en"
            ? "Buyer quality audit (CityFresh Stores)"
            : "खरीदार गुणवत्ता ऑडिट (सिटीफ्रेश स्टोर्स)",
        location: currentLang === "en" ? "Packhouse" : "पैकहाउस",
        owner: currentLang === "en" ? "Operations lead Rohit" : "ऑपरेशन्स प्रमुख रोहित"
      }
    ],
    [currentLang]
  )

  const insights = useMemo(
    () => [
      {
        title:
          currentLang === "en"
            ? "Moisture control improved milling grade"
            : "नमी नियंत्रण ने मिलिंग ग्रेड सुधारा",
        description:
          currentLang === "en"
            ? "Solar drying deck reduced average grain moisture to 11.2%, unlocking higher prices with city mills."
            : "सौर सुखाने डेक ने औसत अनाज नमी 11.2% तक घटाई, जिससे शहर की मिलों से बेहतर मूल्य मिला।"
      },
      {
        title:
          currentLang === "en"
            ? "Diversify buyer mix"
            : "खरीदार मिश्रण विविध बनाएं",
        description:
          currentLang === "en"
            ? "Two retail chains contribute 64% revenue. Explore institutional tie-ups to derisk demand."
            : "दो रिटेल चैन 64% राजस्व देते हैं। मांग का जोखिम घटाने हेतु संस्थागत साझेदारी खोजें।"
      },
      {
        title:
          currentLang === "en"
            ? "Strengthen input scheduling"
            : "इनपुट शेड्यूल मजबूत करें",
        description:
          currentLang === "en"
            ? "Bio-pesticide coverage lags plan by 16%. Align labour rosters before the next spray window."
            : "जैव-कीटनाशक कवरेज योजना से 16% पीछे है। अगले छिड़काव से पहले श्रम रोस्टर समायोजित करें।"
      }
    ],
    [currentLang]
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link
              href="/dashboard/producer"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span className={currentLang === "hi" ? "font-hindi" : ""}>
                {currentLang === "en" ? "Back to dashboard" : "डैशबोर्ड पर वापस"}
              </span>
            </Link>
            <LanguageToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <section className="bg-white border rounded-xl shadow-sm p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold text-gray-900 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                  {currentLang === "en" ? "Farm Performance Overview" : "फार्म प्रदर्शन अवलोकन"}
                </h1>
                <p className={`text-sm text-gray-600 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                  {currentLang === "en"
                    ? "Review harvest output, buyer commitments, and input usage to plan upcoming cycles."
                    : "आगामी चक्रों की योजना हेतु फसल उत्पादन, खरीदार प्रतिबद्धता और इनपुट उपयोग की समीक्षा करें।"}
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500 text-left md:text-right">
              <div className={currentLang === "hi" ? "font-hindi" : ""}>{summaryMeta.period}</div>
              <div className={currentLang === "hi" ? "font-hindi" : ""}>{summaryMeta.updated}</div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border bg-white shadow-sm">
            <div className="border-b border-gray-200 p-6">
              <h2 className={`text-xl font-semibold text-gray-900 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                {currentLang === "en" ? "Seasonal performance" : "मौसमी प्रदर्शन"}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {seasonPerformance.map((season) => (
                <div key={season.season} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className={`text-lg font-semibold text-gray-900 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                        {season.season}
                      </h3>
                      <p className={`mt-1 text-sm text-gray-600 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                        {season.cropMix}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
                      <span className={currentLang === "hi" ? "font-hindi" : ""}>
                        {currentLang === "en" ? "Acreage" : "क्षेत्रफल"}:{" "}
                        <span className="font-semibold text-gray-900">{season.acreage}</span>
                      </span>
                      <span className={currentLang === "hi" ? "font-hindi" : ""}>
                        {currentLang === "en" ? "Yield" : "उत्पादन"}:{" "}
                        <span className="font-semibold text-gray-900">{season.yield}</span>
                      </span>
                      <span className={currentLang === "hi" ? "font-hindi" : ""}>
                        {currentLang === "en" ? "Sell-through" : "बिक्री प्रतिशत"}:{" "}
                        <span className="font-semibold text-gray-900">{season.sellThrough}</span>
                      </span>
                    </div>
                  </div>
                  <p className={`mt-3 text-sm text-gray-500 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                    {season.highlight}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-white shadow-sm">
            <div className="border-b border-gray-200 p-6">
              <h2 className={`text-xl font-semibold text-gray-900 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                {currentLang === "en" ? "Key insights" : "मुख्य अंतर्दृष्टि"}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {insights.map((insight) => (
                <InsightCard key={insight.title} title={insight.title} description={insight.description} />
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border bg-white shadow-sm">
            <div className="border-b border-gray-200 p-6">
              <h2 className={`text-xl font-semibold text-gray-900 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                {currentLang === "en" ? "Buyer commitments" : "खरीदार प्रतिबद्धताएँ"}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {buyerCommitments.map((commitment) => {
                const meta = commitmentStatusMeta[commitment.status]
                return (
                  <div key={commitment.buyer} className="rounded-lg border border-gray-200 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{commitment.buyer}</h3>
                        <p className={`text-sm text-gray-600 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                          {commitment.volume}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-500">{commitment.price}</p>
                        <span
                          className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${meta.badge}`}
                        >
                          <ClipboardDocumentCheckIcon className="h-4 w-4" />
                          {meta.label}
                        </span>
                      </div>
                    </div>
                    <p className={`mt-3 text-sm text-gray-500 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                      {commitment.nextAction}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-xl border bg-white shadow-sm">
            <div className="border-b border-gray-200 p-6">
              <h2 className={`text-xl font-semibold text-gray-900 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                {currentLang === "en" ? "Input utilisation" : "इनपुट उपयोग"}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {inputUsage.map((metric) => (
                <ProgressBar key={metric.label} {...metric} />
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 p-6 flex items-center justify-between">
            <h2 className={`text-xl font-semibold text-gray-900 ${currentLang === "hi" ? "font-hindi" : ""}`}>
              {currentLang === "en" ? "Upcoming schedule" : "आगामी कार्यक्रम"}
            </h2>
            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
              <CalendarDaysIcon className="h-4 w-4" />
              <span className={currentLang === "hi" ? "font-hindi" : ""}>
                {currentLang === "en" ? "Next 10 days" : "अगले 10 दिन"}
              </span>
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    {currentLang === "en" ? "Date" : "तारीख"}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    {currentLang === "en" ? "Activity" : "गतिविधि"}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    {currentLang === "en" ? "Location" : "स्थान"}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    {currentLang === "en" ? "Owner" : "उत्तरदायी"}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingTasks.map((task) => (
                  <tr key={`${task.date}-${task.activity}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{task.date}</td>
                    <td className={`px-4 py-3 text-gray-600 ${currentLang === "hi" ? "font-hindi" : ""}`}>{task.activity}</td>
                    <td className={`px-4 py-3 text-gray-600 ${currentLang === "hi" ? "font-hindi" : ""}`}>{task.location}</td>
                    <td className={`px-4 py-3 text-gray-600 ${currentLang === "hi" ? "font-hindi" : ""}`}>{task.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}

type StatCardProps = {
  label: string
  value: string
  helper?: string
  icon: IconComponent
  iconBg: string
  iconColor: string
  trend?: StatTrend
}

function StatCard({ label, value, helper, icon: Icon, iconBg, iconColor, trend }: StatCardProps) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {helper && <p className="mt-1 text-xs text-gray-500">{helper}</p>}
          {trend && (
            <span
              className={`mt-3 inline-flex items-center gap-1 text-sm ${trend.direction === "up" ? "text-green-600" : "text-red-600"
                }`}
            >
              {trend.direction === "up" ? (
                <ArrowTrendingUpIcon className="h-4 w-4" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4" />
              )}
              {trend.value}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

type ProgressBarProps = {
  label: string
  value: number
  target: number
  helper: string
  colorClass: string
}

function ProgressBar({ label, value, target, helper, colorClass }: ProgressBarProps) {
  const safeTarget = Math.max(target, 1)
  const width = Math.min(100, (value / safeTarget) * 100)

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>{label}</span>
        <span className="font-medium text-gray-900">{value.toLocaleString()}</span>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
        <div className={`h-2 rounded-full ${colorClass}`} style={{ width: `${width}%` }} />
      </div>
      <p className="mt-2 text-xs text-gray-500">{helper}</p>
    </div>
  )
}

type InsightCardProps = {
  title: string
  description: string
}

function InsightCard({ title, description }: InsightCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}