import dynamic from "next/dynamic"

const Timeclocks = dynamic(
  () => import("@/modules/timeclock/component/Timeclocks")
)

export default function IndexPage() {
  return (
    <>
      <div className="flex h-full w-full flex-col">
        <Timeclocks />
      </div>
    </>
  )
}
