import { cookies } from 'next/headers'
import { prisma } from './prisma'

export interface OAuthUser {
  sub: string
  email: string
  name: string
  given_name?: string
  family_name?: string
  picture?: string
  user_type: string
  country?: string
  phone?: string
}

export class OAuthClient {
  private clientId: string
  private clientSecret: string
  private issuer: string
  private redirectUri: string

  constructor() {
    this.clientId = process.env.OAUTH_CLIENT_ID!
    this.clientSecret = process.env.OAUTH_CLIENT_SECRET!
    this.issuer = process.env.OAUTH_ISSUER!
    this.redirectUri = process.env.OAUTH_REDIRECT_URI!
  }

  getAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'openid profile email',
      ...(state && { state })
    })
    
    return `${this.issuer}/api/auth/authorize?${params}`
  }

  async exchangeCode(code: string): Promise<{ access_token: string; refresh_token?: string }> {
    const response = await fetch(`${this.issuer}/api/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri,
        client_id: this.clientId,
        client_secret: this.clientSecret
      })
    })

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`)
    }

    return response.json()
  }

  async getUserInfo(accessToken: string): Promise<OAuthUser> {
    const response = await fetch(`${this.issuer}/api/auth/userinfo`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      throw new Error(`UserInfo failed: ${response.statusText}`)
    }

    return response.json()
  }

  async createOrUpdateUser(oauthUser: OAuthUser) {
    const existingUser = await prisma.user.findUnique({
      where: { oauthId: oauthUser.sub }
    })

    if (existingUser) {
      return await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          email: oauthUser.email,
          name: oauthUser.name,
          picture: oauthUser.picture,
          userType: oauthUser.user_type
        },
        include: { wallet: true }
      })
    }

    const newUser = await prisma.user.create({
      data: {
        oauthId: oauthUser.sub,
        email: oauthUser.email,
        name: oauthUser.name,
        picture: oauthUser.picture,
        userType: oauthUser.user_type,
        metadata: {}
      }
    })

    await prisma.wallet.create({
      data: {
        userId: newUser.id,
        balance: 0
      }
    })

    return await prisma.user.findUnique({
      where: { id: newUser.id },
      include: { wallet: true }
    })
  }
}