"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Save } from "lucide-react"
import { format } from "date-fns"

type Student = {
  id: string
  roll_no: string
  name: string
  email: string | null
  position_group: string | null
  position_seat: number | null
}

type TakeAttendanceViewProps = {
  classId: string
  students: Student[]
  organizationType: string
  selectedDate: Date
}

export function TakeAttendanceView({ classId, students, organizationType, selectedDate }: TakeAttendanceViewProps) {
  const [attendance, setAttendance] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadAttendance()
  }, [selectedDate])

  const loadAttendance = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const { data } = await supabase
        .from("attendance_records")
        .select("student_id, present")
        .eq("class_id", classId)
        .eq("date", format(selectedDate, "yyyy-MM-dd"))

      if (data) {
        const attendanceMap: Record<string, boolean> = {}
        data.forEach((record) => {
          attendanceMap[record.student_id] = record.present
        })
        setAttendance(attendanceMap)
      }
    } catch (error) {
      console.error("[v0] Error loading attendance:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleAttendance = (studentId: string) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }))
  }

  const saveAttendance = async () => {
    setIsSaving(true)
    const supabase = createClient()

    try {
      const records = students.map((student) => ({
        class_id: classId,
        student_id: student.id,
        date: format(selectedDate, "yyyy-MM-dd"),
        present: attendance[student.id] || false,
      }))

      const { error } = await supabase.from("attendance_records").upsert(records, {
        onConflict: "student_id,date",
      })

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("[v0] Error saving attendance:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.roll_no.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const groupedStudents = filteredStudents.reduce(
    (acc, student) => {
      const group = student.position_group || "Unassigned"
      if (!acc[group]) {
        acc[group] = []
      }
      acc[group].push(student)
      return acc
    },
    {} as Record<string, Student[]>,
  )

  const presentCount = Object.values(attendance).filter(Boolean).length
  const totalCount = students.length

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">Loading attendance...</CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Attendance for {format(selectedDate, "MMMM d, yyyy")}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {presentCount} / {totalCount} students present
              </p>
            </div>
            <Button onClick={saveAttendance} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Attendance"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or roll number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4">
        {Object.entries(groupedStudents).map(([group, groupStudents]) => (
          <Card key={group}>
            <CardHeader>
              <CardTitle className="text-lg">
                {organizationType === "rows" ? "Row" : "Table"} {group}
                <Badge variant="secondary" className="ml-2">
                  {groupStudents.filter((s) => attendance[s.id]).length} / {groupStudents.length} present
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {groupStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                  >
                    <Checkbox
                      id={student.id}
                      checked={attendance[student.id] || false}
                      onCheckedChange={() => toggleAttendance(student.id)}
                      className="h-5 w-5"
                    />
                    <label htmlFor={student.id} className="flex-1 cursor-pointer">
                      <p className="font-medium text-balance">{student.name}</p>
                      <p className="text-sm text-muted-foreground">Roll No: {student.roll_no}</p>
                    </label>
                    {student.position_seat && <Badge variant="outline">Seat {student.position_seat}</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
