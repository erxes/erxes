"use client"

import dynamic from "next/dynamic"

const RightSideBar = dynamic(
  () => import("@/modules/feed/component/RightSideBar")
)
const PostItem = dynamic(() => import("@/modules/feed/component/PostItem"))
const EventItem = dynamic(() => import("@/modules/feed/component/EventItem"))

export default function Detail() {
  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)
  const id = urlParams.get("id")
  const contentType = urlParams.get("contentType")

  const renderDetail = () => {
    if(contentType === 'event') {
      return <EventItem postId={id || ""} />
    }

    return <PostItem postId={id || ""} />
  }

  return (
    <>
      <div className="flex h-full w-[61%] flex-col">
        <div className="h-[65px] border-b border-[#eee] shrink-0" />
        <div className="bg-[#F8F9FA] h-full px-[25px]">
          {renderDetail()}
        </div>
      </div>
      <div className="flex w-[22%] shrink-0 flex-col">
        <RightSideBar />
      </div>
    </>
  )
}
