"use client"

import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { useAtomValue } from "jotai"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { isCurrentUserAdmin } from "../utils"
import Sidebar from "./sidebar/Sidebar"

const TimeClockList = dynamic(() => import("./timeclock/TimeclockList"))
const Absences = dynamic(() => import("./absence/AbsenceList"))
// const Schedule = dynamic(() => import("./schedule/Schedule"))
// const Report = dynamic(() => import("./report/Report"))
// const Configuration = dynamic(() => import("./configuration/Configuration"))

const Timeclocks = () => {
  localStorage.getItem("exm_env_REACT_APP_DOMAIN")

  const currentUser = useAtomValue(currentUserAtom)

  const searchParams = useSearchParams()
  const startDate = new Date(searchParams.get("startDate") as string)
  const endDate = new Date(searchParams.get("endDate") as string)
  const branchIds = searchParams.get("branchIds")?.split(",") || []
  const departmentIds = searchParams.get("departmentIds")?.split(",") || []
  const userIds = searchParams.get("userIds")?.split(",") || []

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
          <TabsTrigger
            className="text-[#444] data-[state=active]:border-[#5629B6] data-[state=active]:border-b-2"
            value="report"
          >
            Report
          </TabsTrigger>
          {isCurrentUserAdmin(currentUser) && (
            <TabsTrigger
              className="text-[#444] data-[state=active]:border-[#5629B6] data-[state=active]:border-b-2"
              value="configuration"
            >
              Configuration
            </TabsTrigger>
          )}
        </TabsList>

        <div className="flex flex-col p-5 gap-5 ">
          <Sidebar
            startDate={startDate}
            endDate={endDate}
            branch={branchIds}
            department={departmentIds}
            user={userIds}
          />
          <TabsContent className="w-full" value="timeclock">
            <TimeClockList />
          </TabsContent>
          <TabsContent className="w-full" value="requests">
            <Absences />
          </TabsContent>
          {/* <TabsContent value="schedule">
          <Schedule />
        </TabsContent>
        <TabsContent value="report">
        <Report />
        </TabsContent>
        <TabsContent value="configuration">
        <Configuration />
      </TabsContent> */}
        </div>
      </Tabs>
    </div>
  )
}

export default Timeclocks
