import React, { useState } from "react"
import { useSearchParams } from "next/navigation"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import Form from "./Form"

type Props = {
  tab: string
  step: number
  setTab: (tab: string) => void
  setStep: (step: number) => void
}

const FeedbackTabs = ({ tab, setTab, step, setStep }: Props) => {
  const style =
    "text-[#A1A1A1] data-[state=active]:text-primary data-[state=active]:border-[#5629B6] data-[state=active]:border-b-2 h-8 hover:font-medium hover:text-[#A1A1A1]"

  return (
    <Tabs defaultValue={tab || "feedback"}>
      <TabsList className="w-full items-center border-b border-[#eee] h-7">
        <div className="items-center flex mr-auto h-[20px] ml-[35px]">
          <TabsTrigger
            className={style}
            // value="feedback"
            value="feedback"
            onClick={() => setTab("feedback")}
          >
            Санал хүсэлт
          </TabsTrigger>
          <TabsTrigger
            className={style}
            // value="application"
            value="application"
            onClick={() => setTab("application")}
          >
            Өргөдөл
          </TabsTrigger>
          <TabsTrigger
            className={style}
            // value="complain"
            value="complaint"
            onClick={() => setTab("complaint")}
          >
            Гомдол
          </TabsTrigger>
        </div>
      </TabsList>

      <TabsContent
        value="feedback"
        // value="feedback"
        className="h-full w-full bg-[#F8F9FA]"
      >
        <Form type={tab} setStep={setStep} step={step} />
      </TabsContent>
      <TabsContent
        value="application"
        // value="application"
        className="h-full w-full bg-[#F8F9FA]"
      >
        <Form type={tab} setStep={setStep} step={step} />
      </TabsContent>
      <TabsContent
        value="complaint"
        // value="complain"
        className="h-full w-full bg-[#F8F9FA]"
      >
        <Form type={tab} setStep={setStep} step={step} />
      </TabsContent>
    </Tabs>
  )
}

export default FeedbackTabs
