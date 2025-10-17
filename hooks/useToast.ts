'use client'

import { useState, useCallback } from 'react'
import { Toast } from '@/components/Toast'

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2)
    const newToast: Toast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])
    
    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const success = useCallback((title: string, message?: string) => {
    return addToast({ type: 'success', title, message })
  }, [addToast])

  const error = useCallback((title: string, message?: string) => {
    return addToast({ type: 'error', title, message })
  }, [addToast])

  const info = useCallback((title: string, message?: string) => {
    return addToast({ type: 'info', title, message })
  }, [addToast])

  const warning = useCallback((title: string, message?: string) => {
    return addToast({ type: 'warning', title, message })
  }, [addToast])

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning
  }
}