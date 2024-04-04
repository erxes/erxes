import { FunctionComponent } from "react"
import { BookOpenIcon, GlassesIcon, TrophyIcon } from "lucide-react"

import Banner from "../Banner"
import LearnTabs from "./LearnTabs"

interface LearnBoardProps {}

const LearnBoard: FunctionComponent<LearnBoardProps> = () => {
  return (
    <div className="mx-auto py-4 max-w-[1308px] w-full">
      <Banner
        title="Upgrade your skills and our online course"
        content={
          <div className="flex justify-center flex-col items-center gap-4">
            {BANNER_VALUES.map((item, index) => (
              <div key={index} className="flex gap-2 items-center">
                {item.icon}
                <p>{item.value}</p>
              </div>
            ))}
          </div>
        }
      />

      <LearnTabs />
    </div>
  )
}

const BANNER_VALUES = [
  {
    icon: <GlassesIcon />,
    value: `Keep learning and growing, and you'll eventually achieve your goals`,
  },
  {
    icon: <BookOpenIcon />,
    value: `Discover new skills and expand your knowledge with courses tailored to your specific needs and interests.`,
  },
  {
    icon: <TrophyIcon />,
    value: `Exams after a course are a valuable tool for instructors to assess student learning and understanding of the course material`,
  },
]

export default LearnBoard
