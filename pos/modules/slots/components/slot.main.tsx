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
  "h-10 w-10 text-base font-bold px-0 relative ",
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
        <Button className={slotVariants({ status })} Component={"div"}>
          {name}
          <RadioGroupItem
            value={active ? "" : code}
            id={code}
            className="peer sr-only"
          />
          <MotionLabel
            className="absolute inset-0 border-primary rounded-md border-2"
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
            <Check className="h-3 w-3" strokeWidth={4} />
          </MotionLabel>
        </Button>
      </DropdownMenuTrigger>
    </SlotActions>
  )
}

export default Slot
