import dynamic from "next/dynamic"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Feed',
  description: 'Employee Experience Management - Feed',
}

const Feed = dynamic(() => import("@/modules/feed/component/Feed"))

export default function IndexPage() {
  return (
    <>
      <div className="flex h-full w-[calc(100%-230px)] flex-col shrink-0">
        <Feed />
      </div>
    </>
  )
}
