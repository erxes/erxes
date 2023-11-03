import React from "react"

import { useRequests } from "../../hooks/useRequest"

type Props = {}

const Request = (props: Props) => {
  const { requestsList, requestsTotalCount } = useRequests(
    1,
    20,
    "Sun Oct 29 2023 08:50:22 GMT+0800 (Ulaanbaatar Standard Time)",
    "Thu Nov 02 2023 08:50:22 GMT+0800 (Ulaanbaatar Standard Time)"
  )

  return <div>Request</div>
}

export default Request
