import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const sig = request.headers.get('stripe-signature')
  const body = await request.text()

  let event

  try {
    event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    
    try {
      const { userId, walletId, reference, type, originalAmount } = session.metadata
      
      if (type === 'deposit') {
        await prisma.$transaction(async (tx) => {
          const transaction = await tx.transaction.findFirst({
            where: {
              reference,
              status: 'PENDING',
              type: 'DEPOSIT'
            }
          })

          if (!transaction) {
            throw new Error('Transaction non trouvée')
          }

          // Utiliser le montant original en FCFA
          const amountToAdd = originalAmount ? parseInt(originalAmount) : transaction.amount

          await tx.wallet.update({
            where: { id: walletId },
            data: {
              balance: {
                increment: amountToAdd
              }
            }
          })

          await tx.transaction.update({
            where: { id: transaction.id },
            data: {
              status: 'COMPLETED',
              metadata: {
                ...transaction.metadata as any,
                stripeSessionId: session.id,
                stripeAmountPaid: session.amount_total,
                completedAt: new Date().toISOString()
              }
            }
          })
        })

        console.log(`Dépôt complété: ${reference} - ${originalAmount || 'N/A'} FCFA (Stripe: ${session.amount_total} centimes EUR)`)
      }
    } catch (error) {
      console.error('Erreur lors du traitement du webhook:', error)
      return NextResponse.json({ error: 'Erreur de traitement' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true, processed: event.type })
}