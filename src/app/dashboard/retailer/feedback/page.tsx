'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
    ArrowLeftIcon,
    ChatBubbleLeftRightIcon,
    StarIcon,
    EnvelopeOpenIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline'
import LanguageToggle from '@/components/LanguageToggle'
import { useLanguage } from '@/hooks/useLanguage'

export default function RetailerFeedbackPage() {
    const { language: currentLang } = useLanguage()

    const feedbackEntries = useMemo(
        () => [
            {
                id: 'FDBK-231',
                customer: currentLang === 'en' ? 'Anita Gupta' : 'अनीता गुप्ता',
                rating: 5,
                highlight:
                    currentLang === 'en'
                        ? 'Loved the freshness of spinach and packaging hygiene.'
                        : 'पालक की ताजगी और पैकेजिंग स्वच्छता बहुत पसंद आई।',
                submittedAt: currentLang === 'en' ? '13 Nov, 4:20 PM' : '13 नवम्बर, 4:20 अपराह्न',
                followUp:
                    currentLang === 'en'
                        ? 'Sent thank-you coupon'
                        : 'धन्यवाद कूपन भेजा गया',
                status: 'closed' as const
            },
            {
                id: 'FDBK-224',
                customer: currentLang === 'en' ? 'Vikram Singh' : 'विक्रम सिंह',
                rating: 3,
                highlight:
                    currentLang === 'en'
                        ? 'Asked for tighter sealing on bulk grains to avoid spillage.'
                        : 'थोक अनाज के लिए पैकिंग को अधिक कसाव देने का अनुरोध किया।',
                submittedAt: currentLang === 'en' ? '12 Nov, 7:45 PM' : '12 नवम्बर, 7:45 अपराह्न',
                followUp:
                    currentLang === 'en'
                        ? 'Pending quality call-back'
                        : 'गुणवत्ता कॉल-बैक लंबित',
                status: 'open' as const
            },
            {
                id: 'FDBK-219',
                customer: currentLang === 'en' ? 'Meera Sharma' : 'मीरा शर्मा',
                rating: 4,
                highlight:
                    currentLang === 'en'
                        ? 'Appreciated quick checkout but wants clearer millet labelling.'
                        : 'तेज चेकआउट पसंद आया पर बाजरा लेबलिंग स्पष्ट करने का सुझाव दिया।',
                submittedAt: currentLang === 'en' ? '11 Nov, 2:05 PM' : '11 नवम्बर, 2:05 अपराह्न',
                followUp:
                    currentLang === 'en'
                        ? 'Label update scheduled'
                        : 'लेबल अद्यतन निर्धारित',
                status: 'in-progress' as const
            }
        ],
        [currentLang]
    )

    const summary = useMemo(
        () => ({
            ratingsReceived: feedbackEntries.length,
            responseTime: currentLang === 'en' ? '6 hours median' : 'माध्य 6 घंटे',
            unresolvedCount: feedbackEntries.filter((entry) => entry.status !== 'closed').length
        }),
        [feedbackEntries, currentLang]
    )

    const statusMeta: Record<string, { label: { en: string; hi: string }; badge: string }> = {
        open: {
            label: { en: 'Open', hi: 'खुला' },
            badge: 'bg-red-100 text-red-700'
        },
        'in-progress': {
            label: { en: 'In progress', hi: 'प्रगति में' },
            badge: 'bg-amber-100 text-amber-700'
        },
        closed: {
            label: { en: 'Closed', hi: 'पूर्ण' },
            badge: 'bg-green-100 text-green-700'
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4">
                        <Link
                            href="/dashboard/retailer"
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                            <span className={currentLang === 'hi' ? 'font-hindi' : ''}>
                                {currentLang === 'en' ? 'Back to dashboard' : 'डैशबोर्ड पर वापस'}
                            </span>
                        </Link>
                        <LanguageToggle />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                <section className="bg-white border rounded-xl shadow-sm p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100">
                                <ChatBubbleLeftRightIcon className="h-6 w-6 text-teal-600" />
                            </div>
                            <div>
                                <h1 className={`text-2xl font-bold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Customer Feedback' : 'ग्राहक प्रतिक्रिया'}
                                </h1>
                                <p className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en'
                                        ? 'Track sentiment, respond to shoppers, and close the loop on store improvements.'
                                        : 'भावना ट्रैक करें, ग्राहकों को जवाब दें और स्टोर सुधारों को पूरा करें।'}
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2 text-sm text-gray-500 text-center md:text-right">
                            <span className={currentLang === 'hi' ? 'font-hindi' : ''}>
                                {currentLang === 'en' ? 'Rolling 14-day window' : 'पिछले 14 दिनों का डेटा'}
                            </span>
                            <span className={currentLang === 'hi' ? 'font-hindi' : ''}>
                                {currentLang === 'en' ? 'Feedback synced nightly' : 'प्रतिदिन रात को प्रतिक्रिया सिंक होती है'}
                            </span>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-xl border bg-white p-6 shadow-sm flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                            <StarIcon className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className={`text-sm text-gray-500 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en' ? 'Ratings received' : 'प्राप्त रेटिंग्स'}
                            </p>
                            <p className="text-2xl font-semibold text-gray-900">{summary.ratingsReceived}</p>
                            <p className={`text-xs text-gray-500 mt-1 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en' ? 'Total feedback tickets' : 'कुल फीडबैक टिकट'}
                            </p>
                        </div>
                    </div>
                    <div className="rounded-xl border bg-white p-6 shadow-sm flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                            <EnvelopeOpenIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className={`text-sm text-gray-500 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en' ? 'Median response time' : 'माध्य प्रतिक्रिया समय'}
                            </p>
                            <p className="text-2xl font-semibold text-gray-900">{summary.responseTime}</p>
                            <p className={`text-xs text-gray-500 mt-1 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en' ? 'From ticket creation to first reply' : 'टिकट बनने से पहली प्रतिक्रिया तक'}
                            </p>
                        </div>
                    </div>
                    <div className="rounded-xl border bg-white p-6 shadow-sm flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                            <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className={`text-sm text-gray-500 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en' ? 'Open follow-ups' : 'खुले फॉलो-अप'}
                            </p>
                            <p className="text-2xl font-semibold text-gray-900">{summary.unresolvedCount}</p>
                            <p className={`text-xs text-gray-500 mt-1 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en'
                                    ? 'Prioritise shoppers waiting for resolution'
                                    : 'समाधान की प्रतीक्षा कर रहे ग्राहकों को प्राथमिकता दें'}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="bg-white border rounded-xl shadow-sm">
                    <div className="border-b border-gray-200 p-6 flex items-center justify-between">
                        <h2 className={`text-xl font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                            {currentLang === 'en' ? 'Recent responses' : 'हाल की प्रतिक्रियाएँ'}
                        </h2>
                        <span className={`text-sm text-gray-500 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                            {currentLang === 'en'
                                ? `${feedbackEntries.length} feedback items`
                                : `${feedbackEntries.length} प्रतिक्रिया आइटम`}
                        </span>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {feedbackEntries.map((entry) => {
                            const meta = statusMeta[entry.status]
                            return (
                                <article key={entry.id} className="p-6">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className={`text-lg font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                    {entry.customer}
                                                </h3>
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${meta.badge}`}>
                                                    {meta.label[currentLang]}
                                                </span>
                                            </div>
                                            <p className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                {entry.highlight}
                                            </p>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <div className="flex items-center justify-end gap-1 text-amber-500">
                                                {Array.from({ length: 5 }).map((_, index) => (
                                                    <StarIcon
                                                        key={index}
                                                        className={`h-4 w-4 ${index < entry.rating ? 'fill-current' : 'text-gray-300'}`}
                                                    />
                                                ))}
                                            </div>
                                            <p className={`text-xs text-gray-500 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                {entry.submittedAt}
                                            </p>
                                            <p className={`text-xs text-gray-500 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                {entry.followUp}
                                            </p>
                                        </div>
                                    </div>
                                </article>
                            )
                        })}
                    </div>
                </section>
            </main>
        </div>
    )
}
