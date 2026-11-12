import { useState } from 'react'

export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = window.localStorage.getItem(key)
      return saved ? JSON.parse(saved) : initialValue
    } catch (error) {
      console.error(`Unable to load "${key}" from local storage.`, error)
      return initialValue
    }
  })

  const updateValue = (nextValue) => {
    setValue((current) => {
      const resolved = typeof nextValue === 'function' ? nextValue(current) : nextValue
      try {
        window.localStorage.setItem(key, JSON.stringify(resolved))
      } catch (error) {
        console.error(`Unable to save "${key}" to local storage.`, error)
      }
      return resolved
    })
  }

  return [value, updateValue]
}
