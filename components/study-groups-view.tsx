"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Trash2, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type Student = {
  id: string
  roll_no: string
  name: string
  email: string | null
  position_group: string | null
  position_seat: number | null
}

type StudyGroup = {
  id: string
  name: string
  description: string | null
  created_at: string
}

type GroupMember = {
  group_id: string
  student_id: string
}

type StudyGroupsViewProps = {
  classId: string
  students: Student[]
}

export function StudyGroupsView({ classId, students }: StudyGroupsViewProps) {
  const [groups, setGroups] = useState<StudyGroup[]>([])
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadGroups()
  }, [])

  const loadGroups = async () => {
    const supabase = createClient()

    const { data: groupsData } = await supabase
      .from("study_groups")
      .select("*")
      .eq("class_id", classId)
      .order("created_at", { ascending: false })

    const { data: membersData } = await supabase.from("study_group_members").select("group_id, student_id")

    if (groupsData) setGroups(groupsData)
    if (membersData) setGroupMembers(membersData)
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    const supabase = createClient()

    const { data: newGroup, error: groupError } = await supabase
      .from("study_groups")
      .insert({
        class_id: classId,
        name: groupName,
        description: groupDescription || null,
      })
      .select()
      .single()

    if (!groupError && newGroup) {
      const memberRecords = selectedStudents.map((studentId) => ({
        group_id: newGroup.id,
        student_id: studentId,
      }))

      await supabase.from("study_group_members").insert(memberRecords)

      setGroupName("")
      setGroupDescription("")
      setSelectedStudents([])
      setShowAddDialog(false)
      loadGroups()
      router.refresh()
    }

    setIsSaving(false)
  }

  const handleDelete = async () => {
    if (!deleteId) return

    const supabase = createClient()
    const { error } = await supabase.from("study_groups").delete().eq("id", deleteId)

    if (!error) {
      setDeleteId(null)
      loadGroups()
      router.refresh()
    }
  }

  const toggleStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    )
  }

  const getGroupMembers = (groupId: string) => {
    const memberIds = groupMembers.filter((m) => m.group_id === groupId).map((m) => m.student_id)
    return students.filter((s) => memberIds.includes(s.id))
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">Loading study groups...</CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Study Groups</CardTitle>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Group
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {groups.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No study groups yet. Create your first group.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {groups.map((group) => {
                const members = getGroupMembers(group.id)
                return (
                  <Card key={group.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <h3 className="font-semibold text-balance">{group.name}</h3>
                          </div>
                          {group.description && (
                            <p className="text-sm text-muted-foreground text-balance">{group.description}</p>
                          )}
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(group.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{members.length} members</Badge>
                        </div>
                        {members.map((member) => (
                          <div key={member.id} className="text-sm p-2 rounded border bg-muted/50">
                            <p className="font-medium text-balance">{member.name}</p>
                            <p className="text-xs text-muted-foreground">Roll No: {member.roll_no}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Study Group</DialogTitle>
            <DialogDescription>Create a new study group and add members</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="groupName">Group Name</Label>
              <Input
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group 1: Data Structures"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="groupDescription">Description (Optional)</Label>
              <Input
                id="groupDescription"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder="Focus on trees and graphs"
              />
            </div>

            <div className="space-y-2">
              <Label>Select Members</Label>
              <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center gap-3 p-2 rounded hover:bg-accent">
                    <Checkbox
                      id={student.id}
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => toggleStudent(student.id)}
                    />
                    <label htmlFor={student.id} className="flex-1 cursor-pointer">
                      <p className="font-medium text-balance">{student.name}</p>
                      <p className="text-sm text-muted-foreground">Roll No: {student.roll_no}</p>
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{selectedStudents.length} students selected</p>
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || selectedStudents.length === 0}>
                {isSaving ? "Creating..." : "Create Group"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Study Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this study group? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
