'use client'

import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/ui-store'
import { Sidebar } from './sidebar'
import { Header } from './header'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { sidebarOpen } = useUIStore()

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main
          className={cn(
            'flex-1 overflow-auto transition-all duration-300 ease-in-out',
            sidebarOpen ? 'ml-0' : 'ml-0'
          )}
        >
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
