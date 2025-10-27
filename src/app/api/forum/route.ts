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

const seededOn = new Date('2025-09-15T10:00:00Z')
const DAY = 24 * 60 * 60 * 1000
const HOUR = 60 * 60 * 1000
const MINUTE = 60 * 1000
const iso = (timestamp: number) => new Date(timestamp).toISOString()

const firstPostBase = seededOn.getTime() - 4 * DAY + 2 * HOUR + 25 * MINUTE
const secondPostBase = seededOn.getTime() - 8 * DAY + 5 * HOUR + 10 * MINUTE

// In-memory store for dev. Resets when server restarts.
const posts: Post[] = [
    {
        id: "best-practices-wheat",
        title: "Best practices for wheat storage",
        author: "Raghav Singh",
        content:
            "What storage methods are you using post-harvest to maintain quality during the monsoon? Share your experiences and tools that worked best.",
        createdAt: iso(firstPostBase),
        replies: [
            {
                id: "best-practices-reply-1",
                author: "Sunita Patel",
                content: "We switched to moisture-proof HDPE bags with silica gel packs and saw dramatic reduction in spoilage.",
                createdAt: iso(firstPostBase + 3 * HOUR + 12 * MINUTE),
            },
            {
                id: "best-practices-reply-2",
                author: "Harish Kumar",
                content: "Consider elevating pallets and installing automated exhaust fans. Keeps humidity under control even in peak monsoon.",
                createdAt: iso(firstPostBase + 8 * HOUR + 5 * MINUTE),
            },
            {
                id: "best-practices-reply-3",
                author: "Lata Verma",
                content: "Use layered tarpaulin with breathable jute sheets. It balances airflow without letting moisture settle.",
                createdAt: iso(firstPostBase + 12 * HOUR + 41 * MINUTE),
            },
            {
                id: "best-practices-reply-4",
                author: "Krish Agro",
                content: "We invested in IoT sensors that alert when relative humidity crosses 65%. It paid for itself in one season.",
                createdAt: iso(firstPostBase + 20 * HOUR + 16 * MINUTE),
            },
            {
                id: "best-practices-reply-5",
                author: "Anita Rawat",
                content: "Wooden pallets plus neem-leaf fumigation every 15 days has kept insect damage below 1% for us.",
                createdAt: iso(firstPostBase + 26 * HOUR + 48 * MINUTE),
            },
            {
                id: "best-practices-reply-6",
                author: "Rakesh Yadav",
                content: "Check your moisture meters weekly. Calibrating them after each monsoon saved us from over-drying grains.",
                createdAt: iso(firstPostBase + 31 * HOUR + 7 * MINUTE),
            },
            {
                id: "best-practices-reply-7",
                author: "Supply Link",
                content: "Cold storage is expensive, but even renting for the first 30 days post-harvest preserved kernel hardness.",
                createdAt: iso(firstPostBase + 36 * HOUR + 52 * MINUTE),
            },
            {
                id: "best-practices-reply-8",
                author: "Irfan Shaikh",
                content: "Install rat guards on all vertical supports. Our pilferage went down to almost zero.",
                createdAt: iso(firstPostBase + 44 * HOUR + 3 * MINUTE),
            },
            {
                id: "best-practices-reply-9",
                author: "EcoStore",
                content: "Try phosphine fumigation under tarp but follow safety guidelines strictly—it is effective for longer storage.",
                createdAt: iso(firstPostBase + 52 * HOUR + 58 * MINUTE),
            },
            {
                id: "best-practices-reply-10",
                author: "Suman Negi",
                content: "We segregate lots by moisture level and rotate stacks every 10 days to ensure uniform aeration.",
                createdAt: iso(firstPostBase + 60 * HOUR + 19 * MINUTE),
            },
            {
                id: "best-practices-reply-11",
                author: "Farm Hub",
                content: "If you see condensation on roofing, insulate with foam panels. It stopped drip damage on our top stacks.",
                createdAt: iso(firstPostBase + 69 * HOUR + 8 * MINUTE),
            },
            {
                id: "best-practices-reply-12",
                author: "Navin Gupta",
                content: "Don’t forget to rotate insecticides. Alternating active ingredients prevented resistance in our stores.",
                createdAt: iso(firstPostBase + 80 * HOUR + 27 * MINUTE),
            },
        ],
    },
    {
        id: "organic-certification-process",
        title: "Organic certification process",
        author: "Meera Joshi",
        content:
            "Looking to get certified organic for turmeric exports. What documents and audits should I prepare for? Any tips to avoid delays?",
        createdAt: iso(secondPostBase),
        replies: [
            {
                id: "organic-certification-reply-1",
                author: "Certification Support",
                content: "Start with APEDA registration, maintain residue test reports for the last three harvests, and document every input used.",
                createdAt: iso(secondPostBase + 4 * HOUR + 9 * MINUTE),
            },
            {
                id: "organic-certification-reply-2",
                author: "Vivek Sharma",
                content: "Invest in a field diary—inspectors loved seeing daily logs. Also schedule soil testing early; labs get busy during peak season.",
                createdAt: iso(secondPostBase + 9 * HOUR + 32 * MINUTE),
            },
            {
                id: "organic-certification-reply-3",
                author: "AgriLegal",
                content: "Keep copies of all farmer agreements and land ownership proofs. Auditors asked us for every single page.",
                createdAt: iso(secondPostBase + 15 * HOUR + 6 * MINUTE),
            },
            {
                id: "organic-certification-reply-4",
                author: "Dhara Farms",
                content: "Time your internal audit 45 days before the external one. Gives enough buffer to fix documentation gaps.",
                createdAt: iso(secondPostBase + 28 * HOUR + 45 * MINUTE),
            },
            {
                id: "organic-certification-reply-5",
                author: "Nisha Patel",
                content: "If you’re exporting, align organic certification with FSSAI renewals so your compliance calendar stays synced.",
                createdAt: iso(secondPostBase + 36 * HOUR + 13 * MINUTE),
            },
            {
                id: "organic-certification-reply-6",
                author: "Kishore Exports",
                content: "Residue tests from NABL-accredited labs were mandatory for our EU buyers—book slots two months in advance.",
                createdAt: iso(secondPostBase + 44 * HOUR + 27 * MINUTE),
            },
            {
                id: "organic-certification-reply-7",
                author: "Organic Alliance",
                content: "Remember to map your supply chain partners. Inspectors will cross-check certifications for processors too.",
                createdAt: iso(secondPostBase + 53 * HOUR + 58 * MINUTE),
            },
            {
                id: "organic-certification-reply-8",
                author: "Field Mentor",
                content: "Train field staff on documentation. A half-day workshop helped us reduce non-compliance notes drastically.",
                createdAt: iso(secondPostBase + 61 * HOUR + 21 * MINUTE),
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