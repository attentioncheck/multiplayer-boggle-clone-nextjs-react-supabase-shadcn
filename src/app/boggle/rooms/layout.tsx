import { createClient } from '@/app/utils/supabase/server'
import { Toaster } from '@/components/ui/toaster'
import { GameNav } from '@/components/GameNav'
import { redirect } from 'next/navigation'

export default async function RoomsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="dark:text-white">Welcome, {user.email}</h2>
        </div>
        <GameNav />
        {children}
        <Toaster />
      </div>
    </div>
  )
}
