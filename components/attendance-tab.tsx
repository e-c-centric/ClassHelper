"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { TakeAttendanceView } from "@/components/take-attendance-view"
import { AttendanceHistoryView } from "@/components/attendance-history-view"
import { VideoAttendanceView } from "@/components/video-attendance-view"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Student = {
  id: string
  roll_no: string
  name: string
  email: string | null
  position_group: string | null
  position_seat: number | null
}

type AttendanceTabProps = {
  classId: string
  students: Student[]
  organizationType: string
}

export function AttendanceTab({ classId, students, organizationType }: AttendanceTabProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Attendance Management</CardTitle>
              <CardDescription>Take attendance manually, via video, and view history</CardDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("justify-start text-left font-normal")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="take">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="take">Manual</TabsTrigger>
          <TabsTrigger value="video">Video/Audio</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="take" className="mt-6">
          <TakeAttendanceView
            classId={classId}
            students={students}
            organizationType={organizationType}
            selectedDate={selectedDate}
          />
        </TabsContent>

        <TabsContent value="video" className="mt-6">
          <VideoAttendanceView classId={classId} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <AttendanceHistoryView classId={classId} students={students} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
