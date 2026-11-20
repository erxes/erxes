import { filterAtom } from "@/store/history.store"
import { useAtom } from "jotai"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const Pagination = ({
  totalCount,
  loading,
}: {
  totalCount: number
  loading: boolean
}) => {
  const [filter, setFilter] = useAtom(filterAtom)
  const totalPage = Math.ceil(totalCount / (filter.perPage || 10))

  const goToPage = (page: number) => {}

  return (
    <div className="flex flex-none items-center justify-end gap-3 px-3 pb-3 text-[13px] font-medium">
      <Select
        value={(filter.perPage || 10).toString()}
        onValueChange={(value) =>
          setFilter({
            ...filter,
            perPage: Number(value),
            page:
              filter.page > Math.ceil(totalCount / Number(value))
                ? 1
                : filter.page,
          })
        }
        disabled={loading}
      >
        <SelectTrigger className="h-7 w-[70px] rounded text-[13px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent side="top">
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <SelectItem key={pageSize} value={`${pageSize}`}>
              {pageSize}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="text-muted-foreground">
        Хуудас{" "}
        <span className="font-semibold text-foreground tabular-nums">
          {filter.page}/{totalPage || 1}
        </span>
      </div>
      <div className="flex">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            className="hidden h-7 w-7 rounded p-0 lg:flex"
            onClick={() => setFilter({ ...filter, page: 1 })}
            disabled={filter.page === 1 || loading}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            className="h-7 w-7 rounded p-0"
            disabled={filter.page === 1 || loading}
            onClick={() => setFilter({ ...filter, page: filter.page - 1 })}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            className="h-7 w-7 rounded p-0"
            disabled={filter.page === totalPage || loading}
            onClick={() => setFilter({ ...filter, page: filter.page + 1 })}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            className="hidden h-7 w-7 rounded p-0 lg:flex"
            onClick={() => setFilter({ ...filter, page: totalPage })}
            disabled={filter.page === totalPage || loading}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Pagination
