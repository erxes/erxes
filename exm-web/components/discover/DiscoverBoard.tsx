import { FunctionComponent } from "react"
import { GlassesIcon } from "lucide-react"

import Banner from "../sharing/Banner"
import CategoryTabsList from "../sharing/CategoryTabsList"

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

      <CategoryTabsList topics={[]} path="discover" />
    </div>
  )
}

export default DiscoverBoard
