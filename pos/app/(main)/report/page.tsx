"use client"

import { isAdminAtom } from "@/store/config.store"
import { useLazyQuery } from "@apollo/client"
import { useAtom } from "jotai"
import { ShieldXIcon } from "lucide-react"

import ReportForm from "./components/form"
import Receipt from "./components/reciept"
import { queries } from "./graphql"

const Report = () => {
  const [getReport, { loading, data }] = useLazyQuery(queries.report)
  const { report } = data?.dailyReport || {}
  const isAdmin = useAtom(isAdminAtom)

  if (!isAdmin)
    return (
      <div className="flex flex-auto items-center justify-center shadow-inner bg-neutral-50">
        <div className="flex items-center flex-col shadow-xl py-12 px-20 rounded-lg bg-white">
          <ShieldXIcon
            className="h-16 w-16 text-neutral-600"
            strokeWidth={1.2}
          />
          <p className="mt-4">Permission denied</p>
        </div>
      </div>
    )

  return (
    <div className="flex flex-auto w-full px-5 py-4 print:w-[72mm] print:px-0 print:py-0 print:overflow-visible overflow-hidden print:block">
      <ReportForm getReport={getReport} loading={loading} />
      <Receipt report={report} />
    </div>
  )
}

export default Report
