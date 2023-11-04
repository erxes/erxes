"use client"

import dynamic from "next/dynamic"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { useAtomValue } from "jotai"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { isCurrentUserAdmin } from "../utils"

const TimeClock = dynamic(() => import("./timeclock/TimeclockContainer"))
const Absences = dynamic(() => import("./absence/AbsenceList"))
const Schedule = dynamic(() => import("./schedule/Schedule"))
const Report = dynamic(() => import("./report/Report"))
const Configuration = dynamic(() => import("./configuration/Configuration"))

const Timeclocks = () => {
  localStorage.getItem("exm_env_REACT_APP_DOMAIN")

  const currentUser = useAtomValue(currentUserAtom)

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

        <TabsContent value="timeclock">
          <TimeClock />
        </TabsContent>
        <TabsContent value="requests">
          <Absences />
        </TabsContent>
        <TabsContent value="schedule">
          <Schedule />
        </TabsContent>
        <TabsContent value="report">
          <Report />
        </TabsContent>
        <TabsContent value="configuration">
          <Configuration />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Timeclocks
