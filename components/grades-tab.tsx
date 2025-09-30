"use client"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AssignmentsView } from "@/components/assignments-view"
import { GradesView } from "@/components/grades-view"
import { StudyGroupsView } from "@/components/study-groups-view"

type Student = {
  id: string
  roll_no: string
  name: string
  email: string | null
  position_group: string | null
  position_seat: number | null
}

type GradesTabProps = {
  classId: string
  students: Student[]
}

export function GradesTab({ classId, students }: GradesTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Grades & Study Groups</CardTitle>
          <CardDescription>Manage assignments, grades, and organize study groups</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="assignments">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
          <TabsTrigger value="groups">Study Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="mt-6">
          <AssignmentsView classId={classId} />
        </TabsContent>

        <TabsContent value="grades" className="mt-6">
          <GradesView classId={classId} students={students} />
        </TabsContent>

        <TabsContent value="groups" className="mt-6">
          <StudyGroupsView classId={classId} students={students} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
