import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  const { amount, description, userId } = await request.json()
  
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Montant invalide' }, { status: 400 })
  }

  const reference = uuidv4()

  try {
    const paymentLink = await prisma.paymentLink.create({
      data: {
        reference,
        amount,
        description: description || 'Paiement PaieCashPlay',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
      }
    })

    const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/pay/${reference}`

    return NextResponse.json({
      paymentUrl,
      reference,
      amount,
      expiresAt: paymentLink.expiresAt
    })
  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json({ error: 'Erreur lors de la création du paiement' }, { status: 500 })
  }
}