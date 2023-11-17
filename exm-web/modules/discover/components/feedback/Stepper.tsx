import React, { useState } from "react"

import "./stepper.css"
import { Check } from "lucide-react"

type Props = {
  step: number
}

const Stepper = ({ step }: Props) => {
  const steps = ["Бичих", "Хянах", "Илгээх"]
  const [complete, setComplete] = useState(false)

  // if (step === steps.length) {
  //   setComplete(true)
  // }

  return (
    <>
      <div className="flex justify-between">
        {steps?.map((s, i) => (
          <div
            key={i}
            className={`step-item ${step === i + 1 && "active"} ${
              (i + 1 < step || complete) && "complete"
            } `}
          >
            <div className="step">
              {i + 1 < step || complete ? <Check size={24} /> : i + 1}
            </div>
            <p className="text-gray-500">{s}</p>
          </div>
        ))}
      </div>
      {/* {!complete && (
        <button
          className="btn"
          onClick={() => {
            currentStep === steps.length
              ? setComplete(true)
              : setCurrentStep((prev) => prev + 1)
          }}
        >
          {currentStep === steps.length ? "Finish" : "Next"}
        </button>
      )} */}
    </>
  )
}

export default Stepper
