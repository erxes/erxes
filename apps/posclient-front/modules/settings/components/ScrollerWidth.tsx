import { scrollWidthAtom } from "@/store"
import { useAtom } from "jotai"

import { Input } from "@/components/ui/input"

import { SettingsRow } from "./SettingsSection"

const ScrollerWidth = () => {
  const [width, setWidth] = useAtom(scrollWidthAtom)

  return (
    <SettingsRow
      title="Гүйлгэх зурвасын өргөн"
      description="Жагсаалтын scroll-ийн өргөн, px (дээд тал нь 48)"
      htmlFor="scrollWidth"
      control={
        <Input
          id="scrollWidth"
          value={width}
          onChange={(e) =>
            setWidth(Math.min(48, Math.max(0, Number(e.target.value) || 0)))
          }
          type="number"
          min={0}
          max={48}
          className="h-8 w-20 text-right tabular-nums"
        />
      }
    />
  )
}

export default ScrollerWidth
