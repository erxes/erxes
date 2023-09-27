import { ReactNode } from "react"
import Link from "next/link"
import { TimerResetIcon } from "lucide-react"

import HeaderLayout from "@/components/header/headerLayout"

const CoverLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <HeaderLayout>
        <Link
          className="inline-flex items-end text-sm font-semibold"
          href={"/cover"}
        >
          <TimerResetIcon className="mr-1" />
          Хаалт / Cover
        </Link>
      </HeaderLayout>
      {children}
    </>
  )
}

export default CoverLayout
