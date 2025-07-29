import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  try {
    const { topic, prompt } = await req.json()

    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      console.log("No OpenAI API key found")
      return Response.json({ outline: [] })
    }

    const { text } = await generateText({
      model: openai("gpt-4.1-mini"),
      maxTokens: 2000,
      temperature: 0.4,
      system: `Bạn là chuyên gia tạo outline kịch bản. Nhiệm vụ của bạn là tạo 8 gạch đầu dòng (outline) cho kịch bản.

Mỗi gạch đầu dòng phải có:
- **Tiêu đề mini ≤ 8 từ**
- **Một câu mô tả nội dung phần đó**

Trả về kết quả dưới dạng JSON với format:
{
  "outline": [
    {
      "title": "Tiêu đề ngắn gọn ≤ 8 từ",
      "description": "Một câu mô tả nội dung phần này"
    },
    ...
  ]
}`,
      prompt: `Chủ đề: ${topic}
Prompt kịch bản: ${prompt}

Tạo 8 gạch đầu dòng outline cho kịch bản này.`,
    })

    // Parse JSON từ response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Không thể parse JSON từ response")
    }

    const result = JSON.parse(jsonMatch[0])
    return Response.json(result)
  } catch (error) {
    console.error("Error generating outline:", error)
    return Response.json({ outline: [] })
  }
}
