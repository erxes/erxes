import { scrollWidth } from "@/store"
import { useAtom } from "jotai"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const ScrollerWidth = () => {
  const [width, setWidth] = useAtom(scrollWidth)
  return (
    <div className="w-full pb-5">
      <Label className="block pb-1">Багцлах төрөл</Label>
      <Input
        value={width}
        onChange={(e) => setWidth(Number(e.target.value))}
        type="number"
        max={48}
      />
    </div>
  )
}

export default ScrollerWidth
