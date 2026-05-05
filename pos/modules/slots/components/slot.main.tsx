import { RadioGroupItem } from "@radix-ui/react-radio-group"
import { cva } from "class-variance-authority"
import { motion } from "framer-motion"
import { Check } from "lucide-react"

import { ISlot } from "@/types/slots.type"
import { Button } from "@/components/ui/button"
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"

import SlotActions from "./slotActions"

export const slotVariants = cva(
  "relative h-auto min-h-11 w-auto min-w-11 max-w-[5.5rem] whitespace-normal break-words px-2 py-1 text-center text-[11px] font-bold leading-tight overflow-hidden",
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
          className={slotVariants({ status })}
          Component={"div"}
          title={name || code}
        >
          <span className="block max-w-full leading-tight break-words">
            {name || code}
          </span>
          <RadioGroupItem
            value={active ? "" : code}
            id={code}
            className="sr-only peer"
          />
          <MotionLabel
            className="absolute inset-0 border-2 rounded-md border-primary"
            animate={{
              opacity: active ? 1 : 0,
            }}
            initial={{
              opacity: 0,
            }}
          />
          <MotionLabel
            className="absolute -top-1.5 -right-1.5 bg-primary h-5 w-5 rounded-full border-2 border-white p-0.5 text-white"
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
