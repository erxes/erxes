import { useState } from "react"
import { PinIcon } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Image from "@/components/ui/image"
import { useUsers } from "@/components/hooks/useUsers"

import { useTeamMembers } from "../hooks/useTeamMembers"
import FeedActions from "./FeedActions"
import CreatedDate from "./FeedCreatedTime"
import UsersList from "./UsersList"

export default function PostHeader({
  feed,
  userDetail,
  open,
  setOpen,
  isDetail,
}: {
  feed: any
  userDetail: any
  open: boolean
  isDetail: boolean
  setOpen: (state: boolean) => void
}) {
  const { users } = useUsers({})
  const { departments, loading: departmentLoading } = useTeamMembers({})
  const [userListOpen, setUserListOpen] = useState(false)

  const contentTypeBgColor =
    feed.contentType === "bravo" ? "bg-[#32D583]" : "bg-[#0BA5EC]"

  const renderRecipientUsers = () => {
    if (feed.recipientIds.length === 0 || !feed.recipientIds) {
      return null
    }

    if (departmentLoading) {
      return <div />
    }

    const recipientUsers = users.filter((u) =>
      feed.recipientIds.includes(u._id)
    )

    const recipientDepartments = departments.filter((u) =>
      feed.recipientIds.includes(u._id)
    )

    const more = () => {
      if (recipientUsers.length + recipientDepartments.length < 3) {
        return null
      }

      return (
        <>
          {" "}
          and {recipientUsers.length + recipientDepartments.length - 2} more
          people
        </>
      )
    }

    return (
      <Dialog
        open={userListOpen}
        onOpenChange={() => setUserListOpen(!userListOpen)}
      >
        <DialogTrigger asChild={true}>
          <span className="cursor-pointer text-primary">
            {recipientUsers.slice(0, 2).map((item) => {
              return (
                <span
                  key={Math.random()}
                  className="truncate max-w-[300px] inline-flex"
                >
                  @{item?.details?.fullName || item?.username || item?.email}
                  &nbsp;
                </span>
              )
            })}
            {recipientUsers.length < 2 &&
              recipientDepartments
                .slice(0, recipientUsers.length || 2)
                .map((item, index) => {
                  return (
                    <span
                      key={Math.random()}
                      className="truncate max-w-[300px] inline-flex"
                    >
                      @{item.title} &nbsp;
                    </span>
                  )
                })}
            {more()}
          </span>
        </DialogTrigger>
        <DialogContent className="p-0 gap-0 max-w-md">
          <DialogHeader className="border-b p-4">
            <DialogTitle className="flex justify-around">People</DialogTitle>
          </DialogHeader>
          <UsersList
            users={recipientUsers}
            departments={recipientDepartments}
          />
        </DialogContent>
      </Dialog>
    )
  }

  const addtionalInfo = () => {
    if (isDetail) {
      return null
    }

    return (
      <>
        <span className="text-[18px] text-[#98A2B3]">∙</span>
        <span
          className={`uppercase flex ${contentTypeBgColor} text-sm text-white px-2 py-1 rounded-full gap-[4px] items-center`}
        >
          {feed.isPinned && <PinIcon size={15} color={"#fff"} />}
          {feed.contentType}
        </span>
        {feed.contentType === "bravo" && renderRecipientUsers()}
      </>
    )
  }

  return (
    <div className="flex  justify-between px-4 pt-2">
      <div className="flex items-center">
        <Image
          src={userDetail?.avatar || "/avatar-colored.svg"}
          alt="User Profile"
          width={100}
          height={100}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="ml-2">
          <div className="text-base font-bold text-gray-700 flex items-center gap-[8px]">
            {userDetail?.fullName || userDetail?.username || userDetail?.email}
            {addtionalInfo()}
          </div>
          <div className="text-xs text-[#666] font-normal">
            <CreatedDate createdAt={feed.createdAt} />
          </div>
        </div>
      </div>

      <div className="flex cursor-pointer">
        <FeedActions feed={feed} open={open} setOpen={setOpen} isDetail={isDetail} />
      </div>
    </div>
  )
}
