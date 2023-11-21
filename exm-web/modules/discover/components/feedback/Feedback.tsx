import React, { useState } from "react"

import FeedbackAction from "./action/FeedbackAction"
import FeedbackForm from "./form/FeedbackForm"
import FeedbackList from "./table/FeedbackList"

type Props = {}

const Feedback = (props: Props) => {
  const [toggleView, setToggleView] = useState(false)

  return (
    <div className="h-[calc(100vh-66px)] p-9 pt-5 flex flex-col justify-between">
      <FeedbackAction toggleView={toggleView} setToggleView={setToggleView} />
      {toggleView ? (
        <FeedbackForm setToggleView={setToggleView} />
      ) : (
        <FeedbackList />
      )}
    </div>
  )
}

export default Feedback
