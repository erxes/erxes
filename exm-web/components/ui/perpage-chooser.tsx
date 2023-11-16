import { useRouter, useSearchParams } from "next/navigation"
import { ChevronUp } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Props = {
  count?: number
}

const PerPageChooser = (props: Props) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPerPage = Number(searchParams.get("perPage")) || 10

  const onClick = (perPage: number) => {
    if (perPage !== currentPerPage) {
      const queryParams = new URLSearchParams()

      queryParams.append("perPage", perPage.toString())
      queryParams.append("page", 1)

      router.push(`?${queryParams.toString()}`, {
        scroll: false,
      })

      const storageValue = window.localStorage.getItem("pagination:perPage")

      let items: any = {}

      if (storageValue) {
        items = JSON.parse(storageValue)
      }

      items[window.location.pathname] = perPage

      window.localStorage.setItem("pagination:perPage", JSON.stringify(items))
    }
  }

  const renderOption = (n: number) => {
    return (
      <DropdownMenuItem
        onClick={onClick.bind(null, n)}
        className="cursor-pointer w-full flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300 dark:focus:bg-gray-700"
      >
        <a href="#number">{n}</a>
      </DropdownMenuItem>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="h-full hs-dropdown-toggle py-1.5 px-2 inline-flex items-center gap-x-2 text-sm rounded-lg border border-gray-200 text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700">
        {currentPerPage} {"per page"} <ChevronUp size={16} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {renderOption(10)}
        {renderOption(50)}
        {renderOption(100)}
        {renderOption(200)}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default PerPageChooser
