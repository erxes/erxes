"use client"

import { useState } from "react"
import { IUser } from "@/modules/auth/types"
import dayjs from "dayjs"
import {
  AlertTriangleIcon,
  MoreHorizontalIcon,
  XCircleIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
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

import { useReactionMutaion } from "../hooks/useReactionMutation"
import { IComment } from "../types"

const CommentItem = ({
  comment,
  currentUserId,
}: {
  comment: IComment
  currentUserId: string
}) => {
  const [open, setOpen] = useState(false)
  const [showAction, setShowAction] = useState(false)

  const user = comment.createdUser || ({} as IUser)
  const userDetail = user.details

  const callBack = (result: string) => {
    if (result === "success") {
      setOpen(false)
    }
  }

  const { deleteComment, loading } = useReactionMutaion({
    callBack,
  })

  const deleteMutation = () => {
    deleteComment(comment._id)
  }

  const renderActionButtons = () => {
    if (currentUserId !== user._id) {
      return null
    }

    const renderForm = () => {
      return (
        <DialogContent>
          {loading ? <LoadingPost text="Loading" /> : null}

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
              onClick={deleteMutation}
            >
              Yes, I am
            </Button>
          </DialogFooter>
        </DialogContent>
      )
    }

    return (
      <Popover>
        <PopoverTrigger asChild={true} className="cursor-pointer">
          <MoreHorizontalIcon size={18} className="ml-2" />
        </PopoverTrigger>
        <PopoverContent className="w-44 p-3">
          <div>
            <Dialog open={open} onOpenChange={() => setOpen(!open)}>
              <DialogTrigger asChild={true}>
                <div className="hover:bg-[#F0F0F0] p-2 rounded-md cursor-pointer text-xs flex items-center">
                  <XCircleIcon size={18} className="mr-1" /> Delete comment
                </div>
              </DialogTrigger>

              {renderForm()}
            </Dialog>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <div
      className="flex items-center mt-2"
      onMouseEnter={() => setShowAction(true)}
      onMouseLeave={() => setShowAction(false)}
    >
      <div className="flex items-start">
        <Image
          src={userDetail?.avatar || "/user.png"}
          alt="User Profile"
          width={100}
          height={100}
          className="w-8 h-8 rounded-full shrink-0"
        />

        <div className="ml-3">
          <div className="bg-[#F8F9FA] py-1 px-2 rounded-lg">
            <div className="text-sm font-bold text-gray-700">
              {userDetail?.fullName || user?.username || user?.email}
            </div>
            <p>{comment?.comment || ""}</p>
          </div>
        </div>
      </div>

      {showAction && renderActionButtons()}
    </div>
  )
}

export default CommentItem
