"use client"

import { useState } from "react"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { IUser } from "@/modules/auth/types"
import { useAtomValue } from "jotai"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import LoadingPost from "@/components/ui/loadingPost"
import SelectUsers from "@/components/select/SelectUsers"

import useChatsMutation from "../hooks/useChatsMutation"
import { IChat } from "../types"
import ParticipantItem from "./ParticipantItem"

const ParticipantList = ({ chat }: { chat: IChat }) => {
  const currentUser = useAtomValue(currentUserAtom) || ({} as IUser)
  const [userIds, setUserIds] = useState([] as any)
  const [open, setOpen] = useState(false)

  const callBack = (result: string) => {
    if (result === "success") {
      setOpen(false)
    }
  }

  const { addOrRemoveMember, loading: mutationLoading } = useChatsMutation({
    callBack,
  })

  const addMember = () => {
    setUserIds([])
    addOrRemoveMember(chat._id, "add", userIds)
  }

  const isAdmin =
    (chat?.participantUsers || []).find(
      (pUser) => pUser._id === currentUser._id
    )?.isAdmin || false

  const renderAdd = () => {
    const renderForm = () => {
      return (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add member</DialogTitle>
          </DialogHeader>

          {mutationLoading ? <LoadingPost text="Adding" /> : null}

          <SelectUsers userIds={userIds} onChange={setUserIds} />

          <Button
            className="font-semibold w-full rounded-full"
            onClick={addMember}
          >
            Add
          </Button>
        </DialogContent>
      )
    }

    return (
      <Dialog open={open} onOpenChange={() => setOpen(!open)}>
        <DialogTrigger asChild={true}>
          <div className="flex items-center mb-2 p-2 hover:bg-[#F0F0F0] cursor-pointer">
            <div className="p-2 bg-[#F0F0F0] rounded-full cursor-pointer mr-2">
              <PlusIcon size={18} />
            </div>
            <div className="">
              <p className="text-sm font-medium text-[#444]">Add member</p>
            </div>
          </div>
        </DialogTrigger>

        {open ? renderForm() : null}
      </Dialog>
    )
  }

  return (
    <div className="mt-4">
      {chat.participantUsers.map((user: any, index: number) => (
        <ParticipantItem
          key={index}
          participant={user}
          chatId={chat._id}
          isAdmin={isAdmin}
        />
      ))}

      {isAdmin && renderAdd()}
    </div>
  )
}

export default ParticipantList
