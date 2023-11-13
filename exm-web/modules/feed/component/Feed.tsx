"use client"

import dynamic from "next/dynamic"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const List = dynamic(() => import("./List"))

const Feed = () => {
  localStorage.getItem("exm_env_REACT_APP_DOMAIN")
  return (
    <div>
      <Tabs defaultValue="post">
        <TabsList className="w-full items-center flex p-2 h-[6vh]">
          <TabsTrigger
            className="text-[#444] data-[state=active]:border-[#5629B6] data-[state=active]:border-b-2"
            value="post"
          >
            Post
          </TabsTrigger>
          <TabsTrigger
            className="text-[#444] data-[state=active]:border-[#5629B6] data-[state=active]:border-b-2"
            value="event"
          >
            Event
          </TabsTrigger>
          <TabsTrigger
            className="text-[#444] data-[state=active]:border-[#5629B6] data-[state=active]:border-b-2"
            value="bravo"
          >
            Bravo
          </TabsTrigger>
          <TabsTrigger
            className="text-[#444] data-[state=active]:border-[#5629B6] data-[state=active]:border-b-2"
            value="publicHoliday"
          >
            Public holiday
          </TabsTrigger>
          <TabsTrigger
            className="text-[#444] data-[state=active]:border-[#5629B6] data-[state=active]:border-b-2"
            value="welcome"
          >
            Welcome
          </TabsTrigger>
        </TabsList>

        <TabsContent value="post">
          <List contentType="post" />
        </TabsContent>
        <TabsContent value="event">
          <List contentType="event" />
        </TabsContent>
        <TabsContent value="bravo">
          <List contentType="bravo" />
        </TabsContent>
        <TabsContent value="publicHoliday">
          <List contentType="publicHoliday" />
        </TabsContent>
        <TabsContent value="welcome">
          <List contentType="welcome" />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Feed
