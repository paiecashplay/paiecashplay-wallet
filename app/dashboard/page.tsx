import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import DashboardClient from '@/components/DashboardClient'

export default async function Dashboard() {
  const session = await getSession()
  
  if (!session) {
    redirect('/auth/signin')
  }

  const [wallet, transactions, payments] = await Promise.all([
    prisma.wallet.findUnique({
      where: { userId: session.id }
    }),
    prisma.transaction.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),
    prisma.payment.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  ])

  return (
    <DashboardClient 
      user={session}
      wallet={wallet}
      transactions={transactions}
      payments={payments}
    />
  )
}