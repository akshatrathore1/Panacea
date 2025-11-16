import { NextRequest, NextResponse } from 'next/server'

type PlaceholderParams = {
  params: Promise<{
    width: string
    height: string
  }>
}

export async function GET(request: NextRequest, context: PlaceholderParams) {
  const params = await context.params
  const { width, height } = params
  const { searchParams } = new URL(request.url)
  const text = searchParams.get('text') ?? `${width}x${height}`

  const redirectUrl = `https://placehold.co/${encodeURIComponent(width)}x${encodeURIComponent(height)}?text=${encodeURIComponent(text)}`

  return NextResponse.redirect(redirectUrl, 302)
}
