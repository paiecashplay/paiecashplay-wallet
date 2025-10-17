import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import { prisma } from './prisma'

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!)

export interface SessionUser {
  id: string
  oauthId: string
  email: string
  name: string
  userType: string
  wallet?: {
    id: string
    balance: number
    currency: string
  }
}

export async function createSession(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { wallet: true }
  })

  if (!user) throw new Error('User not found')

  const sessionData: SessionUser = {
    id: user.id,
    oauthId: user.oauthId,
    email: user.email,
    name: user.name || '',
    userType: user.userType,
    wallet: user.wallet ? {
      id: user.wallet.id,
      balance: user.wallet.balance,
      currency: user.wallet.currency
    } : undefined
  }

  const token = await new SignJWT(sessionData)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .setIssuedAt()
    .sign(secret)

  cookies().set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 // 24 hours
  })

  return token
}

export async function getSession(): Promise<SessionUser | null> {
  const sessionCookie = cookies().get('session')
  
  if (!sessionCookie) return null

  try {
    const { payload } = await jwtVerify(sessionCookie.value, secret)
    return payload as SessionUser
  } catch {
    return null
  }
}

export function destroySession() {
  cookies().delete('session')
}