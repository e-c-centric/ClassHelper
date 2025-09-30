"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

type Schedule = {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
}

type UpcomingClassesProps = {
  className: string
  schedules: Schedule[]
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function UpcomingClasses({ className, schedules }: UpcomingClassesProps) {
  const [nextClass, setNextClass] = useState<{
    schedule: Schedule
    daysUntil: number
    isToday: boolean
    minutesUntil?: number
  } | null>(null)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  useEffect(() => {
    const findNextClass = () => {
      const now = new Date()
      const currentDay = now.getDay()
      const currentTime = now.getHours() * 60 + now.getMinutes()

      let closestClass: typeof nextClass = null
      let minDiff = Number.POSITIVE_INFINITY

      schedules.forEach((schedule) => {
        const [hours, minutes] = schedule.start_time.split(":").map(Number)
        const scheduleTime = hours * 60 + minutes

        let daysDiff = schedule.day_of_week - currentDay
        if (daysDiff < 0) daysDiff += 7
        if (daysDiff === 0 && scheduleTime < currentTime) daysDiff = 7

        const totalMinutes = daysDiff * 24 * 60 + (scheduleTime - currentTime)

        if (totalMinutes < minDiff && totalMinutes > 0) {
          minDiff = totalMinutes
          closestClass = {
            schedule,
            daysUntil: daysDiff,
            isToday: daysDiff === 0,
            minutesUntil: daysDiff === 0 ? scheduleTime - currentTime : undefined,
          }
        }
      })

      setNextClass(closestClass)
    }

    findNextClass()
    const interval = setInterval(findNextClass, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [schedules])

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission()
      setNotificationsEnabled(permission === "granted")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Next Class</CardTitle>
      </CardHeader>
      <CardContent>
        {!nextClass ? (
          <p className="text-sm text-muted-foreground text-center py-8">No upcoming classes scheduled</p>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-lg border bg-accent/50">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-lg text-balance">{className}</p>
                  <p className="text-sm text-muted-foreground">{DAYS_OF_WEEK[nextClass.schedule.day_of_week]}</p>
                </div>
                {nextClass.isToday && <Badge className="bg-green-600">Today</Badge>}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>
                  {formatTime(nextClass.schedule.start_time)} - {formatTime(nextClass.schedule.end_time)}
                </span>
              </div>
              {nextClass.isToday && nextClass.minutesUntil !== undefined && (
                <p className="text-sm font-medium mt-2 text-green-600 dark:text-green-400">
                  Starts in {nextClass.minutesUntil} minutes
                </p>
              )}
              {!nextClass.isToday && (
                <p className="text-sm font-medium mt-2">
                  In {nextClass.daysUntil} {nextClass.daysUntil === 1 ? "day" : "days"}
                </p>
              )}
            </div>

            {!notificationsEnabled && (
              <div className="p-4 rounded-lg border bg-muted">
                <div className="flex items-start gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">Enable Notifications</p>
                    <p className="text-sm text-muted-foreground mb-3">Get notified when it's time for class</p>
                    <Button size="sm" variant="outline" onClick={requestNotificationPermission}>
                      Enable Notifications
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
