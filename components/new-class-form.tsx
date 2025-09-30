"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function NewClassForm() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [organizationType, setOrganizationType] = useState<"rows" | "tables">("rows")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from("classes")
        .insert({
          name,
          description,
          organization_type: organizationType,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error

      router.push(`/dashboard/classes/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Class Details</CardTitle>
        <CardDescription>Enter the details for your new class</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Class Name</Label>
            <Input
              id="name"
              placeholder="e.g., Discrete Structures"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="e.g., CS 201 - Fall 2024"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Organization Type</Label>
            <RadioGroup
              value={organizationType}
              onValueChange={(value) => setOrganizationType(value as "rows" | "tables")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rows" id="rows" />
                <Label htmlFor="rows" className="font-normal cursor-pointer">
                  Rows - Students sit in rows (front to back)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tables" id="tables" />
                <Label htmlFor="tables" className="font-normal cursor-pointer">
                  Tables - Students sit at tables/groups
                </Label>
              </div>
            </RadioGroup>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Class"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
