"use client"

import { Suspense } from "react"
import { isAdminAtom, permissionConfigAtom } from "@/store/config.store"
import { useLazyQuery } from "@apollo/client"
import { useAtomValue } from "jotai"
import { FileBarChart2Icon, ReceiptTextIcon, ShieldXIcon } from "lucide-react"

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
      <h3 className="text-sm font-medium">Тайлан ачаалагдсангүй</h3>
      <p className="mt-1 max-w-xs text-[13px] text-muted-foreground">
        Шүүлтүүрээ өөрчлөх эсвэл «Шинэчлэх» дарж дахин оролдоно уу.
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
      <Suspense fallback={<div className="h-10 flex-none border-b" />}>
        <ReportForm getReport={getReport} loading={loading} />
      </Suspense>
      <div className="flex min-h-0 flex-auto flex-col print:block">
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
