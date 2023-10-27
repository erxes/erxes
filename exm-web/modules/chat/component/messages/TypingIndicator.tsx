import React, { ReactNode } from "react"

import Image from "@/components/ui/image"

type Props = {
  participants: any[]
}

const TypingIndicator = ({ participants }: Props) => {
  return (
    <div className="flex gap-2 items-center">
      <div className="flex -space-x-1">
        {participants?.map((participant, index) => (
          <Image
            key={index}
            src={
              participant.details.avatar
                ? participant.details.avatar
                : "/avatar-colored.svg"
            }
            alt="avatar"
            width={100}
            height={100}
            className="inline-block w-11 h-11 rounded-full object-cover ring-1 ring-primary "
          />
        ))}
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
