import dynamic from "next/dynamic"
import Knowledgebase from "@/modules/discover/components/knowledgebase/Knowledgebase"

const Discover = dynamic(() => import("@/modules/discover/components/Discover"))

export default function IndexPage() {
  return (
    <>
      <div className="flex h-full w-full flex-col">
        <Knowledgebase />
      </div>
    </>
  )
}
