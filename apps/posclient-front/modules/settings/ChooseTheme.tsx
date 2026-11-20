"use client"

import { modeAtom } from "@/store"
import { useAtom } from "jotai"

import { modeT } from "@/types/config.types"
import { Label } from "@/components/ui/label"
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
    <div className="w-full">
      <Label className="block pb-1">Theme сонгох</Label>
      <Select
        value={mode}
        onValueChange={(value: modeT) => {
          setMode(value)
        }}
      >
        <SelectTrigger className="h-10 font-medium">
          <SelectValue placeholder="сонгох" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="main">Үндсэн</SelectItem>
          <SelectItem value="market">Дэлгүүр</SelectItem>
          <SelectItem value="coffee-shop">Кофе шоп</SelectItem>
          <SelectItem value="restaurant">Ресторан</SelectItem>
          <SelectItem value="kiosk">Киоск</SelectItem>
          <SelectItem value="mobile">Mobile</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

export default ChooseTheme
