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
      let apiUrl = '/api/wallet/withdraw'
      
      // Utiliser l'API Stripe pour les retraits par carte
      if (selectedMethod === 'card') {
        apiUrl = '/api/stripe/refund'
      }

      const response = await fetch(apiUrl, {
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
        {/* Header avec gradient */}
        <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-t-3xl p-6 text-white sticky top-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Effectuer un retrait</h2>
              <p className="text-red-100 text-sm mt-1">Retirez vos fonds en toute sécurité</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Colonne gauche - Informations et saisie */}
          <div className="space-y-6">
          {/* Solde disponible */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-5">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <AlertCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">💰 Solde disponible</p>
                <p className="text-xl font-bold text-blue-900">
                  {availableBalance.toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            </div>
          </div>

          {/* Montant */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              💸 Montant à retirer
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-6 py-4 text-lg font-medium border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="0"
                min="1000"
                max={availableBalance}
              />
              <span className="absolute right-6 top-4 text-gray-500 font-medium text-lg">FCFA</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">💡 Montant minimum: 1,000 FCFA</p>
          </div>

          {/* Méthodes de retrait */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-4">
              🏦 Méthodes de retrait
            </label>
            <div className="grid grid-cols-1 gap-3">
              {withdrawalMethods.map((method) => {
                const Icon = method.icon
                const isSelected = selectedMethod === method.id
                return (
                  <div
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`group p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-[1.01] ${
                      isSelected
                        ? 'border-red-500 bg-gradient-to-r from-red-50 to-pink-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'
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
                        <h3 className="font-semibold text-gray-900 text-sm">{method.name}</h3>
                        <p className="text-xs text-gray-600">{method.description}</p>
                        <p className="text-xs text-gray-500">⏱️ {method.processingTime} • Frais: {method.fees}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'border-red-500 bg-red-500' 
                          : 'border-gray-300 group-hover:border-gray-400'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          </div>
          
          {/* Colonne droite - Détails et validation */}
          <div className="space-y-6">

            {/* Détails du compte */}
            {selectedMethod && (
              <div className="bg-gray-50 rounded-2xl p-5">
                <label className="block text-sm font-semibold text-gray-800 mb-4">
                  💼 Détails du compte de destination
                </label>
                
                {selectedMethod === 'bank_transfer' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="IBAN ou numéro de compte"
                      value={accountDetails.iban}
                      onChange={(e) => setAccountDetails({...accountDetails, iban: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    />
                    <input
                      type="text"
                      placeholder="Nom du titulaire du compte"
                      value={accountDetails.accountName}
                      onChange={(e) => setAccountDetails({...accountDetails, accountName: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    />
                  </div>
                )}

                {selectedMethod === 'mobile_money' && (
                  <input
                    type="tel"
                    placeholder="Numéro de téléphone"
                    value={accountDetails.phone}
                    onChange={(e) => setAccountDetails({...accountDetails, phone: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  />
                )}

                {selectedMethod === 'card' && (
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 rounded-r-xl p-4">
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-3">💳</span>
                      <p className="text-sm font-medium text-yellow-800">
                        Le remboursement sera effectué sur la carte utilisée pour le dernier dépôt.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Résumé */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border-2 border-red-200 h-fit">
              <h4 className="font-bold text-red-800 mb-4 flex items-center text-lg">
                📊 Résumé de votre retrait
              </h4>
              {amount ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-red-700">Montant demandé</span>
                    <span className="font-bold text-red-900">{amount} FCFA</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-red-700">Frais de retrait</span>
                    <span className="font-bold text-orange-600">-{calculateFees()} FCFA</span>
                  </div>
                  <div className="border-t-2 border-red-300 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-red-900">Montant net reçu</span>
                      <span className="font-bold text-2xl text-green-600">
                        {netAmount.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">💸</div>
                  <p className="text-red-700 font-medium">Entrez le montant à retirer</p>
                  <p className="text-red-600 text-sm mt-2">Le résumé apparaîtra ici</p>
                </div>
              )}
            </div>

            {/* Bouton de confirmation */}
            <button
              onClick={handleWithdraw}
              disabled={!amount || parseFloat(amount) < 1000 || parseFloat(amount) > availableBalance || loading}
              className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 text-white py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Traitement en cours...</span>
                </>
              ) : (
                <>
                  <span>💸</span>
                  <span>Confirmer le retrait</span>
                </>
              )}
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}