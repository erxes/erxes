import React from "react"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { IUser } from "@/modules/auth/types"
import { useAtomValue } from "jotai"
import { ChevronLeft } from "lucide-react"

import Image from "@/components/ui/image"

type Props = {
  chatDetail: any
  setShowSidebar: () => void
}

const MessagesHeader = ({ chatDetail, setShowSidebar }: Props) => {
  const currentUser = useAtomValue(currentUserAtom) || ({} as IUser)
  const users: any[] = chatDetail?.participantUsers || []
  const user: any =
    users?.length > 1
      ? users?.filter((u) => u._id !== currentUser?._id)[0]
      : users?.[0]

  const renderAvatar = () => {
    if (chatDetail.type === "direct") {
      return (
        <Image
          src={
            user.details.avatar ? user.details.avatar : "/avatar-colored.svg"
          }
          alt="avatar"
          width={100}
          height={100}
          className="bg-blue-200 w-[40px] h-[40px] rounded-full object-cover ring-1 ring-black"
        />
      )
    }

    return chatDetail.participantUsers
      ?.slice(0, 2)
      ?.map((participant: any, index: number) => (
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
          className={`absolute top-${index * 4} right-${
            index * 6
          } w-[25px] h-[25px] rounded-full object-cover ring-1 ring-black`}
        />
      ))
  }

  return (
    <>
      <div className={`flex gap-2 items-center`}>
        <div className="relative shrink-0 w-[40px] h-[40px]">
          {renderAvatar()}
          <div className="indicator bg-success-foreground w-4 h-4 rounded-full border border-white mr-1 absolute bottom-[-3px] right-[-10px]" />
        </div>
        <div className="flex flex-col gap-0 ml-2">
          <div className="font-semibold text-[16px]">
            {chatDetail.type === "direct"
              ? chatDetail
                ? user.details.fullName
                : ""
              : chatDetail.name}
          </div>
          <div className="text-[12px] text-green-400">Active Now</div>
        </div>
      </div>
      <button
        className="bg-gray-200 rounded-full p-1 cursor-pointer"
        onClick={() => setShowSidebar()}
      >
        <ChevronLeft size={16} />
      </button>
    </>
  )
}

export default MessagesHeader
