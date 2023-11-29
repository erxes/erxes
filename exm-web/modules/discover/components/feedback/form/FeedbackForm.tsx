import React, { useState } from "react"

import Stepper from "../Stepper"
import FeedbackTabs from "./FeedbackTabs"

type Props = {
  setToggleView: (view: boolean) => void
}

const FeedbackForm = ({ setToggleView }: Props) => {
  const [tab, setTab] = useState("feedback")
  const [currentStep, setCurrentStep] = useState(1)

  const steps = ["Write", "Check", "Done"]

  return (
    <div className="h-full flex flex-col">
      <div className="flex w-full h-20 items-center justify-center mb-5">
        <Stepper
          steps={steps}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
        />
      </div>
      <div className="w-full mt-10">
        <h2 className="text-[18px] font-semibold capitalize">Send {tab} </h2>
        <p className="text-[14px] font-normal mt-2">
          We will solve your problem.
        </p>
      </div>

      <div className="w-full mt-auto">
        <p className="text-[14px] font-normal mb-5">
          Please select the type of feedback you would like to send.
        </p>
        <FeedbackTabs
          tab={tab}
          setTab={setTab}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          setToggleView={setToggleView}
        />
      </div>
    </div>
  )
}

export default FeedbackForm
