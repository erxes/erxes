import { toggleRemainderAtom, } from "@/store"
import { Button } from "@/components/ui/button"
import { useAtom, useAtomValue } from "jotai"
import { saveRemainderAtom } from "@/store/config.store"
import { cn } from "@/lib/utils"

const ToggleRemainder = () => {
  const saveRemainder = useAtomValue(saveRemainderAtom)
  const [toggleRemainder, setToggleRemainder] = useAtom(toggleRemainderAtom)

  if (!saveRemainder) {
    return null
  }

  return <Button
    variant={!toggleRemainder ? "outline" : undefined}
    size="sm"
    className={cn(
      "my-2 whitespace-nowrap font-bold",
      !toggleRemainder && " text-black/75"
    )}
    onClick={() => {
      setToggleRemainder(!toggleRemainder)
    }}
  >
    Үлд
  </Button>
}

export default ToggleRemainder
