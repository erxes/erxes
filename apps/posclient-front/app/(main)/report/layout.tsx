import Link from "next/link"
import { FileBarChart2Icon } from "lucide-react"

import HeaderLayout from "@/components/header/headerLayout"

const ReportLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <HeaderLayout>
        <Link
          href="/report"
          className="inline-flex items-end text-sm font-semibold"
        >
          <FileBarChart2Icon className="mr-1" />
          Тайлан
        </Link>
      </HeaderLayout>
      {children}
    </>
  )
}

export default ReportLayout
