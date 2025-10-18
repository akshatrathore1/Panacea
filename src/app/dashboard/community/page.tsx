```tsx
"use client";

import React, { useEffect, useState } from "react";

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

export default function CommunityPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [selected, setSelected] = useState<Post | null>(null);

    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const [author, setAuthor] = useState("");

    const [replyContent, setReplyContent] = useState("");
    const [replyAuthor, setReplyAuthor] = useState("");

    async function fetchPosts() {
        setLoading(true);
        try {
            const res = await fetch("/api/forum");
            if (res.ok) {
                const data = (await res.json()) as Post[];
                setPosts(data);
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchPosts();
    }, []);

    async function createPost(e?: React.FormEvent) {
        e?.preventDefault();
        if (!newTitle.trim() || !newContent.trim()) return;
        const res = await fetch("/api/forum", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type: "post",
                title: newTitle,
                content: newContent,
                author: author || "Anonymous",
            }),
        });
        if (res.ok) {
            setNewTitle("");
            setNewContent("");
            setAuthor("");
            await fetchPosts();
            // auto-open the newest post
            const newest = posts.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
            if (newest) setSelected(newest);
        }
    }

    async function submitReply(e?: React.FormEvent) {
        e?.preventDefault();
        if (!selected || !replyContent.trim()) return;
        const res = await fetch("/api/forum", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type: "reply",
                postId: selected.id,
                content: replyContent,
                author: replyAuthor || "Anonymous",
            }),
        });
        if (res.ok) {
            setReplyContent("");
            setReplyAuthor("");
            await fetchPosts();
            const fresh = (await (await fetch("/api/forum")).json()) as Post[];
            setSelected(fresh.find((p) => p.id === selected.id) || null);
        }
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Community Forum</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <section className="mb-6 bg-white dark:bg-slate-800 p-4 rounded shadow-sm">
                        <h2 className="text-lg font-medium mb-2">Start a new discussion</h2>
                        <form onSubmit={createPost} className="space-y-3">
                            <input
                                className="w-full border rounded px-3 py-2"
                                placeholder="Title"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                            />
                            <textarea
                                className="w-full border rounded px-3 py-2"
                                placeholder="Write your message..."
                                rows={4}
                                value={newContent}
                                onChange={(e) => setNewContent(e.target.value)}
                            />
                            <input
                                className="w-full border rounded px-3 py-2"
                                placeholder="Your name (optional)"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                            />
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded"
                                >
                                    Post discussion
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="bg-white dark:bg-slate-800 p-4 rounded shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-medium">Discussions</h2>
                            <div className="text-sm text-gray-500">{loading ? "Loading..." : `${posts.length}`}</div>
                        </div>

                        {posts.length === 0 && !loading && <p className="text-sm text-gray-500">No discussions yet.</p>}

                        <ul className="space-y-3">
                            {posts.map((p) => (
                                <li key={p.id} className="border rounded p-3 hover:shadow">
                                    <div className="flex justify-between items-start">
                                        <div className="w-full">
                                            <button onClick={() => setSelected(p)} className="text-left w-full">
                                                <h3 className="font-semibold">{p.title}</h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    {p.content.length > 160 ? `${p.content.slice(0, 160)}…` : p.content}
                                                </p>
                                            </button>
                                        </div>
                                        <div className="text-sm text-gray-500 ml-3 text-right">
                                            <div>{new Date(p.createdAt).toLocaleString()}</div>
                                            <div className="mt-1">{p.replies.length} replies</div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>

                <aside className="space-y-4">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded shadow-sm">
                        <h3 className="font-medium">About</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            This is a community space for Panacea users — ask questions, share tips, and collaborate.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-4 rounded shadow-sm">
                        <h3 className="font-medium">Quick actions</h3>
                        <button
                            onClick={() => {
                                setSelected(null);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="block w-full text-left mt-2 px-3 py-2 border rounded"
                        >
                            New discussion
                        </button>
                        <button onClick={fetchPosts} className="block w-full text-left mt-2 px-3 py-2 border rounded">
                            Refresh list
                        </button>
                    </div>
                </aside>
            </div>

            <div className="mt-6">
                {selected ? (
                    <article className="bg-white dark:bg-slate-800 p-4 rounded shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-semibold">{selected.title}</h2>
                                <div className="text-sm text-gray-500">
                                    by {selected.author} • {new Date(selected.createdAt).toLocaleString()}
                                </div>
                                <p className="mt-3">{selected.content}</p>
                            </div>
                            <div>
                                <button onClick={() => setSelected(null)} className="text-sm text-gray-500">
                                    Close
                                </button>
                            </div>
                        </div>

                        <section className="mt-6">
                            <h3 className="font-medium">Replies ({selected.replies.length})</h3>
                            <ul className="mt-3 space-y-3">
                                {selected.replies.map((r) => (
                                    <li key={r.id} className="p-3 border rounded">
                                        <div className="text-sm text-gray-600">{r.author} • {new Date(r.createdAt).toLocaleString()}</div>
                                        <p className="mt-2">{r.content}</p>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <form onSubmit={submitReply} className="mt-4 space-y-3">
                            <textarea
                                className="w-full border rounded px-3 py-2"
                                placeholder="Write your reply..."
                                rows={3}
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                            />
                            <input
                                className="w-full border rounded px-3 py-2"
                                placeholder="Your name (optional)"
                                value={replyAuthor}
                                onChange={(e) => setReplyAuthor(e.target.value)}
                            />
                            <div className="flex justify-end">
                                <button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded">
                                    Reply
                                </button>
                            </div>
                        </form>
                    </article>
                ) : (
                    <div className="text-sm text-gray-600 mt-2">Select a discussion to view replies.</div>
                )}
            </div>
        </div>
    );
}
```