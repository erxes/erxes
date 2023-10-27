"use client"

import { useState } from "react"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { IUser } from "@/modules/auth/types"
import { useAtomValue } from "jotai"
import { Bell, BellOff, ChevronRight, LogOut } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Image from "@/components/ui/image"
import { useToast } from "@/components/ui/use-toast"

import useChatsMutation from "../hooks/useChatsMutation"
import AddParticipant from "./AddParticipant"
import ParticipantList from "./ParticipantList"
import { GroupChatAction } from "./form/GroupChatAction"
import { PinnedMessages } from "./messages/PinnedMessages"

const UserDetail = ({
  chatDetail,
  setShowSidebar,
}: {
  chatDetail: any
  setShowSidebar: () => void
}) => {
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
  const [openMembers, setOpenMembers] = useState(false)
  const [openChangeName, setOpenChangeName] = useState(false)
  const [openChangeImage, setOpenChangeImage] = useState(false)
  const currentUser = useAtomValue(currentUserAtom)

  const renderPinnedMessage = () => {
    return <PinnedMessages />
  }

  const renderChatImage = (size?: string) => {
    if (chatDetail && chatDetail.featuredImage.length > 0) {
      return (
        <Image
          src={chatDetail.featuredImage[0]?.url}
          alt="avatar"
          width={60}
          height={60}
          className={`${
            size === "small" ? "w-10 h-10" : "w-20 h-20"
          } rounded-full object-cover border-primary border`}
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
          className={`${
            size === "small" ? "w-[25px] h-[25px]" : "w-[50px] h-[50px]"
          } rounded-full object-cover absolute right-0 border-primary border`}
        />
        <Image
          src={
            chatDetail.participantUsers[1].details?.avatar ||
            "/avatar-colored.svg"
          }
          alt="avatar"
          width={60}
          height={60}
          className={`${
            size === "small"
              ? "w-[25px] h-[25px] top-[14px]"
              : "w-[50px] h-[50px] top-[28px]"
          } rounded-full object-cover absolute  border-primary border`}
        />
      </div>
    )
  }

  const renderMembers = () => {
    const memberNames = chatDetail.participantUsers.map(
      (user: IUser) => (user.details.fullName || user.email) + ","
    )

    return (
      <Dialog
        open={openMembers}
        onOpenChange={() => setOpenMembers(!openMembers)}
      >
        <DialogTrigger asChild={true}>
          <div className="flex justify-between cursor-pointer text-black text-sm items-center">
            <div className="flex">
              <div className="w-10 h-10 mr-3">{renderChatImage("small")}</div>
              <div>
                <p>{chatDetail.participantUsers.length} members</p>
                <p className="truncate w-[150px] text-[#65676B] text-[12px]">
                  {memberNames}
                </p>
              </div>
            </div>
            <ChevronRight size={18} />
          </div>
        </DialogTrigger>

        <DialogContent className="p-0 gap-0 max-w-md">
          <DialogHeader className="border-b p-4">
            <DialogTitle className="flex justify-around">
              {chatDetail.participantUsers.length} Members
            </DialogTitle>
          </DialogHeader>
          <ParticipantList chat={chatDetail} />
        </DialogContent>
      </Dialog>
    )
  }

  const renderNameChangeAction = () => {
    return (
      <Dialog
        open={openChangeName}
        onOpenChange={() => setOpenChangeName(!openChangeName)}
      >
        <DialogTrigger asChild={true}>
          <h3 className="text-xl font-semibold text-[#444] text-center mt-4 mb-6 cursor-pointer">
            {chatDetail.name}
          </h3>
        </DialogTrigger>

        <GroupChatAction
          chat={chatDetail}
          setOpen={setOpenChangeName}
          type="name"
        />
      </Dialog>
    )
  }

  const renderFeatureImageChangeAction = () => {
    return (
      <Dialog
        open={openChangeImage}
        onOpenChange={() => setOpenChangeImage(!openChangeImage)}
      >
        <DialogTrigger asChild={true}>{renderChatImage()}</DialogTrigger>

        <GroupChatAction
          chat={chatDetail}
          setOpen={setOpenChangeImage}
          type="image"
        />
      </Dialog>
    )
  }

  const renderActions = () => {
    const muted = chatDetail.muteUserIds.includes(currentUser?._id)
    return (
      <div className="flex justify-around w-full">
        <AddParticipant chat={chatDetail} type="small" />
        <div className="flex flex-col items-center">
          <div
            className="bg-[#E6E6E6] rounded-lg p-3 text-[#9A9A9A] cursor-pointer w-fit"
            onClick={() => toggleMute(chatDetail._id)}
          >
            {muted ? <Bell size={16} /> : <BellOff size={16} />}
          </div>
          {muted ? "Unmute" : "Mute"}
        </div>
        <div className="flex flex-col items-center">
          <div className="bg-[#E6E6E6] rounded-lg p-3 text-[#9A9A9A] cursor-pointer">
            <LogOut size={16} />
          </div>
          Leave
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        className="bg-[#F2F2F2] p-1 rounded-full w-fit cursor-pointer"
        onClick={() => setShowSidebar()}
      >
        <ChevronRight size={18} />
      </div>

      <div className="flex flex-col items-center">
        <div className="items-end flex mr-2">
          <div className="w-20 h-20 rounded-full relative cursor-pointer">
            {renderFeatureImageChangeAction()}
            <div className="indicator bg-success-foreground w-4 h-4 rounded-full border border-white mr-1 absolute bottom-0 right-0" />
          </div>
        </div>

        {renderNameChangeAction()}
        {renderActions()}
      </div>

      <div className="mt-6">
        {renderMembers()}
        {renderPinnedMessage()}
      </div>
    </>
  )
}

export default UserDetail
