"use client"

import { RefObject } from "react"
import { RelativeDateDisplay } from "@/modules/display"
import {
  RecordTable,
  RecordTableInlineAnchor,
  RecordTableInlineCell,
} from "@/modules/record-table"
import { ColumnDef } from "@tanstack/react-table"
import {
  CircleDotIcon,
  ClockIcon,
  FileDiffIcon,
  HashIcon,
  HistoryIcon,
  LayersIcon,
  UserIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"

import { getOrderAuditUserLabel, OrderAuditLog } from "../../graphql/orderAudit"
import { OrderLogItemAction } from "./OrderLogItemAction"
import {
  changeSummary,
  logDate,
  logTarget,
  ORDER_LOG_ACTIONS,
  sourceOf,
} from "./orderLogUtils"

const badgeClassName = "h-6 rounded-sm py-0"

const createColumns = (
  onOpen: (id: string) => void
): ColumnDef<OrderAuditLog>[] => [
  {
    id: "more",
    size: 33,
    enableHiding: false,
    enableResizing: false,
    header: () => null,
    cell: ({ row }) => (
      <OrderLogItemAction log={row.original} onOpen={onOpen} />
    ),
  },
  {
    id: "target",
    size: 190,
    header: () => <RecordTable.InlineHead icon={HashIcon} label="Объект" />,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <RecordTableInlineAnchor
          className="tabular-nums"
          onClick={() => onOpen(row.original._id)}
        >
          {logTarget(row.original)}
        </RecordTableInlineAnchor>
      </RecordTableInlineCell>
    ),
  },
  {
    id: "occurredAt",
    size: 170,
    header: () => <RecordTable.InlineHead icon={ClockIcon} label="Хэзээ" />,
    cell: ({ row }) => {
      const date = logDate(row.original)
      if (!date) return <RecordTableInlineCell />
      return (
        <RelativeDateDisplay value={date} asChild>
          <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
            <RelativeDateDisplay.Value value={date} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      )
    },
  },
  {
    id: "source",
    size: 130,
    header: () => (
      <RecordTable.InlineHead icon={LayersIcon} label="Эх үүсвэр" />
    ),
    cell: ({ row }) => {
      const source = sourceOf(row.original)
      return (
        <RecordTableInlineCell>
          <Badge variant={source.variant} className={badgeClassName}>
            {source.label}
          </Badge>
        </RecordTableInlineCell>
      )
    },
  },
  {
    id: "action",
    size: 130,
    header: () => (
      <RecordTable.InlineHead icon={CircleDotIcon} label="Үйлдэл" />
    ),
    cell: ({ row }) => {
      const action = row.original.action
        ? ORDER_LOG_ACTIONS[row.original.action]
        : null
      return (
        <RecordTableInlineCell>
          <Badge
            variant={action?.variant || "secondary"}
            className={badgeClassName}
          >
            {action?.label || "Тодорхойгүй"}
          </Badge>
        </RecordTableInlineCell>
      )
    },
  },
  {
    id: "user",
    size: 230,
    header: () => <RecordTable.InlineHead icon={UserIcon} label="Хэрэглэгч" />,
    cell: ({ row }) => {
      const label = getOrderAuditUserLabel(row.original)
      return (
        <RecordTableInlineCell>
          <span
            aria-hidden="true"
            className="inline-flex size-5 flex-none items-center justify-center rounded-full bg-muted text-[11px] uppercase text-muted-foreground"
          >
            {label.charAt(0)}
          </span>
          <span className="truncate">{label}</span>
        </RecordTableInlineCell>
      )
    },
  },
  {
    id: "changes",
    size: 300,
    header: () => (
      <RecordTable.InlineHead icon={FileDiffIcon} label="Өөрчлөлт" />
    ),
    cell: ({ row }) => (
      <RecordTableInlineCell className="text-xs tabular-nums text-muted-foreground">
        <span className="truncate">{changeSummary(row.original)}</span>
      </RecordTableInlineCell>
    ),
  },
]

export const OrderLogsTable = ({
  logs,
  loading,
  hasNextPage,
  onLoadMore,
  onOpen,
  scrollRef,
}: {
  logs: OrderAuditLog[]
  loading: boolean
  hasNextPage: boolean
  onLoadMore: () => void
  onOpen: (id: string) => void
  scrollRef: RefObject<HTMLDivElement | null>
}) => (
  <RecordTable.Provider
    columns={createColumns(onOpen)}
    data={logs}
    stickyColumns={["more", "target"]}
    tableId="pos_order_logs"
    className="h-full"
  >
    <RecordTable.Scroll ref={scrollRef}>
      <RecordTable>
        <RecordTable.Header showColumnSelector />
        <RecordTable.Body>
          {loading ? (
            <RecordTable.RowSkeleton rows={12} />
          ) : (
            <RecordTable.RowList />
          )}
          {!loading && hasNextPage && (
            <RecordTable.RowSkeleton
              rows={3}
              handleInView={onLoadMore}
              root={scrollRef}
            />
          )}
        </RecordTable.Body>
      </RecordTable>
    </RecordTable.Scroll>
    {!loading && !logs.length && (
      <div className="absolute inset-0 top-9 flex items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <HistoryIcon
            className="mb-6 h-12 w-12 text-zinc-400"
            strokeWidth={1.5}
          />
          <h3 className="text-base font-semibold text-foreground">
            Өөрчлөлтийн лог олдсонгүй
          </h3>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Шүүлтүүр эсвэл огноогоо өөрчлөөд дахин харна уу
          </p>
        </div>
      </div>
    )}
  </RecordTable.Provider>
)
