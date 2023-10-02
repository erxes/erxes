import Link from "next/link"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative flex flex-auto items-center justify-center bg-black text-white">
      <Button
        Component={Link}
        variant="ghost"
        size={"sm"}
        href="/"
        className="absolute top-4 right-4 px-2 rounded-full bg-black hover:bg-slate-800 hover:text-white"
      >
        <X className="w-5 h-5" />
      </Button>
      <ScrollArea>{children}</ScrollArea>
    </div>
  )
}

export default Layout
