"use client"

import { useEffect, useState } from "react"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { useAtomValue } from "jotai"
import { ChevronDown, PenSquareIcon } from "lucide-react"
import { useInView } from "react-intersection-observer"

import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "@/components/ui/image"
import { Input } from "@/components/ui/input"
import LoadingCard from "@/components/ui/loading-card"

import { useChats } from "../hooks/useChats"
import { ChatItem } from "./ChatItem"
import { ChatForm } from "./form/ChatForm"

dayjs.extend(relativeTime)

const ChatList = () => {
  const { ref, inView } = useInView({
    threshold: 0,
  })

  const currentUser = useAtomValue(currentUserAtom)
  const [searchValue, setSearchValue] = useState("")
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const { chats, chatsCount, loading, handleLoadMore, pinnedChats, refetch } =
    useChats({
      searchValue,
    })
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (inView) {
      handleLoadMore()
    }
  }, [inView, handleLoadMore])

  const renderAction = () => {
    return (
      <Dialog open={open} onOpenChange={() => setOpen(!open)}>
        <DialogTrigger asChild={true}>
          <div>
            <PenSquareIcon size={18} />
          </div>
        </DialogTrigger>

        <ChatForm setOpen={setOpen} refetch={refetch} />
      </Dialog>
    )
  }

  const handleSearch = (event: any) => {
    setSearchValue(event.target.value)
  }

  const handleTabClick = (index: number) => {
    setActiveTabIndex(index)
  }

  const renderDirectChats = () => {
    return chats.map((c: any) => {
      if (c.type === "group") {
        return null
      }
      return (
        <ChatItem
          key={c._id}
          chat={c}
          isPinned={c.isPinnedUserIds.includes(currentUser?._id)}
        />
      )
    })
  }

  const renderGroupChats = () => {
    return chats.map((c: any) => {
      if (c.type === "direct") {
        return null
      }
      return (
        <ChatItem
          key={c._id}
          chat={c}
          isPinned={c.isPinnedUserIds.includes(currentUser?._id)}
        />
      )
    })
  }

  const renderPinnedChats = () => {
    if (pinnedChats.length !== 0) {
      return pinnedChats.map((c: any) => (
        <ChatItem
          key={c._id}
          chat={c}
          isPinned={c.isPinnedUserIds.includes(currentUser?._id)}
        />
      ))
    }
  }

  const renderCurrentUserStatus = () => {
    return (
      <div className="pt-2 px-6 flex items-center h-16">
        <Image
          src={currentUser?.details.avatar || "/avatar-colored.svg"}
          alt="avatar"
          width={45}
          height={45}
          className="w-[45px] h-[45px] rounded-full object-cover mr-3 border border-primary"
        />
        <div className="flex items-start flex-col">
          <div className="text-[16px] w-[280px] truncate mb-1">
            {currentUser?.details.fullName || currentUser?.email}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="bg-success text-success-foreground text-[11px] px-4 py-[1px] rounded-lg flex items-center">
                <div className="indicator bg-success-foreground w-3 h-3 rounded-full border border-white mr-1" />
                Active
                <ChevronDown size={18} />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-transparent border-0 shadow-none px-2.5">
              <button className="bg-warning-foreground text-warning text-[11px] px-4 py-[1px] rounded-lg flex items-center w-full">
                <div className="indicator bg-warning w-3 h-3 rounded-full border border-white mr-1" />
                Busy
              </button>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    )
  }

  const renderChats = () => {
    if (searchValue) {
      return (
        <div className="px-4 pb-4 overflow-auto chat-list-search-max-height">
          <p className="pb-3">Direct chats</p>
          {renderDirectChats()}
          <p className="pb-3">Group chats</p>
          {renderGroupChats()}
          <p className="pb-3">Pinned chats</p>
          {renderPinnedChats()}
        </div>
      )
    }

    return (
      <div>
        <div className="flex px-4">
          {["Chat", "Groups", "Pinned"].map((type, index) => (
            <button
              key={index}
              className={`py-2 px-4 flex-1 ${
                activeTabIndex === index && "border-b border-primary"
              }`}
              onClick={() => handleTabClick(index)}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="p-4 overflow-auto chat-list-max-height">
          {activeTabIndex === 0 && renderDirectChats()}
          {activeTabIndex === 1 && renderGroupChats()}
          {activeTabIndex === 2 && renderPinnedChats()}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full overflow-auto h-screen">
      {renderCurrentUserStatus()}

      <div className="flex items-center justify-between p-6">
        <h5 className="text-base font-semibold text-[#444]">Create new chat</h5>
        {renderAction()}
      </div>

      <div className="px-4">
        <Input
          className={"sm:rounded-lg border-[#DEE4E7]"}
          value={searchValue}
          placeholder={"Search Chat"}
          onChange={handleSearch}
        />
      </div>

      <div className="mt-4">
        {renderChats()}

        {!loading && chats.length < chatsCount && (
          <div ref={ref}>
            <LoadingCard type="chatlist" />
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatList
