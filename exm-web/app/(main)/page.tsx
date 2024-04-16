import { FunctionComponent } from "react"

import TodaysClock from "@/components/TodaysClock"
import YourRequests from "@/components/YourRequests"

interface OverviewPageProps {}

const OverviewPage: FunctionComponent<OverviewPageProps> = () => {
  return (
    <div className="flex h-full w-[calc(100%-230px)] flex-col shrink-0 p-4">
      <div className="flex gap-5 max-w-[1607px] w-full mx-auto">
        <div className="flex-1 border rounded-2xl">
          <TodaysClock />
        </div>

        <YourRequests />
      </div>
    </div>
  )
}

export default OverviewPage
