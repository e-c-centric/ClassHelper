"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type Student = {
  id: string
  roll_no: string
  name: string
  email: string | null
  position_group: string | null
  position_seat: number | null
}

type StudentsListProps = {
  students: Student[]
  classId: string
  organizationType: string
}

export function StudentsList({ students, organizationType }: StudentsListProps) {
  const [searchQuery, setSearchQuery] = useState("")

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

  return (
    <div className="space-y-6">
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
                  {groupStudents.length} students
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {groupStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-balance">{student.name}</p>
                      <p className="text-sm text-muted-foreground">Roll No: {student.roll_no}</p>
                      {student.email && <p className="text-sm text-muted-foreground">{student.email}</p>}
                    </div>
                    {student.position_seat && <Badge variant="outline">Seat {student.position_seat}</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No students found matching your search
          </CardContent>
        </Card>
      )}
    </div>
  )
}
