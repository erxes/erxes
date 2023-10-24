"use client"

import React, { useEffect, useRef, useState } from "react"
import { useInView } from "react-intersection-observer"

import Loader from "@/components/ui/loader"

import { useChatMessages } from "../../hooks/useChatMessages"
import Editor from "./Editor"
import MessageItem from "./MessageItem"
import ReplyInfo from "./ReplyInfo"

const Messages = () => {
  const {
    chatMessages,
    loading,
    error,
    sendMessage,
    handleLoadMore,
    messagesTotalCount,
  } = useChatMessages()
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

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages])

  if (error) {
    return <div>Something went wrong</div>
  }

  if (loading) {
    return <div />
  }

  return (
    <div className="flex flex-col h-screen relative">
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-4 border-0 flex flex-col-reverse"
      >
        {chatMessages.map((message) => (
          <MessageItem
            key={message._id}
            message={message}
            setReply={setReply}
          />
        ))}

        {!loading && chatMessages.length < messagesTotalCount && (
          <div ref={ref}>
            <Loader />
          </div>
        )}
      </div>
      <ReplyInfo reply={reply} setReply={setReply} />
      <div className="p-4">
        <Editor sendMessage={sendMessage} reply={reply} setReply={setReply} />
      </div>
    </div>
  )
}

export default Messages
