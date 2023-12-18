"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import RightNavbar from "@/modules/navbar/component/RightNavbar"
import { useAtomValue } from "jotai"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// import Sidebar from "./sidebar/Sidebar"

const TimeClockList = dynamic(() => import("./timeclock/TimeclockList"))
const Absences = dynamic(() => import("./absence/AbsenceList"))
const Schedule = dynamic(() => import("./schedule/ScheduleList"))

const NOW = new Date()
// get 1st of the next Month
const startOfNextMonth = new Date(NOW.getFullYear(), NOW.getMonth() + 1, 1)
// get 1st of this month
const startOfThisMonth = new Date(NOW.getFullYear(), NOW.getMonth(), 1)

const Timeclocks = () => {
  localStorage.getItem("exm_env_REACT_APP_DOMAIN")
  const currentUser = useAtomValue(currentUserAtom)
  const searchParams = useSearchParams()
  const router = useRouter()
  const params = Object.fromEntries(searchParams)

  const queryParams = {
    page: params.page || 1,
    perPage: params.perPage || 10,
    userIds: currentUser?._id,
    startDate: startOfThisMonth,
    endDate: startOfNextMonth,
  }

  const tab = searchParams.get("tab")

  const handleTabClick = (tabType: string) => {
    router.push(`/timeclocks?tab=${tabType}&page=1`)
  }

  const style =
    "text-[#A1A1A1] data-[state=active]:text-primary data-[state=active]:border-[#5629B6] data-[state=active]:border-b-2 h-16 hover:font-medium hover:text-[#A1A1A1]"

  return (
    <div>
      <Tabs defaultValue={tab || "timeclock"}>
        <TabsList className="border-b border-[#eee] bg-white">
          <div className="flex justify-between">
            <div className="w-[60%] items-center flex mr-auto h-[2.5rem] my-3 ml-[35px]">
              <TabsTrigger
                onClick={() => handleTabClick("timeclock")}
                className={style}
                value={"timeclock"}
              >
                TimeClocks
              </TabsTrigger>
              <TabsTrigger
                onClick={() => handleTabClick("requests")}
                className={style}
                value={"requests"}
              >
                Requests
              </TabsTrigger>
              <TabsTrigger
                onClick={() => handleTabClick("schedule")}
                className={style}
                value={"schedule"}
              >
                Schedule
              </TabsTrigger>
            </div>
            <RightNavbar />
          </div>
        </TabsList>

        <TabsContent className="w-full" value={"timeclock"}>
          <TimeClockList queryParams={queryParams} />
        </TabsContent>
        <TabsContent className="w-full" value={"requests"}>
          <Absences queryParams={queryParams} />
        </TabsContent>
        <TabsContent className="w-full" value={"schedule"}>
          <Schedule queryParams={queryParams} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Timeclocks
