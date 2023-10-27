"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { IUser } from "@/modules/auth/types"
import { __DEV__ } from "@apollo/client/utilities/globals"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { useAtomValue } from "jotai"
import {
  AlertTriangleIcon,
  Archive,
  Bell,
  BellOff,
  LogOut,
  MoreVerticalIcon,
  Pin,
  PinOff,
  Trash,
} from "lucide-react"

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
  notContactedUser,
  handleForward,
}: {
  chat?: any
  isPinned: boolean
  notContactedUser?: IUser
  handleForward?: (id: string, forwardType: string) => void
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
    toggleMute,
    loading: mutationLoading,
  } = useChatsMutation({ callBack })
  const searchParams = useSearchParams()

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
    if (chat) {
      router.push(`/chats/detail?id=${chat._id}`)
    }
  }

  const onDelete = () => {
    chatDelete(chat._id)
  }

  const onPin = () => {
    togglePinned(chat._id)
  }

  const onMute = () => {
    toggleMute(chat._id)
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
      return (
        <Dialog open={open} onOpenChange={() => setOpen(!open)}>
          <DialogTrigger asChild={true}>
            <div className="hover:bg-[#F0F0F0] p-2 rounded-md cursor-pointer text-rose-600 text-xs flex">
              {chat.type === "direct" ? (
                <Trash size={14} />
              ) : (
                <LogOut size={14} />
              )}
              &nbsp;
              {chat.type === "direct" ? "Delete chat" : "Leave Chat"}
            </div>
          </DialogTrigger>

          {open ? renderForm() : null}
        </Dialog>
      )
    }

    return (
      <Popover>
        <PopoverTrigger asChild={true}>
          <MoreVerticalIcon size={16} />
        </PopoverTrigger>
        <PopoverContent className="w-44 p-3" align="start">
          <div
            className="hover:bg-[#F0F0F0] p-2 rounded-md cursor-pointer text-[#444] text-xs flex"
            onClick={onPin}
          >
            {isPinned ? <PinOff size={14} /> : <Pin size={14} />}&nbsp;
            {isPinned ? "Unpin" : "Pin"}
          </div>
          <div
            className="hover:bg-[#F0F0F0] p-2 rounded-md cursor-pointer text-[#444] text-xs flex"
            onClick={onMute}
          >
            {chat.muteUserIds.includes(currentUser._id) ? (
              <Bell size={14} />
            ) : (
              <BellOff size={14} />
            )}
            &nbsp;
            {chat.muteUserIds.includes(currentUser._id)
              ? "Unmute notification"
              : "Mute notification"}
          </div>
          <div
            className="hover:bg-[#F0F0F0] p-2 rounded-md cursor-pointer text-[#444] text-xs flex"
            // onClick={onPin}
          >
            <Archive size={14} />
            &nbsp; Archive chat
          </div>

          {renderDelete()}
        </PopoverContent>
      </Popover>
    )
  }

  const renderForwardAction = () => {
    if (chat && handleForward) {
      return (
        <button
          className="rounded-md bg-primary-light px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#5532c7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={() => {
            handleForward(
              chat.type === "group" ? chat._id : user._id,
              chat.type
            )
          }}
        >
          Send
        </button>
      )
    }

    if (handleForward && notContactedUser) {
      return (
        <button
          className="rounded-md bg-primary-light px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#5532c7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={() => {
            handleForward(notContactedUser._id, "direct")
          }}
        >
          Send
        </button>
      )
    }

    return null
  }

  const renderAvatar = () => {
    if (chat) {
      return (
        <Image
          src={
            (chat.type === "direct"
              ? user && user.details?.avatar
              : chat && chat.featuredImage[0]?.url) || "/avatar-colored.svg"
          }
          alt="avatar"
          width={60}
          height={60}
          className="w-12 h-12 rounded-full object-cover border border-primary"
        />
      )
    }

    return (
      <Image
        src={
          (notContactedUser &&
            notContactedUser.details &&
            notContactedUser.details.avatar) ||
          "/avatar-colored.svg"
        }
        alt="avatar"
        width={60}
        height={60}
        className="w-12 h-12 rounded-full object-cover border border-primary"
      />
    )
  }

  const renderName = () => {
    if (chat) {
      return chat.type === "direct" ? (
        <>{user?.details.fullName || user?.email}</>
      ) : (
        chat?.name
      )
    }

    return notContactedUser?.details.fullName || notContactedUser?.email
  }

  const renderInfo = () => {
    if (notContactedUser) {
      return (
        <div className={`text-sm text-[#444] w-9/12`}>
          <p className="w-4/5 truncate">{renderName()}</p>
          <p className="w-1/2 truncate">
            {notContactedUser?.details.position ? (
              <span className="text-[10px]">
                {" "}
                ({notContactedUser?.details.position})
              </span>
            ) : null}
          </p>
        </div>
      )
    }

    return (
      <div className={`text-sm text-[#444] w-9/12`}>
        <div className="flex justify-between">
          <p className="w-4/5 truncate">{renderName()}</p>
          {!handleForward &&
            chat &&
            chat.muteUserIds.includes(currentUser._id) && <BellOff size={14} />}
        </div>
        <div className="flex justify-between w-full text-xs">
          <p className="w-1/2 truncate">
            {chat.type === "direct" ? (
              user?.details.position ? (
                <span className="text-[10px]"> ({user?.details.position})</span>
              ) : null
            ) : (
              "(Active now)"
            )}
          </p>
          {!handleForward && (
            <p className="text-primary-light text-[10px]">
              {chat.lastMessage &&
                chat.lastMessage.createdAt &&
                "⋅" + dayjs(chat.lastMessage.createdAt).fromNow()}
            </p>
          )}
        </div>
        {!handleForward && (
          <p
            className="truncate max-w-[150px]"
            dangerouslySetInnerHTML={
              {
                __html: (chat?.lastMessage && chat?.lastMessage.content) || "",
              } || ""
            }
          />
        )}
      </div>
    )
  }

  return (
    <Card
      className={`${
        !handleForward && chatId === chat._id
          ? "bg-[#f0eef9]"
          : "bg-transparent"
      } ${
        isSeen ? "" : "font-bold"
      } px-5 rounded-none py-2.5 cursor-pointer flex items-center shadow-none border-none hover:bg-[#F0F0F0] mb-3 sm:rounded-lg `}
      onClick={handleClick}
    >
      <div className="items-end flex mr-3">
        <div className="w-12 h-12 rounded-full relative">
          {renderAvatar()}
          <div className="indicator bg-success-foreground w-3 h-3 rounded-full border border-white mr-1 absolute bottom-0 right-0" />
        </div>
      </div>

      {renderInfo()}

      {!handleForward && renderChatActions()}
      {handleForward && renderForwardAction()}
    </Card>
  )
}
