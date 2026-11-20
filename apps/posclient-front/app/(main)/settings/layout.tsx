"use client"

import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

const Layout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="flex h-screen w-screen flex-col bg-sidebar">
      <header className="flex h-14 flex-none items-center gap-2 border-b bg-background px-3">
        <Button
          Component={Link}
          href="/"
          variant="ghost"
          className="h-9 w-9 rounded-lg p-0 text-muted-foreground hover:text-foreground"
          title="Буцах"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Button>
        <h1 className="text-sm font-semibold">Тохиргоо</h1>
      </header>
      <div className="min-h-0 flex-auto overflow-y-auto">
        <div className="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-6">
          <div className="flex w-full flex-col items-center rounded-xl border bg-background px-5 py-6 shadow-xs md:px-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Layout
