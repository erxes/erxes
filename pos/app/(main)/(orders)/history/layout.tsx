import Link from "next/link"
import { HistoryIcon } from "lucide-react"

import HeaderLayout from "@/components/header/headerLayout"

const HistoryLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <HeaderLayout>
        <Link
          className="inline-flex items-end text-sm font-semibold"
          href={"/cover"}
        >
          <HistoryIcon className="mr-1" />
          Захиалгын түүх
        </Link>
      </HeaderLayout>
      <div className="flex-auto overflow-hidden">{children}</div>
    </>
  )
}

export default HistoryLayout
