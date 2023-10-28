import RightSideBar from "@/modules/chat/component/RightSideBar"
import Messages from "@/modules/chat/component/messages/Messages"

export default function Detail() {
  return (
    <>
      <div className="w-9/12 border-r">
        <Messages />
      </div>
      <div className="flex h-full w-1/4 flex-col">
        <RightSideBar />
      </div>
    </>
  )
}
