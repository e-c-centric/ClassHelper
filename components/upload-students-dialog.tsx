"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"
import * as XLSX from "xlsx"

type UploadStudentsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  classId: string
}

export function UploadStudentsDialog({ open, onOpenChange, classId }: UploadStudentsDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError("Please select a file")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as Array<{
        "Roll No."?: string
        "Student Name"?: string
        Email?: string
      }>

      if (jsonData.length === 0) {
        throw new Error("Excel file is empty")
      }

      const students = jsonData.map((row) => ({
        class_id: classId,
        roll_no: row["Roll No."] || "",
        name: row["Student Name"] || "",
        email: row.Email || null,
        position_group: null,
        position_seat: null,
      }))

      const supabase = createClient()
      const { error } = await supabase.from("students").insert(students)

      if (error) throw error

      setFile(null)
      onOpenChange(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Students</DialogTitle>
          <DialogDescription>Upload an Excel file with columns: Roll No., Student Name, Email</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Excel File</Label>
            <Input id="file" type="file" accept=".xlsx,.xls" onChange={handleFileChange} required />
            {file && <p className="text-sm text-muted-foreground">Selected: {file.name}</p>}
          </div>

          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-medium mb-2">Expected format:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Column 1: Roll No.</li>
              <li>Column 2: Student Name</li>
              <li>Column 3: Email (optional)</li>
            </ul>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Uploading..." : "Upload"}
              <Upload className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
