import React from "react"
import { IUser } from "@/modules/auth/types"

import Image from "@/components/ui/image"

type Props = {
  user: IUser
}

const TypingIndicator = ({ user }: Props) => {
  return (
    <div className="flex gap-2 items-center">
      <div className="flex -space-x-1">
        <Image
          src={
            user.details && user.details.avatar
              ? user.details.avatar
              : "/avatar-colored.svg"
          }
          alt="avatar"
          width={100}
          height={100}
          className="inline-block w-11 h-11 rounded-full object-cover ring-1 ring-primary "
        />
      </div>
      <div className="p-2 bg-[#E4E6EB] rounded-lg h-6">
        <div className="flex gap-[2px]">
          <div className="w-[5px] h-[5px] bg-[#828589] rounded-full animate-bounce delay-50" />
          <div className="w-[5px] h-[5px] bg-[#828589] rounded-full animate-bounce delay-100" />
          <div className="w-[5px] h-[5px] bg-[#828589] rounded-full animate-bounce delay-150" />
        </div>
      </div>
    </div>
  )
}

export default TypingIndicator
