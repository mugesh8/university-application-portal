import { useEffect, useState } from 'react'

export function usePersistentState(key, initialValue) {
  const [state, setState] = useState(() => {
    const storedValue = window.localStorage.getItem(key)
    if (!storedValue) {
      return initialValue
    }

    try {
      return JSON.parse(storedValue)
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state))
  }, [key, state])

  return [state, setState]
}
