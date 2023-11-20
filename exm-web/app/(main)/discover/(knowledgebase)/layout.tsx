import "@/styles/globals.css"
import KnowledgebaseHeader from "@/modules/discover/components/knowledgebase/KnowledgebaseHeader"
import RightNavbar from "@/modules/navbar/component/RightNavbar"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ILayoutProps {
  children: React.ReactNode
}

export default function KnowledgeLayout({ children }: ILayoutProps) {
  return (
    <div className="relative flex h-screen flex-col">
      <>
        <section className="flex flex-col flex-auto items-stretch bg-white h-full">
          {children}
        </section>
      </>
    </div>
  )
}
