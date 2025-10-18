import { NextRequest } from 'next/server'

export async function GET(request: NextRequest, context: { params: { width: string; height: string } }) {
    const { width, height } = context.params
    const { searchParams } = new URL(request.url)
    const text = searchParams.get('text') ?? `${width}x${height}`

    const redirectUrl = `https://placehold.co/${encodeURIComponent(width)}x${encodeURIComponent(height)}?text=${encodeURIComponent(text)}`

    return Response.redirect(redirectUrl, 302)
}
