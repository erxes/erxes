import { FunctionComponent } from "react"
import type { Metadata } from "next"

import DiscoverBoard from "@/components/discover/DiscoverBoard"

export const metadata: Metadata = {
  title: "Discover",
  description: "Employee Experience Management - Discover",
}

interface DiscoverPageProps {}

const DiscoverPage: FunctionComponent<DiscoverPageProps> = () => {
  return <DiscoverBoard />
}

export default DiscoverPage
