"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ImageIcon, Volume2, Copy, Check } from "lucide-react"
import type { ScriptSection } from "@/types"
import { VoiceControls } from "./VoiceControls"
import { ImagePromptControls } from "./ImagePromptControls"
import { useClipboard } from "@/hooks/useClipboard"

interface SectionCardProps {
  section: ScriptSection
  sectionIndex: number
  isLoadingContent: boolean
  isLoadingImagePrompts: boolean
  onVoiceSettingChange: (field: "voice" | "speed", value: string | number) => void
  onGenerateVoice: () => void
  onImagePromptInputChange: (value: string) => void
  onImageCountChange: (count: number) => void
  onGenerateImagePrompts: () => void
  onToggleImagePrompts: () => void
}

export function SectionCard({
  section,
  sectionIndex,
  isLoadingContent,
  isLoadingImagePrompts,
  onVoiceSettingChange,
  onGenerateVoice,
  onImagePromptInputChange,
  onImageCountChange,
  onGenerateImagePrompts,
  onToggleImagePrompts,
}: SectionCardProps) {
  const { copyToClipboard, isCopied } = useClipboard()

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline">Phần {sectionIndex + 1}</Badge>
            {section.title}
            {sectionIndex > 0 && (
              <Badge variant="secondary" className="text-xs">
                Tiếp nối phần {sectionIndex}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{section.imagePrompts.length} prompts</Badge>
            {section.audioUrl && (
              <Badge variant="outline" className="text-green-600">
                <Volume2 className="h-3 w-3 mr-1" />
                Voice Ready
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(section.content, `section-${sectionIndex}`)}
            >
              {isCopied(`section-${sectionIndex}`) ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Nội dung:</h4>
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border max-h-96 overflow-y-auto">
            {isLoadingContent ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p className="text-sm text-blue-600">Đang tạo nội dung section {sectionIndex + 1}...</p>
              </div>
            ) : section.content ? (
              section.content
            ) : (
              "Chưa có nội dung"
            )}
          </div>
          {section.content && (
            <div className="text-xs text-gray-500 mt-2">
              Số từ: {section.content.split(" ").length}
              {sectionIndex > 0 && <span className="ml-4 text-blue-600">📖 Tiếp nối từ phần {sectionIndex}</span>}
            </div>
          )}
        </div>

        {/* Voice Generation Section */}
        {section.content && (
          <VoiceControls
            section={section}
            sectionIndex={sectionIndex}
            onVoiceSettingChange={onVoiceSettingChange}
            onGenerateVoice={onGenerateVoice}
          />
        )}

        {/* Image Generation Section */}
        {section.content && (
          <ImagePromptControls
            section={section}
            sectionIndex={sectionIndex}
            isLoading={isLoadingImagePrompts}
            onImagePromptInputChange={onImagePromptInputChange}
            onImageCountChange={onImageCountChange}
            onGenerateImagePrompts={onGenerateImagePrompts}
            onToggleImagePrompts={onToggleImagePrompts}
          />
        )}

        {!section.content && !isLoadingContent && (
          <div className="p-4 text-center text-gray-400 bg-gray-50 rounded-lg border">
            <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Tạo nội dung section trước để có thể tạo prompts hình ảnh và voice</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
