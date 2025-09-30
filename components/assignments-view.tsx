"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CalendarIcon, Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type Assignment = {
  id: string
  title: string
  description: string | null
  due_date: string
  max_points: number
  created_at: string
}

type AssignmentsViewProps = {
  classId: string
}

export function AssignmentsView({ classId }: AssignmentsViewProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState<Date>(new Date())
  const [maxPoints, setMaxPoints] = useState("100")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadAssignments()
  }, [])

  const loadAssignments = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("assignments")
      .select("*")
      .eq("class_id", classId)
      .order("due_date", { ascending: true })

    if (data) {
      setAssignments(data)
    }
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    const supabase = createClient()
    const { error } = await supabase.from("assignments").insert({
      class_id: classId,
      title,
      description: description || null,
      due_date: format(dueDate, "yyyy-MM-dd"),
      max_points: Number.parseInt(maxPoints),
    })

    if (!error) {
      setTitle("")
      setDescription("")
      setDueDate(new Date())
      setMaxPoints("100")
      setShowAddDialog(false)
      loadAssignments()
      router.refresh()
    }

    setIsSaving(false)
  }

  const handleDelete = async () => {
    if (!deleteId) return

    const supabase = createClient()
    const { error } = await supabase.from("assignments").delete().eq("id", deleteId)

    if (!error) {
      setDeleteId(null)
      loadAssignments()
      router.refresh()
    }
  }

  const isPastDue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">Loading assignments...</CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Assignments</CardTitle>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Assignment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No assignments yet. Create your first assignment.
            </p>
          ) : (
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="flex items-start justify-between p-4 rounded-lg border bg-card">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-balance">{assignment.title}</h3>
                      {isPastDue(assignment.due_date) && <Badge variant="destructive">Past Due</Badge>}
                    </div>
                    {assignment.description && (
                      <p className="text-sm text-muted-foreground mb-2 text-balance">{assignment.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Due: {format(new Date(assignment.due_date), "MMM d, yyyy")}</span>
                      <span>Max Points: {assignment.max_points}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(assignment.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Assignment</DialogTitle>
            <DialogDescription>Create a new assignment for your class</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Assignment 1: Binary Trees"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Implement a binary search tree with insert and search operations"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dueDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dueDate} onSelect={(date) => date && setDueDate(date)} />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPoints">Max Points</Label>
              <Input
                id="maxPoints"
                type="number"
                value={maxPoints}
                onChange={(e) => setMaxPoints(e.target.value)}
                min="1"
                required
              />
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Adding..." : "Add Assignment"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this assignment? This will also delete all associated grades.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
