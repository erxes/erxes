import React from "react"

type Props = {
  queryParams: any
  totalCount: number
}

const TimeclockTableFooter = ({ queryParams, totalCount }: Props) => {
  const { page, perPage } = queryParams

  if (!totalCount || totalCount === 0) {
    return null
  }

  return (
    <span className="text-[#B5B7C0] font-medium">
      Showing data {(page - 1) * perPage + 1} to{" "}
      {page * perPage > totalCount ? totalCount : page * perPage} of{" "}
      {totalCount} entries
    </span>
  )
}

export default TimeclockTableFooter
