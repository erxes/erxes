import React from "react"

import { Button } from "@/components/ui/button"

type Props = {
  toggleView: boolean
  setToggleView: (view: boolean) => void
}

const FeedbackAction = ({ toggleView, setToggleView }: Props) => {
  return (
    <div className="flex gap-2 p-0 justify-end">
      <Button onClick={() => setToggleView(!toggleView)}>
        {toggleView ? "Show feedback" : "Send feedback"}
      </Button>
    </div>
  )
}

export default FeedbackAction
