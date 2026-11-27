"use client"

import { RelativeDateDisplay } from "@/modules/display"
import {
  RecordTable,
  RecordTableInlineAnchor,
  RecordTableInlineCell,
} from "@/modules/record-table"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import {
  CalendarClockIcon,
  CalendarPlusIcon,
  CalendarRangeIcon,
  CircleDotIcon,
  TimerResetIcon,
  UserIcon,
  UserPenIcon,
} from "lucide-react"

import { Cover } from "@/types/cover.types"

import { CoverItemAction } from "./cover-item-action"
import { CoverStatusBadge } from "./cover-status"

const formatDate = (date?: Date | string | null) =>
  date ? format(new Date(date), "yyyy.MM.dd HH:mm") : ""

const DateCell = ({ value }: { value?: Date | string | null }) => {
  if (!value) return <RecordTableInlineCell />

  return (
    <RelativeDateDisplay value={value} asChild>
      <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
        <RelativeDateDisplay.Value value={value} />
      </RecordTableInlineCell>
    </RelativeDateDisplay>
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

const createColumns = (onOpen: (id: string) => void): ColumnDef<Cover>[] => [
  {
    id: "more",
    size: 33,
    enableHiding: false,
    enableResizing: false,
    header: () => null,
    cell: CoverItemAction,
  },
  {
    id: "period",
    size: 280,
    header: () => (
      <RecordTable.InlineHead icon={CalendarRangeIcon} label="Хугацаа" />
    ),
    cell: ({ row }) => {
      const { _id, beginDate, endDate } = row.original
      return (
        <RecordTableInlineCell>
          <RecordTableInlineAnchor
            className="tabular-nums"
            onClick={() => onOpen(_id)}
          >
            {beginDate ? formatDate(beginDate) : "Эхнээс"}
            <span className="px-1.5 text-muted-foreground">→</span>
            {formatDate(endDate)}
          </RecordTableInlineAnchor>
        </RecordTableInlineCell>
      )
    },
  },
  {
    id: "status",
    accessorKey: "status",
    size: 170,
    header: () => <RecordTable.InlineHead icon={CircleDotIcon} label="Төлөв" />,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <CoverStatusBadge status={row.original.status} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: "createdUser",
    size: 230,
    header: () => <RecordTable.InlineHead icon={UserIcon} label="Үүсгэсэн" />,
    cell: ({ row }) => <UserCell email={row.original.createdUser?.email} />,
  },
  {
    id: "createdAt",
    size: 160,
    header: () => (
      <RecordTable.InlineHead icon={CalendarPlusIcon} label="Үүсгэсэн огноо" />
    ),
    cell: ({ row }) => <DateCell value={row.original.createdAt} />,
  },
  {
    id: "modifiedUser",
    size: 230,
    header: () => (
      <RecordTable.InlineHead icon={UserPenIcon} label="Өөрчилсөн" />
    ),
    cell: ({ row }) => <UserCell email={row.original.modifiedUser?.email} />,
  },
  {
    id: "modifiedAt",
    size: 160,
    header: () => (
      <RecordTable.InlineHead
        icon={CalendarClockIcon}
        label="Өөрчилсөн огноо"
      />
    ),
    cell: ({ row }) => <DateCell value={row.original.modifiedAt} />,
  },
]

export const CoversRecordTable = ({
  covers,
  loading,
  onOpen,
}: {
  covers: Cover[]
  loading: boolean
  onOpen: (id: string) => void
}) => (
  <RecordTable.Provider
    columns={createColumns(onOpen)}
    data={covers}
    stickyColumns={["more", "period"]}
    tableId="pos_covers"
    className="h-full"
  >
    <RecordTable.Scroll>
      <RecordTable>
        <RecordTable.Header showColumnSelector />
        <RecordTable.Body>
          {loading ? (
            <RecordTable.RowSkeleton rows={12} />
          ) : (
            <RecordTable.RowList />
          )}
        </RecordTable.Body>
      </RecordTable>
    </RecordTable.Scroll>
    {!loading && !covers.length && (
      <div className="absolute inset-0 top-9 flex items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <TimerResetIcon
            className="mb-6 h-12 w-12 text-zinc-400"
            strokeWidth={1.5}
          />
          <h3 className="text-base font-semibold text-foreground">
            Хаалт олдсонгүй
          </h3>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Шүүлтүүрээ өөрчлөх эсвэл шинэ хаалт нэмнэ үү
          </p>
        </div>
      </div>
    )}
  </RecordTable.Provider>
)
