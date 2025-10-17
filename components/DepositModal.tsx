'use client'

import { useState } from 'react'
import { X, CreditCard, Smartphone, Wallet, Loader } from 'lucide-react'

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function DepositModal({ isOpen, onClose, onSuccess }: DepositModalProps) {
  const [amount, setAmount] = useState('')
  const [aggregator, setAggregator] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const paymentAggregators = [
    { 
      id: 'stripe', 
      name: 'Stripe', 
      icon: CreditCard, 
      fee: '2.9% + 30 FCFA',
      methods: ['Carte Visa/Mastercard', 'Apple Pay', 'Google Pay'],
      color: 'blue'
    },
    { 
      id: 'paypal', 
      name: 'PayPal', 
      icon: Wallet, 
      fee: '3.4% + 35 FCFA',
      methods: ['Compte PayPal', 'Carte via PayPal'],
      color: 'indigo'
    },
    { 
      id: 'orange_money', 
      name: 'Orange Money', 
      icon: Smartphone, 
      fee: '1.5%',
      methods: ['Orange Money Sénégal', 'Orange Money Mali'],
      color: 'orange'
    },
    { 
      id: 'wave', 
      name: 'Wave', 
      icon: Smartphone, 
      fee: '1%',
      methods: ['Wave Sénégal', 'Wave Côte d\'Ivoire'],
      color: 'green'
    }
  ]

  const calculateFee = (amount: number, aggregatorId: string) => {
    switch (aggregatorId) {
      case 'stripe':
        return Math.round(amount * 0.029 + 30)
      case 'paypal':
        return Math.round(amount * 0.034 + 35)
      case 'orange_money':
        return Math.round(amount * 0.015)
      case 'wave':
        return Math.round(amount * 0.01)
      default:
        return 0
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !aggregator) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          aggregator,
          fee: calculateFee(parseFloat(amount), aggregator)
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du dépôt')
      }

      // Redirection vers l'agrégateur de paiement
      if (data.paymentUrl) {
        // Rediriger vers Stripe dans la même fenêtre
        window.location.href = data.paymentUrl
      } else {
        onSuccess()
        onClose()
        setAmount('')
        setAggregator('')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl transform transition-all duration-300 scale-100">
        {/* Header avec gradient */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-3xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Effectuer un dépôt</h2>
              <p className="text-green-100 text-sm mt-1">Choisissez votre méthode de paiement préférée</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6">

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Colonne gauche - Saisie et sélection */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  💰 Montant à déposer
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-6 py-4 text-lg font-medium border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="0"
                    min="100"
                    required
                  />
                  <span className="absolute right-6 top-4 text-gray-500 font-medium text-lg">FCFA</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">💡 Montant minimum: 100 FCFA</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-4">
                  🏦 Méthodes de paiement
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {paymentAggregators.map((agg) => {
                    const Icon = agg.icon
                    const isSelected = aggregator === agg.id
                    return (
                      <button
                        key={agg.id}
                        type="button"
                        onClick={() => setAggregator(agg.id)}
                        className={`group relative p-4 border-2 rounded-xl text-left transition-all duration-200 transform hover:scale-[1.02] ${
                          isSelected
                            ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'
                        }`}
                      >
                        <div className="flex flex-col items-center text-center space-y-2">
                          <div className={`p-3 rounded-xl ${
                            agg.color === 'blue' ? 'bg-blue-100' :
                            agg.color === 'indigo' ? 'bg-indigo-100' :
                            agg.color === 'orange' ? 'bg-orange-100' :
                            'bg-green-100'
                          }`}>
                            <Icon className={`w-6 h-6 ${
                              agg.color === 'blue' ? 'text-blue-600' :
                              agg.color === 'indigo' ? 'text-indigo-600' :
                              agg.color === 'orange' ? 'text-orange-600' :
                              'text-green-600'
                            }`} />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">{agg.name}</div>
                            <div className="text-xs text-gray-600">Frais: {agg.fee}</div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected 
                              ? 'border-green-500 bg-green-500' 
                              : 'border-gray-300 group-hover:border-gray-400'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
            
            {/* Colonne droite - Résumé et validation */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 h-fit">
                <h4 className="font-bold text-green-800 mb-4 flex items-center text-lg">
                  📊 Résumé de votre dépôt
                </h4>
                {amount && aggregator ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-green-700">Montant</span>
                      <span className="font-bold text-green-900">{parseFloat(amount).toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-700">Frais {paymentAggregators.find(a => a.id === aggregator)?.name}</span>
                      <span className="font-bold text-orange-600">+{calculateFee(parseFloat(amount), aggregator).toLocaleString()} FCFA</span>
                    </div>
                    <div className="border-t-2 border-green-300 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-green-900">Total à payer</span>
                        <span className="font-bold text-2xl text-green-600">
                          {(parseFloat(amount) + calculateFee(parseFloat(amount), aggregator)).toLocaleString()} FCFA
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">💳</div>
                    <p className="text-green-700 font-medium">Sélectionnez un montant et une méthode</p>
                    <p className="text-green-600 text-sm mt-2">Le résumé apparaîtra ici</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-r-xl">
                  <div className="flex items-center">
                    <div className="text-red-400 mr-3">⚠️</div>
                    <p className="text-sm font-medium text-red-700">{error}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!amount || !aggregator || loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 px-6 rounded-2xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Traitement en cours...</span>
                  </>
                ) : (
                  <>
                    <span>💳</span>
                    <span>Payer avec {aggregator ? paymentAggregators.find(a => a.id === aggregator)?.name : 'l\'agrégateur'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}