import dynamic from "next/dynamic"

const Feed = dynamic(() => import("@/modules/feed/component/Feed"))

const RightSideBar = dynamic(
  () => import("@/modules/feed/component/RightSideBar")
)

export default function IndexPage() {
  return (
    <>
      <div className="flex h-full w-[62%] flex-col">
        <Feed />
      </div>
      <div className="flex w-[22%] shrink-0 flex-col">
        <RightSideBar />
      </div>
    </>
  )
}
