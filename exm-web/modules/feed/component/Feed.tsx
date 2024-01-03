"use client"

import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const List = dynamic(() => import("./List"))

const Feed = () => {
  localStorage.getItem("exm_env_REACT_APP_DOMAIN")

  const style =
    "text-[#A1A1A1] data-[state=active]:text-primary data-[state=active]:border-[#5629B6] data-[state=active]:border-b-2 h-16 hover:font-medium hover:text-[#A1A1A1]"

  const router = useRouter()
  const searchParams = useSearchParams()

  const type = searchParams.get("contentType")

  const handleClick = (tabType: string) => {
    router.push(`/?contentType=${tabType}`)
  }

  return (
    <div>
      <Tabs defaultValue={type || "post"}>
        <TabsList className="border-b border-[#eee]">
          <div className="w-[60%] items-center flex mr-auto h-[2.5rem] my-3 ml-[25px]">
            <TabsTrigger
              className={style}
              value="post"
              onClick={() => handleClick("post")}
            >
              Post
            </TabsTrigger>
            <TabsTrigger
              className={style}
              value="event"
              onClick={() => handleClick("event")}
            >
              Event
            </TabsTrigger>
            <TabsTrigger
              className={style}
              value="bravo"
              onClick={() => handleClick("bravo")}
            >
              Bravo
            </TabsTrigger>
            <TabsTrigger
              className={style}
              value="publicHoliday"
              onClick={() => handleClick("publicHoliday")}
            >
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
