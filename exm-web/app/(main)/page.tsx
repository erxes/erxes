import dynamic from "next/dynamic"

const Feed = dynamic(() => import("@/modules/feed/component/Feed"))
const RightSideBar = dynamic(
  () => import("@/modules/feed/component/RightSideBar")
)

export default function IndexPage() {
  return (
    <>
      <div className="flex h-full w-full flex-col">
        <Feed />
      </div>
      <div className="flex w-1/3 flex-col border-l">
        <RightSideBar />
      </div>
    </>
  )
}
