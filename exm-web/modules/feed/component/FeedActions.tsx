import { useState } from "react"
import dynamic from "next/dynamic"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { IUser } from "@/modules/auth/types"
import { useAtomValue } from "jotai"
import {
  AlertTriangleIcon,
  MoreHorizontalIcon,
  MoreVerticalIcon,
  PencilIcon,
  PinIcon,
  PinOff,
  TrashIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import LoadingPost from "@/components/ui/loadingPost"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import useFeedMutation from "../hooks/useFeedMutation"

const FeedForm = dynamic(() => import("./form/FeedForm"))

export default function FeedActions({
  feed,
  setOpen,
  open,
  isDetail,
}: {
  feed: any
  open: boolean
  isDetail: boolean
  setOpen: (state: boolean) => void
}) {
  const [formOpen, setFormOpen] = useState(false)

  const currentUser = useAtomValue(currentUserAtom) || ({} as IUser)

  if (currentUser._id !== feed.createdUser?._id) {
    return null
  }

  const callBack = (result: string) => {
    if (result === "success") {
      setOpen(false)
    }
  }

  const {
    deleteFeed,
    pinFeed,
    loading: mutationLoading,
  } = useFeedMutation({
    callBack,
  })

  const deleteAction = () => {
    const renderDeleteForm = () => {
      return (
        <DialogContent>
          {mutationLoading ? <LoadingPost text={"Deleting"} /> : null}

          <div className="flex flex-col items-center justify-center">
            <AlertTriangleIcon size={30} color={"#6569DF"} /> Are you sure?
          </div>

          <DialogFooter className="flex flex-col items-center justify-center sm:justify-center sm:space-x-2">
            <Button
              className="font-semibold rounded-full bg-[#F2F2F2] hover:bg-[#F2F2F2] text-black"
              onClick={() => setFormOpen(false)}
            >
              No, Cancel
            </Button>

            <Button
              type="submit"
              className="font-semibold rounded-full"
              onClick={() => deleteFeed(feed._id)}
            >
              Yes, I am
            </Button>
          </DialogFooter>
        </DialogContent>
      )
    }

    return (
      <>
        <Dialog open={formOpen} onOpenChange={() => setFormOpen(!formOpen)}>
          <DialogTrigger asChild={true} id="delete-form">
            <div className="text-destructive flex items-center">
              <TrashIcon size={16} className="mr-1" />
              Delete
            </div>
          </DialogTrigger>

          {renderDeleteForm()}
        </Dialog>
      </>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild={true}>
        <div
          className={`p-2 bg-white cursor-pointer ${
            feed.contentType === "event" && !isDetail
              ? "rounded-sm absolute top-[11px] right-[11px]"
              : "rounded-full"
          }`}
        >
          {feed.contentType === "event" ? (
            <MoreVerticalIcon size={16} />
          ) : (
            <MoreHorizontalIcon size={16} />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-3">
        {new Date(feed.eventData?.endDate || "") < new Date() ? null : (
          <div
            className="hover:bg-[#F0F0F0] p-2 rounded-md cursor-pointer text-[#444] text-xs flex items-center"
            onClick={() => pinFeed(feed._id)}
          >
            {feed.isPinned ? (
              <PinOff size={16} className="mr-1 text-black" />
            ) : (
              <PinIcon size={16} className="mr-1 text-black" />
            )}
            <span className="text-black font-medium">
              {feed.isPinned ? "UnPin" : "Pin"}
            </span>
          </div>
        )}
        <div className="hover:bg-[#F0F0F0] p-2 rounded-md cursor-pointer text-[#444] text-xs">
          <FeedForm contentType={feed.contentType || "post"} feed={feed} />
        </div>
        <div className="hover:bg-[#F0F0F0] p-2 rounded-md cursor-pointer text-xs">
          {deleteAction()}
        </div>
      </PopoverContent>
    </Popover>
  )
}
