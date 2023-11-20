import React, { useState } from "react"

import FeedbackForm from "./form/FeedbackForm"
import FeedbackList from "./table/FeedbackList"

type Props = {}

const Feedback = (props: Props) => {
  const [toggleView, setToggleView] = useState(false)

  return (
    <>
      {toggleView ? (
        <FeedbackForm />
      ) : (
        <FeedbackList setToggleView={setToggleView} />
      )}
    </>
  )
}

export default Feedback
