"use client"

import { useLazyQuery } from "@apollo/client"

import ReportForm from "./components/form"
import Receipt from "./components/reciept"
import { queries } from "./graphql"

const Report = () => {
  const [getReport, { loading, data }] = useLazyQuery(queries.report)
  const { report } = data?.dailyReport || {}
  return (
    <div className="flex flex-auto w-full px-5 py-4 print:w-[72mm] print:px-0 print:py-0 print:overflow-visible overflow-hidden print:block">
      <ReportForm getReport={getReport} loading={loading} />
      <Receipt report={report} />
    </div>
  )
}

export default Report
