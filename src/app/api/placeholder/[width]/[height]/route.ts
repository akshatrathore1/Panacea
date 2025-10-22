import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, context: any) {
  const { width, height } = context.params
  const { searchParams } = new URL(request.url)
  const text = searchParams.get('text') ?? `${width}x${height}`

  const redirectUrl = `https://placehold.co/${encodeURIComponent(width)}x${encodeURIComponent(height)}?text=${encodeURIComponent(text)}`

  return NextResponse.redirect(redirectUrl, 302)
}
