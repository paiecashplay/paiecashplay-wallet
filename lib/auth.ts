import { NextAuthOptions } from 'next-auth'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: 'paiecashplay',
      name: 'PaieCashPlay',
      type: 'oauth',
      authorization: {
        url: `${process.env.OAUTH_ISSUER}/api/auth/authorize`,
        params: {
          scope: 'openid profile email',
          response_type: 'code'
        }
      },
      token: {
        url: `${process.env.OAUTH_ISSUER}/api/auth/token`,
        async request({ client, params, checks, provider }) {
          const response = await fetch(provider.token.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              code: params.code!,
              redirect_uri: process.env.OAUTH_REDIRECT_URI!,
              client_id: process.env.OAUTH_CLIENT_ID!,
              client_secret: process.env.OAUTH_CLIENT_SECRET!
            })
          })
          
          const tokens = await response.json()
          
          if (!response.ok) {
            throw new Error(`Token request failed: ${JSON.stringify(tokens)}`)
          }
          
          return { tokens }
        }
      },
      userinfo: {
        url: `${process.env.OAUTH_ISSUER}/api/auth/userinfo`,
        async request({ tokens, provider }) {
          const response = await fetch(provider.userinfo.url, {
            headers: {
              'Authorization': `Bearer ${tokens.access_token}`
            }
          })
          
          const userInfo = await response.json()
          
          if (!response.ok) {
            throw new Error(`UserInfo request failed: ${JSON.stringify(userInfo)}`)
          }
          
          return userInfo
        }
      },
      clientId: process.env.OAUTH_CLIENT_ID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          userType: profile.user_type || 'player',
          metadata: profile.metadata || {}
        }
      }
    }
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { oauthId: user.id }
        })

        if (!existingUser) {
          const newUser = await prisma.user.create({
            data: {
              oauthId: user.id,
              email: user.email!,
              name: user.name,
              picture: user.image,
              userType: (user as any).userType || 'player',
              metadata: (user as any).metadata || {}
            }
          })

          await prisma.wallet.create({
            data: {
              userId: newUser.id,
              balance: 0
            }
          })
        }
        return true
      } catch (error) {
        console.error('SignIn error:', error)
        return false
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.oauthId = user.id
        token.userType = (user as any).userType
      }
      return token
    },
    async session({ session, token }) {
      if (token?.oauthId && session?.user) {
        try {
          const user = await prisma.user.findUnique({
            where: { oauthId: token.oauthId as string },
            include: { wallet: true }
          })
          if (user) {
            session.user.id = user.id
            session.user.oauthId = user.oauthId
            session.user.userType = user.userType
            session.user.wallet = user.wallet
          }
        } catch (error) {
          console.error('Session callback error:', error)
        }
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET
}