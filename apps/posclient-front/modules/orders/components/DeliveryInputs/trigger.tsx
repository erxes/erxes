import { isPreAtom } from "@/store/order.store"
import { useAtomValue } from "jotai"
import { AlarmClockIcon, SlidersHorizontalIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CollapsibleTrigger } from "@/components/ui/collapsible"

const SettingsTrigger = () => {
  const isPre = useAtomValue(isPreAtom)
  return (
    <CollapsibleTrigger asChild>
      <Button
        variant="outline"
        className={cn(
          "col-span-2 h-12 w-12 rounded-xl px-0 font-semibold",
          isPre && "border-2 border-primary text-primary hover:text-primary"
        )}
      >
        {isPre ? (
          <AlarmClockIcon className="h-5 w-5 animate-bounce" />
        ) : (
          <SlidersHorizontalIcon className="h-5 w-5" />
        )}
      </Button>
    </CollapsibleTrigger>
  )
}

export default SettingsTrigger
