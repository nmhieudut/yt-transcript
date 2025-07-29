"use client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Loader2, Volume2, Play, Pause, Download, Check } from "lucide-react"
import type { ScriptSection } from "@/types"
import { VOICE_OPTIONS } from "@/constants/voices"
import { useAudioPlayer } from "@/hooks/useAudioPlayer"
import { estimateVoiceCost, generateAudioFileName } from "@/utils/textUtils"

interface VoiceControlsProps {
  section: ScriptSection
  sectionIndex: number
  onVoiceSettingChange: (field: "voice" | "speed", value: string | number) => void
  onGenerateVoice: () => void
}

export function VoiceControls({ section, sectionIndex, onVoiceSettingChange, onGenerateVoice }: VoiceControlsProps) {
  const { playAudio, pauseAudio } = useAudioPlayer()

  const handlePlay = () => {
    if (!section.audioUrl) return

    playAudio(
      section.audioUrl,
      () => onVoiceSettingChange("isPlayingVoice" as any, true),
      () => onVoiceSettingChange("isPlayingVoice" as any, false),
      () => onVoiceSettingChange("isPlayingVoice" as any, false),
    )
  }

  const handlePause = () => {
    pauseAudio()
    onVoiceSettingChange("isPlayingVoice" as any, false)
  }

  const handleDownload = () => {
    if (!section.audioUrl) return

    const link = document.createElement("a")
    link.href = section.audioUrl
    link.download = generateAudioFileName(sectionIndex, section.title)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div>
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <Volume2 className="h-4 w-4" />
        Tạo Voice với OpenAI TTS:
      </h4>

      <div className="space-y-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Chọn giọng đọc</Label>
            <Select value={section.voice} onValueChange={(value) => onVoiceSettingChange("voice", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VOICE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Tốc độ: {section.speed}x</Label>
            <Slider
              value={[section.speed]}
              onValueChange={([value]) => onVoiceSettingChange("speed", value)}
              min={0.5}
              max={2.0}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.5x</span>
              <span>1.0x</span>
              <span>2.0x</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={onGenerateVoice} disabled={section.isGeneratingVoice} className="flex-1">
            {section.isGeneratingVoice ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tạo voice...
              </>
            ) : (
              <>
                <Volume2 className="mr-2 h-4 w-4" />
                Tạo Voice
              </>
            )}
          </Button>

          {section.audioUrl && (
            <>
              <Button
                variant="outline"
                onClick={section.isPlayingVoice ? handlePause : handlePlay}
                disabled={section.isGeneratingVoice}
              >
                {section.isPlayingVoice ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>

              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={section.isGeneratingVoice}
                title="Tải về file MP3"
              >
                <Download className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {section.audioUrl && (
          <div className="text-xs text-green-600 flex items-center gap-1">
            <Check className="h-3 w-3" />
            Voice đã sẵn sàng! Click Play để nghe hoặc Download để tải về.
          </div>
        )}

        <div className="text-xs text-gray-500">
          💰 Chi phí ước tính: ~{estimateVoiceCost(section.content)} VNĐ
          <span className="ml-2 text-blue-600">🔵 Powered by OpenAI TTS</span>
        </div>
      </div>
    </div>
  )
}
