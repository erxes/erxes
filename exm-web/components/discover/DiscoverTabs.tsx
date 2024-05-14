"use client"

import { FunctionComponent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Feedback from "@/modules/discover/components/feedback/Feedback"
import KnowledgebaseHeader from "@/modules/discover/components/knowledgebase/KnowledgebaseHeader"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DiscoverTabsProps {}

const DiscoverTabs: FunctionComponent<DiscoverTabsProps> = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const tab = searchParams.get("tab")

  const handleClick = (tabType: string) => {
    router.push(`/discover?tab=${tabType}`)
  }

  return (
    <div className="w-full mt-10">
      <Tabs defaultValue={tab || "all"}>
        <TabsList className="flex w-full bg-white rounded-2xl p-5">
          {DISCOVER_TAB_TRIGGERS.map((item) => (
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

const DISCOVER_TAB_TRIGGERS = [
  {
    value: "all",
    text: "Бүгд",
  },
  {
    value: "about-us",
    text: "Бидний тухай",
  },
  {
    value: "career",
    text: "Хүний нөөц, Карьер",
  },
  {
    value: "everyday",
    text: "Өдөр тутамд",
  },
  {
    value: "how-do-we-work",
    text: "Бид хэрхэн ажилладаг вэ?",
  },
]

export default DiscoverTabs
