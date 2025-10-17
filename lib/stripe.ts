import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100) // Convertir en centimes
}

export const formatAmountFromStripe = (amount: number): number => {
  return Math.round(amount / 100) // Convertir depuis centimes
}