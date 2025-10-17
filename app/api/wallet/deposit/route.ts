import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe, formatAmountForStripe } from '@/lib/stripe'
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

  const reference = uuidv4()

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(amount),
      currency: 'xaf',
      metadata: {
        userId: session.user.id,
        reference,
        type: 'deposit'
      }
    })

    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        walletId: session.user.wallet.id,
        amount,
        description: 'Dépôt wallet',
        reference,
        paymentMethod: 'stripe',
        externalId: paymentIntent.id
      }
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id
    })
  } catch (error) {
    console.error('Deposit error:', error)
    return NextResponse.json({ error: 'Erreur lors du dépôt' }, { status: 500 })
  }
}