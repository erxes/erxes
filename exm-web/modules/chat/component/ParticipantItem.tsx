"use client"

import { useState } from "react"
import { IUser } from "@/modules/auth/types"
import { AlertTriangleIcon, ShieldOffIcon, UserXIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import Image from "@/components/ui/image"
import LoadingPost from "@/components/ui/loadingPost"

import useChatsMutation from "../hooks/useChatsMutation"

const ParticipantItem = ({
  participant,
  chatId,
  isAdmin,
}: {
  participant: IUser
  chatId: string
  isAdmin: boolean
}) => {
  const [open, setOpen] = useState(false)
  const [showAction, setShowAction] = useState(false)

  const callBack = (result: string) => {
    if (result === "success") {
      setOpen(false)
    }
  }

  const { makeOrRemoveAdmin, addOrRemoveMember, loading } = useChatsMutation({
    callBack,
  })

  const adminMutation = () => {
    makeOrRemoveAdmin(chatId, participant._id)
  }

  const userMutation = () => {
    addOrRemoveMember(chatId, "remove", [participant._id])
  }

  const renderActionButtons = () => {
    if (!isAdmin) {
      return null
    }

    const renderForm = () => {
      return (
        <DialogContent>
          {loading ? <LoadingPost /> : null}

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
              onClick={userMutation}
            >
              Yes, I am
            </Button>
          </DialogFooter>
        </DialogContent>
      )
    }

    return (
      <div className="flex">
        <div
          className="p-2 bg-[#F0F0F0] rounded-full cursor-pointer mr-2 z-10"
          onClick={adminMutation}
        >
          <ShieldOffIcon size={18} />
        </div>
        <Dialog open={open} onOpenChange={() => setOpen(!open)}>
          <DialogTrigger asChild={true}>
            <div className="p-2 bg-[#F0F0F0] rounded-full cursor-pointer mr-2 z-10">
              <UserXIcon size={18} />
            </div>
          </DialogTrigger>

          {renderForm()}
        </Dialog>
      </div>
    )
  }

  return (
    <div
      className="mt-4"
      onMouseEnter={() => setShowAction(true)}
      onMouseLeave={() => setShowAction(false)}
    >
      <div className="flex items-center justify-between mb-2 p-2 hover:bg-[#F0F0F0]">
        <div className="flex items-center">
          <div className="items-end flex mr-2">
            <div className="w-12 h-12 rounded-full">
              <Image
                src={
                  (participant && participant.details?.avatar) ||
                  "/avatar-colored.svg"
                }
                alt="avatar"
                width={60}
                height={60}
                className="w-12 h-12 rounded-full object-cover"
              />
            </div>
          </div>

          <div className="">
            <p className="text-sm font-semibold text-[#444]">
              {participant?.details?.fullName || participant?.email}
            </p>
            <p className="text-xs font-medium text-[#444]">
              {participant.isAdmin ? "Admin " : ""}
              {participant?.details?.position || ""}
            </p>
          </div>
        </div>
        {showAction ? renderActionButtons() : null}
      </div>
    </div>
  )
}

export default ParticipantItem
