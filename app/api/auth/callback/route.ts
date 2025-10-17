import { NextRequest, NextResponse } from 'next/server'
import { OAuthClient } from '@/lib/oauth'
import { createSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL('/auth/error?error=' + error, request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/auth/error?error=no_code', request.url))
  }

  try {
    console.log('Processing OAuth callback with code:', code)
    const oauth = new OAuthClient()
    
    const tokens = await oauth.exchangeCode(code)
    console.log('Tokens received:', !!tokens.access_token)
    
    const oauthUser = await oauth.getUserInfo(tokens.access_token)
    console.log('User info received:', oauthUser.email)
    
    const user = await oauth.createOrUpdateUser(oauthUser)
    console.log('User created/updated:', user?.id)
    
    if (!user) {
      throw new Error('Failed to create user')
    }
    
    await createSession(user.id)
    console.log('Session created, redirecting to dashboard')
    
    return NextResponse.redirect(new URL('/dashboard?auth=success', request.url))
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(new URL('/auth/signin?error=oauth_failed', request.url))
  }
}