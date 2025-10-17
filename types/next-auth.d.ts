import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      oauthId: string
      name?: string | null
      email?: string | null
      image?: string | null
      userType: string
      wallet?: {
        id: string
        balance: number
        currency: string
      }
    }
  }

  interface User {
    id: string
    oauthId: string
    userType: string
    metadata?: any
  }
}