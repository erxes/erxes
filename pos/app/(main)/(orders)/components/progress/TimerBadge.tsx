import { isFuture } from "date-fns"
import { ClockIcon, TimerIcon, TimerOffIcon } from "lucide-react"

import useTimer from "@/lib/useTimer"
import { Badge } from "@/components/ui/badge"

const TimerBadge = ({
  date,
  isDueDate,
}: {
  date?: string
  isDueDate?: boolean
}) => {
  const { remainingTime } = useTimer(date || "")

  const isOutDated = isDueDate && date && !isFuture(new Date(date))
  const Icon = function () {
    if (isOutDated) return TimerOffIcon

    if (isDueDate) return TimerIcon

    return ClockIcon
  }()
  
  return (
    <Badge variant={isOutDated ? "destructive" : "outline"}>
      <Icon className="h-4 w-4 mr-1" />
      {remainingTime}
    </Badge>
  )
}

export default TimerBadge
