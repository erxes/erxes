import { useEffect, useState } from "react"
import { exmAtom } from "@/modules/JotaiProiveder"
import { useAtomValue } from "jotai"
import { Check } from "lucide-react"

type Props = {
  steps: string[]
  currentStep: number
  setCurrentStep: (step: number) => void
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}

const Stepper = ({ steps = [], currentStep = 1, setCurrentStep }: Props) => {
  const [complete, setComplete] = useState(false)
  const exm = useAtomValue(exmAtom)

  useEffect(() => {
    setComplete(currentStep === steps.length + 1)
  }, [currentStep])

  if (steps.length === 0) {
    return null
  }

  const getStepClasses = (i: number) =>
    classNames(i !== steps.length - 1 ? "pr-8 sm:pr-20" : "", "relative")

  const getCircleClasses = (i: number) =>
    classNames(
      "relative flex h-12 w-12 items-center justify-center rounded-full hover:bg-[#4f46e5]",
      currentStep >= i + 1 ? "cursor-pointer" : "cursor-not-allowed"
    )

  const circleBackgroundColor = (i: number) =>
    i + 1 <= currentStep || complete
      ? exm?.appearance.primaryColor || "#4f46e5"
      : "#d1d5db"

  const stepLineStyle = {
    backgroundColor: circleBackgroundColor,
  }

  const circleStyle = {
    backgroundColor: circleBackgroundColor,
  }

  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, i) => (
          <li key={i} className={getStepClasses(i)}>
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div
                className="h-0.5 w-full"
                style={{ backgroundColor: circleBackgroundColor(i) }}
              />
            </div>
            <a
              onClick={() => {
                if (currentStep >= i + 1) {
                  setCurrentStep(i + 1)
                  setComplete(false)
                }
              }}
              className={getCircleClasses(i)}
              style={{ backgroundColor: circleBackgroundColor(i) }}
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
              <span className="absolute top-[50px] text-sm font-semibold text-center">
                {step}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default Stepper
