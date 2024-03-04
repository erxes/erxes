import dynamic from "next/dynamic"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Discover',
  description: 'Employee Experience Management - Discover',
}

const Knowledgebase = dynamic(
  () => import("@/modules/discover/components/knowledgebase/Knowledgebase")
)

export default function IndexPage() {
  return <Knowledgebase />
}
