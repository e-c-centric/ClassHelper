import { generateText } from "ai"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const { classId, dateRange } = await req.json()

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: students } = await supabase.from("students").select("id, name, roll_no").eq("class_id", classId)

  const { data: participationComments } = await supabase
    .from("participation_comments")
    .select("student_id, comment, relevance, date")
    .eq("class_id", classId)
    .gte("date", dateRange.from)
    .lte("date", dateRange.to)

  if (!students || !participationComments) {
    return Response.json({ error: "No data found" }, { status: 404 })
  }

  const studentMap = new Map(students.map((s) => [s.id, s]))
  const participationByStudent = participationComments.reduce(
    (acc, comment) => {
      const studentId = comment.student_id
      if (!acc[studentId]) {
        acc[studentId] = []
      }
      acc[studentId].push(comment)
      return acc
    },
    {} as Record<string, typeof participationComments>,
  )

  const analysisPrompt = `Analyze the following student participation data and provide insights:

${Object.entries(participationByStudent)
  .map(([studentId, comments]) => {
    const student = studentMap.get(studentId)
    return `
Student: ${student?.name} (${student?.roll_no})
Total Contributions: ${comments.length}
Relevant: ${comments.filter((c) => c.relevance === "relevant").length}
Somewhat Relevant: ${comments.filter((c) => c.relevance === "somewhat_relevant").length}
Not Relevant: ${comments.filter((c) => c.relevance === "not_relevant").length}

Comments:
${comments.map((c) => `- [${c.date}] ${c.comment}`).join("\n")}
`
  })
  .join("\n---\n")}

Provide:
1. Top 3 most engaged students with specific examples
2. Students who need encouragement
3. Overall participation quality assessment
4. Recommendations for improving class engagement`

  const { text } = await generateText({
    model: "groq/llama-3.3-70b-versatile",
    prompt: analysisPrompt,
    maxOutputTokens: 2000,
  })

  return Response.json({ analysis: text })
}
