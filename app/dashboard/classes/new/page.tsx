import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { NewClassForm } from "@/components/new-class-form"

export default async function NewClassPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center px-4">
          <h1 className="text-xl font-semibold">Create New Class</h1>
        </div>
      </header>

      <main className="flex-1 container px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <NewClassForm />
        </div>
      </main>
    </div>
  )
}
