"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Save, Search } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

type Student = {
  id: string
  roll_no: string
  name: string
  email: string | null
  position_group: string | null
  position_seat: number | null
}

type LogParticipationViewProps = {
  classId: string
  students: Student[]
}

export function LogParticipationView({ classId, students }: LogParticipationViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedStudent, setSelectedStudent] = useState<string>("")
  const [comment, setComment] = useState("")
  const [relevance, setRelevance] = useState<string>("relevant")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.roll_no.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent || !comment.trim()) {
      setError("Please select a student and enter a comment")
      return
    }

    setIsSaving(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error } = await supabase.from("participation_comments").insert({
        class_id: classId,
        student_id: selectedStudent,
        date: format(selectedDate, "yyyy-MM-dd"),
        comment: comment.trim(),
        relevance,
      })

      if (error) throw error

      setSelectedStudent("")
      setComment("")
      setRelevance("relevant")
      setSearchQuery("")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  const selectedStudentData = students.find((s) => s.id === selectedStudent)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Log New Participation</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="student">Student</Label>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or roll number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {filteredStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.roll_no})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Participation Comment</Label>
              <Textarea
                id="comment"
                placeholder="Describe the student's participation (e.g., 'Asked insightful question about binary trees', 'Contributed solution to problem 3')"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Relevance</Label>
              <RadioGroup value={relevance} onValueChange={setRelevance}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="relevant" id="relevant" />
                  <Label htmlFor="relevant" className="font-normal cursor-pointer">
                    Relevant - On-topic and valuable contribution
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="somewhat_relevant" id="somewhat_relevant" />
                  <Label htmlFor="somewhat_relevant" className="font-normal cursor-pointer">
                    Somewhat Relevant - Partially related to topic
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="not_relevant" id="not_relevant" />
                  <Label htmlFor="not_relevant" className="font-normal cursor-pointer">
                    Not Relevant - Off-topic or disruptive
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Log Participation"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {selectedStudentData && (
          <Card>
            <CardHeader>
              <CardTitle>Selected Student</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium text-balance">{selectedStudentData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Roll Number</p>
                  <p className="font-medium">{selectedStudentData.roll_no}</p>
                </div>
                {selectedStudentData.email && (
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedStudentData.email}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Quick Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Be specific about what the student contributed</p>
            <p>• Note if questions were insightful or answers were correct</p>
            <p>• Record both verbal and written participation</p>
            <p>• Mark relevance to help AI analyze quality of contributions</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
