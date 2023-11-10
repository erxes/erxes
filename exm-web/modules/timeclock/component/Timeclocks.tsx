"use client"

import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { useAtomValue } from "jotai"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { isCurrentUserAdmin } from "../utils"

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
  const params = Object.fromEntries(searchParams)

  const queryParams = {
    page: params.page || 1,
    perPage: params.perPage || 8,
    userIds: currentUser?._id,
    startDate: startOfThisMonth,
    endDate: startOfNextMonth,
  }

  return (
    <div>
      <Tabs defaultValue="timeclock">
        <TabsList className="w-full items-center flex p-2 h-[6vh]">
          <TabsTrigger
            className="text-[#444] data-[state=active]:border-[#5629B6] data-[state=active]:border-b-2"
            value="timeclock"
          >
            TimeClocks
          </TabsTrigger>
          <TabsTrigger
            className="text-[#444] data-[state=active]:border-[#5629B6] data-[state=active]:border-b-2"
            value="requests"
          >
            Requests
          </TabsTrigger>
          <TabsTrigger
            className="text-[#444] data-[state=active]:border-[#5629B6] data-[state=active]:border-b-2"
            value="schedule"
          >
            Schedule
          </TabsTrigger>
        </TabsList>

        <div className="flex flex-col px-10 py-5 gap-5 ">
          {/* <Sidebar queryParams={queryParams} /> */}
          <TabsContent className="w-full" value="timeclock">
            <TimeClockList queryParams={queryParams} />
          </TabsContent>
          <TabsContent className="w-full" value="requests">
            <Absences queryParams={queryParams} />
          </TabsContent>
          <TabsContent className="w-full" value="schedule">
            <Schedule queryParams={queryParams} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

export default Timeclocks
