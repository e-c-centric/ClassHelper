import { generateText } from "ai"

export async function POST(req: Request) {
  const formData = await req.formData()
  const audioFile = formData.get("audio") as File
  const classId = formData.get("classId") as string

  if (!audioFile) {
    return Response.json({ error: "No audio file provided" }, { status: 400 })
  }

  const audioBuffer = await audioFile.arrayBuffer()
  const base64Audio = Buffer.from(audioBuffer).toString("base64")

  const { text } = await generateText({
    model: "groq/whisper-large-v3-turbo",
    prompt:
      "Transcribe the following audio recording of a class session. Focus on capturing student names and their contributions.",
    maxOutputTokens: 2000,
  })

  return Response.json({ transcription: text })
}
