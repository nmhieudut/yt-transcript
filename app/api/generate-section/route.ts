import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  try {
    const { topic, scriptPrompt, outlineTitle, outlineDescription, sectionIndex, previousContent } = await req.json()

    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      console.log("No OpenAI API key found")
      return Response.json({ content: "" })
    }

    // Tạo context cho section hiện tại
    let contextPrompt = `Chủ đề chính: ${topic}
Yêu cầu kịch bản: ${scriptPrompt}

Phần ${sectionIndex + 1}: ${outlineTitle}
Mô tả: ${outlineDescription}`

    // Nếu có nội dung section trước, thêm vào context
    if (previousContent && previousContent.trim()) {
      contextPrompt += `

QUAN TRỌNG: Đây là nội dung của phần trước đó, hãy tiếp nối một cách tự nhiên và logic:
---
${previousContent}
---

Hãy viết phần tiếp theo dựa trên nội dung trên, đảm bảo:
- Tiếp nối tự nhiên từ phần trước
- Giữ tính nhất quán về nhân vật, bối cảnh, thời gian
- Phát triển cốt truyện một cách logic
- Không lặp lại nội dung đã viết`
    }

    contextPrompt += `

Hãy triển khai chi tiết phần này của kịch bản với nội dung dài và chi tiết, tối thiểu 800-1200 từ.`

    const { text } = await generateText({
      model: openai("gpt-4.1-mini"),
      temperature: 0.4,
      system: `Bạn là một chuyên gia viết kịch bản chuyên nghiệp. Nhiệm vụ của bạn là triển khai chi tiết một phần của kịch bản dựa trên outline và nội dung phần trước (nếu có).

Nội dung phải bao gồm:
- Mô tả chi tiết bối cảnh, không gian, thời gian
- Tâm lý nhân vật sâu sắc và phức tạp  
- Đối thoại sinh động và tự nhiên
- Mô tả hành động và cảm xúc cụ thể
- Chi tiết về môi trường xung quanh
- Phân tích động cơ và xung đột nội tâm

Nếu có nội dung phần trước:
- Tiếp nối tự nhiên và logic
- Giữ tính nhất quán về nhân vật và bối cảnh
- Phát triển cốt truyện một cách mạch lạc
- Không lặp lại thông tin đã có
- Chỉ bao gồm nội dung, ko bao gồm các text dư thừa (Section 1,...)

Viết nội dung dài và chi tiết, tối thiểu 800-1200 từ.`,
      prompt: contextPrompt,
    })

    return Response.json({ content: text })
  } catch (error) {
    console.error("Error generating section:", error)
    return Response.json({ content: "" })
  }
}
