import { paymentTypesAtom } from "@/store/config.store"
import { useAtomValue } from "jotai"
import {
  CreditCardIcon,
  LucideIcon,
  PaletteIcon,
  PrinterIcon,
  RefreshCwIcon,
  UserIcon,
} from "lucide-react"

import { BANK_CARD_TYPES } from "@/lib/constants"
import { useQueryState } from "@/lib/useQueryState"
import { getPaymentType } from "@/lib/utils"

export type SettingsSectionKey =
  "profile" | "appearance" | "printing" | "terminal" | "sync"

export type SettingsSectionItem = {
  value: SettingsSectionKey
  label: string
  description: string
  icon: LucideIcon
  group: "pos" | "data"
}

const SECTIONS: SettingsSectionItem[] = [
  {
    value: "profile",
    group: "pos",
    label: "Профайл",
    description: "Нэвтэрсэн хэрэглэгч болон кассын мэдээлэл",
    icon: UserIcon,
  },
  {
    value: "appearance",
    group: "pos",
    label: "Харагдах байдал",
    description: "Кассын дэлгэцийн загвар, бараа ба жагсаалтын харагдац",
    icon: PaletteIcon,
  },
  {
    value: "printing",
    group: "pos",
    label: "Захиалга ба хэвлэлт",
    description: "Захиалгын мэдэгдэл, баримт хэвлэх тохиргоо",
    icon: PrinterIcon,
  },
  {
    value: "terminal",
    group: "data",
    label: "Картын терминал",
    description: "Банкны картын терминалын холболт",
    icon: CreditCardIcon,
  },
  {
    value: "sync",
    group: "data",
    label: "Синк ба өгөгдөл",
    description: "erxes-ээс тохиргоо, бараа, ширээ татах, захиалга илгээх",
    icon: RefreshCwIcon,
  },
]

export const useSettingsSections = () => {
  const paymentTypes = useAtomValue(paymentTypesAtom) || []
  const hasTerminal = !!getPaymentType(paymentTypes, BANK_CARD_TYPES.GOLOMT)
  const [section, setSection] = useQueryState<string>("section")

  const sections = SECTIONS.filter(
    (item) => item.value !== "terminal" || hasTerminal
  )
  const active = sections.find((item) => item.value === section) || sections[0]

  return { sections, active, setSection }
}
