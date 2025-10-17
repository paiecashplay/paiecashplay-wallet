import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminClient from '@/components/AdminClient'

export default async function Admin() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
    redirect('/dashboard')
  }

  const [stats, allTransactions, allPayments] = await Promise.all([
    Promise.all([
      prisma.user.count(),
      prisma.wallet.count(),
      prisma.transaction.count(),
      prisma.payment.count(),
      prisma.wallet.aggregate({ _sum: { balance: true } })
    ]),
    prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { user: { select: { name: true, email: true } } }
    }),
    prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { user: { select: { name: true, email: true } } }
    })
  ])

  const [totalUsers, totalWallets, totalTransactions, totalPayments, totalBalance] = stats

  return (
    <AdminClient 
      stats={{
        totalUsers,
        totalWallets,
        totalTransactions,
        totalPayments,
        totalBalance: totalBalance._sum.balance || 0
      }}
      transactions={allTransactions}
      payments={allPayments}
    />
  )
}