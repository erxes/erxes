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
          "relative col-span-2 size-9 flex-none rounded-md border-0 px-0 text-muted-foreground shadow-xs hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground",
          isPre &&
            "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary data-[state=open]:bg-primary/15 data-[state=open]:text-primary"
        )}
      >
        {isPre ? (
          <AlarmClockIcon className="size-4" aria-label="Урьдчилсан захиалга" />
        ) : (
          <SlidersHorizontalIcon className="size-4" />
        )}
      </Button>
    </CollapsibleTrigger>
  )
}

export default SettingsTrigger
