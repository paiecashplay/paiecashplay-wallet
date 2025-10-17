import { NextResponse } from 'next/server'
import { OAuthClient } from '@/lib/oauth'

export async function GET() {
  const oauth = new OAuthClient()
  const state = Math.random().toString(36).substring(2)
  const authUrl = oauth.getAuthUrl(state)
  
  return NextResponse.redirect(authUrl)
}