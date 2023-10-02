import RightSideBar from "@/modules/chat/component/RightSideBar"
import Messages from "@/modules/chat/component/messages/Messages"

export default function Detail() {
  return (
    <>
      <div className="w-full border-r">
        <Messages />
      </div>
      <div className="flex h-full w-1/3 flex-col">
        <RightSideBar />
      </div>
    </>
  )
}
