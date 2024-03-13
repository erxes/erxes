"use client"

import dynamic from "next/dynamic"

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
      <div className="flex h-full w-[calc(100%-230px)] flex-col">
        <div className="h-full px-[25px] pt-4">
          {renderDetail()}
        </div>
      </div>
    </>
  )
}
