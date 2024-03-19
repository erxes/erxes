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
      <div
        className={`${
          showSidebar ? "w-[calc(60%-230px)]" : "w-[calc(80%-230px)]"
        } border-r shrink-0`}
      >
        <Messages setShowSidebar={handleToggle} />
      </div>
      {showSidebar && (
        <div className="flex w-1/5 flex-col">
          <RightSideBar
            setShowSidebar={handleToggle}
            showSidebar={showSidebar}
          />
        </div>
      )}
    </>
  )
}
