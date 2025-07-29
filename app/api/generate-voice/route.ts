export async function POST(req: Request) {
  try {
    const { text, voice = "nova", speed = 1.0 } = await req.json()

    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      console.log("No OpenAI API key found")
      return Response.json({ error: "API key not configured" }, { status: 500 })
    }

    // Optimize text for TTS
    const optimizedText = text
      .replace(/\[.*?\]/g, "") // Remove stage directions
      .replace(/\$\$.*?\$\$/g, "") // Remove parentheses
      .replace(/\s+/g, " ") // Multiple spaces
      .trim()

    if (!optimizedText) {
      return Response.json({ error: "No text to convert" }, { status: 400 })
    }

    // Use official OpenAI API
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        input: optimizedText,
        voice: voice,
        speed: speed,
        response_format: "mp3",
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`OpenAI API error: ${response.statusText} - ${errorText}`)
    }

    const audioBuffer = await response.arrayBuffer()

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error("Error generating voice:", error)
    return Response.json(
      {
        error: "Failed to generate voice",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
