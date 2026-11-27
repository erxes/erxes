"use client"

import { Suspense } from "react"
import { PROGRESS_FILTER_ID, showFilterAtom } from "@/store/progress.store"
import { useAtomValue } from "jotai"

import { ORDER_STATUSES } from "@/lib/constants"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"

import { OrdersFilter } from "../components/OrdersFilter"
import ActiveOrders from "../components/progress/ActiveOrders"

const Progress = () => {
  const showFilter = useAtomValue(showFilterAtom)

  return (
    <>
      <Collapsible open={showFilter}>
        <CollapsibleContent className="px-4 pt-3">
          <OrdersFilter
            id={PROGRESS_FILTER_ID}
            allowedStatuses={ORDER_STATUSES.ACTIVE}
          />
        </CollapsibleContent>
      </Collapsible>
      <ActiveOrders />
    </>
  )
}

const ProgressPage = () => (
  <Suspense fallback={null}>
    <Progress />
  </Suspense>
)

export default ProgressPage
