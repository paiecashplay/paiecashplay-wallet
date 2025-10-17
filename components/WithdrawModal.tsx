'use client'

import { useState } from 'react'
import { X, CreditCard, Smartphone, Building, Loader, AlertCircle } from 'lucide-react'

interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  availableBalance: number
}

export default function WithdrawModal({ isOpen, onClose, onSuccess, availableBalance }: WithdrawModalProps) {
  const [amount, setAmount] = useState('')
  const [selectedMethod, setSelectedMethod] = useState('bank_transfer')
  const [accountDetails, setAccountDetails] = useState({
    iban: '',
    phone: '',
    accountName: ''
  })
  const [loading, setLoading] = useState(false)

  const withdrawalMethods = [
    {
      id: 'bank_transfer',
      name: 'Virement bancaire',
      description: 'Vers votre compte bancaire',
      icon: Building,
      fees: '500 FCFA',
      processingTime: '1-3 jours ouvrés',
      color: 'blue'
    },
    {
      id: 'mobile_money',
      name: 'Mobile Money',
      description: 'Orange Money, MTN Money',
      icon: Smartphone,
      fees: '2%',
      processingTime: 'Instantané',
      color: 'orange'
    },
    {
      id: 'card',
      name: 'Carte bancaire',
      description: 'Remboursement sur carte',
      icon: CreditCard,
      fees: '1.5%',
      processingTime: '3-5 jours ouvrés',
      color: 'purple'
    }
  ]

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0 || parseFloat(amount) > availableBalance) return

    setLoading(true)
    try {
      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          method: selectedMethod,
          accountDetails
        })
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess()
        onClose()
      } else {
        console.error('Withdrawal error:', data.error)
      }
    } catch (error) {
      console.error('Withdrawal error:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateFees = () => {
    if (!amount) return 0
    const amountNum = parseFloat(amount)
    
    switch (selectedMethod) {
      case 'bank_transfer':
        return 500
      case 'mobile_money':
        return Math.ceil(amountNum * 0.02)
      case 'card':
        return Math.ceil(amountNum * 0.015)
      default:
        return 0
    }
  }

  const netAmount = amount ? parseFloat(amount) - calculateFees() : 0

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Effectuer un retrait</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Solde disponible */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Solde disponible: {availableBalance.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>

          {/* Montant */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant à retirer
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg"
                placeholder="0"
                min="1000"
                max={availableBalance}
              />
              <span className="absolute right-3 top-3 text-gray-500">FCFA</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Montant minimum: 1,000 FCFA</p>
          </div>

          {/* Méthodes de retrait */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Méthode de retrait
            </label>
            <div className="space-y-3">
              {withdrawalMethods.map((method) => {
                const Icon = method.icon
                return (
                  <div
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedMethod === method.id
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        method.color === 'blue' ? 'bg-blue-100' :
                        method.color === 'orange' ? 'bg-orange-100' :
                        'bg-purple-100'
                      }`}>
                        <Icon className={`h-5 w-5 ${
                          method.color === 'blue' ? 'text-blue-600' :
                          method.color === 'orange' ? 'text-orange-600' :
                          'text-purple-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{method.name}</h3>
                        <p className="text-sm text-gray-500">{method.description}</p>
                        <p className="text-xs text-gray-400">{method.processingTime}</p>
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

          {/* Détails du compte */}
          {selectedMethod && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Détails du compte de destination
              </label>
              
              {selectedMethod === 'bank_transfer' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="IBAN ou numéro de compte"
                    value={accountDetails.iban}
                    onChange={(e) => setAccountDetails({...accountDetails, iban: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                  <input
                    type="text"
                    placeholder="Nom du titulaire du compte"
                    value={accountDetails.accountName}
                    onChange={(e) => setAccountDetails({...accountDetails, accountName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              )}

              {selectedMethod === 'mobile_money' && (
                <input
                  type="tel"
                  placeholder="Numéro de téléphone"
                  value={accountDetails.phone}
                  onChange={(e) => setAccountDetails({...accountDetails, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              )}

              {selectedMethod === 'card' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    Le remboursement sera effectué sur la carte utilisée pour le dernier dépôt.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Résumé */}
          {amount && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Montant demandé</span>
                <span className="font-medium">{amount} FCFA</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Frais de retrait</span>
                <span className="font-medium text-red-600">-{calculateFees()} FCFA</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between items-center">
                <span className="font-medium">Montant net reçu</span>
                <span className="font-bold text-lg text-green-600">
                  {netAmount.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>
          )}

          {/* Bouton de confirmation */}
          <button
            onClick={handleWithdraw}
            disabled={!amount || parseFloat(amount) < 1000 || parseFloat(amount) > availableBalance || loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Traitement...</span>
              </>
            ) : (
              <span>Confirmer le retrait</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}