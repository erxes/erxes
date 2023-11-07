"use client"

import { currentUserAtom } from "@/modules/JotaiProiveder"
import { useAtomValue } from "jotai"

import { useChatDetail } from "../hooks/useChatDetail"
import GroupDetail from "./GroupDetail"
import UserDetail from "./UserDetail"

const RightSideBar = ({
  setShowSidebar,
  showSidebar,
}: {
  setShowSidebar: () => void
  showSidebar: boolean
}) => {
  const currentUser = useAtomValue(currentUserAtom)
  const { chatDetail, loading } = useChatDetail()

  if (loading) {
    return null
  }

  const users: any[] = chatDetail?.participantUsers || []
  const user: any =
    users?.length > 1
      ? users?.filter((u) => u._id !== currentUser?._id)[0]
      : users?.[0]

  const renderGroup = () => {
    return (
      <GroupDetail setShowSidebar={setShowSidebar} chatDetail={chatDetail} />
    )
  }

  const renderDirect = () => {
    return <UserDetail setShowSidebar={setShowSidebar} user={user} />
  }

  return (
    <div
      className={`overflow-auto h-screen p-5 fixed top-0 right-0 transition-transform ${
        showSidebar ? "translate-x-[0%]" : "translate-x-[100%]"
      } w-[19%] bg-white border-l`}
    >
      {chatDetail?.type === "group" ? renderGroup() : renderDirect()}
    </div>
  )
}

export default RightSideBar
