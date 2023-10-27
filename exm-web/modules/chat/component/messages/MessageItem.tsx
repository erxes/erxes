"use client"

import React, { useMemo, useState } from "react"
import { IUser } from "@/modules/auth/types"
import dayjs from "dayjs"
import calendar from "dayjs/plugin/calendar"
import { useAtomValue } from "jotai"
import { Pin, PinOff, ReplyIcon } from "lucide-react"

import Image from "@/components/ui/image"

import { currentUserAtom } from "../../../JotaiProiveder"
import { useChatMessages } from "../../hooks/useChatMessages"
import { IChatMessage } from "../../types"
import ForwardMessage from "./ForwardMessage"
import MessageAttachmentSection from "./MessageAttachment"

dayjs.extend(calendar)

const MessageItem = ({
  message,
  setReply,
  type,
}: {
  message: IChatMessage
  setReply: (message: any) => void
  type: string
}) => {
  const { relatedMessage, content, attachments, createdUser } = message

  const { pinMessage } = useChatMessages()

  const currentUser = useAtomValue(currentUserAtom) || ({} as IUser)
  const [showAction, setShowAction] = useState(true)

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

  const messageContent = (content: string) => {
    const urlRegex =
      /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi
    return content.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" class="text-blue-500 font-bold">${url}</a>`
    })
  }

  const renderReplyText = () => {
    return (
      <div className="flex gap-2 text-xs text-[#444] font-medium whitespace-nowrap">
        <ReplyIcon size={16} />
        {isMe
          ? `You replied to ${
              relatedMessage.createdUser._id === createdUser._id
                ? "yourself"
                : userInfo
            } `
          : `
        ${userDetail.fullName || createdUser.email} replied to ${
              relatedMessage.createdUser._id === createdUser._id
                ? "themself"
                : userInfo
            }
        `}
      </div>
    )
  }

  const messageReplySection = (messageReplyContent: string) => {
    const style = isMe
      ? ` ${"bg-[#f8f8f8] text-[#000] rounded-lg"} font-medium`
      : ` ${"bg-[#F9F7FF] text-[#000] rounded-lg"} font-medium`
    return (
      <>
        {renderReplyText()}
        <div
          className={`${style} py-2.5 px-5 max-w-xs h-10 overflow-hidden truncate`}
          dangerouslySetInnerHTML={{ __html: messageReplyContent || "" }}
        />
      </>
    )
  }

  const messageSection = (messageSectionContent: string) => {
    const style = isMe
      ? ` ${"bg-primary-light text-[#fff] rounded-tr-none rounded-tl-lg rounded-br-lg rounded-bl-lg"}  font-medium`
      : ` ${"bg-[#F2F3F5] text-[#000] rounded-tl-none rounded-tr-lg rounded-br-lg rounded-bl-lg"} font-medium`
    return (
      <div
        className={`${style} py-2.5 px-5 max-w-md drop-shadow-md`}
        dangerouslySetInnerHTML={{ __html: messageSectionContent || "" }}
      />
    )
  }

  const renderPosition = () => {
    if (!userDetail.position) {
      return null
    }

    return (
      <span className="font-medium text-[#7B7B7B]">
        ({`${userDetail.position}`})
      </span>
    )
  }

  const renderNamePositions = () => {
    if (isMe || relatedMessage || type === "direct") {
      return null
    }

    return (
      <div className="flex gap-1 items-center">
        <span className="font-semibold text-[#000]">
          {userDetail.fullName || userDetail?.email}
        </span>
        {renderPosition()}
      </div>
    )
  }

  return (
    <>
      <div
        className={`w-full my-1 flex items-start gap-[10px]  ${
          isMe ? "flex-row-reverse" : "flex-row"
        }`}
        onMouseEnter={() => setShowAction(true)}
        onMouseLeave={() => setShowAction(false)}
      >
        <div className={`shrink-0 w-11 h-11 mt-auto`}>
          <Image
            src={userDetail.avatar ? userDetail.avatar : "/avatar-colored.svg"}
            alt="avatar"
            width={60}
            height={60}
            className="w-11 h-11 rounded-full object-cover border border-primary"
          />
        </div>

        <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
          {renderNamePositions()}

          <div
            className={`flex flex-col   ${isMe ? "items-end" : "items-start"}`}
          >
            <div className={`flex flex-col gap-1 `}>
              {relatedMessage &&
                messageReplySection(messageContent(relatedMessage.content))}
            </div>
            <div
              className={`flex gap-2 items-center ${
                isMe ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {messageSection(messageContent(content))}
              {showAction ? (
                <div
                  className={`flex gap-3 ${
                    isMe ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  <div className="p-2.5 bg-[#F2F2F2] rounded-full cursor-pointer">
                    <ReplyIcon size={16} onClick={() => setReply(message)} />
                  </div>{" "}
                  <div className="p-2.5 bg-[#F2F2F2] rounded-full cursor-pointer">
                    {message.isPinned ? (
                      <PinOff
                        size={16}
                        onClick={() => pinMessage(message._id)}
                      />
                    ) : (
                      <Pin size={16} onClick={() => pinMessage(message._id)} />
                    )}
                  </div>
                  <ForwardMessage content={content} attachments={attachments} />
                </div>
              ) : null}
            </div>
          </div>
          {attachments && attachments.length > 0 && (
            <MessageAttachmentSection attachments={attachments} />
          )}
        </div>
      </div>
      <div className={`flex justify-end mt-1`}>
        {message.seenList.map((item) => {
          if (currentUser._id === item.user._id) {
            return null
          }
          return (
            <Image
              key={item.user._id}
              src={item.user.details.avatar}
              alt="avatar"
              width={60}
              height={60}
              className="w-5 h-5 rounded-full object-cover p-1px"
            />
          )
        })}
      </div>
    </>
  )
}

export default MessageItem
