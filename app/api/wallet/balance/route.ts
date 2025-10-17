import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session?.id) {
    return NextResponse.json({ error: 'Non autorisé - Veuillez vous connecter' }, { status: 401 })
  }

  const wallet = await prisma.wallet.findUnique({
    where: { userId: session.id }
  })

  return NextResponse.json({ 
    balance: wallet?.balance || 0,
    currency: wallet?.currency || 'XAF'
  })
}