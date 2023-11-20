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


.step-item {
  @apply relative flex flex-col justify-center items-center w-40;
}
.step-item:not(:first-child):before {
  @apply content-[''] bg-slate-200 absolute w-full h-[3px] right-2/4 top-1/3 -translate-y-2/4;
}
.step {
  @apply w-10 h-10 flex items-center justify-center z-10 relative bg-slate-700 rounded-full font-semibold text-white;
}
.active .step {
  @apply bg-[#4F33AF];
}
.complete .step {
  @apply bg-green-600;
}
.complete p {
  @apply text-white;
}
.complete:not(:first-child):before,
.active:not(:first-child):before {
  @apply bg-green-600;
}
