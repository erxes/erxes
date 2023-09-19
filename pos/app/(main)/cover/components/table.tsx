"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { format } from "date-fns"
import {
  ArrowUpDown,
  CheckCircle2Icon,
  CircleIcon,
  XCircleIcon,
} from "lucide-react"

import { Cover } from "@/types/cover.types"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import CoverItemAction from "./cover-item-action"

const statuses = [
  {
    value: "confirm",
    icon: CheckCircle2Icon,
  },
  {
    value: "new",
    icon: CircleIcon,
  },
  {
    value: "unconfirm",
    icon: XCircleIcon,
  },
]

export const columns: ColumnDef<Cover>[] = [
  {
    accessorKey: "beginDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          огноо/эхлэх - төгсөх/
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const formatD = (date: Date) => {
        if (!date) return "-"
        return format(new Date(date), "yyyy.MM.dd HH:mm")
      }
      const { beginDate, endDate } = row.original
      return (
        <div className="lowercase">
          {(beginDate && formatD(beginDate)) +
            " - " +
            (endDate && formatD(endDate))}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Tөлөв",
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue("status")
      )

      if (!status) {
        return null
      }

      return (
        <div className="flex w-[100px] items-center">
          {status.icon && (
            <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{status.value}</span>
        </div>
      )
    },
  },
  {
    id: "user",
    accessorKey: "createdUser",
    header: "Хаалт үүсгэсэн",
    cell: ({ row }) => {
      return <div className="lowercase">{row.original.createdUser.email}</div>
    },
  },

  {
    id: "modified_user",
    accessorKey: "modified_user",
    header: "Хаалт өөрчилсөн",
    cell: ({ row }) => {
      return (
        <div className="lowercase">
          {row.original.modifiedUser?.email || "-"}
        </div>
      )
    },
  },

  {
    id: "actions",
    enableHiding: false,
    cell: CoverItemAction,
  },
]

export default function DataTable({ data }: { data: Cover[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full py-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
