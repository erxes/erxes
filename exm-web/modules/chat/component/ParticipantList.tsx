"use client"

import { currentUserAtom } from "@/modules/JotaiProiveder"
import { IUser } from "@/modules/auth/types"
import { useAtomValue } from "jotai"

import { IChat } from "../types"
import AddParticipant from "./AddParticipant"
import ParticipantItem from "./ParticipantItem"

const ParticipantList = ({ chat }: { chat: IChat }) => {
  const currentUser = useAtomValue(currentUserAtom) || ({} as IUser)

  const isAdmin =
    (chat?.participantUsers || []).find(
      (pUser) => pUser._id === currentUser._id
    )?.isAdmin || false

  return (
    <>
      <div className="px-6 pt-6 max-h-[70vh] overflow-auto">
        <div className="">
          {chat.participantUsers.map((user: any, index: number) => (
            <ParticipantItem
              key={index}
              participant={user}
              chatId={chat._id}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      </div>
      <div className="px-6 pb-6">
        <AddParticipant chat={chat} />
      </div>
    </>
  )
}

export default ParticipantList
