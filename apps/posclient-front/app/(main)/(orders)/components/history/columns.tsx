import { CellContext, ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import {
  CalendarClockIcon,
  CalendarIcon,
  CalendarPlusIcon,
  CircleDotIcon,
  CoinsIcon,
  HashIcon,
  LucideIcon,
  TagIcon,
  UserIcon,
} from "lucide-react"

import { IOrderHistory } from "@/types/order.types"
import { typeTextDef } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { Badge, BadgeProps } from "@/components/ui/badge"

import HistoryItemAction from "./historyItemAction"

export const formatDate = (info: CellContext<IOrderHistory, unknown>) => (
  <InlineCell className="text-xs font-medium text-muted-foreground">
    {info.getValue()
      ? format(new Date(info.getValue() as string), "yyyy.MM.dd HH:mm")
      : ""}
  </InlineCell>
)

export const InlineHead = ({
  icon: Icon,
  label,
}: {
  icon: LucideIcon
  label: string
}) => (
  <div className="flex items-center gap-1">
    <Icon className="h-4 w-4" />
    {label}
  </div>
)

export const InlineCell = ({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) => (
  <div
    className={cn(
      "flex h-8 w-full items-center overflow-hidden px-2 text-left font-medium",
      className
    )}
  >
    <span className="truncate">{children}</span>
  </div>
)

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
    header: () => null,
    cell: ({ row }: CellContext<IOrderHistory, unknown>) => (
      <HistoryItemAction {...(row.original || {})} />
    ),
  },
  {
    accessorKey: "number",
    size: 160,
    header: () => <InlineHead icon={HashIcon} label="Дугаар" />,
    cell: (info) => <InlineCell>{info.getValue() as string}</InlineCell>,
  },
  {
    accessorKey: "status",
    size: 120,
    header: () => <InlineHead icon={CircleDotIcon} label="Cтатус" />,
    cell: (info) => {
      const status = info.getValue() as string
      return (
        <InlineCell>
          <Badge variant={statusVariant[status] || "secondary"}>{status}</Badge>
        </InlineCell>
      )
    },
  },
  {
    accessorKey: "totalAmount",
    size: 140,
    header: () => <InlineHead icon={CoinsIcon} label="Дүн" />,
    cell: (info) => (
      <InlineCell>{(info.getValue() || "").toLocaleString()}</InlineCell>
    ),
  },
  {
    accessorKey: "type",
    size: 120,
    header: () => <InlineHead icon={TagIcon} label="Төрөл" />,
    cell: (info) => (
      <InlineCell>
        <Badge>
          {typeTextDef[info.getValue() as keyof typeof typeTextDef]}
        </Badge>
      </InlineCell>
    ),
  },
  {
    accessorKey: "createdAt",
    size: 170,
    header: () => <InlineHead icon={CalendarPlusIcon} label="Үүсгэсэн огноо" />,
    cell: formatDate,
  },
  {
    accessorKey: "modifiedAt",
    size: 170,
    header: () => (
      <InlineHead icon={CalendarClockIcon} label="Өөрчилсөн огноо" />
    ),
    cell: formatDate,
  },
  {
    accessorKey: "paidDate",
    size: 190,
    header: () => (
      <InlineHead icon={CalendarIcon} label="Төлбөр төлсөн огноо" />
    ),
    cell: formatDate,
  },
  {
    id: "user",
    size: 240,
    accessorFn: (order) => order.user?.email,
    header: () => <InlineHead icon={UserIcon} label="Хэрэглэгч" />,
    cell: (info) => <InlineCell>{info.getValue() as string}</InlineCell>,
  },
]

export default columns
