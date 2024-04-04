import React, { useState } from "react"
import { useSearchParams } from "next/navigation"

import FeedbackForm from "./form/FeedbackForm"
import FeedbackList from "./table/FeedbackList"

const Feedback = () => {
  const searchParams = useSearchParams()
  const params = Object.fromEntries(searchParams)

  const view = searchParams.get("view")

  const [toggleView, setToggleView] = useState(view === "table" ? false : true)

  const queryParams = {
    page: params.page || 1,
    perPage: params.perPage || 10,
  }

  return (
    <div className="h-[calc(100vh-66px)] p-9 pt-5 flex flex-col justify-between">
      {toggleView ? (
        <FeedbackForm setToggleView={setToggleView} />
      ) : (
        <FeedbackList queryParams={queryParams} setToggleView={setToggleView} />
      )}
    </div>
  )
}

export default Feedback
