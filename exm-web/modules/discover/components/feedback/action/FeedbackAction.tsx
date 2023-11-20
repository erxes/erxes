import React from "react"

import { Button } from "@/components/ui/button"

type Props = {
  setToggleView: (view: boolean) => void
}

const FeedbackAction = ({ setToggleView }: Props) => {
  return (
    <div className="flex gap-2 p-0 justify-end">
      <Button onClick={() => setToggleView(true)}>Send feedback</Button>
    </div>
  )
}

export default FeedbackAction
