"use client"

import React from "react"
import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"
import RightNavbar from "@/modules/navbar/component/RightNavbar"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useDiscover } from "../hooks/useDiscover"

const Knowledgebase = dynamic(
  () => import("@/modules/discover/components/knowledgebase/Knowledgebase")
)
const Feedback = dynamic(
  () => import("@/modules/discover/components/feedback/Feedback")
)

const Discover = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const tab = searchParams.get("tab")

  const handleClick = (tabType: string) => {
    router.push(`/discover?tab=${tabType}`)
  }

  const style =
    "text-[#A1A1A1] data-[state=active]:text-primary data-[state=active]:border-[#5629B6] data-[state=active]:border-b-2 h-16 hover:font-medium hover:text-[#A1A1A1]"

  return (
    <Tabs defaultValue={tab || "guide"}>
      <TabsList className="border-b border-[#eee]">
        <div className="flex justify-between">
          <div className="w-[50%] items-center flex mr-auto h-[2.5rem] my-3 ml-[35px]">
            <TabsTrigger
              className={style}
              value="guide"
              onClick={() => handleClick("guide")}
            >
              Гарын авлага
            </TabsTrigger>
            <TabsTrigger
              className={style}
              value="feedback"
              onClick={() => handleClick("feedback")}
            >
              Санал хүсэлт
            </TabsTrigger>
          </div>
          <RightNavbar />
        </div>
      </TabsList>

      <TabsContent value={"guide"} className="h-full w-full bg-[#F8F9FA]">
        <Knowledgebase />
      </TabsContent>
      <TabsContent value={"feedback"} className="h-full w-full bg-[#F8F9FA]">
        <Feedback />
      </TabsContent>
    </Tabs>
  )
}

export default Discover
