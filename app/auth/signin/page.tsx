'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'

export default function SignIn() {
  const router = useRouter()

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    fetch('/api/auth/check')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          router.push('/dashboard')
        }
      })
      .catch(() => {})
  }, [])

  const handleLogin = () => {
    window.location.href = '/api/auth/login'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Logo size="lg" className="justify-center mb-6" />
          <p className="mt-2 text-center text-sm text-gray-600">
            Connectez-vous avec votre compte PaieCashPlay
          </p>
        </div>
        <div>
          <button
            onClick={handleLogin}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Se connecter
          </button>
        </div>
      </div>
    </div>
  )
}