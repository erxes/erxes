"use client"

import { Suspense } from "react"
import { coverPrintIdAtom } from "@/store/cover.store"
import { useQuery } from "@apollo/client"
import { useSetAtom } from "jotai"
import { PlusIcon } from "lucide-react"

import { Cover as ICover } from "@/types/cover.types"
import { useQueryState } from "@/lib/useQueryState"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import { CoverPrintPanel } from "./components/cover-print-panel"
import { CoverRecord } from "./components/cover-record"
import { CoversFilter } from "./components/covers-filter"
import { CoversRecordTable } from "./components/table"
import { queries } from "./graphql"
import { useCoversVariables } from "./hooks/useCoversVariables"

const Cover = () => {
  const { startDate, endDate, status } = useCoversVariables()
  const [coverId, setCoverId] = useQueryState<string>("id")
  const setPrintId = useSetAtom(coverPrintIdAtom)
  const openCover = (id: string) => {
    setPrintId(null)
    setCoverId(id)
  }
  const { data, previousData, loading } = useQuery<{ covers?: ICover[] }>(
    queries.covers,
    { variables: { startDate, endDate } }
  )

  const allCovers = data?.covers ?? previousData?.covers ?? []
  const covers = status
    ? allCovers.filter((cover) => cover.status === status)
    : allCovers
  const isLoading = loading && !previousData

  return (
    <div className="flex min-h-0 flex-auto overflow-hidden bg-background">
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-10 flex-none items-center gap-3 border-b bg-background px-4 py-1 md:pl-6 md:pr-4">
          <CoversFilter>
            <div className="h-7 whitespace-nowrap text-[13px] font-medium leading-7 text-muted-foreground">
              {isLoading ? (
                <Skeleton className="mt-1.5 inline-block h-4 w-20" />
              ) : (
                `${covers.length} хаалт олдлоо`
              )}
            </div>
          </CoversFilter>
          <Button
            type="button"
            onClick={() => openCover("create")}
            className="ml-auto h-7 flex-none gap-1.5 rounded px-2.5 text-[13px] font-medium"
          >
            <PlusIcon className="size-4" aria-hidden="true" />
            Хаалт нэмэх
          </Button>
        </div>
        <div className="min-h-0 flex-auto pb-3 pl-1 pt-3 md:pl-3 md:pr-1">
          <CoversRecordTable
            covers={covers}
            loading={isLoading}
            onOpen={openCover}
          />
        </div>
      </div>
      {coverId ? (
        <CoverRecord
          key={coverId}
          mode="panel"
          onClose={() => setCoverId(null)}
        />
      ) : (
        <CoverPrintPanel />
      )}
    </div>
  )
}

const CoverPage = () => (
  <Suspense fallback={null}>
    <Cover />
  </Suspense>
)

export default CoverPage
