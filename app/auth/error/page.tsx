'use client'

import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'

export default function AuthError() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'Erreur de configuration OAuth'
      case 'AccessDenied':
        return 'Accès refusé'
      case 'Verification':
        return 'Erreur de vérification'
      default:
        return 'Erreur d\'authentification'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="text-center">
          <Logo size="lg" className="justify-center mb-6" />
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Erreur d'authentification
          </h1>
          <p className="text-gray-600 mb-6">
            {getErrorMessage(error)}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/auth/signin')}
              className="w-full bg-paiecash-primary text-white py-2 px-4 rounded-md hover:bg-paiecash-dark"
            >
              Réessayer
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}