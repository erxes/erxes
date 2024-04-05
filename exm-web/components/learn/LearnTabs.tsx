"use client"

import { FunctionComponent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Feedback from "@/modules/discover/components/feedback/Feedback"
import KnowledgebaseHeader from "@/modules/discover/components/knowledgebase/KnowledgebaseHeader"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface LearnTabsProps {}

const LearnTabs: FunctionComponent<LearnTabsProps> = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const tab = searchParams.get("tab")

  const handleClick = (tabType: string) => {
    router.push(`/learn?tab=${tabType}`)
  }

  return (
    <div className="w-full mt-10 flex flex-col items-center justify-center gap-4">
      <b className="text-3xl">Popular Courses</b>

      <Tabs defaultValue={tab || "all"} className="w-full">
        <TabsList className="flex w-full bg-white rounded-2xl p-5">
          {LEARN_TABS_TRIGGER.map((item) => (
            <TabsTrigger
              className="text-[#1D2939] font-medium data-[state=active]:bg-[#6569DF] data-[state=active]:text-white rounded-xl hover:text-[#A1A1A1]"
              value={item.value}
              onClick={() => handleClick(item.value)}
            >
              {item.text}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={"guide"} className="h-full w-full bg-[#F8F9FA]">
          <ScrollArea className="h-[calc(100vh-66px)]">
            <KnowledgebaseHeader />
          </ScrollArea>
        </TabsContent>
        <TabsContent value={"feedback"} className="h-full w-full">
          <Feedback />
        </TabsContent>
      </Tabs>
    </div>
  )
}

const LEARN_TABS_TRIGGER = [
  {
    value: "all",
    text: "Бүгд",
  },
  {
    value: "business",
    text: "Business",
  },
  {
    value: "technology",
    text: "Technology",
  },
  {
    value: "art-design",
    text: "Art&Design",
  },
  {
    value: "languages",
    text: "Languages",
  },
]

export default LearnTabs
