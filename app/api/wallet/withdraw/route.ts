import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendTransactionEmail } from '@/lib/email'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { amount } = await request.json()
  
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Montant invalide' }, { status: 400 })
  }

  const wallet = await prisma.wallet.findUnique({
    where: { userId: session.user.id }
  })

  if (!wallet || wallet.balance < amount) {
    return NextResponse.json({ error: 'Solde insuffisant' }, { status: 400 })
  }

  const reference = uuidv4()

  try {
    await prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: amount } }
      })

      await tx.transaction.create({
        data: {
          userId: session.user.id,
          walletId: wallet.id,
          type: 'WITHDRAWAL',
          amount: -amount,
          description: 'Retrait wallet',
          status: 'COMPLETED',
          reference
        }
      })
    })

    await sendTransactionEmail(
      session.user.email!,
      'withdrawal',
      amount,
      reference
    )

    return NextResponse.json({ success: true, reference })
  } catch (error) {
    console.error('Withdrawal error:', error)
    return NextResponse.json({ error: 'Erreur lors du retrait' }, { status: 500 })
  }
}