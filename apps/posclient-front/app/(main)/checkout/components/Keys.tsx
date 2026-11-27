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
        "grid grid-cols-3 gap-2 py-0",
        mode === "mobile" && "mx-auto max-w-xs py-4 md:max-w-sm"
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

  const button = (
    <Button
      onClick={handleClick}
      className={cn(
        "h-full w-full rounded-xl text-lg font-semibold tabular-nums shadow-xs hover:border-primary/40 hover:bg-primary/5 hover:text-primary",
        mode !== "mobile" && "h-12",
        typeof value === "string" && "text-muted-foreground"
      )}
      variant="outline"
    >
      {value === "CE" ? <DeleteIcon className="h-5 w-5" /> : value}
    </Button>
  )

  if (mode !== "mobile") {
    return button
  }

  return <AspectRatio ratio={1.5}>{button}</AspectRatio>
}

export default Keys
