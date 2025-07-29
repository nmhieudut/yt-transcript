"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2, ArrowLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SectionCard } from "@/components/SectionCard"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import type { OutlineItem, ScriptSection, GenerationProgress, AppStep } from "@/types"

export default function ScriptImageGenerator() {
  const [currentStep, setCurrentStep] = useState<AppStep>("input")
  const [titlePrompt, setTitlePrompt] = useLocalStorage("titlePrompt", "")
  const [titleCount, setTitleCount] = useLocalStorage("titleCount", 8)
  const [scriptPrompt, setScriptPrompt] = useState("")
  const [titles, setTitles] = useState<string[]>([])
  const [selectedTitle, setSelectedTitle] = useState("")
  const [outline, setOutline] = useState<OutlineItem[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState<GenerationProgress>({ step: "", progress: 0 })
  const [sections, setSections] = useState<ScriptSection[]>([])
  const [error, setError] = useState("")
  const [loadingSections, setLoadingSections] = useState<Set<number>>(new Set())
  const [loadingImagePrompts, setLoadingImagePrompts] = useState<Set<number>>(new Set())

  const generateVoice = async (sectionIndex: number) => {
    const section = sections[sectionIndex]
    if (!section.content.trim()) {
      setError("Không có nội dung để tạo voice")
      return
    }

    // Update loading state
    const updatedSections = [...sections]
    updatedSections[sectionIndex].isGeneratingVoice = true
    setSections(updatedSections)
    setError("")

    try {
      const response = await fetch("/api/generate-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: section.content,
          voice: section.voice,
          speed: section.speed,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate voice")
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      // Update section with audio URL
      const finalSections = [...sections]
      finalSections[sectionIndex].audioUrl = audioUrl
      finalSections[sectionIndex].isGeneratingVoice = false
      setSections(finalSections)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi tạo voice")

      // Reset loading state
      const finalSections = [...sections]
      finalSections[sectionIndex].isGeneratingVoice = false
      setSections(finalSections)
    }
  }

  const updateVoiceSettings = (sectionIndex: number, field: "voice" | "speed", value: string | number) => {
    const updatedSections = [...sections]
    updatedSections[sectionIndex][field] = value as any
    setSections(updatedSections)
  }

  const generateTitles = async () => {
    if (!titlePrompt.trim()) {
      setError("Vui lòng nhập prompt để tạo tiêu đề")
      return
    }

    if (titleCount < 1 || titleCount > 50) {
      setError("Số lượng tiêu đề phải từ 1 đến 50")
      return
    }

    setIsGenerating(true)
    setError("")
    setTitles([])

    try {
      setProgress({ step: "Đang tạo danh sách tiêu đề...", progress: 50 })

      const response = await fetch("/api/generate-titles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: titlePrompt,
          count: titleCount,
        }),
      })

      if (!response.ok) {
        throw new Error("Lỗi khi tạo tiêu đề")
      }

      const data = await response.json()
      setTitles(data.titles || [])
      setCurrentStep("titles")
      setProgress({ step: "Hoàn thành!", progress: 100 })

      if (data.isDemo) {
        setError(`⚠️ ${data.message}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra")
    } finally {
      setIsGenerating(false)
    }
  }

  const selectTitle = (title: string) => {
    setSelectedTitle(title)
    setCurrentStep("script-input")
    setError("")
  }

  const generateOutline = async () => {
    if (!scriptPrompt.trim()) {
      setError("Vui lòng nhập prompt kịch bản")
      return
    }

    setIsGenerating(true)
    setError("")
    setOutline([])
    setCurrentStep("outline")

    try {
      setProgress({ step: "Đang tạo outline kịch bản...", progress: 30 })

      const response = await fetch("/api/generate-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedTitle,
          prompt: scriptPrompt,
        }),
      })

      if (!response.ok) {
        throw new Error("Lỗi khi tạo outline")
      }

      const data = await response.json()
      setOutline(data.outline || [])
      setProgress({ step: "Outline hoàn thành!", progress: 100 })

      if (data.isDemo) {
        setError(`⚠️ ${data.message}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra")
    } finally {
      setIsGenerating(false)
    }
  }

  const generateContent = async () => {
    setIsGenerating(true)
    setError("")
    setSections([])
    setCurrentStep("content")

    try {
      // Khởi tạo sections với outline
      const initialSections: ScriptSection[] = outline.map((item) => ({
        title: item.title,
        content: "",
        imagePrompts: [],
        imagePromptInput: "",
        imageCount: 20,
        isImagePromptsOpen: false,
        // Voice properties
        voice: "alloy", // Default narrator voice
        speed: 1.0,
        audioUrl: null,
        isGeneratingVoice: false,
        isPlayingVoice: false,
      }))
      setSections(initialSections)

      setProgress({ step: "Đang tạo nội dung chi tiết...", progress: 10 })

      // Tạo sections tuần tự, mỗi section dựa trên section trước
      const updatedSections = [...initialSections]
      let previousContent = ""

      for (let i = 0; i < outline.length; i++) {
        // Set loading state cho section hiện tại
        setLoadingSections((prev) => new Set(prev).add(i))

        setProgress({
          step: `Đang tạo section ${i + 1}/8...`,
          progress: 10 + (i / outline.length) * 80,
          currentSection: i + 1,
        })

        const response = await fetch("/api/generate-section", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: selectedTitle,
            scriptPrompt: scriptPrompt,
            outlineTitle: outline[i].title,
            outlineDescription: outline[i].description,
            sectionIndex: i,
            previousContent: previousContent,
          }),
        })

        if (!response.ok) {
          throw new Error(`Lỗi khi tạo section ${i + 1}`)
        }

        const data = await response.json()
        const content = data.content || ""

        updatedSections[i].content = content
        previousContent = content

        // Cập nhật UI real-time và xóa loading state
        setSections([...updatedSections])
        setLoadingSections((prev) => {
          const newSet = new Set(prev)
          newSet.delete(i)
          return newSet
        })
      }

      setProgress({ step: "Hoàn thành!", progress: 100 })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra")
    } finally {
      setIsGenerating(false)
      setLoadingSections(new Set())
    }
  }

  const generateImagePrompts = async (sectionIndex: number) => {
    const section = sections[sectionIndex]
    if (!section.imagePromptInput.trim()) {
      setError("Vui lòng nhập prompt tạo ảnh cho section này")
      return
    }

    if (section.imageCount < 1 || section.imageCount > 100) {
      setError("Số lượng ảnh phải từ 1 đến 100")
      return
    }

    setLoadingImagePrompts((prev) => new Set(prev).add(sectionIndex))
    setError("")

    try {
      const response = await fetch("/api/generate-image-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedTitle,
          scriptPrompt: scriptPrompt,
          sectionTitle: section.title,
          sectionContent: section.content,
          imagePrompt: section.imagePromptInput,
          imageCount: section.imageCount,
        }),
      })

      if (!response.ok) {
        throw new Error(`Lỗi khi tạo prompts cho section ${sectionIndex + 1}`)
      }

      const data = await response.json()

      // Cập nhật section với image prompts và mở accordion
      const updatedSections = [...sections]
      updatedSections[sectionIndex].imagePrompts = data.prompts || []
      updatedSections[sectionIndex].isImagePromptsOpen = true // Tự động mở khi có kết quả
      setSections(updatedSections)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra")
    } finally {
      setLoadingImagePrompts((prev) => {
        const newSet = new Set(prev)
        newSet.delete(sectionIndex)
        return newSet
      })
    }
  }

  const updateImagePromptInput = (sectionIndex: number, value: string) => {
    const updatedSections = [...sections]
    updatedSections[sectionIndex].imagePromptInput = value
    setSections(updatedSections)
  }

  const updateImageCount = (sectionIndex: number, count: number) => {
    const updatedSections = [...sections]
    updatedSections[sectionIndex].imageCount = count
    setSections(updatedSections)
  }

  const toggleImagePrompts = (sectionIndex: number) => {
    const updatedSections = [...sections]
    updatedSections[sectionIndex].isImagePromptsOpen = !updatedSections[sectionIndex].isImagePromptsOpen
    setSections(updatedSections)
  }

  const resetToInput = () => {
    setCurrentStep("input")
    setScriptPrompt("")
    setTitles([])
    setSelectedTitle("")
    setOutline([])
    setSections([])
    setError("")
  }

  const backToTitles = () => {
    setCurrentStep("titles")
    setScriptPrompt("")
    setSelectedTitle("")
    setOutline([])
    setSections([])
    setError("")
  }

  const backToScriptInput = () => {
    setCurrentStep("script-input")
    setOutline([])
    setSections([])
    setError("")
  }

  const backToOutline = () => {
    setCurrentStep("outline")
    setSections([])
    setError("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Script & Image Generator</h1>
          <p className="text-gray-600">Tạo kịch bản 8 nhánh và prompts hình ảnh bằng AI</p>
        </div>

        {/* Step 1: Input Title Prompt */}
        {currentStep === "input" && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Bước 1: Nhập Prompt Tạo Tiêu Đề</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titleCount">Số lượng tiêu đề (1-50)</Label>
                <Input
                  id="titleCount"
                  type="number"
                  min="1"
                  max="50"
                  value={titleCount}
                  onChange={(e) => setTitleCount(Number.parseInt(e.target.value) || 8)}
                  className="w-32"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="titlePrompt">Prompt tạo tiêu đề</Label>
                <Textarea
                  id="titlePrompt"
                  placeholder="Ví dụ: Tạo tiêu đề kịch bản drama về tình yêu và sự nghiệp của giới trẻ hiện đại..."
                  value={titlePrompt}
                  onChange={(e) => setTitlePrompt(e.target.value)}
                  rows={4}
                  className="w-full resize-none"
                />
                <p className="text-xs text-gray-500">💡 Số lượng tiêu đề sẽ được thêm tự động vào context</p>
                <p className="text-xs text-blue-500">💾 Prompt sẽ được lưu tự động vào trình duyệt</p>
              </div>

              {error && (
                <div className="text-red-600 text-sm p-3 bg-red-50 border border-red-200 rounded-md">{error}</div>
              )}

              <Button onClick={generateTitles} disabled={isGenerating} className="w-full" size="lg">
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tạo {titleCount} tiêu đề...
                  </>
                ) : (
                  `Tạo ${titleCount} Tiêu Đề`
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Select Title */}
        {currentStep === "titles" && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Bước 2: Chọn Tiêu Đề Để Phát Triển ({titles.length} tiêu đề)</CardTitle>
                <Button variant="outline" size="sm" onClick={resetToInput}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quay lại
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3 text-sm">{error}</div>
              )}

              <div className="grid gap-3">
                {titles.map((title, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <h3 className="font-semibold text-gray-900">{title}</h3>
                      </div>
                    </div>
                    <Button onClick={() => selectTitle(title)} className="ml-4">
                      Chọn
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Input Script Prompt */}
        {currentStep === "script-input" && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Bước 3: Nhập Prompt Kịch Bản</CardTitle>
                <Button variant="outline" size="sm" onClick={backToTitles}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Chọn tiêu đề khác
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Tiêu đề đã chọn:</strong> {selectedTitle}
                </p>
              </div>

              <Textarea
                placeholder="Ví dụ: Tạo kịch bản drama về một cô gái trẻ phải lựa chọn giữa tình yêu và sự nghiệp. Kịch bản phải có tính kịch tính cao, nhiều twist bất ngờ và cảm xúc sâu sắc. Mỗi section cần có ít nhất 1200 từ với chi tiết về tâm lý nhân vật, đối thoại và mô tả cảnh..."
                value={scriptPrompt}
                onChange={(e) => setScriptPrompt(e.target.value)}
                rows={8}
                className="w-full resize-y min-h-[200px]"
              />

              {error && (
                <div className="text-red-600 text-sm p-3 bg-red-50 border border-red-200 rounded-md">{error}</div>
              )}

              <Button onClick={generateOutline} disabled={isGenerating} className="w-full" size="lg">
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tạo outline...
                  </>
                ) : (
                  "Tạo Outline Kịch Bản"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Show Outline */}
        {currentStep === "outline" && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Bước 4: Outline Kịch Bản (8 Phần)</CardTitle>
                <Button variant="outline" size="sm" onClick={backToScriptInput}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Chỉnh sửa prompt
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3 text-sm">{error}</div>
              )}

              <div className="grid gap-3">
                {outline.map((item, index) => (
                  <div key={index} className="p-4 bg-white border rounded-lg">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-1">
                        Phần {index + 1}
                      </Badge>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button onClick={generateContent} disabled={isGenerating} className="w-full" size="lg">
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tạo nội dung chi tiết...
                  </>
                ) : (
                  "Tạo Nội Dung Chi Tiết"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Progress */}
        {isGenerating && currentStep === "content" && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{progress.step}</span>
                  <span>{progress.progress}%</span>
                </div>
                <Progress value={progress.progress} className="w-full" />
                {progress.currentSection && (
                  <div className="text-xs text-gray-500">
                    Section hiện tại: {progress.currentSection}/8
                    {progress.currentSection <= 8 && (
                      <span className="ml-2 text-blue-600">(Mỗi section sẽ tiếp nối section trước)</span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Results */}
        {currentStep === "content" && sections.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Kết Quả cho: "{selectedTitle}"</h2>
                <p className="text-sm text-gray-600 mt-1">Dựa trên prompt: {scriptPrompt.slice(0, 100)}...</p>
                <p className="text-xs text-blue-600 mt-1">
                  ✨ Các sections được tạo tuần tự, mỗi phần tiếp nối phần trước để tạo câu chuyện liên tục
                </p>
              </div>
              <Button variant="outline" onClick={backToOutline}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Xem lại outline
              </Button>
            </div>

            {error && (
              <div className="text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3 text-sm">{error}</div>
            )}

            {sections.map((section, index) => (
              <SectionCard
                key={index}
                section={section}
                sectionIndex={index}
                isLoadingContent={loadingSections.has(index)}
                isLoadingImagePrompts={loadingImagePrompts.has(index)}
                onVoiceSettingChange={(field, value) => updateVoiceSettings(index, field, value)}
                onGenerateVoice={() => generateVoice(index)}
                onImagePromptInputChange={(value) => updateImagePromptInput(index, value)}
                onImageCountChange={(count) => updateImageCount(index, count)}
                onGenerateImagePrompts={() => generateImagePrompts(index)}
                onToggleImagePrompts={() => toggleImagePrompts(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
