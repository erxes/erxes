import Link from "next/link"
import { XCircleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

const Layout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-black">
      <Button
        Component={Link}
        className="absolute right-5 top-5 h-auto rounded-full p-1 hover:bg-white/20 hover:text-white"
        variant="ghost"
        href="/"
      >
        <XCircleIcon className="h-6 w-6 text-white" />
      </Button>
      <ScrollArea className="bg-white rounded-lg h-[44rem] max-h-[95vh] overflow-hidden">
        <div className="mx-auto flex  w-screen max-w-lg flex-col items-center justify-center px-8 py-5">
          {children}
        </div>
      </ScrollArea>
    </div>
  )
}

export default Layout
