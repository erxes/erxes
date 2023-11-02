"use client"

import dynamic from "next/dynamic"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const TimeClock = dynamic(() => import("./timeclock/TimeclockList"))
const Requests = dynamic(() => import("./requests/Request"))
const Schedule = dynamic(() => import("./schedule/Schedule"))
const Report = dynamic(() => import("./report/Report"))

const Timeclocks = () => {
  localStorage.getItem("exm_env_REACT_APP_DOMAIN")
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
        </TabsList>

        <TabsContent value="timeclock">
          <TimeClock />
        </TabsContent>
        <TabsContent value="requests">
          <Requests />
        </TabsContent>
        <TabsContent value="schedule">
          <Schedule />
        </TabsContent>
        <TabsContent value="report">
          <Report />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Timeclocks
