import { HistoryIcon } from "lucide-react"

import HeaderLayout from "@/components/header/headerLayout"
import HeaderTitle from "@/components/header/headerTitle"

const HistoryLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <HeaderLayout>
        <HeaderTitle href="/history" icon={HistoryIcon}>
          Захиалгын түүх
        </HeaderTitle>
      </HeaderLayout>
      <div className="flex-auto overflow-hidden">{children}</div>
    </>
  )
}

export default HistoryLayout
