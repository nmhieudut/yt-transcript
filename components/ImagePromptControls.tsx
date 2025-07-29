"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Loader2, ImageIcon, ChevronDown, ChevronUp, Copy, Check } from "lucide-react"
import type { ScriptSection } from "@/types"
import { useClipboard } from "@/hooks/useClipboard"

interface ImagePromptControlsProps {
  section: ScriptSection
  sectionIndex: number
  isLoading: boolean
  onImagePromptInputChange: (value: string) => void
  onImageCountChange: (count: number) => void
  onGenerateImagePrompts: () => void
  onToggleImagePrompts: () => void
}

export function ImagePromptControls({
  section,
  sectionIndex,
  isLoading,
  onImagePromptInputChange,
  onImageCountChange,
  onGenerateImagePrompts,
  onToggleImagePrompts,
}: ImagePromptControlsProps) {
  const { copyToClipboard, isCopied } = useClipboard()

  const copyAllPrompts = async () => {
    if (section.imagePrompts.length === 0) return

    const allPrompts = section.imagePrompts.map((prompt, index) => `${index + 1}. ${prompt}`).join("\n\n")
    await copyToClipboard(allPrompts, `all-prompts-${sectionIndex}`)
  }

  return (
    <div>
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <ImageIcon className="h-4 w-4" />
        Tạo Prompts Hình Ảnh:
      </h4>

      <div className="space-y-3">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Label htmlFor={`imagePrompt-${sectionIndex}`} className="text-sm font-medium mb-2 block">
              Prompt tạo ảnh
            </Label>
            <Textarea
              id={`imagePrompt-${sectionIndex}`}
              placeholder="Ví dụ: Tạo prompts hình ảnh cinematic, dramatic lighting, emotional scenes..."
              value={section.imagePromptInput}
              onChange={(e) => onImagePromptInputChange(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="w-32">
            <Label htmlFor={`imageCount-${sectionIndex}`} className="text-sm font-medium mb-2 block">
              Số lượng (1-100)
            </Label>
            <Input
              id={`imageCount-${sectionIndex}`}
              type="number"
              min="1"
              max="100"
              value={section.imageCount}
              onChange={(e) => onImageCountChange(Number.parseInt(e.target.value) || 20)}
              className="w-full"
            />
          </div>
          <Button
            onClick={onGenerateImagePrompts}
            disabled={isLoading || !section.imagePromptInput.trim()}
            className="mb-0"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : `Tạo ${section.imageCount} Ảnh`}
          </Button>
        </div>

        <p className="text-xs text-gray-500">💡 Số lượng ảnh sẽ được thêm tự động vào context</p>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-3 bg-gray-50 rounded-lg border">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            <p className="text-sm text-blue-600">Đang tạo {section.imageCount} prompts hình ảnh...</p>
          </div>
        ) : section.imagePrompts.length > 0 ? (
          <Collapsible open={section.isImagePromptsOpen} onOpenChange={onToggleImagePrompts}>
            <div className="flex gap-2">
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="flex-1 justify-between bg-transparent">
                  <span className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    {section.imagePrompts.length} Image Prompts
                  </span>
                  {section.isImagePromptsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <Button
                variant="outline"
                size="sm"
                onClick={copyAllPrompts}
                className="px-3 bg-transparent"
                title="Copy tất cả prompts"
              >
                {isCopied(`all-prompts-${sectionIndex}`) ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <CollapsibleContent className="space-y-3 mt-3">
              <div className="grid gap-3">
                {section.imagePrompts.map((prompt, pIndex) => (
                  <div key={pIndex} className="p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs mt-0.5 flex-shrink-0">
                        {pIndex + 1}
                      </Badge>
                      <p className="text-sm text-gray-700 leading-relaxed flex-1">{prompt}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(prompt, `prompt-${sectionIndex}-${pIndex}`)}
                        className="flex-shrink-0"
                      >
                        {isCopied(`prompt-${sectionIndex}-${pIndex}`) ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg border">
            Nhập prompt, chọn số lượng và click "Tạo X Ảnh" để tạo prompts hình ảnh
          </div>
        )}
      </div>
    </div>
  )
}
