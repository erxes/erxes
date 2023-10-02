"use client"

import React, { useMemo } from "react"
import dayjs from "dayjs"
import calendar from "dayjs/plugin/calendar"
import { useAtomValue } from "jotai"

import Avatar from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"

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
            <Avatar
              src={userDetail.avatar}
              alt="avatar"
              width={500}
              height={500}
              className="w-10 h-10 rounded-full mb-2"
            />
          )}
        </div>
        <div className="m-2">
          <Card className="p-4 rounded-2xl">
            <div dangerouslySetInnerHTML={{ __html: content || "" }} />
          </Card>
        </div>

        <div className="items-end flex">
          {!isMe ? null : (
            <Avatar
              src={userDetail.avatar}
              alt="avatar"
              width={500}
              height={500}
              className="w-10 h-10 rounded-full mb-2"
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default MessageItem
