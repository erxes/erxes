import { motion } from "framer-motion"
import { CircleDashed, CircleDotDashed, CircleSlash } from "lucide-react"

import { ISlot } from "@/types/slots.type"
import { cn } from "@/lib/utils"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Label } from "@/components/ui/label"
import { RadioGroupItem } from "@/components/ui/radio-group"

const MotionLabel = motion(Label)

const statusIcons = {
  serving: CircleDotDashed,
  available: CircleDashed,
  reserved: CircleSlash,
}

const Slot = ({
  active,
  code,
  name,
  option,
  isPreDates,
  status,
}: ISlot & {
  status?: "serving" | "available" | "reserved"
  active: boolean
}) => {
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

  return (
    <HoverCard>
      <HoverCardTrigger
        className={cn(
          "absolute flex items-center font-medium justify-center text-white",
          active && "shadow-md shadow-primary/50"
        )}
        style={style}
      >
        <RadioGroupItem
          value={active ? "" : code}
          id={code}
          className="peer sr-only"
        />
        <div
          style={{
            transform: `rotate(-${rotateAngle}deg)`,
          }}
          className="flex items-center gap-0.5"
        >
          <Icon className="h-4 w-4" />
          {name || code}
        </div>
        <MotionLabel
          animate={{
            opacity: active ? 1 : 0,
          }}
          initial={{
            opacity: 0,
          }}
          className="absolute inset-0 border-primary border-2 cursor-pointer"
          htmlFor={code}
          style={{
            width,
            height,
            borderRadius,
          }}
        />
      </HoverCardTrigger>

      <HoverCardContent>
        <div className="flex items-center justify-between">
          <div>
            {name} {code}
          </div>
          <div className="flex items-center gap-1">
            <Icon className="h-4 w-4" />
            {status}
          </div>
        </div>

        {(isPreDates || "").toString()}
      </HoverCardContent>
    </HoverCard>
  )
}

export default Slot
