import React, { useState } from "react"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { IUser } from "@/modules/auth/types"
import { IAttachment } from "@/modules/feed/component/form/uploader/Uploader"
import { useAtomValue } from "jotai"
import { Search, Upload } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Loader from "@/components/ui/loader"
import { useUsers } from "@/components/hooks/useUsers"

import { useChatMessages } from "../../hooks/useChatMessages"
import { useChats } from "../../hooks/useChats"
import { ChatItem } from "../ChatItem"

type Props = {
  content?: any
  attachments?: IAttachment[]
  type?: string
}

const ForwardMessage = ({ content, attachments }: Props) => {
  const [searchValue, setSearchValue] = useState("")
  const [open, setOpen] = useState(false)

  const currentUser = useAtomValue(currentUserAtom) || ({} as IUser)
  const { chatForward } = useChatMessages()

  const { users, loading: usersLoading } = useUsers({ searchValue })
  const { chats, loading: chatsLoading } = useChats({ searchValue })

  const contactedUsers = chats.map((c: any) => {
    const chatUsers: any[] = c?.participantUsers || []
    const chatUser: any =
      chatUsers?.length > 1
        ? chatUsers?.filter((u) => u._id !== currentUser?._id)[0]
        : chatUsers?.[0]

    return c.type === "direct" && chatUser._id
  })

  const handleForward = (id: string, forwardType: string) => {
    chatForward({ id, type: forwardType, content, attachments })
    console.log(forwardType, " clicked ", id)
  }

  const handleInputChange = (e: any) => {
    setSearchValue(e.target.value)
  }

  const renderForwardMessage = () => {
    if (usersLoading && chatsLoading) {
      return <Loader />
    }

    return (
      <div className="flex flex-col gap-1 items-start w-full">
        <div className="py-2 text-left">Recent</div>
        <div className="flex flex-col pb-4 w-full">
          {chats.map((c: any) => {
            return (
              <ChatItem
                key={c._id}
                chat={c}
                isPinned={c.isPinnedUserIds.includes(currentUser?._id)}
                handleForward={handleForward}
              />
            )
          })}
          <div className="py-2 text-left">New chat</div>
          {users.map((user) => {
            if (!contactedUsers.includes(user._id)) {
              return (
                <ChatItem
                  key={user._id}
                  notContactedUser={user}
                  isPinned={false}
                  handleForward={handleForward}
                />
              )
            }
          })}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={() => setOpen(!open)}>
      <DialogTrigger asChild={true}>
        <div className="p-2.5 bg-[#F2F2F2] rounded-full cursor-pointer">
          <Upload size={16} />
        </div>
      </DialogTrigger>

      <DialogContent className="p-0 gap-0 max-w-md">
        <DialogHeader className="border-b p-4">
          <DialogTitle className="flex justify-around">
            Forward Chat
          </DialogTitle>
        </DialogHeader>
        <div className="px-4 pt-4">
          <div className="flex gap-1 py-3 px-4 border border-[#0000001F] rounded-lg w-full">
            <input
              value={searchValue}
              autoFocus={true}
              type="text"
              placeholder="Search..."
              className="outline-none bg-transparent w-full"
              autoComplete="off"
              onChange={handleInputChange}
            />
            <Search size={16} />
          </div>
        </div>
        <div className="px-4 pt-4 max-h-[60vh] overflow-y-auto">
          {renderForwardMessage()}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ForwardMessage
