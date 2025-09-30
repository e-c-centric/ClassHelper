"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type Student = {
  id: string
  roll_no: string
  name: string
  email: string | null
  position_group: string | null
  position_seat: number | null
}

type Assignment = {
  id: string
  title: string
  max_points: number
}

type Grade = {
  student_id: string
  assignment_id: string
  points_earned: number
}

type GradesViewProps = {
  classId: string
  students: Student[]
}

export function GradesView({ classId, students }: GradesViewProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [selectedAssignment, setSelectedAssignment] = useState<string>("")
  const [grades, setGrades] = useState<Record<string, string>>({})
  const [existingGrades, setExistingGrades] = useState<Grade[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadAssignments()
  }, [])

  useEffect(() => {
    if (selectedAssignment) {
      loadGrades()
    }
  }, [selectedAssignment])

  const loadAssignments = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("assignments")
      .select("id, title, max_points")
      .eq("class_id", classId)
      .order("due_date", { ascending: true })

    if (data) {
      setAssignments(data)
      if (data.length > 0) {
        setSelectedAssignment(data[0].id)
      }
    }
    setIsLoading(false)
  }

  const loadGrades = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("grades")
      .select("student_id, assignment_id, points_earned")
      .eq("assignment_id", selectedAssignment)

    if (data) {
      setExistingGrades(data)
      const gradesMap: Record<string, string> = {}
      data.forEach((grade) => {
        gradesMap[grade.student_id] = grade.points_earned.toString()
      })
      setGrades(gradesMap)
    }
  }

  const handleGradeChange = (studentId: string, value: string) => {
    setGrades((prev) => ({
      ...prev,
      [studentId]: value,
    }))
  }

  const saveGrades = async () => {
    setIsSaving(true)
    const supabase = createClient()

    const gradeRecords = Object.entries(grades)
      .filter(([_, points]) => points !== "")
      .map(([studentId, points]) => ({
        assignment_id: selectedAssignment,
        student_id: studentId,
        points_earned: Number.parseFloat(points),
      }))

    const { error } = await supabase.from("grades").upsert(gradeRecords, {
      onConflict: "assignment_id,student_id",
    })

    if (!error) {
      router.refresh()
    }

    setIsSaving(false)
  }

  const exportGrades = () => {
    const assignment = assignments.find((a) => a.id === selectedAssignment)
    const headers = ["Roll No", "Name", "Points Earned", "Max Points", "Percentage"]
    const rows = students.map((student) => {
      const pointsEarned = grades[student.id] ? Number.parseFloat(grades[student.id]) : 0
      const maxPoints = assignment?.max_points || 100
      const percentage = maxPoints > 0 ? ((pointsEarned / maxPoints) * 100).toFixed(1) : "0"

      return [student.roll_no, student.name, pointsEarned.toString(), maxPoints.toString(), percentage + "%"]
    })

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `grades-${assignment?.title || "assignment"}.csv`
    a.click()
  }

  const calculateAverage = () => {
    const assignment = assignments.find((a) => a.id === selectedAssignment)
    if (!assignment) return 0

    const validGrades = Object.values(grades)
      .filter((g) => g !== "")
      .map(Number)
    if (validGrades.length === 0) return 0

    const sum = validGrades.reduce((acc, val) => acc + val, 0)
    return ((sum / validGrades.length / assignment.max_points) * 100).toFixed(1)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">Loading grades...</CardContent>
      </Card>
    )
  }

  if (assignments.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No assignments yet. Create an assignment first.
        </CardContent>
      </Card>
    )
  }

  const selectedAssignmentData = assignments.find((a) => a.id === selectedAssignment)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Grade Assignment</CardTitle>
            <div className="flex gap-2">
              <Button onClick={exportGrades} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button onClick={saveGrades} disabled={isSaving} size="sm">
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : "Save Grades"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Assignment</label>
            <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {assignments.map((assignment) => (
                  <SelectItem key={assignment.id} value={assignment.id}>
                    {assignment.title} (Max: {assignment.max_points} pts)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedAssignmentData && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Class Average: {calculateAverage()}%</Badge>
              <Badge variant="outline">Max Points: {selectedAssignmentData.max_points}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student Grades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {students.map((student) => {
              const pointsEarned = grades[student.id] ? Number.parseFloat(grades[student.id]) : 0
              const maxPoints = selectedAssignmentData?.max_points || 100
              const percentage = maxPoints > 0 && pointsEarned > 0 ? ((pointsEarned / maxPoints) * 100).toFixed(1) : ""

              return (
                <div key={student.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card">
                  <div className="flex-1">
                    <p className="font-medium text-balance">{student.name}</p>
                    <p className="text-sm text-muted-foreground">Roll No: {student.roll_no}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={grades[student.id] || ""}
                      onChange={(e) => handleGradeChange(student.id, e.target.value)}
                      placeholder="0"
                      className="w-24"
                      min="0"
                      max={selectedAssignmentData?.max_points}
                      step="0.5"
                    />
                    <span className="text-sm text-muted-foreground">/ {selectedAssignmentData?.max_points}</span>
                    {percentage && (
                      <Badge
                        className={
                          Number.parseFloat(percentage) >= 90
                            ? "bg-green-600"
                            : Number.parseFloat(percentage) >= 70
                              ? "bg-yellow-600"
                              : "bg-red-600"
                        }
                      >
                        {percentage}%
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
