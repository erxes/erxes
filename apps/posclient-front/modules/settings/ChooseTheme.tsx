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

import { SettingsRow } from "./components/SettingsSection"

const ChooseTheme = () => {
  const [mode, setMode] = useAtom(modeAtom)

  return (
    <SettingsRow
      title="Загвар"
      description="Кассын дэлгэцийн төрөл"
      htmlFor="posTheme"
      control={
        <Select value={mode} onValueChange={(value: modeT) => setMode(value)}>
          <SelectTrigger id="posTheme" className="h-8 w-40 font-medium">
            <SelectValue placeholder="Сонгох" />
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
      }
    />
  )
}

export default ChooseTheme
