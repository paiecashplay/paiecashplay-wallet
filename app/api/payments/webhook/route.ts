import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { sendTransactionEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object
      const { userId, reference, type } = paymentIntent.metadata

      if (type === 'deposit') {
        await prisma.$transaction(async (tx) => {
          const payment = await tx.payment.update({
            where: { reference },
            data: { 
              status: 'COMPLETED',
              paidAt: new Date()
            }
          })

          await tx.wallet.update({
            where: { userId },
            data: { balance: { increment: payment.amount } }
          })

          await tx.transaction.create({
            data: {
              userId,
              walletId: payment.walletId,
              type: 'DEPOSIT',
              amount: payment.amount,
              description: 'Dépôt wallet',
              status: 'COMPLETED',
              reference
            }
          })
        })

        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (user?.email) {
          await sendTransactionEmail(
            user.email,
            'deposit',
            paymentIntent.amount / 100,
            reference
          )
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }
}