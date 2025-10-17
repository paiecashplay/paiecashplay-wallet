import './globals.css'
import { Providers } from './providers'
import { ToastProvider } from '@/contexts/ToastContext'

export const metadata = {
  title: 'PaieCashPlay Wallet',
  description: 'Service de wallet centralisé pour PaieCashPlay',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="font-sans">
        <ToastProvider>
          <Providers>{children}</Providers>
        </ToastProvider>
      </body>
    </html>
  )
}