"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
    ArrowLeftIcon,
    ArrowPathIcon,
    ArrowRightIcon,
    MegaphoneIcon,
    PlusIcon,
    UserGroupIcon
} from "@heroicons/react/24/outline";
import LogoutButton from "@/components/LogoutButton";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/hooks/useLanguage";
import type { LanguageCode } from "@/lib/language";

type Language = LanguageCode;

const formatDateTime = (value: string, lang: Language) => {
    const locale = lang === "en" ? "en-IN" : "hi-IN";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    const datePart = date.toLocaleDateString(locale, {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
    const timePart = date.toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });

    return `${datePart} · ${timePart}`;
};

type Reply = {
    id: string;
    author: string;
    content: string;
    createdAt: string;
};

type Post = {
    id: string;
    title: string;
    author: string;
    content: string;
    createdAt: string;
    replies: Reply[];
};

export default function DiscussionForumPage() {
    const { language: currentLang } = useLanguage();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<Post | null>(null);

    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const [author, setAuthor] = useState("");

    const [replyContent, setReplyContent] = useState("");
    const [replyAuthor, setReplyAuthor] = useState("");

    const [submittingDiscussion, setSubmittingDiscussion] = useState(false);
    const [submittingReply, setSubmittingReply] = useState(false);
    const [isDiscussionModalOpen, setIsDiscussionModalOpen] = useState(false);

    const threadDetailRef = useRef<HTMLDivElement | null>(null);

    const fetchPosts = useCallback(async (): Promise<Post[]> => {
        setLoading(true);
        try {
            const res = await fetch("/api/forum");
            if (!res.ok) {
                console.error("Failed to load discussions", await res.text());
                return [];
            }
            const data = (await res.json()) as Post[];
            setPosts(data);
            setSelected((prev) => (prev ? data.find((post) => post.id === prev.id) ?? null : null));
            return data;
        } catch (error) {
            console.error("Failed to load discussions", error);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchPosts();
    }, [fetchPosts]);

    useEffect(() => {
        if (selected && threadDetailRef.current) {
            threadDetailRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [selected]);

    const openDiscussionModal = useCallback(() => {
        setIsDiscussionModalOpen(true);
    }, []);

    const closeDiscussionModal = useCallback(() => {
        setIsDiscussionModalOpen(false);
        setNewTitle("");
        setNewContent("");
        setAuthor("");
    }, []);

    const anonymousLabel = currentLang === "en" ? "Anonymous" : "अनाम";

    const createPost = useCallback(
        async (event?: React.FormEvent) => {
            event?.preventDefault();
            if (!newTitle.trim() || !newContent.trim()) return;
            setSubmittingDiscussion(true);
            try {
                const res = await fetch("/api/forum", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: "post",
                        title: newTitle,
                        content: newContent,
                        author: author || anonymousLabel
                    })
                });
                if (!res.ok) {
                    console.error("Failed to create discussion", await res.text());
                    return;
                }
                setNewTitle("");
                setNewContent("");
                setAuthor("");
                const data = await fetchPosts();
                if (data.length) {
                    const newest = data
                        .slice()
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                    if (newest) setSelected(newest);
                }
                closeDiscussionModal();
            } catch (error) {
                console.error("Failed to create discussion", error);
            } finally {
                setSubmittingDiscussion(false);
            }
        },
        [newTitle, newContent, author, anonymousLabel, fetchPosts, closeDiscussionModal]
    );

    const submitReply = useCallback(
        async (event?: React.FormEvent) => {
            event?.preventDefault();
            if (!selected || !replyContent.trim()) return;
            setSubmittingReply(true);
            try {
                const res = await fetch("/api/forum", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: "reply",
                        postId: selected.id,
                        content: replyContent,
                        author: replyAuthor || anonymousLabel
                    })
                });
                if (!res.ok) {
                    console.error("Failed to submit reply", await res.text());
                    return;
                }
                setReplyContent("");
                setReplyAuthor("");
                const data = await fetchPosts();
                const updated = data.find((post) => post.id === selected.id);
                setSelected(updated ?? null);
            } catch (error) {
                console.error("Failed to submit reply", error);
            } finally {
                setSubmittingReply(false);
            }
        },
        [selected, replyContent, replyAuthor, anonymousLabel, fetchPosts]
    );

    const stats = useMemo(() => {
        const totalThreads = posts.length;
        const totalReplies = posts.reduce((acc, post) => acc + post.replies.length, 0);
        const dayMs = 24 * 60 * 60 * 1000;
        const now = Date.now();
        const last24h = posts.filter((post) => now - new Date(post.createdAt).getTime() <= dayMs).length;
        const unanswered = posts.filter((post) => post.replies.length === 0).length;
        return { totalThreads, totalReplies, last24h, unanswered };
    }, [posts]);

    const guidelineItems = currentLang === "en"
        ? [
            "Keep conversations respectful and on-topic.",
            "Share verifiable data wherever possible.",
            "Avoid sharing personal contact information."
        ]
        : [
            "चर्चा को सम्मानजनक और विषय पर केंद्रित रखें।",
            "जहाँ संभव हो सत्यापित डेटा साझा करें।",
            "व्यक्तिगत संपर्क जानकारी साझा न करें।"
        ];

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
                        <div className="flex items-center gap-3">
                            <LogoutButton />
                            <LanguageToggle />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                <section className="bg-white border rounded-xl shadow-sm p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className={`text-2xl font-bold text-gray-900 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                                {currentLang === "en" ? "Discussion Forum" : "चर्चा मंच"}
                            </h1>
                            <p className={`mt-2 text-sm text-gray-600 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                                {currentLang === "en"
                                    ? "Share field updates, input prices, and crop advice with fellow KrashiAalok farmers."
                                    : "खेत की जानकारी, इनपुट कीमतें और फसल सलाह अपने KrashiAalok साथियों के साथ साझा करें।"}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={openDiscussionModal}
                            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                        >
                            <PlusIcon className="h-5 w-5" />
                            <span className={currentLang === "hi" ? "font-hindi" : ""}>
                                {currentLang === "en" ? "Start new discussion" : "नई चर्चा शुरू करें"}
                            </span>
                        </button>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border bg-white p-4 shadow-sm">
                        <p className={`text-xs font-semibold uppercase tracking-wide text-gray-500 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                            {currentLang === "en" ? "Active discussions" : "सक्रिय चर्चाएँ"}
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-gray-900">{stats.totalThreads}</p>
                    </div>
                    <div className="rounded-xl border bg-white p-4 shadow-sm">
                        <p className={`text-xs font-semibold uppercase tracking-wide text-gray-500 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                            {currentLang === "en" ? "Replies shared" : "साझा उत्तर"}
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-gray-900">{stats.totalReplies}</p>
                    </div>
                    <div className="rounded-xl border bg-white p-4 shadow-sm">
                        <p className={`text-xs font-semibold uppercase tracking-wide text-gray-500 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                            {currentLang === "en" ? "Last 24 hours" : "पिछले 24 घंटे"}
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-gray-900">{stats.last24h}</p>
                    </div>
                    <div className="rounded-xl border bg-white p-4 shadow-sm">
                        <p className={`text-xs font-semibold uppercase tracking-wide text-gray-500 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                            {currentLang === "en" ? "Awaiting replies" : "उत्तर की प्रतीक्षा"}
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-gray-900">{stats.unanswered}</p>
                    </div>
                </section>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <div className="space-y-6 xl:col-span-2">
                        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                                <div>
                                    <h2 className={`text-lg font-semibold text-gray-900 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                                        {currentLang === "en" ? "All discussions" : "सभी चर्चाएँ"}
                                    </h2>
                                    <p className={`mt-1 text-sm text-gray-500 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                                        {currentLang === "en"
                                            ? `Stay updated with ${posts.length} active thread${posts.length === 1 ? "" : "s"}. Select a discussion to view replies.`
                                            : `समुदाय की ${posts.length} सक्रिय चर्चाओं से अपडेट रहें। उत्तर देखने के लिए किसी चर्चा का चयन करें।`}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => void fetchPosts()}
                                    className="inline-flex items-center rounded-full border border-gray-200 p-2 text-gray-500 hover:border-indigo-200 hover:text-indigo-600"
                                >
                                    <ArrowPathIcon className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
                                </button>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {loading && posts.length === 0 ? (
                                    <div className="px-6 py-10 text-center text-sm text-gray-500">
                                        {currentLang === "en" ? "Loading discussions..." : "चर्चाएँ लोड हो रही हैं..."}
                                    </div>
                                ) : posts.length === 0 ? (
                                    <div className="px-6 py-10 text-center text-sm text-gray-500">
                                        {currentLang === "en"
                                            ? "No discussions yet. Be the first to start the conversation."
                                            : "अभी तक कोई चर्चा नहीं है। बातचीत शुरू करने वाले पहले सदस्य बनें।"}
                                    </div>
                                ) : (
                                    posts.map((post) => {
                                        const isActive = selected?.id === post.id;
                                        return (
                                            <button
                                                key={post.id}
                                                type="button"
                                                onClick={() => setSelected(post)}
                                                className={`flex w-full flex-col gap-3 px-6 py-5 text-left transition-colors ${isActive ? "bg-indigo-50/80" : "hover:bg-gray-50"
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <h3 className={`text-base font-semibold text-gray-900 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                                                            {post.title}
                                                        </h3>
                                                        <p className="mt-2 text-sm text-gray-600">
                                                            {post.content.length > 160 ? `${post.content.slice(0, 160)}…` : post.content}
                                                        </p>
                                                    </div>
                                                    <span className="flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 whitespace-nowrap">
                                                        {post.replies.length} {currentLang === "en" ? "Replies" : "उत्तर"}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                    <span className="font-medium text-gray-600">{post.author}</span>
                                                    <span>•</span>
                                                    <span>{formatDateTime(post.createdAt, currentLang)}</span>
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </section>

                        {selected && (
                            <section ref={threadDetailRef} className="rounded-xl border border-gray-200 bg-white shadow-sm">
                                <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
                                    <div>
                                        <h2 className={`text-lg font-semibold text-gray-900 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                                            {selected.title}
                                        </h2>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {currentLang === "en" ? "Posted by" : "द्वारा पोस्ट"}{" "}
                                            <span className="font-medium text-gray-700">{selected.author}</span>{" "}• {formatDateTime(selected.createdAt, currentLang)}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelected(null)}
                                        className="text-sm font-medium text-gray-500 hover:text-gray-700"
                                    >
                                        {currentLang === "en" ? "Close thread" : "चर्चा बंद करें"}
                                    </button>
                                </div>
                                <div className="space-y-6 px-6 py-6">
                                    <p className="text-sm leading-relaxed text-gray-700">{selected.content}</p>
                                    <div>
                                        <h3 className={`text-sm font-semibold text-gray-900 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                                            {currentLang === "en" ? "Replies" : "उत्तर"} ({selected.replies.length})
                                        </h3>
                                        <ul className="mt-3 space-y-3">
                                            {selected.replies.length === 0 ? (
                                                <li className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
                                                    {currentLang === "en"
                                                        ? "No replies yet. Be the first to respond."
                                                        : "अभी तक कोई उत्तर नहीं मिला है। सबसे पहले उत्तर दें।"}
                                                </li>
                                            ) : (
                                                selected.replies.map((reply) => (
                                                    <li key={reply.id} className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
                                                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                            <span className="font-medium text-gray-700">{reply.author}</span>
                                                            <span>•</span>
                                                            <span>{formatDateTime(reply.createdAt, currentLang)}</span>
                                                        </div>
                                                        <p className="mt-2 text-sm text-gray-700">{reply.content}</p>
                                                    </li>
                                                ))
                                            )}
                                        </ul>
                                    </div>
                                    <form onSubmit={submitReply} className="space-y-3">
                                        <div>
                                            <label className={`block text-sm font-medium text-gray-700 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                                                {currentLang === "en" ? "Share a reply" : "अपना उत्तर लिखें"}
                                            </label>
                                            <textarea
                                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                placeholder={currentLang === "en" ? "Add your response for the community." : "समुदाय के लिए अपना उत्तर साझा करें।"}
                                                rows={3}
                                                value={replyContent}
                                                onChange={(event) => setReplyContent(event.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium text-gray-700 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                                                {currentLang === "en" ? "Your name (optional)" : "आपका नाम (वैकल्पिक)"}
                                            </label>
                                            <input
                                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                placeholder={currentLang === "en" ? "Tell us who is replying." : "उत्तर देने वाले का परिचय दें।"}
                                                value={replyAuthor}
                                                onChange={(event) => setReplyAuthor(event.target.value)}
                                            />
                                        </div>
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setReplyContent("");
                                                    setReplyAuthor("");
                                                }}
                                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                                            >
                                                {currentLang === "en" ? "Clear" : "रीसेट"}
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={submittingReply}
                                                className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {submittingReply && <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />}
                                                {currentLang === "en" ? "Send reply" : "उत्तर भेजें"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </section>
                        )}
                    </div>

                    <aside className="space-y-6">
                        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="flex items-center gap-4 border-b border-gray-200 px-6 py-4">
                                <MegaphoneIcon className="h-6 w-6 text-indigo-500" />
                                <h3 className={`text-base font-semibold text-gray-900 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                                    {currentLang === "en" ? "Tools" : "उपकरण"}
                                </h3>
                            </div>
                            <div className="space-y-3 px-6 py-5">
                                <button
                                    type="button"
                                    onClick={openDiscussionModal}
                                    className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:border-indigo-200 hover:bg-indigo-50"
                                >
                                    <span className={currentLang === "hi" ? "font-hindi" : ""}>
                                        {currentLang === "en" ? "Start new discussion" : "नई चर्चा शुरू करें"}
                                    </span>
                                    <PlusIcon className="h-5 w-5" />
                                </button>
                                <Link
                                    href="/dashboard/marketplace"
                                    className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:border-indigo-200 hover:bg-indigo-50"
                                >
                                    <span className={currentLang === "hi" ? "font-hindi" : ""}>
                                        {currentLang === "en" ? "Explore marketplace" : "मार्केटप्लेस देखें"}
                                    </span>
                                    <ArrowRightIcon className="h-5 w-5" />
                                </Link>
                            </div>
                        </section>

                        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="px-6 py-5">
                                <div className="flex items-center gap-4">
                                    <div className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center text-indigo-600">
                                        <UserGroupIcon className="h-6 w-6" />
                                    </div>
                                    <h3 className={`text-base font-semibold text-gray-900 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                                        {currentLang === "en" ? "Community Guidelines" : "सामुदायिक दिशानिर्देश"}
                                    </h3>
                                </div>
                                <div className="mt-4 space-y-3">
                                    {guidelineItems.map((text, index) => (
                                        <div
                                            key={`${currentLang}-guideline-${index}`}
                                            className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
                                        >
                                            <p className={`text-sm text-gray-700 leading-relaxed ${currentLang === "hi" ? "font-hindi" : ""}`}>
                                                <span className="mr-2 font-semibold text-indigo-600">{index + 1}.</span>
                                                {text}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </aside>
                </div>
            </main>

            {isDiscussionModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
                    <div className="absolute inset-0 bg-gray-900/40" onClick={closeDiscussionModal} />
                    <div className="relative z-10 w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-xl">
                        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
                            <div>
                                <h2 className={`text-lg font-semibold text-gray-900 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                                    {currentLang === "en" ? "Start a new discussion" : "नई चर्चा शुरू करें"}
                                </h2>
                                <p className={`mt-1 text-sm text-gray-500 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                                    {currentLang === "en"
                                        ? "Post a topic to collaborate with others."
                                        : "अन्य लोगों के साथ सहयोग करने के लिए एक विषय पोस्ट करें।"}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeDiscussionModal}
                                className="rounded-lg border border-gray-200 px-3 py-1 text-sm font-semibold text-gray-500 hover:bg-gray-50"
                            >
                                {currentLang === "en" ? "Close" : "बंद करें"}
                            </button>
                        </div>
                        <form onSubmit={createPost} className="space-y-4 px-6 py-6">
                            <div>
                                <label className={`block text-sm font-medium text-gray-700 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                                    {currentLang === "en" ? "Discussion title" : "चर्चा का शीर्षक"}
                                </label>
                                <input
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder={currentLang === "en" ? "What would you like to ask or share?" : "आप क्या पूछना या साझा करना चाहते हैं?"}
                                    value={newTitle}
                                    onChange={(event) => setNewTitle(event.target.value)}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium text-gray-700 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                                    {currentLang === "en" ? "Share your message" : "अपना संदेश साझा करें"}
                                </label>
                                <textarea
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder={currentLang === "en" ? "Add context, data points, or details in plain text." : "संदर्भ, डेटा बिंदु या विवरण साधारण पाठ में जोड़ें।"}
                                    rows={4}
                                    value={newContent}
                                    onChange={(event) => setNewContent(event.target.value)}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium text-gray-700 ${currentLang === "hi" ? "font-hindi" : ""}`}>
                                    {currentLang === "en" ? "Your name (optional)" : "आपका नाम (वैकल्पिक)"}
                                </label>
                                <input
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder={currentLang === "en" ? "How should the community address you?" : "समुदाय आपको किस नाम से संबोधित करे?"}
                                    value={author}
                                    onChange={(event) => setAuthor(event.target.value)}
                                />
                            </div>
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setNewTitle("");
                                        setNewContent("");
                                        setAuthor("");
                                    }}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                                >
                                    {currentLang === "en" ? "Clear" : "रीसेट"}
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingDiscussion}
                                    className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {submittingDiscussion && <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />}
                                    {currentLang === "en" ? "Post discussion" : "चर्चा पोस्ट करें"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}