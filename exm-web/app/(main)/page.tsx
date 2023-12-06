import dynamic from "next/dynamic"

const Feed = dynamic(() => import("@/modules/feed/component/Feed"))

const RightSideBar = dynamic(
  () => import("@/modules/feed/component/RightSideBar")
)

export default function IndexPage() {
  return (
    <>
      <div className="flex h-full w-[61%] flex-col shrink-0">
        <Feed />
      </div>
      <div className="flex w-[22%] shrink-0 flex-col">
        <RightSideBar />
      </div>
    </>
  )
}
