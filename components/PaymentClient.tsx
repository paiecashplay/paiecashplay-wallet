'use client'

import { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { CreditCard, Wallet } from 'lucide-react'
import Logo from './Logo'

export default function PaymentClient({ paymentLink }: any) {
  const { data: session } = useSession()
  const [paymentMethod, setPaymentMethod] = useState('wallet')
  const [loading, setLoading] = useState(false)

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF'
    }).format(amount)
  }

  const handlePayment = async () => {
    if (!session) {
      signIn('paiecashplay')
      return
    }

    setLoading(true)
    try {
      if (paymentMethod === 'wallet') {
        // Paiement via wallet
        const response = await fetch('/api/payments/wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reference: paymentLink.reference,
            amount: paymentLink.amount
          })
        })
        
        if (response.ok) {
          alert('Paiement effectué avec succès!')
        } else {
          alert('Erreur lors du paiement')
        }
      } else {
        // Paiement via Stripe
        const response = await fetch('/api/payments/stripe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reference: paymentLink.reference,
            amount: paymentLink.amount
          })
        })
        
        const { clientSecret } = await response.json()
        // Intégrer Stripe Elements ici
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Erreur lors du paiement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="text-center mb-6">
          <Logo size="lg" className="justify-center mb-4" />
          <h1 className="text-2xl font-bold text-paiecash-primary">Paiement</h1>
          <p className="text-gray-600 mt-2">{paymentLink.description}</p>
        </div>

        <div className="mb-6">
          <div className="text-center">
            <span className="text-3xl font-bold text-paiecash-primary">
              {formatAmount(paymentLink.amount)}
            </span>
          </div>
        </div>

        {!session ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Connectez-vous pour effectuer le paiement
            </p>
            <button
              onClick={() => signIn('paiecashplay')}
              className="w-full bg-paiecash-primary text-white py-2 px-4 rounded-md hover:bg-paiecash-dark"
            >
              Se connecter
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Méthode de paiement
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="wallet"
                    checked={paymentMethod === 'wallet'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  <Wallet className="h-4 w-4 mr-2" />
                  Wallet PaieCashPlay
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="stripe"
                    checked={paymentMethod === 'stripe'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  <CreditCard className="h-4 w-4 mr-2" />
                  Carte bancaire
                </label>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-paiecash-primary text-white py-2 px-4 rounded-md hover:bg-paiecash-dark disabled:opacity-50"
            >
              {loading ? 'Traitement...' : 'Payer maintenant'}
            </button>
          </div>
        )}

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Paiement sécurisé par PaieCashPlay</p>
          {paymentLink.expiresAt && (
            <p>Expire le {new Date(paymentLink.expiresAt).toLocaleDateString('fr-FR')}</p>
          )}
        </div>
      </div>
    </div>
  )
}