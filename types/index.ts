export interface OutlineItem {
  title: string
  description: string
}

export interface ScriptSection {
  title: string
  content: string
  imagePrompts: string[]
  imagePromptInput: string
  imageCount: number
  isImagePromptsOpen: boolean
  // Voice properties
  voice: string
  speed: number
  audioUrl: string | null
  isGeneratingVoice: boolean
  isPlayingVoice: boolean
}

export interface GenerationProgress {
  step: string
  progress: number
  currentSection?: number
}

export type AppStep = "input" | "titles" | "script-input" | "outline" | "content"

export interface VoiceOption {
  value: string
  label: string
  description: string
}
