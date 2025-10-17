import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const wallet = await prisma.wallet.findUnique({
    where: { userId: session.user.id }
  })

  return NextResponse.json({ 
    balance: wallet?.balance || 0,
    currency: wallet?.currency || 'XAF'
  })
}