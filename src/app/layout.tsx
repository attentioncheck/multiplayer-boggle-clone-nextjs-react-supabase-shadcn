import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Multiplayer Boggle',
  description: 'Multiplayer Boggle by yves gardiner',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className='scroll-smooth'>
      <body className='dark:bg-gray-900'>
        
        
       
        <main className="flex-1">
          
          {children}
         
        </main>
       
      
        <Toaster />
    
      </body>
    </html>
  )
}