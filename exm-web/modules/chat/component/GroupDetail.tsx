"use client"

import { useState } from "react"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { useAtomValue } from "jotai"
import {
  Bell,
  BellOff,
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
  LogOut,
  Pencil,
} from "lucide-react"

import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import Image from "@/components/ui/image"
import { useToast } from "@/components/ui/use-toast"

import useChatsMutation from "../hooks/useChatsMutation"
import LeaveChat from "./LeaveChat"
import ParticipantList from "./ParticipantList"
import SharedFiles from "./SharedFiles"
import { GroupChatAction } from "./form/GroupChatAction"
import { PinnedMessages } from "./messages/PinnedMessages"

const UserDetail = ({ chatDetail }: { chatDetail: any }) => {
  const { toast } = useToast()
  const callBack = (result: string) => {
    if (result === "success") {
      return toast({
        description: chatDetail.muteUserIds.includes(currentUser?._id)
          ? "Unmuted chat"
          : `Muted chat`,
      })
    }
  }
  const { toggleMute } = useChatsMutation({ callBack })
  const [openChangeName, setOpenChangeName] = useState(false)
  const [openChangeImage, setOpenChangeImage] = useState(false)
  const [screen, setScreen] = useState("main")
  const [showMembers, setShowMembers] = useState(false)

  const [open, setOpen] = useState(false)
  const currentUser = useAtomValue(currentUserAtom)

  if (screen === "files") {
    return <SharedFiles setScreen={setScreen} />
  }

  if (screen === "pinned") {
    return <PinnedMessages setScreen={setScreen} />
  }

  const renderChatImage = () => {
    if (chatDetail && chatDetail.featuredImage.length > 0) {
      return (
        <Image
          src={chatDetail.featuredImage[0]?.url}
          alt="avatar"
          width={60}
          height={60}
          className={`w-16 h-16 rounded-full object-cover border-exm border-4`}
        />
      )
    }

    return (
      <div className="relative">
        <Image
          src={
            chatDetail.participantUsers[0].details?.avatar ||
            "/avatar-colored.svg"
          }
          alt="avatar"
          width={60}
          height={60}
          className={`w-[50px] h-[50px] rounded-full object-cover absolute right-0 border-exm border-2`}
        />
        <Image
          src={
            chatDetail.participantUsers[1].details?.avatar ||
            "/avatar-colored.svg"
          }
          alt="avatar"
          width={60}
          height={60}
          className={`w-[50px] h-[50px] top-[28px] rounded-full object-cover absolute  border-exm border-2`}
        />
      </div>
    )
  }

  const renderMembers = () => {
    return (
      <div className="text-[#475467] text-sm font-medium">
        <div
          className="flex justify-between cursor-pointer py-3"
          onClick={() => setShowMembers(!showMembers)}
        >
          Chat members
          {showMembers ? (
            <ChevronDown size={18} color="#475467" />
          ) : (
            <ChevronRight size={18} color="#475467" />
          )}
        </div>
        {showMembers && <ParticipantList chat={chatDetail} />}
      </div>
    )
  }

  const renderActions = () => {
    const muted = chatDetail.muteUserIds.includes(currentUser?._id)

    return (
      <div className="w-full">
        <Dialog
          open={openChangeImage}
          onOpenChange={() => setOpenChangeImage(!openChangeImage)}
        >
          <DialogTrigger asChild={true}>
            <div className="flex items-center py-2 cursor-pointer">
              <div
                className="bg-[#F2F4F7] rounded-full p-3 text-black mr-2 "
                onClick={() => toggleMute(chatDetail._id)}
              >
                <ImageIcon size={16} />
              </div>
              Change chat image
            </div>
          </DialogTrigger>

          <GroupChatAction
            chat={chatDetail}
            setOpen={setOpenChangeImage}
            type="image"
          />
        </Dialog>
        <Dialog
          open={openChangeName}
          onOpenChange={() => setOpenChangeName(!openChangeName)}
        >
          <DialogTrigger asChild={true}>
            <div className="flex items-center py-2 cursor-pointer">
              <div
                className="bg-[#F2F4F7] rounded-full p-3 text-black mr-2 "
                onClick={() => toggleMute(chatDetail._id)}
              >
                <Pencil size={16} />
              </div>
              Change chat name
            </div>
          </DialogTrigger>

          <GroupChatAction
            chat={chatDetail}
            setOpen={setOpenChangeName}
            type="name"
          />
        </Dialog>
        <div
          className="flex items-center py-2 cursor-pointer"
          onClick={() => toggleMute(chatDetail._id)}
        >
          <div className="bg-[#F2F4F7] rounded-full p-3 text-black mr-2 ">
            {muted ? <Bell size={16} /> : <BellOff size={16} />}
          </div>
          {muted ? "Unmute" : "Mute"}
        </div>
        <Dialog open={open} onOpenChange={() => setOpen(!open)}>
          <DialogTrigger asChild={true}>
            <div className="flex items-center py-2 cursor-pointer">
              <div className="bg-[#F2F4F7] rounded-full p-3 text-black mr-2">
                <LogOut size={16} />
              </div>
              Leave
            </div>
          </DialogTrigger>
          {open ? <LeaveChat setOpen={setOpen} _id={chatDetail._id} /> : null}
        </Dialog>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col items-center">
        <div className="items-end flex mr-2">
          <div className="w-16 h-16 rounded-full relative cursor-pointer">
            {renderChatImage()}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-black text-center mt-4 cursor-pointer">
          {chatDetail.name}
        </h3>
      </div>

      <div className="mt-4 max-h-[calc(100%-185px)] overflow-auto">
        {renderMembers()}
        <div
          className="flex justify-between cursor-pointer py-3"
          onClick={() => setScreen("files")}
        >
          Attached files
          <ChevronRight size={18} color="#475467" />
        </div>
        <div
          className="flex justify-between cursor-pointer py-3"
          onClick={() => setScreen("pinned")}
        >
          View pinned chats
          <ChevronRight size={18} color="#475467" />
        </div>
        {renderActions()}
      </div>
    </>
  )
}

export default UserDetail
