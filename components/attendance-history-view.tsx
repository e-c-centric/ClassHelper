"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, CalendarIcon } from "lucide-react"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { DateRange } from "react-day-picker"

type Student = {
  id: string
  roll_no: string
  name: string
  email: string | null
  position_group: string | null
  position_seat: number | null
}

type AttendanceRecord = {
  student_id: string
  date: string
  present: boolean
}

type AttendanceHistoryViewProps = {
  classId: string
  students: Student[]
}

export function AttendanceHistoryView({ classId, students }: AttendanceHistoryViewProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      loadAttendanceHistory()
    }
  }, [dateRange])

  const loadAttendanceHistory = async () => {
    if (!dateRange?.from || !dateRange?.to) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { data } = await supabase
        .from("attendance_records")
        .select("student_id, date, present")
        .eq("class_id", classId)
        .gte("date", format(dateRange.from, "yyyy-MM-dd"))
        .lte("date", format(dateRange.to, "yyyy-MM-dd"))

      if (data) {
        setAttendanceData(data)
      }
    } catch (error) {
      console.error("[v0] Error loading attendance history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStudentAttendance = (studentId: string) => {
    const studentRecords = attendanceData.filter((record) => record.student_id === studentId)
    const presentCount = studentRecords.filter((r) => r.present).length
    const totalCount = studentRecords.length
    const percentage = totalCount > 0 ? (presentCount / totalCount) * 100 : 0

    return { presentCount, totalCount, percentage }
  }

  const exportToCSV = () => {
    const headers = ["Roll No", "Name", "Present Days", "Total Days", "Attendance %"]
    const rows = students.map((student) => {
      const { presentCount, totalCount, percentage } = getStudentAttendance(student.id)
      return [
        student.roll_no,
        student.name,
        presentCount.toString(),
        totalCount.toString(),
        percentage.toFixed(1) + "%",
      ]
    })

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `attendance-report-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>View attendance records and generate reports</CardDescription>
            </div>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("justify-start text-left font-normal")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd, yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, yyyy")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              <Button onClick={exportToCSV} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">Loading attendance history...</CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Student Attendance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {students.map((student) => {
                const { presentCount, totalCount, percentage } = getStudentAttendance(student.id)
                return (
                  <div key={student.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="flex-1">
                      <p className="font-medium text-balance">{student.name}</p>
                      <p className="text-sm text-muted-foreground">Roll No: {student.roll_no}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {presentCount} / {totalCount}
                      </p>
                      <p
                        className={cn(
                          "text-sm font-medium",
                          percentage >= 75
                            ? "text-green-600 dark:text-green-400"
                            : percentage >= 50
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-red-600 dark:text-red-400",
                        )}
                      >
                        {percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
