import { FunctionComponent } from "react"
import { Timer } from "lucide-react"

import { Button } from "./ui/button"

interface TodaysClockProps {}

const TodaysClock: FunctionComponent<TodaysClockProps> = () => {
  return (
    <div className="p-4 flex items-center flex-col gap-4 bg-white rounded-2xl">
      <div className="flex items-center w-full">
        <h3 className="text-2xl font-bold">Today's clock</h3>

        <div className="px-3 py-2 border rounded-xl ml-auto gap-2 flex items-center">
          <span className="text-[#667085]">Total work hours today</span>
          <b>00:00</b>
        </div>
      </div>

      <div className="w-[198px] h-[198px] rounded-full bg-primary flex flex-col items-center gap-4 justify-center text-white text-xl">
        <Timer size={66} />

        <b>Clock in</b>
      </div>
    </div>
  )
}

export default TodaysClock
