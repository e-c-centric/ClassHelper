"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

type RollNumberLookupProps = {
  students: Student[]
  organizationType: string
}

export function RollNumberLookup({ students, organizationType }: RollNumberLookupProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredStudents = students.filter(
    (student) =>
      student.roll_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Roll Number Lookup</CardTitle>
        <CardDescription>Quickly find students by roll number or name</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by roll number or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {searchQuery && (
          <div className="space-y-2">
            {filteredStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No students found</p>
            ) : (
              filteredStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="flex-1">
                    <p className="font-medium text-balance">{student.name}</p>
                    <p className="text-sm text-muted-foreground">Roll No: {student.roll_no}</p>
                    {student.email && <p className="text-sm text-muted-foreground">{student.email}</p>}
                  </div>
                  <div className="flex gap-2">
                    {student.position_group && (
                      <Badge variant="outline">
                        {organizationType === "rows" ? "Row" : "Table"} {student.position_group}
                      </Badge>
                    )}
                    {student.position_seat && <Badge variant="outline">Seat {student.position_seat}</Badge>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
