'use client'

import { useState } from 'react'
import { X, CreditCard, Smartphone, Building, Loader } from 'lucide-react'

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function DepositModal({ isOpen, onClose, onSuccess }: DepositModalProps) {
  const [amount, setAmount] = useState('')
  const [selectedMethod, setSelectedMethod] = useState('stripe')
  const [loading, setLoading] = useState(false)

  const paymentMethods = [
    {
      id: 'stripe',
      name: 'Carte bancaire',
      description: 'Visa, Mastercard, American Express',
      icon: CreditCard,
      fees: '2.9% + 30 FCFA',
      color: 'blue'
    },
    {
      id: 'mobile_money',
      name: 'Mobile Money',
      description: 'Orange Money, MTN Money',
      icon: Smartphone,
      fees: '1.5%',
      color: 'orange'
    },
    {
      id: 'bank_transfer',
      name: 'Virement bancaire',
      description: 'Virement SEPA, Swift',
      icon: Building,
      fees: 'Gratuit',
      color: 'green'
    }
  ]

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) return

    setLoading(true)
    try {
      const response = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          method: selectedMethod
        })
      })

      const data = await response.json()

      if (selectedMethod === 'stripe' && data.clientSecret) {
        // Rediriger vers Stripe Checkout ou utiliser Stripe Elements
        window.location.href = data.checkoutUrl || '#'
      } else if (selectedMethod === 'mobile_money' && data.paymentUrl) {
        // Rediriger vers l'interface Mobile Money
        window.location.href = data.paymentUrl
      } else {
        // Pour les virements bancaires, afficher les instructions
        onSuccess()
      }
    } catch (error) {
      console.error('Deposit error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Effectuer un dépôt</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Montant */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant à déposer
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                placeholder="0"
                min="100"
              />
              <span className="absolute right-3 top-3 text-gray-500">FCFA</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Montant minimum: 100 FCFA</p>
          </div>

          {/* Méthodes de paiement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Méthode de paiement
            </label>
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon
                return (
                  <div
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedMethod === method.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        method.color === 'blue' ? 'bg-blue-100' :
                        method.color === 'orange' ? 'bg-orange-100' :
                        'bg-green-100'
                      }`}>
                        <Icon className={`h-5 w-5 ${
                          method.color === 'blue' ? 'text-blue-600' :
                          method.color === 'orange' ? 'text-orange-600' :
                          'text-green-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{method.name}</h3>
                        <p className="text-sm text-gray-500">{method.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">Frais: {method.fees}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Résumé */}
          {amount && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Montant</span>
                <span className="font-medium">{amount} FCFA</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Frais</span>
                <span className="font-medium">
                  {selectedMethod === 'stripe' ? Math.ceil(parseFloat(amount) * 0.029 + 30) :
                   selectedMethod === 'mobile_money' ? Math.ceil(parseFloat(amount) * 0.015) :
                   0} FCFA
                </span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between items-center">
                <span className="font-medium">Total à payer</span>
                <span className="font-bold text-lg">
                  {selectedMethod === 'stripe' ? parseFloat(amount) + Math.ceil(parseFloat(amount) * 0.029 + 30) :
                   selectedMethod === 'mobile_money' ? parseFloat(amount) + Math.ceil(parseFloat(amount) * 0.015) :
                   parseFloat(amount)} FCFA
                </span>
              </div>
            </div>
          )}

          {/* Bouton de confirmation */}
          <button
            onClick={handleDeposit}
            disabled={!amount || parseFloat(amount) < 100 || loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Traitement...</span>
              </>
            ) : (
              <span>Continuer le paiement</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}