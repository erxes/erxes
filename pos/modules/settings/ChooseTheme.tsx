"use client"

import { modeAtom } from "@/store"
import { useAtom } from "jotai"

import { modeT } from "@/types/config.types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ChooseTheme = () => {
  const [mode, setMode] = useAtom(modeAtom)

  return (
    <div className="relative w-full rounded-lg bg-black text-sm">
      <Select
        value={mode}
        onValueChange={(value: modeT) => {
          setMode(value)
        }}
      >
        <SelectTrigger className="h-auto border-none p-3 pt-7 text-sm font-extrabold text-white">
          <SelectValue placeholder="сонгох" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="main">Үндсэн</SelectItem>
          <SelectItem value="market">Дэлгүүр</SelectItem>
          <SelectItem value="coffee-shop">Кофе шоп</SelectItem>
          <SelectItem value="restaurant">Ресторан</SelectItem>
          <SelectItem value="kiosk">Киоск</SelectItem>
        </SelectContent>
      </Select>
      <small className="absolute left-3 top-2 font-bold leading-4 text-white/80">
        Theme сонгох
      </small>
    </div>
  )
}

export default ChooseTheme
