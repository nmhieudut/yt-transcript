export function optimizeTextForTTS(text: string): string {
  return text
    .replace(/\[.*?\]/g, "") // Remove stage directions
    .replace(/$$.*?$$/g, "") // Remove parentheses
    .replace(/\s+/g, " ") // Multiple spaces
    .trim()
}

export function estimateVoiceCost(text: string): number {
  const characters = text.length
  const costPerMillion = 15 // USD
  const costUSD = (characters / 1000000) * costPerMillion
  const costVND = costUSD * 24000 // Approximate VND conversion
  return Math.ceil(costVND)
}

export function generateAudioFileName(sectionIndex: number, title: string): string {
  const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, "-")
  return `section-${sectionIndex + 1}-${cleanTitle}.mp3`
}
