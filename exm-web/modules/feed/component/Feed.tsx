"use client"

import dynamic from "next/dynamic"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const List = dynamic(() => import("./List"))

const Feed = () => {
  localStorage.getItem("exm_env_REACT_APP_DOMAIN")

  const style =
    "text-[#A1A1A1] data-[state=active]:text-primary data-[state=active]:border-[#5629B6] data-[state=active]:border-b-2 h-16 hover:font-medium hover:text-[#A1A1A1]"

  return (
    <div>
      <Tabs defaultValue="post">
        <TabsList className="border-b border-[#eee]">
          <div className="w-[60%] items-center flex mx-auto h-[2.5rem] my-3">
            <TabsTrigger className={style} value="post">
              Post
            </TabsTrigger>
            <TabsTrigger className={style} value="event">
              Event
            </TabsTrigger>
            <TabsTrigger className={style} value="bravo">
              Bravo
            </TabsTrigger>
            <TabsTrigger className={style} value="publicHoliday">
              Calendar
            </TabsTrigger>
          </div>
        </TabsList>

        {["post", "event", "bravo", "publicHoliday"].map((item) => (
          <TabsContent value={item} className="bg-[#F8F9FA]" key={item}>
            <List contentType={item} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

export default Feed
