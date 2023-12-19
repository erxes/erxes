"use client"

import { useState } from "react"
import RightSideBar from "@/modules/chat/component/RightSideBar"
import Messages from "@/modules/chat/component/messages/Messages"

export default function Detail() {
  const [showSidebar, setShowSidebar] = useState(false)

  const handleToggle = () => {
    setShowSidebar(!showSidebar)
  }

  return (
    <>
      <div className="w-message border-r shrink-0">
        <Messages setShowSidebar={handleToggle} showSidebar={showSidebar} />
      </div>
      {showSidebar && (
        <div className="flex h-full w-1/4 flex-col">
          <RightSideBar
            setShowSidebar={handleToggle}
            showSidebar={showSidebar}
          />
        </div>
      )}
    </>
  )
}
