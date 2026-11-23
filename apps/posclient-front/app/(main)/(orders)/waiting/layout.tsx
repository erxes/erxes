import { Hourglass } from "lucide-react"

import HeaderLayout from "@/components/header/headerLayout"
import HeaderTitle from "@/components/header/headerTitle"

const HistoryLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <HeaderLayout>
        <HeaderTitle href="/waiting" icon={Hourglass}>
          Хүлээлгийн дэлгэц
        </HeaderTitle>
      </HeaderLayout>
      <>{children}</>
    </>
  )
}

export default HistoryLayout
