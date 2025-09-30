import { generateText } from "ai"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const { transcription, classId, date } = await req.json()

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: students } = await supabase.from("students").select("id, name, roll_no").eq("class_id", classId)

  if (!students) {
    return Response.json({ error: "No students found" }, { status: 404 })
  }

  const studentNames = students.map((s) => s.name).join(", ")

  const matchPrompt = `Given this transcription of a teacher calling out student names during attendance:

"${transcription}"

And this list of students in the class:
${studentNames}

Please identify which students were mentioned in the transcription. Return a JSON array of student names that were called out. Be flexible with name matching (e.g., "John" matches "John Smith", "Mike" matches "Michael").

Return ONLY a valid JSON array like: ["John Smith", "Jane Doe"]`

  const { text } = await generateText({
    model: "groq/llama-3.3-70b-versatile",
    prompt: matchPrompt,
    maxOutputTokens: 1000,
  })

  let matchedNames: string[] = []
  try {
    matchedNames = JSON.parse(text)
  } catch {
    const matches = text.match(/\[.*\]/)
    if (matches) {
      matchedNames = JSON.parse(matches[0])
    }
  }

  const attendanceRecords = students.map((student) => {
    const isPresent = matchedNames.some(
      (name) =>
        student.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(student.name.toLowerCase()),
    )

    return {
      class_id: classId,
      student_id: student.id,
      date,
      present: isPresent,
    }
  })

  const { error } = await supabase
    .from("attendance_records")
    .upsert(attendanceRecords, { onConflict: "student_id,date" })

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({
    success: true,
    matched: matchedNames,
    totalPresent: attendanceRecords.filter((r) => r.present).length,
  })
}
