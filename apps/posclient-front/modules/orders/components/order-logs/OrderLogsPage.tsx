"use client"

import { Suspense, useCallback, useRef, useState } from "react"
import { isAdminAtom } from "@/store/config.store"
import { useQuery } from "@apollo/client"
import { useAtomValue } from "jotai"
import { HistoryIcon, LockIcon, RefreshCwIcon } from "lucide-react"

import { useQueryState } from "@/lib/useQueryState"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { onError, toast } from "@/components/ui/use-toast"
import HeaderLayout from "@/components/header/headerLayout"
import HeaderTitle from "@/components/header/headerTitle"

import { OrderAuditLog, orderAuditLogs } from "../../graphql/orderAudit"
import { OrderLogPanel } from "./OrderLogPanel"
import { OrderLogsFilter } from "./OrderLogsFilter"
import { OrderLogsTable } from "./OrderLogsTable"
import {
  ORDER_LOGS_PER_PAGE,
  useOrderLogsVariables,
} from "./useOrderLogsVariables"

type OrderLogsData = { orderChangeLogs: OrderAuditLog[] }

const OrderLogsList = ({
  variables,
}: {
  variables: ReturnType<typeof useOrderLogsVariables>
}) => {
  const [logId, setLogId] = useQueryState<string>("log")
  const [extraLogs, setExtraLogs] = useState<OrderAuditLog[]>([])
  const [nextPage, setNextPage] = useState(2)
  const [lastPageFull, setLastPageFull] = useState(true)
  const requestedPage = useRef(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data, loading, refetch, fetchMore } = useQuery<OrderLogsData>(
    orderAuditLogs,
    {
      variables: { ...variables, page: 1, perPage: ORDER_LOGS_PER_PAGE },
      fetchPolicy: "network-only",
      pollInterval: 10000,
      notifyOnNetworkStatusChange: false,
      onError({ message }) {
        onError(message)
      },
    }
  )

  const firstPage = data?.orderChangeLogs || []
  const seen = new Set<string>()
  const logs = [...firstPage, ...extraLogs].filter((log) => {
    if (seen.has(log._id)) return false
    seen.add(log._id)
    return true
  })
  const hasNextPage = firstPage.length === ORDER_LOGS_PER_PAGE && lastPageFull
  const isLoading = loading && !data

  const loadMore = useCallback(() => {
    if (requestedPage.current === nextPage) return
    requestedPage.current = nextPage
    fetchMore({
      variables: { page: nextPage },
      updateQuery: (previous) => previous,
    })
      .then(({ data: more }) => {
        const page = more?.orderChangeLogs || []
        setExtraLogs((current) => [...current, ...page])
        setNextPage((current) => current + 1)
        setLastPageFull(page.length === ORDER_LOGS_PER_PAGE)
      })
      .catch((error: unknown) =>
        onError(error instanceof Error ? error.message : String(error))
      )
  }, [fetchMore, nextPage])

  const openLog = logs.find((log) => log._id === logId)

  const [refreshing, setRefreshing] = useState(false)
  const handleRefresh = () => {
    setRefreshing(true)
    refetch()
      .then(({ data: fresh }) =>
        toast({
          title: "Лог шинэчлэгдлээ",
          description: `${fresh?.orderChangeLogs?.length ?? 0} лог ачааллаа`,
          variant: "success",
        })
      )
      .catch((error: unknown) =>
        onError(error instanceof Error ? error.message : String(error))
      )
      .finally(() => setRefreshing(false))
  }

  return (
    <div className="flex min-h-0 flex-auto overflow-hidden bg-background">
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-10 flex-none items-center gap-3 border-b bg-background px-4 py-1 md:pl-6 md:pr-4">
          <OrderLogsFilter>
            <div className="h-7 whitespace-nowrap text-[13px] font-medium leading-7 text-muted-foreground">
              {isLoading ? (
                <Skeleton className="mt-1.5 inline-block h-4 w-20" />
              ) : (
                `${logs.length}${hasNextPage ? "+" : ""} лог`
              )}
            </div>
          </OrderLogsFilter>
          <Button
            type="button"
            variant="outline"
            disabled={refreshing}
            onClick={handleRefresh}
            className="ml-auto h-7 flex-none gap-1.5 rounded px-2.5 text-[13px] font-medium"
          >
            <RefreshCwIcon
              className={refreshing ? "size-4 animate-spin" : "size-4"}
              aria-hidden="true"
            />
            Шинэчлэх
          </Button>
        </div>
        <div className="min-h-0 flex-auto pb-3 pl-1 pt-3 md:pl-3 md:pr-1">
          <OrderLogsTable
            logs={logs}
            loading={isLoading}
            hasNextPage={hasNextPage}
            onLoadMore={loadMore}
            onOpen={setLogId}
            scrollRef={scrollRef}
          />
        </div>
      </div>
      {openLog && (
        <OrderLogPanel
          key={openLog._id}
          log={openLog}
          onClose={() => setLogId(null)}
        />
      )}
    </div>
  )
}

const OrderLogs = () => {
  const variables = useOrderLogsVariables()

  return <OrderLogsList key={JSON.stringify(variables)} variables={variables} />
}

export const OrderLogsPage = () => {
  const isAdmin = useAtomValue(isAdminAtom)

  return (
    <>
      <HeaderLayout>
        <HeaderTitle href="/order-logs" icon={HistoryIcon}>
          Өөрчлөлтийн лог
        </HeaderTitle>
      </HeaderLayout>
      {isAdmin ? (
        <Suspense fallback={null}>
          <OrderLogs />
        </Suspense>
      ) : (
        <div className="flex flex-auto flex-col items-center justify-center px-6 py-20 text-center">
          <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <LockIcon className="size-5" aria-hidden="true" />
          </div>
          <h2 className="text-sm font-medium">Хандах эрхгүй</h2>
          <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">
            Өөрчлөлтийн логийг зөвхөн админ эрхтэй хэрэглэгч харна.
          </p>
        </div>
      )}
    </>
  )
}
