"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Clock } from "lucide-react"
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

type Schedule = {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
}

type ScheduleListProps = {
  classId: string
  schedules: Schedule[]
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function ScheduleList({ schedules }: ScheduleListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("class_schedules").delete().eq("id", deleteId)

      if (error) throw error

      setDeleteId(null)
      router.refresh()
    } catch (error) {
      console.error("[v0] Error deleting schedule:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const sortedSchedules = [...schedules].sort((a, b) => {
    if (a.day_of_week !== b.day_of_week) {
      return a.day_of_week - b.day_of_week
    }
    return a.start_time.localeCompare(b.start_time)
  })

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No schedules added yet. Add your first class meeting time.
            </p>
          ) : (
            <div className="space-y-2">
              {sortedSchedules.map((schedule) => (
                <div key={schedule.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{DAYS_OF_WEEK[schedule.day_of_week]}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(schedule.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this class schedule? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
