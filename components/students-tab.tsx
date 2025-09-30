"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Upload } from "lucide-react"
import { AddStudentDialog } from "@/components/add-student-dialog"
import { UploadStudentsDialog } from "@/components/upload-students-dialog"
import { StudentsList } from "@/components/students-list"

type Student = {
  id: string
  roll_no: string
  name: string
  email: string | null
  position_group: string | null
  position_seat: number | null
}

type StudentsTabProps = {
  classId: string
  students: Student[]
  organizationType: string
}

export function StudentsTab({ classId, students, organizationType }: StudentsTabProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => setShowAddDialog(true)} className="flex-1 sm:flex-none">
          <Plus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
        <Button onClick={() => setShowUploadDialog(true)} variant="outline" className="flex-1 sm:flex-none">
          <Upload className="mr-2 h-4 w-4" />
          Upload Excel
        </Button>
      </div>

      {students.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No students yet</CardTitle>
            <CardDescription>Add students individually or upload an Excel file to get started</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
            <Button onClick={() => setShowUploadDialog(true)} variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Upload Excel
            </Button>
          </CardContent>
        </Card>
      ) : (
        <StudentsList students={students} classId={classId} organizationType={organizationType} />
      )}

      <AddStudentDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        classId={classId}
        organizationType={organizationType}
      />

      <UploadStudentsDialog open={showUploadDialog} onOpenChange={setShowUploadDialog} classId={classId} />
    </div>
  )
}
