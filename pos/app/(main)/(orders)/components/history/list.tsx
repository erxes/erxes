import { filterAtom } from "@/store/history.store"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useAtomValue } from "jotai"

import { IOrderHistory } from "@/types/order.types"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import columns from "./columns"

const HistoryTable = ({
  orders,
  loading,
}: {
  orders: IOrderHistory[]
  loading: boolean
}) => {
  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })
  return (
    <div className="mx-4 rounded-md border mt-4">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loading ? (
            <LoadingList />
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export const LoadingList = () => {
  const { perPage } = useAtomValue(filterAtom)
  const uniqueIndexes = [] // Initialize an empty array

  // Populate the array with unique numbers from 0 to perPage - 1
  for (let i = 0; i < perPage; i++) {
    uniqueIndexes.push(i)
  }
  return (
    <>
      {uniqueIndexes.map((key) => (
        <TableRow key={key} style={{ height: 49 }}>
          {[0, 1, 2, 3, 4, 5].map((id) => (
            <TableCell key={id}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

export default HistoryTable
