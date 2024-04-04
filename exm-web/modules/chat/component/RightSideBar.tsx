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
      <GroupDetail chatDetail={chatDetail} />
    )
  }

  const renderDirect = () => {
    return <UserDetail user={user} />
  }

  return (
    <div
      className={`overflow-auto h-screen p-5  transition-transform ${
        showSidebar ? "translate-x-[0%]" : "translate-x-[100%]"
      } bg-white`}
    >
      {chatDetail?.type === "group" ? renderGroup() : renderDirect()}
    </div>
  )
}

export default RightSideBar
