"use client"

import { filterAtom, showFilterAtom } from "@/store/progress.store"
import { useAtom, useAtomValue } from "jotai"

import { ORDER_STATUSES } from "@/lib/constants"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"

import Filter from "../components/filter"
import ActiveOrders from "../components/progress/ActiveOrders"

const Progress = () => {
  const [filter, setFilter] = useAtom(filterAtom)
  const showFilter = useAtomValue(showFilterAtom)

  return (
    <>
      <Collapsible open={showFilter}>
        <CollapsibleContent className="pt-3">
          <Filter
            filter={filter}
            setFilter={setFilter}
            allowedStatuses={ORDER_STATUSES.ACTIVE}
          />
        </CollapsibleContent>
      </Collapsible>
      <ActiveOrders />
    </>
  )
}

export default Progress
