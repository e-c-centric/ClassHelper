"use client"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogParticipationView } from "@/components/log-participation-view"
import { ParticipationHistoryView } from "@/components/participation-history-view"
import { ParticipationAnalysisView } from "@/components/participation-analysis-view"

type Student = {
  id: string
  roll_no: string
  name: string
  email: string | null
  position_group: string | null
  position_seat: number | null
}

type ParticipationTabProps = {
  classId: string
  students: Student[]
}

export function ParticipationTab({ classId, students }: ParticipationTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Participation Tracking</CardTitle>
          <CardDescription>Log student participation and track contributions over time</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="log">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="log">Log Participation</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="log" className="mt-6">
          <LogParticipationView classId={classId} students={students} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <ParticipationHistoryView classId={classId} students={students} />
        </TabsContent>

        <TabsContent value="analysis" className="mt-6">
          <ParticipationAnalysisView classId={classId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
