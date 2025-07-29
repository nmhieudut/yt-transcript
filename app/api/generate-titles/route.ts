import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  try {
    const { prompt, count = 8 } = await req.json()

    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      console.log("No OpenAI API key found")
      return Response.json({ titles: [] })
    }

    const { text } = await generateText({
      model: openai("gpt-4.1-mini"),
      maxTokens: 1000,
      system: `Bạn là chuyên gia tạo tiêu đề kịch bản. Nhiệm vụ của bạn là tạo ${count} tiêu đề theo hướng dẫn của prompt đầu vào.

Trả về kết quả dưới dạng JSON với format:
{
  "titles": [
    "Tiêu đề 1",
    "Tiêu đề 2",
    ...
  ]
}

Đảm bảo tạo đúng ${count} tiêu đề khác nhau và đa dạng.`,
      prompt: `Yêu cầu: Tạo ${count} tiêu đề

Prompt từ người dùng: ${prompt}

Hãy tạo ${count} tiêu đề khác nhau và đa dạng dựa trên prompt trên.`,
    })

    // Parse JSON từ response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Không thể parse JSON từ response")
    }

    const result = JSON.parse(jsonMatch[0])
    return Response.json(result)
  } catch (error) {
    console.error("Error generating titles:", error)
    return Response.json({ titles: [] })
  }
}
