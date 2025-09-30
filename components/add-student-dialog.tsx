"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type AddStudentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  classId: string
  organizationType: string
}

export function AddStudentDialog({ open, onOpenChange, classId, organizationType }: AddStudentDialogProps) {
  const [rollNo, setRollNo] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [positionGroup, setPositionGroup] = useState("")
  const [positionSeat, setPositionSeat] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error } = await supabase.from("students").insert({
        class_id: classId,
        roll_no: rollNo,
        name,
        email: email || null,
        position_group: positionGroup || null,
        position_seat: positionSeat ? Number.parseInt(positionSeat) : null,
      })

      if (error) throw error

      setRollNo("")
      setName("")
      setEmail("")
      setPositionGroup("")
      setPositionSeat("")
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
          <DialogTitle>Add Student</DialogTitle>
          <DialogDescription>Add a new student to this class</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rollNo">Roll Number</Label>
            <Input
              id="rollNo"
              placeholder="e.g., 2024001"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Student Name</Label>
            <Input
              id="name"
              placeholder="e.g., John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g., john@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="positionGroup">{organizationType === "rows" ? "Row" : "Table"} (Optional)</Label>
              <Input
                id="positionGroup"
                placeholder={organizationType === "rows" ? "e.g., 1" : "e.g., A"}
                value={positionGroup}
                onChange={(e) => setPositionGroup(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="positionSeat">Seat (Optional)</Label>
              <Input
                id="positionSeat"
                type="number"
                placeholder="e.g., 1"
                value={positionSeat}
                onChange={(e) => setPositionSeat(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Student"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
