import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const [
    totalUsers,
    totalWallets,
    totalTransactions,
    totalPayments,
    totalBalance
  ] = await Promise.all([
    prisma.user.count(),
    prisma.wallet.count(),
    prisma.transaction.count(),
    prisma.payment.count(),
    prisma.wallet.aggregate({ _sum: { balance: true } })
  ])

  const recentTransactions = await prisma.transaction.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, email: true } } }
  })

  return NextResponse.json({
    totalUsers,
    totalWallets,
    totalTransactions,
    totalPayments,
    totalBalance: totalBalance._sum.balance || 0,
    recentTransactions
  })
}