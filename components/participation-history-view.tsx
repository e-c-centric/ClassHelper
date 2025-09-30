"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, CalendarIcon } from "lucide-react"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { DateRange } from "react-day-picker"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

type Student = {
  id: string
  roll_no: string
  name: string
  email: string | null
  position_group: string | null
  position_seat: number | null
}

type ParticipationComment = {
  id: string
  student_id: string
  date: string
  comment: string
  relevance: string
  created_at: string
}

type ParticipationHistoryViewProps = {
  classId: string
  students: Student[]
}

export function ParticipationHistoryView({ classId, students }: ParticipationHistoryViewProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })
  const [participationData, setParticipationData] = useState<ParticipationComment[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      loadParticipationHistory()
    }
  }, [dateRange])

  const loadParticipationHistory = async () => {
    if (!dateRange?.from || !dateRange?.to) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { data } = await supabase
        .from("participation_comments")
        .select("*")
        .eq("class_id", classId)
        .gte("date", format(dateRange.from, "yyyy-MM-dd"))
        .lte("date", format(dateRange.to, "yyyy-MM-dd"))
        .order("date", { ascending: false })

      if (data) {
        setParticipationData(data)
      }
    } catch (error) {
      console.error("[v0] Error loading participation history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStudentParticipation = (studentId: string) => {
    const studentComments = participationData.filter((comment) => comment.student_id === studentId)
    const relevantCount = studentComments.filter((c) => c.relevance === "relevant").length
    const somewhatRelevantCount = studentComments.filter((c) => c.relevance === "somewhat_relevant").length
    const notRelevantCount = studentComments.filter((c) => c.relevance === "not_relevant").length

    return {
      total: studentComments.length,
      relevant: relevantCount,
      somewhatRelevant: somewhatRelevantCount,
      notRelevant: notRelevantCount,
      comments: studentComments,
    }
  }

  const exportToCSV = () => {
    const headers = ["Roll No", "Name", "Total Participation", "Relevant", "Somewhat Relevant", "Not Relevant"]
    const rows = students.map((student) => {
      const stats = getStudentParticipation(student.id)
      return [
        student.roll_no,
        student.name,
        stats.total.toString(),
        stats.relevant.toString(),
        stats.somewhatRelevant.toString(),
        stats.notRelevant.toString(),
      ]
    })

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `participation-report-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
  }

  const getRelevanceBadge = (relevance: string) => {
    switch (relevance) {
      case "relevant":
        return <Badge className="bg-green-600">Relevant</Badge>
      case "somewhat_relevant":
        return <Badge className="bg-yellow-600">Somewhat Relevant</Badge>
      case "not_relevant":
        return <Badge className="bg-red-600">Not Relevant</Badge>
      default:
        return <Badge variant="outline">{relevance}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Participation History</CardTitle>
              <CardDescription>View participation records and analyze contributions</CardDescription>
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
          <CardContent className="py-8 text-center text-muted-foreground">Loading participation history...</CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Student Participation Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {students.map((student) => {
                const stats = getStudentParticipation(student.id)
                return (
                  <AccordionItem key={student.id} value={student.id}>
                    <AccordionTrigger>
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="text-left">
                          <p className="font-medium text-balance">{student.name}</p>
                          <p className="text-sm text-muted-foreground">Roll No: {student.roll_no}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="secondary">{stats.total} total</Badge>
                          {stats.relevant > 0 && <Badge className="bg-green-600">{stats.relevant}</Badge>}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {stats.comments.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4">No participation recorded in this period</p>
                      ) : (
                        <div className="space-y-3 pt-2">
                          {stats.comments.map((comment) => (
                            <div key={comment.id} className="p-3 rounded-lg border bg-card">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <p className="text-sm font-medium">{format(new Date(comment.date), "MMM d, yyyy")}</p>
                                {getRelevanceBadge(comment.relevance)}
                              </div>
                              <p className="text-sm text-balance">{comment.comment}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
