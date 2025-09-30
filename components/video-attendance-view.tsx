"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, Upload, Sparkles } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

type VideoAttendanceViewProps = {
  classId: string
}

export function VideoAttendanceView({ classId }: VideoAttendanceViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [transcription, setTranscription] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ matched: string[]; totalPresent: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append("audio", file)
      formData.append("classId", classId)

      const transcribeResponse = await fetch("/api/ai/transcribe-audio", {
        method: "POST",
        body: formData,
      })

      const { transcription: text } = await transcribeResponse.json()
      setTranscription(text)
    } catch (error) {
      console.error("[v0] Error processing video:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const processAttendance = async () => {
    if (!transcription) return

    setIsProcessing(true)
    try {
      const response = await fetch("/api/ai/video-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcription,
          classId,
          date: format(selectedDate, "yyyy-MM-dd"),
        }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("[v0] Error processing attendance:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Video-Based Attendance</CardTitle>
          <CardDescription>
            Upload a video of you calling out names, and AI will mark attendance automatically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <label className="text-sm font-medium">Upload Video/Audio</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,audio/*"
              onChange={handleVideoUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
              disabled={isProcessing}
            >
              <Upload className="mr-2 h-4 w-4" />
              {isProcessing ? "Processing..." : "Upload Video/Audio"}
            </Button>
          </div>

          {transcription && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Transcription</label>
                <Textarea
                  value={transcription}
                  onChange={(e) => setTranscription(e.target.value)}
                  rows={6}
                  placeholder="Transcription will appear here..."
                />
              </div>

              <Button onClick={processAttendance} disabled={isProcessing} className="w-full">
                <Sparkles className="mr-2 h-4 w-4" />
                {isProcessing ? "Processing Attendance..." : "Process Attendance with AI"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Attendance Processed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-600">{result.totalPresent} students marked present</Badge>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Matched Students:</p>
              <div className="flex flex-wrap gap-2">
                {result.matched.map((name, index) => (
                  <Badge key={index} variant="outline">
                    {name}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
