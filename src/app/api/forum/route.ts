import { NextResponse } from "next/server";

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

// In-memory store for dev. Resets when server restarts.
let posts: Post[] = [
    {
        id: "1",
        title: "Welcome to Panacea Community",
        author: "Admin",
        content: "Introduce yourself, ask questions, and share tips about the supply chain.",
        createdAt: new Date().toISOString(),
        replies: [
            {
                id: "r1",
                author: "Alice",
                content: "Great to be here — excited to collaborate.",
                createdAt: new Date().toISOString(),
            },
        ],
    },
];

export async function GET() {
    const sorted = posts.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return NextResponse.json(sorted);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body?.type) {
            return NextResponse.json({ error: "Missing type in request body" }, { status: 400 });
        }

        if (body.type === "post") {
            const { title, content, author } = body as { title?: string; content?: string; author?: string };
            if (!title || !content) {
                return NextResponse.json({ error: "Missing title or content" }, { status: 400 });
            }
            const newPost: Post = {
                id: Date.now().toString(),
                title,
                author: author || "Anonymous",
                content,
                createdAt: new Date().toISOString(),
                replies: [],
            };
            posts.push(newPost);
            return NextResponse.json(newPost, { status: 201 });
        }

        if (body.type === "reply") {
            const { postId, content, author } = body as { postId?: string; content?: string; author?: string };
            if (!postId || !content) {
                return NextResponse.json({ error: "Missing postId or content" }, { status: 400 });
            }
            const post = posts.find((p) => p.id === postId);
            if (!post) {
                return NextResponse.json({ error: "Post not found" }, { status: 404 });
            }
            const newReply: Reply = {
                id: Date.now().toString(),
                author: author || "Anonymous",
                content,
                createdAt: new Date().toISOString(),
            };
            post.replies.push(newReply);
            return NextResponse.json(newReply, { status: 201 });
        }

        return NextResponse.json({ error: "Unsupported type" }, { status: 400 });
    } catch {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}