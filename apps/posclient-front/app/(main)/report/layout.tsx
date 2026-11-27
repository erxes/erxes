import { FileBarChart2Icon } from "lucide-react"

import HeaderLayout from "@/components/header/headerLayout"
import HeaderTitle from "@/components/header/headerTitle"

const ReportLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <HeaderLayout>
        <HeaderTitle href="/report" icon={FileBarChart2Icon}>
          Тайлан
        </HeaderTitle>
      </HeaderLayout>
      {children}
    </>
  )
}

export default ReportLayout
