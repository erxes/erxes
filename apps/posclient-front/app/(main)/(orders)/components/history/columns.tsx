import { RelativeDateDisplay } from "@/modules/display"
import {
  RecordTable,
  RecordTableInlineAnchor,
  RecordTableInlineCell,
} from "@/modules/record-table"
import { detailIdAtom, openReturnDialogAtom } from "@/store/history.store"
import { CellContext, ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { useSetAtom } from "jotai"
import {
  CalendarClockIcon,
  CalendarIcon,
  CalendarPlusIcon,
  CircleDotIcon,
  CoinsIcon,
  HashIcon,
  TagIcon,
  UserIcon,
} from "lucide-react"

import { IOrderHistory } from "@/types/order.types"
import { typeTextDef } from "@/lib/constants"
import { Badge, BadgeProps } from "@/components/ui/badge"

import HistoryItemAction from "./historyItemAction"

const relativeDate = (info: CellContext<IOrderHistory, unknown>) => {
  const value = info.getValue() as string | undefined
  if (!value) return <RecordTableInlineCell />

  return (
    <RelativeDateDisplay value={value} asChild>
      <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
        <RelativeDateDisplay.Value value={value} />
      </RecordTableInlineCell>
    </RelativeDateDisplay>
  )
}

export const formatDate = (info: CellContext<IOrderHistory, unknown>) => (
  <RecordTableInlineCell className="text-xs tabular-nums text-muted-foreground">
    <span className="truncate">
      {info.getValue()
        ? format(new Date(info.getValue() as string), "yyyy.MM.dd HH:mm")
        : ""}
    </span>
  </RecordTableInlineCell>
)

const badgeClassName = "h-6 rounded-sm py-0"

export const statusText: Record<string, string> = {
  new: "Шинэ",
  pending: "Хүлээгдэж буй",
  doing: "Хийгдэж буй",
  reDoing: "Дахин хийгдэж буй",
  done: "Бэлэн болсон",
  complete: "Дууссан",
}

export const StatusBadge = ({ status }: { status: string }) => (
  <Badge
    variant={statusVariant[status] || "secondary"}
    className={badgeClassName}
  >
    {statusText[status] || status}
  </Badge>
)

const OrderNumberCell = ({ _id, number }: IOrderHistory) => {
  const setDetailId = useSetAtom(detailIdAtom)
  const setReturnId = useSetAtom(openReturnDialogAtom)

  return (
    <RecordTableInlineCell>
      <RecordTableInlineAnchor
        className="tabular-nums"
        onClick={() => {
          setReturnId(null)
          setDetailId(_id)
        }}
      >
        {number}
      </RecordTableInlineAnchor>
    </RecordTableInlineCell>
  )
}

const UserCell = ({ email }: { email?: string }) => {
  if (!email) return <RecordTableInlineCell />

  return (
    <RecordTableInlineCell>
      <span
        aria-hidden="true"
        className="inline-flex size-5 flex-none items-center justify-center rounded-full bg-muted text-[11px] uppercase text-muted-foreground"
      >
        {email.charAt(0)}
      </span>
      <span className="truncate">{email}</span>
    </RecordTableInlineCell>
  )
}

export const statusVariant: Record<string, BadgeProps["variant"]> = {
  new: "secondary",
  pending: "warning",
  doing: "warning",
  reDoing: "warning",
  done: "info",
  complete: "success",
}

const columns: ColumnDef<IOrderHistory>[] = [
  {
    id: "more",
    size: 33,
    enableHiding: false,
    enableResizing: false,
    header: () => null,
    cell: ({ row }: CellContext<IOrderHistory, unknown>) => (
      <HistoryItemAction {...(row.original || {})} />
    ),
  },
  {
    id: "number",
    accessorKey: "number",
    size: 160,
    header: () => <RecordTable.InlineHead icon={HashIcon} label="Дугаар" />,
    cell: ({ row }) => <OrderNumberCell {...row.original} />,
  },
  {
    id: "status",
    accessorKey: "status",
    size: 120,
    header: () => (
      <RecordTable.InlineHead icon={CircleDotIcon} label="Статус" />
    ),
    cell: (info) => {
      const status = info.getValue() as string
      return (
        <RecordTableInlineCell>
          <StatusBadge status={status} />
        </RecordTableInlineCell>
      )
    },
  },
  {
    id: "totalAmount",
    accessorKey: "totalAmount",
    size: 140,
    header: () => <RecordTable.InlineHead icon={CoinsIcon} label="Дүн" />,
    cell: (info) => (
      <RecordTableInlineCell className="tabular-nums">
        <span className="truncate">
          {(info.getValue() || "").toLocaleString()}
        </span>
      </RecordTableInlineCell>
    ),
  },
  {
    id: "type",
    accessorKey: "type",
    size: 120,
    header: () => <RecordTable.InlineHead icon={TagIcon} label="Төрөл" />,
    cell: (info) => (
      <RecordTableInlineCell>
        <Badge className={badgeClassName}>
          {typeTextDef[info.getValue() as keyof typeof typeTextDef]}
        </Badge>
      </RecordTableInlineCell>
    ),
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    size: 170,
    header: () => (
      <RecordTable.InlineHead icon={CalendarPlusIcon} label="Үүсгэсэн огноо" />
    ),
    cell: relativeDate,
  },
  {
    id: "modifiedAt",
    accessorKey: "modifiedAt",
    size: 170,
    header: () => (
      <RecordTable.InlineHead
        icon={CalendarClockIcon}
        label="Өөрчилсөн огноо"
      />
    ),
    cell: relativeDate,
  },
  {
    id: "paidDate",
    accessorKey: "paidDate",
    size: 190,
    header: () => (
      <RecordTable.InlineHead icon={CalendarIcon} label="Төлбөр төлсөн огноо" />
    ),
    cell: formatDate,
  },
  {
    id: "user",
    size: 240,
    accessorFn: (order) => order.user?.email,
    header: () => <RecordTable.InlineHead icon={UserIcon} label="Хэрэглэгч" />,
    cell: (info) => <UserCell email={info.getValue() as string} />,
  },
]

export default columns
