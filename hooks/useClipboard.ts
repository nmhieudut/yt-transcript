"use client"

import { useState, useCallback } from "react"

export function useClipboard() {
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set())

  const copyToClipboard = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItems((prev) => new Set(prev).add(id))
      setTimeout(() => {
        setCopiedItems((prev) => {
          const newSet = new Set(prev)
          newSet.delete(id)
          return newSet
        })
      }, 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }, [])

  const isCopied = useCallback((id: string) => copiedItems.has(id), [copiedItems])

  return { copyToClipboard, isCopied }
}
