import { filterItemClass } from "@/modules/filter"
import { queries } from "@/modules/orders/graphql"
import { RecordSidePanel, usePanelWidth } from "@/modules/record-side-panel"
import { modeAtom } from "@/store"
import { detailIdAtom, openReturnDialogAtom } from "@/store/history.store"
import { useQuery } from "@apollo/client"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { Undo2Icon } from "lucide-react"

import { IOrderHistory, IPaidAmount } from "@/types/order.types"
import { CommandItem } from "@/components/ui/command"
import { Skeleton } from "@/components/ui/skeleton"

import ReturnForm from "./ReturnForm"

export const OrderReturnPanel = ({ orders }: { orders: IOrderHistory[] }) => {
  const [returnId, setReturnId] = useAtom(openReturnDialogAtom)
  const isMobile = useAtomValue(modeAtom) === "mobile"
  const [panelWidth, setPanelWidth] = usePanelWidth(
    "pos_order_detail_panel_width"
  )
  const order = orders.find(({ _id }) => _id === returnId)
  const { data, loading } = useQuery<{
    orderDetail?: { cashAmount?: number; paidAmounts?: IPaidAmount[] }
  }>(queries.historyItemDetail, {
    variables: { _id: returnId },
    skip: !returnId,
    fetchPolicy: "network-only",
  })

  if (!returnId || !order) return null

  return (
    <RecordSidePanel
      width={panelWidth}
      onWidthChange={isMobile ? undefined : setPanelWidth}
      expanded={isMobile || undefined}
      expandable={false}
    >
      <RecordSidePanel.Header
        avatar={
          <span className="flex size-7 flex-none items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Undo2Icon className="size-4" aria-hidden="true" />
          </span>
        }
        title={
          <span className="flex min-w-0 items-baseline gap-2">
            Буцаалт хийх
            <span className="truncate text-xs font-normal tabular-nums text-muted-foreground">
              {order.number}
            </span>
          </span>
        }
        onClose={() => setReturnId(null)}
      />
      {loading || !data ? (
        <div className="flex flex-col gap-2 p-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-7 w-full" />
          ))}
        </div>
      ) : (
        <ReturnForm
          key={returnId}
          totalAmount={order.totalAmount}
          _id={returnId}
          cashAmount={data.orderDetail?.cashAmount}
          paidAmounts={data.orderDetail?.paidAmounts}
        />
      )}
    </RecordSidePanel>
  )
}

export const OrderReturnTrigger = ({
  _id,
  paidDate,
  onSelect,
}: {
  _id: string
  paidDate: string | null
  onSelect: () => void
}) => {
  const changeOpen = useSetAtom(openReturnDialogAtom)
  const setDetailId = useSetAtom(detailIdAtom)

  return (
    <CommandItem
      value="return"
      className={filterItemClass}
      disabled={!paidDate}
      onSelect={() => {
        onSelect()
        setDetailId(null)
        changeOpen(_id)
      }}
    >
      <Undo2Icon />
      Буцаах
    </CommandItem>
  )
}
