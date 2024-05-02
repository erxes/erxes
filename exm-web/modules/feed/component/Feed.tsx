"use client"

import dynamic from "next/dynamic"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const List = dynamic(() => import("./List"))

const Feed = () => {
  localStorage.getItem("exm_env_REACT_APP_DOMAIN")

  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const type = searchParams.get("contentType")

  const handleClick = (tabType: string) => {
    router.push(`${pathname}?contentType=${tabType}`)
  }

  const style =
    "text-[#A1A1A1] h-full py-[10px] data-[state=active]:text-[#3F2E81] data-[state=active]:bg-[#E0E2FF] rounded-lg hover:font-medium hover:text-[#A1A1A1]"

  return (
    <Tabs defaultValue={type || "post"}>
      <TabsList className="max-w-[880px] w-full mx-auto border border-t-0 rounded-b-lg p-2 border-exm h-[3.5rem]">
        <div className="h-full items-center flex">
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
        </div>
      </TabsList>

      <List contentType={type || "post"} />
    </Tabs>
  )
}

export default Feed
