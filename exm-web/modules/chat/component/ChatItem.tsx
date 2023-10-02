"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { __DEV__ } from "@apollo/client/utilities/globals"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { useAtomValue } from "jotai"
import { MoreHorizontalIcon } from "lucide-react"

import { readFile } from "@/lib/utils"
import Avatar from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import useChatsMutation from "../hooks/useChatsMutation"

dayjs.extend(relativeTime)

export const ChatItem = ({
  chat,
  isPinned,
}: {
  chat?: any
  isPinned: boolean
}) => {
  const router = useRouter()
  const currentUser = useAtomValue(currentUserAtom)
  const { togglePinned } = useChatsMutation()
  const searchParams = useSearchParams()

  const [showAction, setShowAction] = useState(false)

  const chatId = searchParams.get("id")

  const users: any[] = chat?.participantUsers || []
  const user: any =
    users?.length > 1
      ? users?.filter((u) => u._id !== currentUser?._id)[0]
      : users?.[0]

  const handleClick = () => {
    router.push(`/chats/detail?id=${chat._id}`)
  }

  const onDelete = () => {
    console.log("delete")
  }

  const onPin = () => {
    togglePinned(chat._id)
  }

  const renderChatActions = () => {
    return (
      <Popover>
        <PopoverTrigger asChild={true}>
          <div className="p-2 bg-white rounded-full absolute right-1 ">
            <MoreHorizontalIcon size={16} />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-3">
          <div
            className="hover:bg-[#F0F0F0] p-2 rounded-md cursor-pointer text-[#444] text-xs"
            onClick={onPin}
          >
            {isPinned ? "Unpin" : "Pin"}
          </div>

          <div
            className="hover:bg-[#F0F0F0] p-2 rounded-md cursor-pointer text-rose-600 text-xs"
            onClick={onDelete}
          >
            Delete Chat
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Card
      className={`${
        chatId === chat._id ? "bg-[#F0F0F0]" : "bg-transparent"
      } px-6 rounded-none py-2.5 cursor-pointer flex items-center shadow-none border-none hover:bg-[#F0F0F0] relative`}
      onClick={handleClick}
      onMouseEnter={() => setShowAction(true)}
      onMouseLeave={() => setShowAction(false)}
    >
      <Avatar
        src={readFile((user && user.details?.avatar) || "/avatar-colored.svg")}
        alt="User Profile"
        width={500}
        height={500}
        className="w-12 h-12 rounded-full mr-4"
      />

      <div className="text-sm text-[#444] w-full">
        <p>
          {chat && chat.type === "direct" ? (
            <>
              {user?.details.fullName || user?.email}

              {user?.details.position ? (
                <span> ({user?.details.position})</span>
              ) : null}
            </>
          ) : (
            chat?.name
          )}
        </p>
        <div className="flex justify-between w-full text-xs font-normal">
          <p>{(chat?.lastMessage && chat?.lastMessage.content) || ""}</p>
          <p>
            {chat.lastMessage &&
              chat.lastMessage.createdAt &&
              dayjs(chat.lastMessage.createdAt).fromNow()}
          </p>
        </div>
      </div>

      {showAction ? renderChatActions() : null}
    </Card>
  )
}
