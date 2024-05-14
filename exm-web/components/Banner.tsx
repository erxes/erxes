import { FunctionComponent } from "react"

import { Card, CardContent, CardHeader } from "./ui/card"

interface BannerProps {
  title: string
  content: React.ReactNode
}

const Banner: FunctionComponent<BannerProps> = (props) => {
  const { title, content } = props

  return (
    <Card className="bg-primary-light text-white flex justify-center flex-col items-center py-8 gap-4">
      <CardHeader className="text-6xl font-bold">{title}</CardHeader>
      <CardContent className="text-lg">{content}</CardContent>
    </Card>
  )
}

export default Banner
