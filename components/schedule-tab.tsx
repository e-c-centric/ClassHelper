"use client"

import { useState } from "react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AddScheduleDialog } from "@/components/add-schedule-dialog"
import { ScheduleList } from "@/components/schedule-list"
import { UpcomingClasses } from "@/components/upcoming-classes"

type Schedule = {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
}

type ScheduleTabProps = {
  classId: string
  className: string
  schedules: Schedule[]
}

export function ScheduleTab({ classId, className, schedules }: ScheduleTabProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Class Schedule</CardTitle>
              <CardDescription>Manage your class meeting times and get reminders</CardDescription>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Schedule
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <ScheduleList classId={classId} schedules={schedules} />
        <UpcomingClasses className={className} schedules={schedules} />
      </div>

      <AddScheduleDialog open={showAddDialog} onOpenChange={setShowAddDialog} classId={classId} />
    </div>
  )
}
