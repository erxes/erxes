"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { IUser } from "@/modules/auth/types"
import { __DEV__ } from "@apollo/client/utilities/globals"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { useAtomValue } from "jotai"
import { AlertTriangleIcon, MoreHorizontalIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import Image from "@/components/ui/image"
import LoadingPost from "@/components/ui/loadingPost"
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
  const currentUser = useAtomValue(currentUserAtom) || ({} as IUser)

  const callBack = (result: string) => {
    if (result === "success") {
      setOpen(false)
    }
  }

  const {
    togglePinned,
    chatDelete,
    loading: mutationLoading,
  } = useChatsMutation({ callBack })
  const searchParams = useSearchParams()

  const [showAction, setShowAction] = useState(false)
  const [open, setOpen] = useState(false)

  const chatId = searchParams.get("id")

  const users: any[] = chat?.participantUsers || []
  const user: any =
    users?.length > 1
      ? users?.filter((u) => u._id !== currentUser?._id)[0]
      : users?.[0]

  const isSeen = chat
    ? chat.lastMessage?.createdUser?._id === currentUser?._id
      ? true
      : chat.isSeen
    : true

  const handleClick = () => {
    router.push(`/chats/detail?id=${chat._id}`)
  }

  const onDelete = () => {
    chatDelete(chat._id)
  }

  const onPin = () => {
    togglePinned(chat._id)
  }

  const renderChatActions = () => {
    const renderForm = () => {
      return (
        <DialogContent>
          {mutationLoading ? <LoadingPost text="Leaving" /> : null}

          <div className="flex flex-col items-center justify-center">
            <AlertTriangleIcon size={30} color={"#6569DF"} /> Are you sure?
          </div>

          <DialogFooter className="flex flex-col items-center justify-center sm:justify-center sm:space-x-2">
            <Button
              className="font-semibold rounded-full bg-[#F2F2F2] hover:bg-[#F2F2F2] text-black"
              onClick={() => setOpen(false)}
            >
              No, Cancel
            </Button>

            <Button
              type="submit"
              className="font-semibold rounded-full"
              onClick={onDelete}
            >
              Yes, I am
            </Button>
          </DialogFooter>
        </DialogContent>
      )
    }

    const renderDelete = () => {
      if (chat.type === "direct") {
        return null
      }

      return (
        <Dialog open={open} onOpenChange={() => setOpen(!open)}>
          <DialogTrigger asChild={true}>
            <div className="hover:bg-[#F0F0F0] p-2 rounded-md cursor-pointer text-rose-600 text-xs">
              Leave Chat
            </div>
          </DialogTrigger>

          {open ? renderForm() : null}
        </Dialog>
      )
    }

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

          {renderDelete()}
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Card
      className={`${chatId === chat._id ? "bg-[#f0eef9]" : "bg-transparent"} ${
        isSeen ? "" : "font-bold"
      } px-6 rounded-none py-2.5 cursor-pointer flex items-center shadow-none border-none hover:bg-[#F0F0F0] relative`}
      onClick={handleClick}
      onMouseEnter={() => setShowAction(true)}
      onMouseLeave={() => setShowAction(false)}
    >
      <div className="items-end flex mr-2">
        <div className="w-12 h-12 rounded-full">
          <Image
            src={
              (chat.type === "direct"
                ? user && user.details?.avatar
                : chat && chat.featuredImage[0]?.url) || "/avatar-colored.svg"
            }
            alt="avatar"
            width={60}
            height={60}
            className="w-12 h-12 rounded-full object-cover"
          />
        </div>
      </div>

      <div className={`text-sm text-[#444] w-full`}>
        <p>
          {chat && chat.type === "direct" ? (
            <>
              {user?.details.fullName || user?.email}

              {user?.details.position ? (
                <span className="text-[10px]"> ({user?.details.position})</span>
              ) : null}
            </>
          ) : (
            chat?.name
          )}
        </p>
        <div className="flex justify-between w-full text-xs">
          <p
            className="truncate max-w-[150px]"
            dangerouslySetInnerHTML={
              {
                __html: (chat?.lastMessage && chat?.lastMessage.content) || "",
              } || ""
            }
          />

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
