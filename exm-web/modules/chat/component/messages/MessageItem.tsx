"use client"

import React, { useMemo, useState } from "react"
import { IUser } from "@/modules/auth/types"
import dayjs from "dayjs"
import calendar from "dayjs/plugin/calendar"
import { useAtomValue } from "jotai"
import { ReplyIcon } from "lucide-react"

import { Card } from "@/components/ui/card"
import Image from "@/components/ui/image"
import { AttachmentWithChatPreview } from "@/components/AttachmentWithChatPreview"

import { currentUserAtom } from "../../../JotaiProiveder"
import { IChatMessage } from "../../types"

dayjs.extend(calendar)

const MessageItem = ({
  message,
  setReply,
}: {
  message: IChatMessage
  setReply: (message: any) => void
}) => {
  const { relatedMessage, content, attachments, createdAt, createdUser } =
    message

  const currentUser = useAtomValue(currentUserAtom) || ({} as IUser)
  const [showAction, setShowAction] = useState(false)

  const isMe = useMemo(
    () => currentUser?._id === createdUser._id,
    [createdUser]
  )

  const userDetail = createdUser.details || {}

  const userInfo =
    relatedMessage &&
    relatedMessage.createdUser &&
    (relatedMessage.createdUser.details.fullName ||
      relatedMessage.createdUser.email)

  const renderReplyText = () => {
    if (isMe) {
      return (
        <div className="text-xs text-[#444] font-medium">
          You replied to{" "}
          {relatedMessage.createdUser._id === currentUser._id
            ? "yourself"
            : userInfo}
        </div>
      )
    }

    return (
      <div className="text-xs text-[#444] font-medium">
        {(userDetail.fullName || createdUser.email) + "replied to "}
        {relatedMessage.createdUser._id === createdUser._id
          ? "themself"
          : userInfo}
      </div>
    )
  }

  return (
    <div className="mt-2">
      {relatedMessage && (
        <div
          className={`flex ${
            isMe ? "justify-end" : "justify-start"
          } text-xs text-[#444] font-medium`}
        >
          <div className="max-w-md">
            <div className="flex">
              <ReplyIcon size={16} /> {renderReplyText()}
            </div>
            <p className="truncate bg-[#ededfb] p-2 rounded-2xl">
              {relatedMessage.content}
            </p>
          </div>
        </div>
      )}

      <div
        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
        onMouseEnter={() => setShowAction(true)}
        onMouseLeave={() => setShowAction(false)}
      >
        <div className="flex items-end">
          {isMe ? null : (
            <div className="w-10 h-10 rounded-full mr-2 mb-2">
              <Image
                src={userDetail.avatar}
                alt="avatar"
                width={60}
                height={60}
                className="w-10 h-10 rounded-full object-cover"
              />
            </div>
          )}
        </div>

        <div
          className={`${
            isMe ? "flex-row" : "flex-row-reverse"
          } max-w-xs flex items-center`}
        >
          {showAction ? (
            <div className={`flex ${isMe ? "flex-row" : "flex-row-reverse"}`}>
              <ReplyIcon
                size={16}
                className={`${isMe ? "mr-1" : "ml-1"} cursor-pointer`}
                onClick={() => setReply(message)}
              />
            </div>
          ) : null}

          <div>
            {attachments && attachments.length > 0 ? (
              <>
                <Card className="p-4 rounded-2xl">
                  <div dangerouslySetInnerHTML={{ __html: content || "" }} />
                </Card>
                <AttachmentWithChatPreview
                  attachments={attachments}
                  className="m-2 overflow-x-auto w-60"
                  isDownload={true}
                />
              </>
            ) : (
              <Card className="p-4 rounded-2xl">
                <div dangerouslySetInnerHTML={{ __html: content || "" }} />
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MessageItem
