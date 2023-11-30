"use client"

import { useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Image from "@/components/ui/image"
import { useUsers } from "@/components/hooks/useUsers"

import UsersList from "./UsersList"

const EventUsersAvatar = ({ eventData }: { eventData: any }): JSX.Element => {
  const { users } = useUsers({})
  const [open, setOpen] = useState(false)

  const goingUsers = users.filter((user) =>
    eventData.goingUserIds.includes(user._id)
  )

  if (goingUsers.length === 0) {
    return <></>
  }

  return (
    <Dialog open={open} onOpenChange={() => setOpen(!open)}>
      <DialogTrigger asChild={true}>
        <div className="flex items-center gap-2 mt-3">
          <div id="going users" className="flex -space-x-1">
            {goingUsers.slice(0, 5).map((user) => (
              <Image
                src={
                  user.details && user.details.avatar
                    ? user.details.avatar
                    : "/avatar-colored.svg"
                }
                alt="avatar"
                key={user._id}
                width={100}
                height={100}
                className="inline-block w-6 h-6 rounded-full object-cover ring-1 ring-primary cursor-pointer"
              />
            ))}
          </div>
          {goingUsers.length > 5 && <div>+ {goingUsers.length - 5} going</div>}
        </div>
      </DialogTrigger>
      <DialogContent className="p-0 gap-0 max-w-md">
        <DialogHeader className="border-b p-4">
          <DialogTitle className="flex justify-around">People</DialogTitle>
        </DialogHeader>
        <UsersList users={goingUsers} />
      </DialogContent>
    </Dialog>
  )
}

export default EventUsersAvatar
