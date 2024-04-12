import { FunctionComponent } from "react"
import { Metadata } from "next"
import dynamic from "next/dynamic"

export const metadata: Metadata = {
  title: "Feed",
  description: "Employee Experience Management - Feed",
}

const Feed = dynamic(() => import("@/modules/feed/component/Feed"))

interface FeedPageProps {}

const FeedPage: FunctionComponent<FeedPageProps> = () => {
  return (
    <div className="mx-auto max-w-[1607px] w-full">
      <Feed />
    </div>
  )
}

export default FeedPage
