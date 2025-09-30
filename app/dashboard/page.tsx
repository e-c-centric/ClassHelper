import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Plus, GraduationCap } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: classes } = await supabase
    .from("classes")
    .select("*, students(count)")
    .order("created_at", { ascending: false })

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">ClassHelper</span>
          </div>
          <form action="/auth/signout" method="post">
            <Button variant="ghost" type="submit">
              Sign Out
            </Button>
          </form>
        </div>
      </header>

      <main className="flex-1 container px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Classes</h1>
            <p className="text-muted-foreground">Manage your classes and students</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/classes/new">
              <Plus className="mr-2 h-4 w-4" />
              New Class
            </Link>
          </Button>
        </div>

        {!classes || classes.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No classes yet</CardTitle>
              <CardDescription>Create your first class to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/dashboard/classes/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Class
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {classes.map((classItem) => (
              <Link key={classItem.id} href={`/dashboard/classes/${classItem.id}`}>
                <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-balance">{classItem.name}</CardTitle>
                    <CardDescription className="text-balance">
                      {classItem.description || "No description"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{classItem.students?.[0]?.count || 0} students</span>
                      <span>•</span>
                      <span className="capitalize">{classItem.organization_type}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
