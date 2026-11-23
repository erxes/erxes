import { useState } from "react"
import { paymentTypesAtom } from "@/store/config.store"
import { useAtomValue } from "jotai"
import { CreditCardIcon } from "lucide-react"

import { BANK_CARD_TYPES } from "@/lib/constants"
import { getLocal, getPaymentType, setLocal } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"

import { SettingsSection } from "./SettingsSection"

const GolomtConfig = () => {
  const paymentTypes = useAtomValue(paymentTypesAtom) || []
  const paymentType = getPaymentType(paymentTypes, BANK_CARD_TYPES.GOLOMT)
  const [terminalID, setTerminalID] = useState(getLocal("golomtId") || "")
  const [portNo, setPortNo] = useState(getLocal("golomtPortNo") || "")

  if (!paymentType) {
    return null
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLocal("golomtId", terminalID)
    setLocal("golomtPortNo", portNo)
    toast({ description: "Амжилттай хадгаллаа", variant: "success" })
  }

  return (
    <SettingsSection
      title="Голомт банк"
      description="Картын терминалын ID болон холболтын порт"
      icon={CreditCardIcon}
    >
      <form className="space-y-3 px-2 py-2" onSubmit={handleSubmit}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label
              htmlFor="golomtId"
              className="font-mono text-xs font-semibold uppercase text-zinc-400 dark:text-zinc-500"
            >
              Terminal ID
            </label>
            <Input
              id="golomtId"
              placeholder="Терминалын ID"
              className="h-8 rounded-sm border-0 text-[13px] shadow-xs"
              required
              value={terminalID}
              onChange={(e) => setTerminalID(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="golomtPortNo"
              className="font-mono text-xs font-semibold uppercase text-zinc-400 dark:text-zinc-500"
            >
              Port
            </label>
            <Input
              id="golomtPortNo"
              placeholder="Терминалын dev-PORT"
              className="h-8 rounded-sm border-0 text-[13px] shadow-xs"
              value={portNo}
              onChange={(e) => setPortNo(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            type="submit"
            className="h-8 rounded px-3 text-[13px] font-medium"
          >
            Хадгалах
          </Button>
        </div>
      </form>
    </SettingsSection>
  )
}

export default GolomtConfig
