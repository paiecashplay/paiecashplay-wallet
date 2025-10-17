'use client'

import { useState } from 'react'

export default function TestStripe() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  const testStripePayment = async () => {
    setLoading(true)
    setResult('')
    
    try {
      // Vérifier d'abord l'authentification
      const authCheck = await fetch('/api/auth/check')
      const authData = await authCheck.json()
      
      if (!authData.authenticated) {
        setResult('❌ Non connecté - Veuillez vous connecter d\'abord')
        setLoading(false)
        return
      }
      
      const response = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 1000,
          aggregator: 'stripe'
        })
      })
      
      const data = await response.json()
      
      if (data.paymentUrl) {
        setResult(`✅ Session Stripe créée!\nURL: ${data.paymentUrl}`)
        window.open(data.paymentUrl, '_blank')
      } else {
        setResult(`❌ Erreur: ${JSON.stringify(data, null, 2)}`)
      }
    } catch (error) {
      setResult(`❌ Erreur: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Test Stripe Integration</h1>
        
        <button
          onClick={testStripePayment}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Création...' : 'Tester Stripe (1000 FCFA)'}
        </button>
        
        {result && (
          <div className="mt-4 bg-gray-50 p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm">{result}</pre>
          </div>
        )}
      </div>
    </div>
  )
}