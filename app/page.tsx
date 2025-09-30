import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GraduationCap, CheckSquare, Users, BarChart3 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">ClassHelper</span>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="ghost">
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container px-4 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-6xl mb-6">
              Simplify Class Management for Teaching Assistants
            </h1>
            <p className="text-lg text-muted-foreground text-balance mb-8">
              Take attendance, track participation, manage grades, and generate AI-powered reports - all in one
              intuitive mobile-first app.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/auth/sign-up">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/auth/login">Login</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="container px-4 py-16">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center gap-4 p-6 rounded-lg bg-card">
              <div className="p-3 rounded-full bg-primary/10">
                <CheckSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Quick Attendance</h3>
              <p className="text-sm text-muted-foreground text-balance">
                Mark attendance with simple checkboxes as you walk through rows
              </p>
            </div>

            <div className="flex flex-col items-center text-center gap-4 p-6 rounded-lg bg-card">
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Student Management</h3>
              <p className="text-sm text-muted-foreground text-balance">
                Upload Excel sheets or add students individually with seating arrangements
              </p>
            </div>

            <div className="flex flex-col items-center text-center gap-4 p-6 rounded-lg bg-card">
              <div className="p-3 rounded-full bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Participation Tracking</h3>
              <p className="text-sm text-muted-foreground text-balance">
                Log comments and let AI analyze participation quality
              </p>
            </div>

            <div className="flex flex-col items-center text-center gap-4 p-6 rounded-lg bg-card">
              <div className="p-3 rounded-full bg-primary/10">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">AI Reports</h3>
              <p className="text-sm text-muted-foreground text-balance">
                Generate comprehensive reports from attendance and participation data
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 bg-background/95 backdrop-blur">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>ClassHelper - Making TA work easier, one class at a time</p>
        </div>
      </footer>
    </div>
  )
}
