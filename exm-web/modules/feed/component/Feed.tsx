"use client"

import dynamic from "next/dynamic"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const List = dynamic(() => import("./List"))

const Feed = () => {
  localStorage.getItem("exm_env_REACT_APP_DOMAIN")
  return (
    <div>
      <Tabs defaultValue="post">
        <TabsList className="border-b">
          <div className="w-[60%] items-center flex mx-auto h-[2.5rem] my-3">
            <TabsTrigger
              className="text-[#444] data-[state=active]:border-[#5629B6] data-[state=active]:border-b-2 h-8"
              value="post"
            >
              Post
            </TabsTrigger>
            <TabsTrigger
              className="text-[#444] data-[state=active]:border-[#5629B6] data-[state=active]:border-b-2 h-8"
              value="event"
            >
              Event
            </TabsTrigger>
            <TabsTrigger
              className="text-[#444] data-[state=active]:border-[#5629B6] data-[state=active]:border-b-2 h-8"
              value="bravo"
            >
              Bravo
            </TabsTrigger>
            <TabsTrigger
              className="text-[#444] data-[state=active]:border-[#5629B6] data-[state=active]:border-b-2 h-8"
              value="publicHoliday"
            >
              Calendar
            </TabsTrigger>
          </div>
        </TabsList>

        <TabsContent value="post" className="bg-[#F8F9FA]">
          <List contentType="post" />
        </TabsContent>
        <TabsContent value="event" className="bg-[#F8F9FA]">
          <List contentType="event" />
        </TabsContent>
        <TabsContent value="bravo" className="bg-[#F8F9FA]">
          <List contentType="bravo" />
        </TabsContent>
        <TabsContent value="publicHoliday" className="bg-[#F8F9FA]">
          <List contentType="publicHoliday" />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Feed
