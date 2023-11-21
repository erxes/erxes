"use client"

import "@/styles/globals.css"
import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"
import KnowledgebaseProvider from "@/modules/discover/components/knowledgebase/KnowledgebaseProvider"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const KnowledgebaseHeader = dynamic(
  () =>
    import("@/modules/discover/components/knowledgebase/KnowledgebaseHeader")
)

const RightNavbar = dynamic(
  () => import("@/modules/navbar/component/RightNavbar")
)

const Feedback = dynamic(
  () => import("@/modules/discover/components/feedback/Feedback")
)

interface ILayoutProps {
  children: React.ReactNode
}

export default function DiscoverLayout({ children }: ILayoutProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const tab = searchParams.get("tab")

  const handleClick = (tabType: string) => {
    router.push(`/discover?tab=${tabType}`)
  }

  const style =
    "text-[#A1A1A1] data-[state=active]:text-primary data-[state=active]:border-[#5629B6] data-[state=active]:border-b-2 h-16 hover:font-medium hover:text-[#A1A1A1]"

  return (
    <div className="relative flex h-screen w-screen flex-col">
      <>
        <section className="flex flex-col flex-auto items-stretch bg-white h-full">
          <Tabs defaultValue={tab || "guide"}>
            <TabsList className="border-b border-[#eee]">
              <div className="flex justify-between">
                <div className="w-[50%] items-center flex mr-auto h-[2.5rem] my-3 ml-[35px]">
                  <TabsTrigger
                    className={style}
                    value="guide"
                    onClick={() => handleClick("guide")}
                  >
                    Guide
                  </TabsTrigger>
                  <TabsTrigger
                    className={style}
                    value="feedback"
                    onClick={() => handleClick("feedback")}
                  >
                    Feedback
                  </TabsTrigger>
                </div>
                <RightNavbar />
              </div>
            </TabsList>

            <TabsContent value={"guide"} className="h-full w-full bg-[#F8F9FA]">
              <KnowledgebaseProvider>
                <ScrollArea className="h-[calc(100vh-66px)]">
                  <KnowledgebaseHeader />
                  {children}
                </ScrollArea>
              </KnowledgebaseProvider>
            </TabsContent>
            <TabsContent
              value={"feedback"}
              className="h-full w-full bg-[#F8F9FA]"
            >
              <Feedback />
            </TabsContent>
          </Tabs>
        </section>
      </>
    </div>
  )
}
