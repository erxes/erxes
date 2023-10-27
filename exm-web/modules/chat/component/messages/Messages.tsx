"use client"

import React, { useEffect, useRef, useState } from "react"
import { ChevronLeft } from "lucide-react"
import { useInView } from "react-intersection-observer"

import Image from "@/components/ui/image"
import Loader from "@/components/ui/loader"

import { useChatDetail } from "../../hooks/useChatDetail"
import { useChatMessages } from "../../hooks/useChatMessages"
import Editor from "./Editor"
import MessageItem from "./MessageItem"
import MessagesHeader from "./MessagesHeader"
import TypingIndicator from "./TypingIndicator"

const Messages = ({ setShowSidebar, showSidebar }: { setShowSidebar: () => void, showSidebar: boolean }) => {
  const {
    chatMessages,
    loading,
    error,
    sendMessage,
    handleLoadMore,
    messagesTotalCount,
  } = useChatMessages()

  const { chatDetail } = useChatDetail()
  const chatContainerRef = useRef(null) as any
  const [reply, setReply] = useState<any>(null)

  const { ref, inView } = useInView({
    threshold: 0,
  })

  useEffect(() => {
    if (inView) {
      handleLoadMore()
    }
  }, [inView, handleLoadMore])

  if (error) {
    return <div>Something went wrong</div>
  }

  if (loading) {
    return <div />
  }

  return (
    <div className="flex flex-col h-screen relative">
      <div className="h-16 border-b flex items-center justify-between px-5">
        <MessagesHeader
          chatDetail={chatDetail}
          setShowSidebar={setShowSidebar}
        />
      </div>
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-5 border-0 flex flex-col-reverse scrollbar-hide "
      >
        {/* <div className="w-full pt-2">
          {chatDetail.participantUsers && (
            <TypingIndicator participants={chatDetail.participantUsers} />
          )}
        </div> */}
        {chatMessages.map((message) => (
          <MessageItem
            key={message._id}
            message={message}
            setReply={setReply}
            type={chatDetail.type}
          />
        ))}

        {!loading && chatMessages.length < messagesTotalCount && (
          <div ref={ref}>
            <Loader />
          </div>
        )}
      </div>

      <Editor sendMessage={sendMessage} reply={reply} setReply={setReply} showSidebar={showSidebar} />
    </div>
  )
}

export default Messages
