'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import type { RoshiExpression } from '@/components/mascot/Roshi'

interface MascotContextValue {
  expression: RoshiExpression
  setExpression: (e: RoshiExpression) => void
}

const MascotContext = createContext<MascotContextValue>({
  expression: 'idle',
  setExpression: () => {},
})

export function MascotProvider({ children }: { children: React.ReactNode }) {
  const [expression, setExpressionRaw] = useState<RoshiExpression>('idle')

  const setExpression = useCallback((e: RoshiExpression) => {
    setExpressionRaw(e)
    if (e !== 'idle') {
      // Auto-reset to idle after animation completes
      const delay = e === 'disappointed' ? 3200 : 5000
      setTimeout(() => setExpressionRaw('idle'), delay)
    }
  }, [])

  return (
    <MascotContext.Provider value={{ expression, setExpression }}>
      {children}
    </MascotContext.Provider>
  )
}

export function useMascot() {
  return useContext(MascotContext)
}
