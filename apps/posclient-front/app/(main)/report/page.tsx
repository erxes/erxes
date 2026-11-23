"use client"

import { reportEndDateAtom, reportStartDateAtom } from "@/store"
import { isAdminAtom, permissionConfigAtom } from "@/store/config.store"
import { useLazyQuery } from "@apollo/client"
import { format } from "date-fns"
import { useAtomValue } from "jotai"
import {
  CalendarIcon,
  FileBarChart2Icon,
  ReceiptTextIcon,
  ShieldXIcon,
} from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"

import ReportForm from "./components/form"
import Receipt from "./components/reciept"
import ReportSummary, { DailyReport } from "./components/summary"
import { queries } from "./graphql"

interface DailyReportResponse {
  dailyReport: {
    report: DailyReport
  }
}

interface ReportVariables {
  posUserIds?: string[]
  dateType?: string
  startDate: Date
  endDate: Date
}

const ReportPlaceholder = ({ loading }: { loading: boolean }) => {
  if (loading) {
    return (
      <div
        role="status"
        aria-label="Тайлан бэлдэж байна"
        className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-6"
      >
        <Skeleton className="h-6 w-24" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-lg" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-40 rounded-lg" />
          <Skeleton className="h-40 rounded-lg" />
        </div>
        <Skeleton className="h-56 rounded-lg" />
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-64 flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <FileBarChart2Icon className="size-5" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-medium">Тайлан гаргаагүй байна</h3>
      <p className="mt-1 max-w-xs text-[13px] text-muted-foreground">
        Зүүн талд ажилчид, хугацаагаа сонгоод «Тайлан шүүх» дарна уу.
      </p>
    </div>
  )
}

const Report = () => {
  const [getReport, { loading, data }] = useLazyQuery<
    DailyReportResponse,
    ReportVariables
  >(queries.report)
  const { report } = data?.dailyReport || {}
  const reportStartDate = useAtomValue(reportStartDateAtom)
  const reportEndDate = useAtomValue(reportEndDateAtom)
  const isAdmin = useAtomValue(isAdminAtom)
  const permissionConfig = useAtomValue(permissionConfigAtom)

  if (!isAdmin && !permissionConfig?.seeReport)
    return (
      <div className="flex flex-auto flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <ShieldXIcon className="size-5" aria-hidden="true" />
        </div>
        <h3 className="text-sm font-medium">Хандах эрхгүй</h3>
        <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">
          Тайлан харах эрхийг админаас авна уу.
        </p>
      </div>
    )

  return (
    <div className="flex min-h-0 w-full flex-auto flex-col overflow-hidden bg-background print:block print:w-[72mm] print:overflow-visible">
      <div className="flex h-10 flex-none items-center gap-2 border-b px-4 md:pl-6 md:pr-4 print:hidden">
        <FileBarChart2Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-[13px] font-medium">Тайлан</span>
        <span className="h-4 w-px bg-border" />
        <span className="rounded-md bg-muted px-2 py-1 text-[13px] font-medium">
          Өдрийн тайлан
        </span>
        {!!report && !!reportStartDate && !!reportEndDate && (
          <span className="ml-auto hidden items-center gap-1.5 text-xs tabular-nums text-muted-foreground sm:inline-flex">
            <CalendarIcon className="h-3.5 w-3.5" />
            {format(reportStartDate, "yyyy.MM.dd HH:mm")} –{" "}
            {format(reportEndDate, "yyyy.MM.dd HH:mm")}
          </span>
        )}
      </div>
      <div className="flex min-h-0 flex-auto flex-col md:flex-row print:block">
        <aside className="flex-none overflow-y-auto border-b bg-sidebar md:w-72 md:border-b-0 md:border-r print:hidden">
          <ReportForm getReport={getReport} loading={loading} />
        </aside>
        <div className="flex min-h-0 min-w-0 flex-auto flex-col overflow-y-auto xl:flex-row xl:overflow-hidden print:block print:overflow-visible">
          <main className="min-w-0 flex-auto xl:overflow-y-auto print:hidden">
            {report ? (
              <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-6">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-semibold">Тойм</h2>
                </div>
                <ReportSummary report={report} />
              </div>
            ) : (
              <ReportPlaceholder loading={loading} />
            )}
          </main>
          {!!report && (
            <aside className="flex flex-none flex-col border-t bg-sidebar xl:w-[22rem] xl:overflow-y-auto xl:border-l xl:border-t-0 print:block print:border-0 print:bg-transparent">
              <div className="flex h-10 flex-none items-center gap-2 border-b px-3 text-[13px] font-medium print:hidden">
                <ReceiptTextIcon className="h-4 w-4 text-muted-foreground" />
                Хэвлэх баримт
              </div>
              <div className="flex justify-center py-2 print:block print:py-0">
                <Receipt report={report} />
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}

export default Report
