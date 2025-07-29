"use client"

import { useState, useCallback, useRef, useEffect } from "react"

export function useAudioPlayer() {
  const [currentlyPlayingAudio, setCurrentlyPlayingAudio] = useState<HTMLAudioElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const playAudio = useCallback(
    (audioUrl: string, onPlay?: () => void, onEnd?: () => void, onError?: () => void) => {
      // Stop currently playing audio
      if (currentlyPlayingAudio) {
        currentlyPlayingAudio.pause()
        currentlyPlayingAudio.src = ""
      }

      const audio = new Audio(audioUrl)
      audioRef.current = audio
      setCurrentlyPlayingAudio(audio)

      audio.onended = () => {
        onEnd?.()
        setCurrentlyPlayingAudio(null)
        audioRef.current = null
      }

      audio.onerror = () => {
        onError?.()
        setCurrentlyPlayingAudio(null)
        audioRef.current = null
      }

      audio.onplay = () => {
        onPlay?.()
      }

      audio.play()
    },
    [currentlyPlayingAudio],
  )

  const pauseAudio = useCallback(() => {
    if (currentlyPlayingAudio) {
      currentlyPlayingAudio.pause()
      currentlyPlayingAudio.src = ""
      setCurrentlyPlayingAudio(null)
      audioRef.current = null
    }
  }, [currentlyPlayingAudio])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }
    }
  }, [])

  return {
    playAudio,
    pauseAudio,
    isPlaying: !!currentlyPlayingAudio,
  }
}
