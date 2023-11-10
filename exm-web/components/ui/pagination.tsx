import React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

import PerPageChooser from "./perpage-chooser"

type Props = {
  history: any
  page: number
  currentPage: number
}

const range = (start: number, stop: number) => {
  return Array.from(Array(stop), (_, i) => start + i)
}

// Return the list of values that are the intersection of two arrays
const intersection = (array1: any[], array2: any[]) => {
  return array1.filter((n) => array2.includes(n))
}

// Computes the union of the passed-in arrays: the list of unique items
const union = (array1: any[], array2: any[]) => {
  return array1.concat(array2.filter((n) => !array1.includes(n)))
}

// Similar to without, but returns the values from array that are not present in the other arrays.
const difference = (array1: any[], array2: any[]) => {
  return array1.filter((n) => !array2.includes(n))
}

const generatePages = (pageCount: number, currentPage: number): number[] => {
  const w = 4

  // Create an array with pageCount numbers, starting from 1
  let pages = range(1, pageCount)

  let diff
  const first = pages.slice(0, w)

  const last = pages.slice(-w)

  let currentStart = currentPage - 1 - w

  if (currentStart < 0) {
    currentStart = 0
  }

  let currentEnd = currentPage - 1 + w

  if (currentEnd < 0) {
    currentEnd = 0
  }

  const current = pages.slice(currentStart, currentEnd)

  pages = []

  if (intersection(first, current).length === 0) {
    pages = pages.concat(first)
    diff = current[0] - first[first.length - 1]

    if (diff === 2) {
      pages.push(current[0] - 1)
    } else if (diff !== 1) {
      pages.push(-1)
    }

    pages = pages.concat(current)
  } else {
    pages = union(first, current)
  }

  if (intersection(current, last).length === 0) {
    diff = last[0] - pages[pages.length - 1]

    if (diff === 2) {
      pages.push(last[0] - 1)
    } else if (diff !== 1) {
      pages.push(-1)
    }

    pages = pages.concat(last)
  } else {
    diff = difference(last, current)
    pages = pages.concat(diff)
  }

  return pages
}

const Page = ({
  history,
  page,
  currentPage,
}: {
  history: any
  page: number
  currentPage: number
}) => {
  const router = useRouter()
  // tslint:disable-next-line:no-shadowed-variable
  const goto = (page: number) => {
    const queryParams = new URLSearchParams(window.location.search)
    queryParams.set("page", page.toString())
    router.push(`?${queryParams.toString()}`, { scroll: false })
  }

  const onClick = (e: any) => {
    e.preventDefault()

    goto(page)
  }

  if (page !== -1) {
    let className = ""

    if (page === currentPage) {
      className += "bg-gray-200 text-gray-800 disabled"
    }

    return (
      <button
        type="button"
        onClick={onClick}
        className={`min-h-[38px] min-w-[38px] flex justify-center items-center text-gray-800 hover:bg-gray-100 py-2 px-3 text-sm rounded-lg focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-white/10 dark:focus:bg-white/10 ${className}`}
      >
        <a href="#page">{page}</a>
      </button>
    )
  }

  return (
    <div className={`hs-tooltip inline-block disabled`}>
      <button
        type="button"
        className="hs-tooltip-toggle group min-h-[38px] min-w-[38px] flex justify-center items-center text-gray-400 hover:text-blue-600 p-2 text-sm rounded-lg focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-gray-500 dark:hover:text-blue-500 dark:focus:bg-white/10"
      >
        <span className="text-xs cursor-not-allowed">•••</span>
      </button>
    </div>
  )
}

type IRouterProps = {
  totalPagesCount?: number
  pages?: number[]
  count?: number
  currentPage?: number
  isPaginated?: boolean
}

const PaginationContainer = ({
  totalPagesCount = 0,
  pages,
  count,
  currentPage,
  isPaginated,
}: IRouterProps) => {
  const router = useRouter()
  const queryParams = new URLSearchParams(window.location.search)
  const goto = (page: string | number) => {
    queryParams.set("page", page as string)
    router.push(`?${queryParams.toString()}`, { scroll: false })
  }

  const onPrev = (e: any) => {
    e.preventDefault()

    const page = (currentPage || 1) - 1

    if (page > 0) {
      goto(page)
    }
  }

  const onNext = (e: any) => {
    e.preventDefault()

    const page = (currentPage || 1) + 1

    if (page <= totalPagesCount) {
      goto(page)
    }
  }

  const renderBar = () => {
    if (!isPaginated) {
      return null
    }

    let prevClass = ""
    let nextClass = ""

    if (currentPage || 1 <= 1) {
      prevClass = "disabled"
    }

    if (currentPage || 1 >= totalPagesCount) {
      nextClass = "disabled"
    }

    return (
      <div className="flex items-center gap-x-1">
        <button
          type="button"
          className={`min-h-[38px] min-w-[38px] py-2 px-2.5 inline-flex jusify-center items-center gap-x-2 text-sm rounded-lg text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-white/10 dark:focus:bg-white/10 ${prevClass}`}
        >
          <a href="#prev" onClick={onPrev}>
            <ChevronLeft size={16} />
          </a>
        </button>

        {pages?.map((page, index) => (
          <Page
            key={index}
            history={history}
            currentPage={currentPage || 1}
            page={page}
          />
        ))}

        <button
          type="button"
          className={`min-h-[38px] min-w-[38px] py-2 px-2.5 inline-flex jusify-center items-center gap-x-2 text-sm rounded-lg text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-white/10 dark:focus:bg-white/10 ${nextClass}`}
        >
          <a href="#next" onClick={onNext}>
            <ChevronRight size={16} />
          </a>
        </button>

        {renderPerPageChooser()}
      </div>
    )
  }

  const renderPerPageChooser = () => {
    return <PerPageChooser count={count || 0} />
  }

  return <div>{renderBar()}</div>
}

interface IPaginationContainerProps extends IRouterProps {
  count?: number
}

const Pagination = (props: IPaginationContainerProps) => {
  const { count = 100 } = props

  const searchParams = useSearchParams()

  const currentPage = Number(searchParams.get("page")) || 1
  const perPage = Number(searchParams.get("perPage")) || 10

  let totalPagesCount = parseInt((count / perPage).toString(), 10) + 1

  if (count % perPage === 0) {
    totalPagesCount -= 1
  }

  // calculate page numbers
  const pages = generatePages(totalPagesCount, currentPage)

  const childProps = {
    ...props,
    currentPage,
    isPaginated: totalPagesCount > 1,
    totalPagesCount,
    pages,
  }

  return <PaginationContainer {...childProps} />
}

export default Pagination
