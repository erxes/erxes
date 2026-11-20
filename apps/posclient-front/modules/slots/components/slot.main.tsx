import { RadioGroup as RadioGroupPrimitive } from "radix-ui"
import { cva } from "class-variance-authority"
import { motion } from "framer-motion"
import { Check } from "lucide-react"

import { ISlot } from "@/types/slots.type"
import { Button } from "@/components/ui/button"
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"

import SlotActions from "./slotActions"

export const slotVariants = cva(
  "relative h-12 w-14 rounded-xl px-1 text-center text-[11px] font-semibold leading-tight whitespace-normal break-words ring-1 ring-inset transition-colors",
  {
    variants: {
      status: {
        serving: "bg-blue-50 text-blue-700 ring-blue-200 hover:bg-blue-100",
        available:
          "bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100",
        reserved: "bg-amber-50 text-amber-700 ring-amber-200 hover:bg-amber-100",
      },
    },
    defaultVariants: {
      status: "available",
    },
  }
)

const MotionLabel = motion(Label)

const Slot = (
  props: ISlot & {
    status?: "serving" | "available" | "reserved"
    active: boolean
  }
) => {
  const { code, name, status, active } = props

  return (
    <SlotActions {...props}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={slotVariants({ status })}
          Component={"div"}
        >
          {name}
          <RadioGroupPrimitive.Item
            value={active ? "" : code}
            id={code}
            className="sr-only peer"
          />
          <MotionLabel
            className="absolute inset-0 rounded-xl border-2 border-primary"
            animate={{
              opacity: active ? 1 : 0,
            }}
            initial={{
              opacity: 0,
            }}
          />
          <MotionLabel
            className="absolute -top-1.5 -right-1.5 bg-primary h-5 w-5 rounded-full border-2 border-background p-0.5 text-primary-foreground shadow-sm"
            initial={{ opacity: 0, translateY: 2, translateX: -2 }}
            animate={{
              opacity: active ? 1 : 0,
              translateY: active ? 0 : 2,
              translateX: active ? 0 : -2,
            }}
          >
            <Check className="w-3 h-3" strokeWidth={4} />
          </MotionLabel>
        </Button>
      </DropdownMenuTrigger>
    </SlotActions>
  )
}

export default Slot
