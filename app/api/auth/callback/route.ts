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
    
    // Échanger le code contre un token
    console.log('Exchanging code for token...')
    const tokens = await oauth.exchangeCode(code)
    console.log('Tokens received:', !!tokens.access_token)
    
    // Récupérer les infos utilisateur
    console.log('Getting user info...')
    const oauthUser = await oauth.getUserInfo(tokens.access_token)
    console.log('User info received:', oauthUser.email)
    
    // Créer ou mettre à jour l'utilisateur
    console.log('Creating/updating user...')
    const user = await oauth.createOrUpdateUser(oauthUser)
    console.log('User created/updated:', user?.id)
    
    if (!user) {
      throw new Error('Failed to create user')
    }
    
    // Créer la session
    console.log('Creating session...')
    await createSession(user.id)
    console.log('Session created, redirecting to dashboard')
    
    const response = NextResponse.redirect(new URL('/dashboard', request.url))
    console.log('Redirecting to dashboard with response:', response.status)
    return response
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(new URL('/auth/signin?error=oauth_failed', request.url))
  }
}