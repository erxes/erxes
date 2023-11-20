import { useEffect, useState } from "react"
import { Check } from "lucide-react"

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}

type Props = {
  steps: string[]
  currentStep: number
  setCurrentStep: (step: number) => void
}

const Stepper = ({ steps = [], currentStep = 1, setCurrentStep }: Props) => {
  const [complete, setComplete] = useState(false)

  useEffect(() => {
    if (currentStep === steps.length + 1) {
      setComplete(true)
    }
  }, [currentStep])
  if (steps.length === 0) {
    return null
  }

  return (
    <>
      <nav aria-label="Progress">
        <ol role="list" className="flex items-center">
          {steps.map((step, i) => (
            <li
              key={i}
              className={classNames(
                i !== steps.length - 1 ? "pr-8 sm:pr-20" : "",
                "relative"
              )}
            >
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div
                  className={`h-0.5 w-full ${
                    i + 1 < currentStep || complete
                      ? "bg-indigo-600"
                      : "bg-gray-300"
                  }`}
                />
              </div>
              <a
                onClick={() => {
                  setCurrentStep(i + 1), setComplete(false)
                }}
                className={`relative flex h-12 w-12 items-center justify-center rounded-full ${
                  i + 1 < currentStep || complete
                    ? "bg-indigo-600"
                    : "bg-gray-300"
                } hover:bg-indigo-900 cursor-pointer`}
              >
                {i + 1 < currentStep || complete ? (
                  <Check
                    size={24}
                    className="h-5 w-5 text-white"
                    aria-hidden="true"
                  />
                ) : (
                  <span className="font-semibold text-center text-white">
                    {i + 1}
                  </span>
                )}
                <span className="absolute top-[49px] text-sm font-medium text-center">
                  {step}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
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
