import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  try {
    const { topic, scriptPrompt, sectionTitle, sectionContent, imagePrompt, imageCount = 20 } = await req.json()

    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      console.log("No OpenAI API key found")
      return Response.json({ prompts: [] })
    }

    const { text } = await generateText({
      model: openai("gpt-4.1-mini"),
      temperature: 0.4,
      system: `Bạn là chuyên gia tạo prompts cho AI tạo hình ảnh. Nhiệm vụ của bạn là tạo ra ${imageCount} prompts chi tiết và đa dạng để tạo hình ảnh minh họa cho một section kịch bản.

Mỗi prompt phải:
- Mô tả chi tiết cảnh, nhân vật, không khí, ánh sáng
- Phù hợp với chủ đề, prompt kịch bản và nội dung section
- Có tính nghệ thuật và điện ảnh cao
- Bao gồm chi tiết về composition, lighting, mood
- Bằng tiếng Anh để phù hợp với AI tạo hình
- Đa dạng về góc chụp, style và cảm xúc

Trả về JSON format:
{
  "prompts": [
    "Detailed cinematic prompt 1...",
    "Detailed artistic prompt 2...",
    ...
  ]
}

Đảm bảo tạo đúng ${imageCount} prompts khác nhau và đa dạng.`,
      prompt: `Yêu cầu: Tạo ${imageCount} prompts hình ảnh

Chủ đề chính: ${topic}
Prompt kịch bản: ${scriptPrompt}
Tiêu đề section: ${sectionTitle}
Nội dung section: ${sectionContent}

Prompt từ người dùng: ${imagePrompt}

Hãy tạo ${imageCount} prompts rất chi tiết với mô tả cụ thể về lighting, composition, mood, và artistic style dựa trên yêu cầu của người dùng và nội dung section.`,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Không thể parse JSON từ response")
    }

    const result = JSON.parse(jsonMatch[0])
    return Response.json(result)
  } catch (error) {
    console.error("Error generating image prompts:", error)
    return Response.json({ prompts: [] })
  }
}
