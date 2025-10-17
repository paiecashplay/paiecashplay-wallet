import './globals.css'
import { Providers } from './providers'

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
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}