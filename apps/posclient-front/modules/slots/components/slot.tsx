import { forwardRef, memo } from "react"
import useOrderCU from "@/modules/orders/hooks/useOrderCU"
import { slotFilterAtom } from "@/store"
import {
  activeOrderIdAtom,
  savedSlotCodeAtom,
  slotCodeAtom,
} from "@/store/order.store"
import { cva } from "class-variance-authority"
import { motion } from "framer-motion"
import { useAtom, useAtomValue, useSetAtom } from "jotai"

import { ISlot } from "@/types/slots.type"
import { cn } from "@/lib/utils"
import { ButtonProps } from "@/components/ui/button"
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"

import { useCreateSlots } from "../hooks/useSlots"
import SlotActions from "./slotActions"

const MotionLabel = motion(Label)

export const slotVariants = cva(
  "absolute flex items-center font-medium justify-center",
  {
    variants: {
      status: {
        serving: "bg-blue-300 hover:bg-blue-200",
        available: "bg-green-300 hover:bg-green-200",
        reserved: "bg-orange-200 hover:bg-orange-200",
      },
    },
    defaultVariants: {
      status: "available",
    },
  }
)

const Slot = (
  props: ISlot & {
    status?: "serving" | "available" | "reserved"
  }
) => {
  const { code, name, option, status } = props
  const [activeSlot, setActiveSlot] = useAtom(slotCodeAtom)
  const savedSlot = useAtomValue(savedSlotCodeAtom)
  const activeOrderId = useAtomValue(activeOrderIdAtom)
  const active = activeSlot === code
  const setFilter = useSetAtom(slotFilterAtom)

  const {
    rotateAngle,
    width,
    height,
    top,
    left,
    zIndex,
    borderRadius,
    isShape,
  } = option || {}
  const { handleCreate } = useCreateSlots({ code })

  const style = {
    width,
    height,
    top,
    left,
    transform: `rotate(${rotateAngle}deg)`,
    // backgroundColor: color,
    zIndex,
    borderRadius,
  }

  const { orderCU, loading } = useOrderCU()

  const handleClick = () => {
    if (status === "serving") {
      if (savedSlot === activeSlot && active) {
        return setActiveSlot(null)
      }
      return setFilter(code)
    }
    if (activeOrderId) {
      setActiveSlot(code)
      setFilter(null)
      return setTimeout(orderCU)
    }
    return handleCreate()
  }

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

  if (
    (status === "available" &&
      (!activeOrderId || (activeOrderId && !activeSlot))) ||
    status === "serving"
  )
    return (
      <SlotComponent
        name={name}
        code={code}
        active={active}
        className={cn(
          slotVariants({ status }),
          active && "shadow-md shadow-primary/50"
        )}
        style={style}
        onClick={handleClick}
        disabled={loading}
      />
    )

  return (
    <SlotActions {...props}>
      <DropdownMenuTrigger asChild>
        <SlotComponent
          name={name}
          code={code}
          active={active}
          className={cn(
            slotVariants({ status }),
            active && "shadow-md shadow-primary/50"
          )}
          style={style}
        />
      </DropdownMenuTrigger>
    </SlotActions>
  )
}

export interface ISlotComponent extends ButtonProps {
  name: string
  code: string
  active: boolean
}

const SlotComponent = forwardRef<HTMLButtonElement, ISlotComponent>(
  ({ name, code, active, style, ...props }, slotRef) => {
    return (
      <button ref={slotRef} {...props} style={style}>
        <div
          style={{
            transform: style?.transform,
          }}
          className="flex items-center gap-0.5"
        >
          {name || code}
        </div>
        <MotionLabel
          animate={{
            opacity: active ? 1 : 0,
          }}
          initial={{
            opacity: 0,
          }}
          className="absolute inset-0 ring-2 ring-primary ring-offset-2  cursor-pointer"
          htmlFor={code}
          style={{
            width: style?.width,
            height: style?.height,
            borderRadius: style?.borderRadius,
          }}
        />
      </button>
    )
  }
)

export default memo(Slot)
