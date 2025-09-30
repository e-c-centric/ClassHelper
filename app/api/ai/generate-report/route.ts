import { generateText } from "ai"
import { createClient } from "@/lib/supabase/server"
import { format } from "date-fns"

export async function POST(req: Request) {
  const { classId, date, reportType } = await req.json()

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: classData } = await supabase.from("classes").select("name, description").eq("id", classId).single()

  const { data: students } = await supabase.from("students").select("id, name, roll_no").eq("class_id", classId)

  let reportContent = ""

  if (reportType === "attendance" || reportType === "comprehensive") {
    const { data: attendanceRecords } = await supabase
      .from("attendance_records")
      .select("student_id, present")
      .eq("class_id", classId)
      .eq("date", date)

    const presentCount = attendanceRecords?.filter((r) => r.present).length || 0
    const totalCount = students?.length || 0

    reportContent += `Attendance Report for ${classData?.name}\nDate: ${format(new Date(date), "MMMM d, yyyy")}\n\n`
    reportContent += `Present: ${presentCount}/${totalCount} students (${((presentCount / totalCount) * 100).toFixed(1)}%)\n\n`

    if (attendanceRecords && students) {
      const presentStudents = students.filter((s) => attendanceRecords.find((r) => r.student_id === s.id && r.present))
      const absentStudents = students.filter((s) => !attendanceRecords.find((r) => r.student_id === s.id && r.present))

      reportContent += `Present Students:\n${presentStudents.map((s) => `- ${s.name} (${s.roll_no})`).join("\n")}\n\n`
      reportContent += `Absent Students:\n${absentStudents.map((s) => `- ${s.name} (${s.roll_no})`).join("\n")}\n\n`
    }
  }

  if (reportType === "participation" || reportType === "comprehensive") {
    const { data: participationComments } = await supabase
      .from("participation_comments")
      .select("student_id, comment, relevance")
      .eq("class_id", classId)
      .eq("date", date)

    if (participationComments && participationComments.length > 0) {
      reportContent += `Participation Summary:\n`
      reportContent += `Total Contributions: ${participationComments.length}\n\n`

      const studentMap = new Map(students?.map((s) => [s.id, s]) || [])
      participationComments.forEach((comment) => {
        const student = studentMap.get(comment.student_id)
        reportContent += `- ${student?.name} (${student?.roll_no}): ${comment.comment} [${comment.relevance}]\n`
      })
    }
  }

  const aiPrompt = `Based on the following class data, generate a professional, concise class report:

${reportContent}

Please provide:
1. A brief summary of the class session
2. Key highlights and notable contributions
3. Any concerns or areas for improvement
4. Recommendations for the next session

Keep the report professional and actionable.`

  const { text } = await generateText({
    model: "groq/llama-3.3-70b-versatile",
    prompt: aiPrompt,
    maxOutputTokens: 1500,
  })

  const { error } = await supabase.from("class_reports").insert({
    class_id: classId,
    date,
    report_type: reportType,
    content: text,
  })

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ report: text })
}
