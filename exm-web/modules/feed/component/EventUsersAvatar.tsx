"use client"

import Image from "@/components/ui/image"
import { useUsers } from "@/components/hooks/useUsers"

const EventUsersAvatar = ({ eventData }: { eventData: any }) => {
  const { users } = useUsers({})

  const goingUsers = users.filter((user) =>
    eventData.goingUserIds.includes(user._id)
  )

  return (
    goingUsers.length > 0 && (
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
              className="inline-block w-6 h-6 rounded-full object-cover ring-1 ring-primary "
            />
          ))}
        </div>
        {goingUsers.length > 5 && <div>+ {goingUsers.length - 5} going</div>}
      </div>
    )
  )
}

export default EventUsersAvatar
