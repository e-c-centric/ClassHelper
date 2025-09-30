"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Sparkles } from "lucide-react"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { cn } from "@/lib/utils"
import type { DateRange } from "react-day-picker"
import { Textarea } from "@/components/ui/textarea"

type ParticipationAnalysisViewProps = {
  classId: string
}

export function ParticipationAnalysisView({ classId }: ParticipationAnalysisViewProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })
  const [analysis, setAnalysis] = useState<string>("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analyzeParticipation = async () => {
    if (!dateRange?.from || !dateRange?.to) return

    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/ai/analyze-participation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          dateRange: {
            from: format(dateRange.from, "yyyy-MM-dd"),
            to: format(dateRange.to, "yyyy-MM-dd"),
          },
        }),
      })

      const data = await response.json()
      setAnalysis(data.analysis)
    } catch (error) {
      console.error("[v0] Error analyzing participation:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Participation Analysis</CardTitle>
          <CardDescription>Get AI-powered insights on student engagement and participation quality</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
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
              <PopoverContent className="w-auto p-0" align="start">
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
          </div>

          <Button onClick={analyzeParticipation} disabled={isAnalyzing} className="w-full">
            <Sparkles className="mr-2 h-4 w-4" />
            {isAnalyzing ? "Analyzing..." : "Analyze Participation with AI"}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>AI Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea value={analysis} readOnly rows={20} className="font-mono text-sm whitespace-pre-wrap" />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
