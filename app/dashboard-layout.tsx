"use client"

import { SidebarNav } from "@/components/sidebar-nav"
import { MainHeader } from "@/components/main-header"
import { SidebarProvider, useSidebar } from "@/components/sidebar-context"
import type { ReactNode } from "react"

interface DashboardLayoutProps {
  children: ReactNode
}

function DashboardContent({ children }: DashboardLayoutProps) {
  const { isOpen } = useSidebar()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <SidebarNav />
      <MainHeader />
      <div className={`transition-all duration-300 ${isOpen ? "md:pl-64" : "md:pl-16"}`}>
        <main className="py-6 px-4 md:px-6">{children}</main>
      </div>
    </div>
  )
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  )
}

export default DashboardLayout
