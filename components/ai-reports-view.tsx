"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Sparkles, Download } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

type AIReportsViewProps = {
  classId: string
}

export function AIReportsView({ classId }: AIReportsViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [reportType, setReportType] = useState<string>("comprehensive")
  const [report, setReport] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)

  const generateReport = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/ai/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          date: format(selectedDate, "yyyy-MM-dd"),
          reportType,
        }),
      })

      const data = await response.json()
      setReport(data.report)
    } catch (error) {
      console.error("[v0] Error generating report:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadReport = () => {
    const blob = new Blob([report], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `class-report-${format(selectedDate, "yyyy-MM-dd")}.txt`
    a.click()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Class Reports</CardTitle>
          <CardDescription>Generate comprehensive reports using AI analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={selectedDate} onSelect={(date) => date && setSelectedDate(date)} />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attendance">Attendance Only</SelectItem>
                  <SelectItem value="participation">Participation Only</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={generateReport} disabled={isGenerating} className="w-full">
            <Sparkles className="mr-2 h-4 w-4" />
            {isGenerating ? "Generating Report..." : "Generate AI Report"}
          </Button>
        </CardContent>
      </Card>

      {report && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Report</CardTitle>
              <Button onClick={downloadReport} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea value={report} readOnly rows={20} className="font-mono text-sm" />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
