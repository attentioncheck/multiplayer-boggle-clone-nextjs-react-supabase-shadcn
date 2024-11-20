'use client'

import { useUser } from '@/hooks/useUser'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function BogglePage() {
  const router = useRouter()
  const { user, loading } = useUser()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-center">Boggle Online</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => router.push('/boggle/rooms')}
              className="w-full text-lg h-12"
            >
              Play Multiplayer
            </Button>
            <Button 
              onClick={() => {
                const seed = Date.now().toString()
                router.push(`/boggle/rooms/practice?seed=${seed}`)
              }}
              variant="outline"
              className="w-full"
            >
              Practice Mode
            </Button>
            <Button 
              onClick={() => router.push('/boggle/rooms/daily')}
              variant="secondary"
              className="w-full"
            >
              Daily Challenge
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 