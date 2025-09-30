import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowLeft, Plus, Users, CheckSquare, MessageSquare, Calendar, BarChart, FileText } from "lucide-react"
import { StudentsTab } from "@/components/students-tab"
import { AttendanceTab } from "@/components/attendance-tab"
import { RollNumberLookup } from "@/components/roll-number-lookup"
import { ParticipationTab } from "@/components/participation-tab"
import { ScheduleTab } from "@/components/schedule-tab"
import { AIReportsView } from "@/components/ai-reports-view"
import { GradesTab } from "@/components/grades-tab"

export default async function ClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  const { data: classData, error: classError } = await supabase.from("classes").select("*").eq("id", id).single()

  if (classError || !classData) {
    redirect("/dashboard")
  }

  const { data: students } = await supabase
    .from("students")
    .select("*")
    .eq("class_id", id)
    .order("position_group", { ascending: true })
    .order("position_seat", { ascending: true })

  const { data: schedules } = await supabase
    .from("class_schedules")
    .select("*")
    .eq("class_id", id)
    .order("day_of_week", { ascending: true })

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-balance">{classData.name}</h1>
            {classData.description && (
              <p className="text-sm text-muted-foreground text-balance">{classData.description}</p>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container px-4 py-8">
        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="students" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Students</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="gap-2">
              <CheckSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Attendance</span>
            </TabsTrigger>
            <TabsTrigger value="participation" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Participation</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Schedule</span>
            </TabsTrigger>
            <TabsTrigger value="grades" className="gap-2">
              <BarChart className="h-4 w-4" />
              <span className="hidden sm:inline">Grades</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <div className="space-y-6">
              <StudentsTab classId={id} students={students || []} organizationType={classData.organization_type} />
              {students && students.length > 0 && (
                <RollNumberLookup students={students} organizationType={classData.organization_type} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="attendance">
            {students && students.length > 0 ? (
              <AttendanceTab classId={id} students={students} organizationType={classData.organization_type} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Students</CardTitle>
                  <CardDescription>Add students to your class before taking attendance</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild>
                    <Link href={`/dashboard/classes/${id}?tab=students`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Students
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="participation">
            {students && students.length > 0 ? (
              <ParticipationTab classId={id} students={students} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Students</CardTitle>
                  <CardDescription>Add students to your class before tracking participation</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild>
                    <Link href={`/dashboard/classes/${id}?tab=students`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Students
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="schedule">
            <ScheduleTab classId={id} className={classData.name} schedules={schedules || []} />
          </TabsContent>

          <TabsContent value="grades">
            {students && students.length > 0 ? (
              <GradesTab classId={id} students={students} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Students</CardTitle>
                  <CardDescription>Add students to your class before managing grades</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild>
                    <Link href={`/dashboard/classes/${id}?tab=students`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Students
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reports">
            <AIReportsView classId={id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
