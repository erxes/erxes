import React, { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import Form from "./Form"

type Props = {
  tab: string
  setTab: (tab: string) => void
  currentStep: number
  setCurrentStep: (step: number) => void
  setToggleView: (view: boolean) => void
}

const FeedbackTabs = ({
  tab,
  setTab,
  currentStep,
  setCurrentStep,
  setToggleView,
}: Props) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get("type")

  const style =
    "text-[#A1A1A1] data-[state=active]:text-primary data-[state=active]:border-[#5629B6] data-[state=active]:border-b-2 h-8 hover:font-medium hover:text-[#A1A1A1]"

  const handleTabClick = (tabType: string) => {
    setTab(tabType)
    setCurrentStep(1)
    router.push(`/discover?tab=feedback&view=form&type=${tabType}`)
  }

  return (
    <Tabs defaultValue={type || "feedback"}>
      <TabsList className="w-full items-center border-b border-[#eee] h-7">
        <div className="items-center flex mr-auto h-[20px] ml-[35px]">
          <TabsTrigger
            className={style}
            value="feedback"
            onClick={() => handleTabClick("feedback")}
          >
            Feedback
          </TabsTrigger>
          <TabsTrigger
            className={style}
            value="application"
            onClick={() => handleTabClick("application")}
          >
            Application
          </TabsTrigger>
          <TabsTrigger
            className={style}
            value="complaint"
            onClick={() => handleTabClick("complaint")}
          >
            Complaint
          </TabsTrigger>
        </div>
      </TabsList>

      <TabsContent value="feedback" className="h-full w-full bg-[#F8F9FA]">
        <Form
          type={tab}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          setToggleView={setToggleView}
        />
      </TabsContent>
      <TabsContent value="application" className="h-full w-full bg-[#F8F9FA]">
        <Form
          type={tab}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          setToggleView={setToggleView}
        />
      </TabsContent>
      <TabsContent value="complaint" className="h-full w-full bg-[#F8F9FA]">
        <Form
          type={tab}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          setToggleView={setToggleView}
        />
      </TabsContent>
    </Tabs>
  )
}

export default FeedbackTabs
