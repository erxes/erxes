import useHandlePayment from "@/modules/checkout/hooks/useHandlePayment"
import { displayAmountAtom, modeAtom } from "@/store"
import { useAtomValue } from "jotai"
import { DeleteIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Button } from "@/components/ui/button"

const Keys = () => {
  const mode = useAtomValue(modeAtom)

  return (
    <div
      className={cn(
        "grid grid-cols-4 gap-4 max-w-none py-0",
        mode === "mobile" && "grid-cols-3 py-4 max-w-xs md:max-w-sm mx-auto"
      )}
    >
      {Array.from({ length: 9 }).map((_, idx) => (
        <ControlButton key={idx} value={idx + 1} />
      ))}
      {mode === "mobile" && <div />}
      <ControlButton value={0} />
      <ControlButton value={"CE"} />
      <ControlButton value={"C"} />
    </div>
  )
}

const ControlButton = ({ value }: { value: string | number }) => {
  const displayAmount = useAtomValue(displayAmountAtom)
  const { handleValueChange } = useHandlePayment()
  const mode = useAtomValue(modeAtom)

  if (mode === "mobile" && value === "C") {
    return null
  }

  const handleClick = () => {
    if (value === "C") return handleValueChange("0")

    if (value === "CE")
      return handleValueChange(displayAmount.toString().slice(0, -1) || "0")

    return handleValueChange(displayAmount.toString() + value)
  }

  return (
    <AspectRatio ratio={mode === "mobile" ? 1.5 : 1}>
      <Button
        onClick={handleClick}
        className={cn(
          "h-full w-full rounded-full text-lg font-black hover:bg-secondary/10 hover:text-white",
          mode === "mobile" && "hover:text-black"
        )}
        variant="outline"
      >
        {mode === "mobile" && value === "CE" ? <DeleteIcon /> : value}
      </Button>
    </AspectRatio>
  )
}

export default Keys
