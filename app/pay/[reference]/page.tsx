import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PaymentClient from '@/components/PaymentClient'

export default async function PaymentPage({ params }: { params: { reference: string } }) {
  const paymentLink = await prisma.paymentLink.findUnique({
    where: { reference: params.reference }
  })

  if (!paymentLink || !paymentLink.isActive) {
    notFound()
  }

  if (paymentLink.expiresAt && paymentLink.expiresAt < new Date()) {
    notFound()
  }

  return <PaymentClient paymentLink={paymentLink} />
}