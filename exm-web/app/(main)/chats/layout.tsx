import ChatList from "@/modules/chat/component/ChatList"

interface ILayoutProps {
  children: React.ReactNode
}

export default function ChatLayout({ children }: ILayoutProps) {
  return (
    <>
      <div className="flex h-full w-1/4 flex-col border-r shrink-0">
        <ChatList />
      </div>
      {children}
    </>
  )
}
