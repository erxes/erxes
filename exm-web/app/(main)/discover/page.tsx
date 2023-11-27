import dynamic from "next/dynamic"

const Knowledgebase = dynamic(
  () => import("@/modules/discover/components/knowledgebase/Knowledgebase")
)

export default function IndexPage() {
  return <Knowledgebase />
}
