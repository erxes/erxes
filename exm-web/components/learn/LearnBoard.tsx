import { FunctionComponent } from "react"
import {
  ArrowRightIcon,
  BookIcon,
  BookOpenIcon,
  GlassesIcon,
  TrophyIcon,
} from "lucide-react"

import Image from "@/components/ui/image"

import Banner from "../sharing/Banner"
import CategoryTabsList from "../sharing/CategoryTabsList"
import { Button } from "../ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card"

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

      <CategoryTabsList path="learn" topics={LEARN_TABS_TRIGGER} />

      <div className="grid grid-cols-5 mt-4 gap-4">
        {LEARN_TABS_TRIGGER.map(() => {
          return (
            <Card className="overflow-hidden">
              <CardHeader className="p-0 ">
                <div className="bg-[url('/auth-cover.png')] bg-cover flex justify-center">
                  <Image
                    alt=""
                    src="/erxes-logo-white.svg"
                    height={100}
                    width={200}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex text-base gap-1 text-primary-light">
                  <BookIcon size={24} />
                  <span>0 Articles</span>
                </div>

                <div className="text-lg">Эрхэт багийн тоглоомын дүрэм</div>

                <div className="text-base text-primary-light">by MJ</div>
              </CardContent>

              <CardFooter>
                <Button className="ml-auto">
                  <span className="text-sm">Start</span>
                  <ArrowRightIcon size={20} />
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

const LEARN_TABS_TRIGGER = [
  {
    value: "all",
    text: "Бүгд",
  },
  {
    value: "business",
    text: "Business",
  },
  {
    value: "technology",
    text: "Technology",
  },
  {
    value: "art-design",
    text: "Art&Design",
  },
  {
    value: "languages",
    text: "Languages",
  },
]

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
