import { modeAtom } from "@/store"
import { useAtomValue } from "jotai"
import { ListFilterIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const RenderFilter = ({ children }: React.PropsWithChildren) => {
  const mode = useAtomValue(modeAtom)

  if (mode !== "mobile") return <>{children}</>

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size={"sm"}>
          <ListFilterIcon className="h-5 w-5 mr-1" />
          Шүүх
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-screen">{children}</PopoverContent>
    </Popover>
  )
}

export default RenderFilter
