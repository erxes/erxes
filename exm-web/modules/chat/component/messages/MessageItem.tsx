"use client"

import React, { useMemo } from "react"
import dayjs from "dayjs"
import calendar from "dayjs/plugin/calendar"
import { useAtomValue } from "jotai"

import { Card } from "@/components/ui/card"
import Image from "@/components/ui/image"

import { currentUserAtom } from "../../../JotaiProiveder"
import { IChatMessage } from "../../types"

dayjs.extend(calendar)

const MessageItem = ({ message }: { message: IChatMessage }) => {
  const { relatedMessage, content, attachments, createdAt, createdUser } =
    message

  const currentUser = useAtomValue(currentUserAtom)

  const isMe = useMemo(
    () => currentUser?._id === createdUser._id,
    [createdUser]
  )

  const userDetail = createdUser.details || {}

  return (
    <div>
      <div className={`flex ${isMe ? "justify-end" : "justify-start"} h-full`}>
        <div className="items-end flex">
          {isMe ? null : (
            <div className="w-12 h-12 rounded-full mr-4 ">
              <Image
                src={userDetail.avatar}
                alt="avatar"
                width={60}
                height={60}
                className="w-10 h-10 rounded-full mb-2 object-cover"
              />
            </div>
          )}
        </div>
        <div className="m-2">
          <Card className="p-4 rounded-2xl">
            <div dangerouslySetInnerHTML={{ __html: content || "" }} />
          </Card>
        </div>

        <div className="items-end flex">
          {!isMe ? null : (
            <div className="w-12 h-12 rounded-full mr-4 ">
              <Image
                src={userDetail.avatar}
                alt="avatar"
                width={60}
                height={60}
                className="w-10 h-10 rounded-full mb-2 object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MessageItem
