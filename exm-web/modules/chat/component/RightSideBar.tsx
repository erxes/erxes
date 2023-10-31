"use client"

import { useState } from "react"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { useAtomValue } from "jotai"
import { PenSquareIcon } from "lucide-react"

import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import Image from "@/components/ui/image"

import { useChatDetail } from "../hooks/useChatDetail"
import ParticipantList from "./ParticipantList"
import UserDetail from "./UserDetail"
import { GroupChatAction } from "./form/GroupChatAction"

const RightSideBar = () => {
  const currentUser = useAtomValue(currentUserAtom)
  const { chatDetail, loading } = useChatDetail()

  const [open, setOpen] = useState(false)

  if (loading) {
    return null
  }

  const users: any[] = chatDetail?.participantUsers || []
  const user: any =
    users?.length > 1
      ? users?.filter((u) => u._id !== currentUser?._id)[0]
      : users?.[0]

  const renderAction = () => {
    return (
      <Dialog open={open} onOpenChange={() => setOpen(!open)}>
        <DialogTrigger asChild={true}>
          <div className="p-4 bg-[#F0F0F0] rounded-full cursor-pointer">
            <PenSquareIcon size={18} />
          </div>
        </DialogTrigger>

        <GroupChatAction chat={chatDetail} setOpen={setOpen} />
      </Dialog>
    )
  }

  const renderGroup = () => {
    return (
      <>
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="flex items-center">
            <div className="items-end flex mr-2">
              <div className="w-12 h-12 rounded-full">
                <Image
                  src={
                    (chatDetail &&
                      chatDetail.featuredImage &&
                      chatDetail.featuredImage[0]?.url) ||
                    "/avatar-colored.svg"
                  }
                  alt="avatar"
                  width={60}
                  height={60}
                  className="w-12 h-12 rounded-full object-cover"
                />
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-[#444]">
              {chatDetail.name}
            </h3>
          </div>
          {renderAction()}
        </div>

        <ParticipantList chat={chatDetail} />
      </>
    )
  }

  const renderDirect = () => {
    return <UserDetail user={user} />
  }

  return (
    <div className="overflow-auto h-screen p-6">
      <h3 className="text-[#444] font-bold text-xl mb-4">Details</h3>
      {chatDetail?.type === "group" ? renderGroup() : renderDirect()}
    </div>
  )
}

export default RightSideBar
