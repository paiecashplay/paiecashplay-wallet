import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  const session = await getSession()
  
  if (!session?.id) {
    return NextResponse.json({ error: 'Non autorisé - Veuillez vous connecter' }, { status: 401 })
  }

  const { amount, aggregator, fee } = await request.json()
  const method = aggregator || 'stripe' // Compatibilité avec le modal
  
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Montant invalide' }, { status: 400 })
  }

  try {
    console.log('Deposit request:', { amount, method, userId: session.id })
    
    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.id }
    })

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet non trouvé' }, { status: 404 })
    }

    const reference = uuidv4()
    console.log('Generated reference:', reference)

    if (method === 'stripe') {
      console.log('Creating Stripe session...')
      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'eur', // Stripe ne supporte pas XAF directement
            product_data: {
              name: 'Dépôt PaieCashPlay Wallet',
              description: `Dépôt de ${amount} FCFA`
            },
            unit_amount: Math.round(amount / 655.957 * 100) // Conversion FCFA vers EUR en centimes
          },
          quantity: 1
        }],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?deposit=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?deposit=cancelled`,
        metadata: {
          userId: session.id,
          walletId: wallet.id,
          reference,
          type: 'deposit',
          originalAmount: amount.toString() // Montant original en FCFA
        }
      })

      await prisma.transaction.create({
        data: {
          userId: session.id,
          walletId: wallet.id,
          type: 'DEPOSIT',
          amount,
          description: `Dépôt Stripe - ${reference}`,
          status: 'PENDING',
          reference,
          metadata: {
            stripeSessionId: stripeSession.id,
            method: 'stripe',
            originalAmount: amount,
            eurAmount: Math.round(amount / 655.957 * 100)
          }
        }
      })

      console.log('Stripe session created:', {
        id: stripeSession.id,
        url: stripeSession.url,
        amount: amount,
        eurAmount: Math.round(amount / 655.957 * 100)
      })
      
      return NextResponse.json({ 
        paymentUrl: stripeSession.url,
        sessionId: stripeSession.id,
        reference 
      })
    } else {
      const transaction = await prisma.transaction.create({
        data: {
          userId: session.id,
          walletId: wallet.id,
          type: 'DEPOSIT',
          amount,
          description: `Dépôt ${method} - ${reference}`,
          status: 'PENDING',
          reference,
          metadata: { method }
        }
      })

      return NextResponse.json({ 
        message: 'Dépôt initié avec succès',
        reference,
        transaction 
      })
    }
  } catch (error) {
    console.error('Deposit error:', error)
    return NextResponse.json({ error: 'Erreur lors du dépôt' }, { status: 500 })
  }
}

