import { toggleRemainderAtom } from "@/store"
import { isShowRemainderAtom, saveRemainderAtom } from "@/store/config.store"
import { useAtom, useAtomValue } from "jotai"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const ToggleRemainder = () => {
  const saveRemainder = useAtomValue(saveRemainderAtom)
  const isShowRemainder = useAtomValue(isShowRemainderAtom)
  const [toggleRemainder, setToggleRemainder] = useAtom(toggleRemainderAtom)

  if (!isShowRemainder || !saveRemainder) {
    return null
  }

  return (
    <Button
      variant="ghost"
      aria-pressed={toggleRemainder}
      size="sm"
      className={cn(
        "h-7 flex-none rounded border-0 px-3 text-[13px] font-medium whitespace-nowrap shadow-none",
        toggleRemainder
          ? "bg-primary/10 text-primary hover:bg-primary/15"
          : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
      onClick={() => {
        setToggleRemainder(!toggleRemainder)
      }}
    >
      Үлд
    </Button>
  )
}

export default ToggleRemainder
