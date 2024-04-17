import { FunctionComponent } from "react"
import type { Metadata } from "next"
import ChatList from "@/modules/chat/component/ChatList"

export const metadata: Metadata = {
  title: "Chats",
  description: "Employee Experience Management - Chats",
}

interface ChatLayoutProps {
  children: React.ReactNode
}

const ChatLayout: FunctionComponent<ChatLayoutProps> = (props) => {
  const { children } = props

  return (
    <>
      <div className="flex h-full w-1/5 flex-col border-r shrink-0">
        <ChatList />
      </div>
      {children}
    </>
  )
}

export default ChatLayout
