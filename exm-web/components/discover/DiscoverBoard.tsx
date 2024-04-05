import { FunctionComponent } from "react"
import { GlassesIcon } from "lucide-react"

import Banner from "../Banner"
import DiscoverTabs from "./DiscoverTabs"

interface DiscoverBoardProps {}

const DiscoverBoard: FunctionComponent<DiscoverBoardProps> = () => {
  return (
    <div className="mx-auto py-4 max-w-[1308px] w-full">
      <Banner
        title="EXM Гарын авлагагууд"
        content={
          <div className="flex gap-2 items-center">
            <GlassesIcon />
            <p>
              A knowledge-sharing help center designed specially for the erxes
              community
            </p>
          </div>
        }
      />

      <DiscoverTabs />
    </div>
  )
}

export default DiscoverBoard
