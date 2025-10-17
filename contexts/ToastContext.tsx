'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/Toast'

interface ToastContextType {
  success: (title: string, message?: string) => string
  error: (title: string, message?: string) => string
  info: (title: string, message?: string) => string
  warning: (title: string, message?: string) => string
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, removeToast, success, error, info, warning } = useToast()

  return (
    <ToastContext.Provider value={{ success, error, info, warning }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToastContext() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider')
  }
  return context
}