"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRightLeft, CalendarPlus } from "lucide-react"

import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const List = dynamic(() => import("./List"))
const EventForm = dynamic(() => import("../component/form/EventForm"))

const Feed = () => {
  localStorage.getItem("exm_env_REACT_APP_DOMAIN")
  const [open, setOpen] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()

  const type = searchParams.get("contentType")

  const handleClick = (tabType: string) => {
    router.push(`/?contentType=${tabType}`)
  }

  const renderEventForm = () => {
    return (
      <Dialog open={open} onOpenChange={() => setOpen(!open)}>
        <button className="px-[14px] bg-white py-2 border border-[#D0D5DD] rounded-lg shadow-sm flex gap-2 capitalize items-center">
          <CalendarPlus size={15} />
          Create event
        </button>

        {open ? <EventForm setOpen={setOpen} /> : null}
      </Dialog>
    )
  }

  const dropdownContentItemStyle = `cursor-pointer py-[10px] hover:bg-[#EAECF0]`

  const rightSpace = type === "event" ? "right-[30px]" : "right-[15%]"

  return (
    <div className="relative">
      <List contentType={type || "post"} />
      <div className={`absolute bottom-[20px] ${rightSpace} flex gap-4`}>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <button className="px-[14px] bg-white py-2 border border-[#D0D5DD] rounded-lg shadow-sm flex gap-2 capitalize items-center">
              {type || "Post"} <ArrowRightLeft size={15} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#FCFCFD] rounded-lg px-3 py-2">
            <div
              className={dropdownContentItemStyle}
              onClick={() => handleClick("post")}
            >
              Post
            </div>
            <div
              className={dropdownContentItemStyle}
              onClick={() => handleClick("event")}
            >
              Event
            </div>
            <div
              className={dropdownContentItemStyle}
              onClick={() => handleClick("bravo")}
            >
              Bravo
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        {type === "event" && renderEventForm()}
      </div>
    </div>
  )
}

export default Feed
