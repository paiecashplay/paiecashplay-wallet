import { NextRequest, NextResponse } from 'next/server'
import { destroySession } from '@/lib/session'

export async function POST(request: NextRequest) {
  destroySession()
  return NextResponse.json({ success: true })
}

export async function GET(request: NextRequest) {
  destroySession()
  return NextResponse.redirect(new URL('/auth/signin', request.url))
}