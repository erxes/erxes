"use client"

import { currentUserAtom } from "@/modules/JotaiProiveder"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { useAtomValue } from "jotai"
import { ArrowLeft, MessageCircle } from "lucide-react"

import Image from "@/components/ui/image"

import useChatsMutation from "../../hooks/useChatsMutation"
import { usePinnedChats } from "../../hooks/usePinnedChats"
import MessageAttachmentSection from "./MessageAttachment"

dayjs.extend(relativeTime)

export const PinnedMessages = ({
  setScreen,
}: {
  setScreen: (type: string) => void
}) => {
  const { chatPinnedMessages } = usePinnedChats()
  const currentUser = useAtomValue(currentUserAtom)

  const { pinMessage } = useChatsMutation({
    callBack: (result: string) => {},
  })

  const messageContent = (text: string) => {
    const urlRegex =
      /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi
    return text.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" class="text-blue-500 font-bold">${url}</a>`
    })
  }

  const renderPinnedMessages = () => {
    if (chatPinnedMessages.length === 0) {
      return (
        <div className="flex justify-center items-center flex-col p-4 mb-4">
          <MessageCircle size={25} className="mb-2" />
          <p>There is no pinned message</p>
        </div>
      )
    }

    return chatPinnedMessages.map((message: any) => {
      const { createdAt, createdUser, _id, content, attachments } = message

      const renderContent = () => {
        if (content === "<p></p>" || !content) {
          return null
        }

        const isMe = currentUser?._id === message.createdUser._id

        return (
          <div className="flex justify-between">
            <div
              className={`${isMe ? "bg-[#F9FAFB]" : "bg-[#2970FF]"} ${
                !isMe && "text-white"
              } p-2 rounded-lg w-fit border border-exm`}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: messageContent(content) || "",
                }}
                className="truncate whitespace-wrap"
              />
            </div>
            <div onClick={() => pinMessage(message._id)} />
          </div>
        )
      }

      return (
        <div key={_id} className="mb-5">
          <div className="flex mb-4">
            <div className="items-start mt-8 flex mr-1">
              <div className="w-10 h-10 rounded-full relative">
                <Image
                  src={
                    (createdUser && createdUser.details?.avatar) ||
                    "/avatar-colored.svg"
                  }
                  alt="avatar"
                  width={60}
                  height={60}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </div>
            </div>
            <div className={`text-[#444] w-[calc(100%-45px)]`}>
              <div className="flex justify-between items-center mb-2">
                <p className="w-4/5 truncate text-base">
                  {createdUser?.details.fullName || createdUser?.email}
                </p>
                <p className="text-xs">
                  {createdAt && dayjs(createdAt).format("MMM D")}
                </p>
              </div>
              {renderContent()}
              {attachments && attachments.length > 0 && (
                <MessageAttachmentSection
                  attachments={attachments}
                  isPinned={true}
                />
              )}
            </div>
          </div>
        </div>
      )
    })
  }

  return (
    <>
      <div
        className="flex text-[#475467] font-medium text-base items-center gap-3 mb-5 cursor-pointer"
        onClick={() => setScreen("main")}
      >
        <ArrowLeft size={18} color="#475467" /> Pinned chats
      </div>
      <div className="overflow-y-auto max-h-[calc(100%-90px)]">
        {renderPinnedMessages()}
      </div>
    </>
  )
}
