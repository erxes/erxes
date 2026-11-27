import { ReactNode } from "react"
import { TimerResetIcon } from "lucide-react"

import HeaderLayout from "@/components/header/headerLayout"
import HeaderTitle from "@/components/header/headerTitle"

const CoverLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <HeaderLayout>
        <HeaderTitle href="/cover" icon={TimerResetIcon}>
          Хаалт / Cover
        </HeaderTitle>
      </HeaderLayout>
      {children}
    </>
  )
}

export default CoverLayout
