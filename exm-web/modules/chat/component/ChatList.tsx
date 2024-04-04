"use client"

import { useEffect, useState } from "react"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { IUser } from "@/modules/auth/types"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { useAtomValue } from "jotai"
import { PenSquareIcon } from "lucide-react"
import { useInView } from "react-intersection-observer"

import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import LoadingCard from "@/components/ui/loading-card"

import { useChats } from "../hooks/useChats"
import { IChat } from "../types"
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
          <PenSquareIcon size={18} />
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
    return (
      <>
        {pinnedChats
          .filter((c: any) => c.type === "direct")
          .map((c: any) => (
            <ChatItem
              key={c._id}
              chat={c}
              isPinned={c.isPinnedUserIds.includes(currentUser?._id)}
            />
          ))}
        {chats.map((c: any) => {
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
        })}
      </>
    )
  }

  const renderGroupChats = () => {
    return (
      <>
        {pinnedChats
          .filter((c: any) => c.type === "group")
          .map((c: any) => (
            <ChatItem
              key={c._id}
              chat={c}
              isPinned={c.isPinnedUserIds.includes(currentUser?._id)}
            />
          ))}
        {chats.map((c: any) => {
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
        })}
      </>
    )
  }

  const filteredPinnedChats = pinnedChats.filter((item: any) => {
    let name = ""

    if (item.type === "direct") {
      const users: any[] = item.participantUsers || []
      const user: any =
        users.length > 1
          ? users.filter((u) => u._id !== (currentUser || ({} as IUser))._id)[0]
          : users[0]
      name = user.details.fullName || user.email
      return (
        name.toLowerCase().includes(searchValue.toLowerCase()) ||
        user.details.position.toLowerCase().includes(searchValue.toLowerCase())
      )
    } else {
      name = item.name
      return name.toLowerCase().includes(searchValue.toLowerCase())
    }
  })

  const renderChats = () => {
    if (searchValue) {
      return (
        <div className="px-4 pb-4 overflow-auto chat-list-search-max-height">
          <p className="pb-3">Direct chats</p>
          {renderDirectChats()}
          <p className="pb-3">Group chats</p>
          {renderGroupChats()}
          <p className="pb-3">Pinned chats</p>
          {filteredPinnedChats.map((c: any) => (
            <ChatItem
              key={c._id}
              chat={c}
              isPinned={c.isPinnedUserIds.includes(currentUser?._id)}
            />
          ))}
        </div>
      )
    }

    const directChatUnreadCount = chats.filter(
      (c: IChat) => c.type === "direct" && !c.isSeen
    ).length
    const groupChatUnreadCount = chats.filter(
      (c: IChat) => c.type === "group" && !c.isSeen
    ).length
    const pinnedChatUnreadCount = pinnedChats.filter(
      (c: IChat) => !c.isSeen
    ).length

    const renderUnreadCount = (type: string) => {
      return type === "Chat"
        ? directChatUnreadCount
        : type === "Groups"
        ? groupChatUnreadCount
        : pinnedChatUnreadCount
    }

    return (
      <div>
        <div className="flex">
          {["Chat", "Groups"].map((type, index) => (
            <button
              key={index}
              className={`py-3 px-4 flex-1 flex items-center gap-2 justify-center border-b-2 border-exm ${
                activeTabIndex === index && "!border-primary"
              }`}
              onClick={() => handleTabClick(index)}
            >
              {type}
              {renderUnreadCount(type) > 0 && (
                <div className="">
                  <span className="bg-primary text-white rounded-lg w-5 h-5 flex items-center justify-center text-[10px] border border-exm">
                    +{renderUnreadCount(type)}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
        <div className="overflow-auto chat-list-max-height">
          {activeTabIndex === 0 && renderDirectChats()}
          {activeTabIndex === 1 && renderGroupChats()}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full overflow-auto h-screen">
      <div className="flex items-center justify-between px-3 pt-4 pb-2">
        <h5 className="text-base font-semibold text-[#444]">Chat</h5>
        {renderAction()}
      </div>

      <div className="px-3 pb-4 border-b border-exm">
        <Input
          className={"sm:rounded-lg border-[#DEE4E7]"}
          value={searchValue}
          placeholder={"Search Chat"}
          onChange={handleSearch}
        />
      </div>

      <div>
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
