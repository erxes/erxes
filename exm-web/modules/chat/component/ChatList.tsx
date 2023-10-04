"use client"

import { useEffect, useState } from "react"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { useAtomValue } from "jotai"
import { PenSquareIcon } from "lucide-react"
import { useInView } from "react-intersection-observer"

import { Dialog, DialogTrigger } from "@/components/ui/dialog"
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
          <div className="p-4 bg-[#F0F0F0] rounded-full cursor-pointer">
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

  const renderChats = () => {
    if (pinnedChats.length !== 0) {
      return (
        <>
          <h3 className="mx-6">Resent</h3>
          {chats.map((c: any) => (
            <ChatItem
              key={c._id}
              chat={c}
              isPinned={c.isPinnedUserIds.includes(currentUser?._id)}
            />
          ))}
        </>
      )
    } else {
      return chats.map((c: any) => (
        <ChatItem
          key={c._id}
          chat={c}
          isPinned={c.isPinnedUserIds.includes(currentUser?._id)}
        />
      ))
    }
  }

  const renderPinnedChats = () => {
    if (pinnedChats.length !== 0) {
      return (
        <>
          <h3 className="mx-6">Pinned</h3>
          {pinnedChats.map((c: any) => (
            <ChatItem
              key={c._id}
              chat={c}
              isPinned={c.isPinnedUserIds.includes(currentUser?._id)}
            />
          ))}
        </>
      )
    }
  }

  return (
    <div className="w-full overflow-auto h-screen">
      <div className="flex items-center justify-between p-6">
        <h3 className="text-2xl font-semibold text-[#444]">Chats</h3>
        {renderAction()}
      </div>

      <div className="px-6">
        <Input
          className={"rounded-full border-[#DEE4E7]"}
          value={searchValue}
          placeholder={"Search Chat"}
          onChange={handleSearch}
        />
      </div>

      <div className="mt-4">
        <>
          {renderPinnedChats()}
          {renderChats()}
        </>

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
