import dynamic from "next/dynamic"

const Discover = dynamic(() => import("@/modules/discover/components/Discover"))

export default function IndexPage() {
  return (
    <>
      <div className="flex h-full w-full flex-col">
        <Discover />
      </div>
    </>
  )
}
