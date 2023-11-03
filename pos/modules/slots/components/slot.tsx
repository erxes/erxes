import { memo } from "react"
import { selectedTabAtom } from "@/store"
import { slotCodeAtom } from "@/store/order.store"
import { motion } from "framer-motion"
import { useSetAtom } from "jotai"
import { CheckCircle2, Circle, XCircleIcon } from "lucide-react"

import { ISlot } from "@/types/slots.type"
import { cn } from "@/lib/utils"
import { ContextMenuTrigger } from "@/components/ui/context-menu"
import { Label } from "@/components/ui/label"

import SlotActions from "./slotActions"

const MotionLabel = motion(Label)

const statusIcons = {
  serving: CheckCircle2,
  available: Circle,
  reserved: XCircleIcon,
}

const Slot = (
  props: ISlot & {
    status?: "serving" | "available" | "reserved"
    active: boolean
  }
) => {
  const { active, code, name, option, status } = props

  const {
    rotateAngle,
    width,
    height,
    top,
    left,
    color,
    zIndex,
    borderRadius,
    isShape,
  } = option || {}

  const Icon = statusIcons[status || "available"]
  const style = {
    width,
    height,
    top,
    left,
    transform: `rotate(${rotateAngle}deg)`,
    backgroundColor: color,
    zIndex,
    borderRadius,
  }
  const setActiveSlot = useSetAtom(slotCodeAtom)
  const setSelectedTab = useSetAtom(selectedTabAtom)

  if (isShape)
    return (
      <div
        className={cn(
          "absolute flex items-center font-medium justify-center",
          active && "shadow-md shadow-primary/50"
        )}
        style={style}
      />
    )

  const handleChoose = () => {
    setActiveSlot(code)
    setSelectedTab("products")
  }

  return (
    <SlotActions {...props}>
      <ContextMenuTrigger
        className={cn(
          "absolute flex items-center font-medium justify-center text-white",
          active && "shadow-md shadow-primary/50"
        )}
        style={style}
        onClick={handleChoose}
      >
        <div
          style={{
            transform: `rotate(-${rotateAngle}deg)`,
          }}
          className="flex items-center gap-0.5"
        >
          <Icon className="h-5 w-5" />
          {name || code}
        </div>
        <MotionLabel
          animate={{
            opacity: active ? 1 : 0,
          }}
          initial={{
            opacity: 0,
          }}
          className="absolute inset-0 ring-2 ring-ring ring-offset-2  cursor-pointer"
          htmlFor={code}
          style={{
            width,
            height,
            borderRadius,
          }}
        />
      </ContextMenuTrigger>
    </SlotActions>
  )
}

export default memo(Slot)
