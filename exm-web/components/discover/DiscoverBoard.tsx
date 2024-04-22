import { FunctionComponent } from "react"
import { BookIcon, GlassesIcon } from "lucide-react"

import Banner from "../sharing/Banner"
import CategoryTabsList from "../sharing/CategoryTabsList"
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card"

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

      <CategoryTabsList topics={DISCOVER_TAB_TRIGGERS} path="discover" />

      <div className="grid grid-cols-5 mt-4 gap-4">
        {DISCOVER_TAB_TRIGGERS.map(() => {
          return (
            <Card>
              <CardHeader>
                <div className="flex text-base gap-1 text-primary-light">
                  <BookIcon size={24} />
                  <span>0 Articles</span>
                </div>
              </CardHeader>
              <CardContent className="text-lg">
                Эрхэт багийн тоглоомын дүрэм
              </CardContent>
              <CardFooter className="text-base text-primary-light">
                by MJ
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

const DISCOVER_TAB_TRIGGERS = [
  {
    value: "all",
    text: "Бүгд",
  },
  {
    value: "about-us",
    text: "Бидний тухай",
  },
  {
    value: "career",
    text: "Хүний нөөц, Карьер",
  },
  {
    value: "everyday",
    text: "Өдөр тутамд",
  },
  {
    value: "how-do-we-work",
    text: "Бид хэрхэн ажилладаг вэ?",
  },
]

export default DiscoverBoard
