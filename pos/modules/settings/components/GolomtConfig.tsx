import { useState } from "react"

import { IPaymentType } from "@/types/config.types"
import { BANK_CARD_TYPES } from "@/lib/constants"
import { getLocal, getPaymentType, setLocal } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

const GolomtConfig = ({ paymentTypes }: { paymentTypes: IPaymentType[] }) => {
  const paymentType = getPaymentType(paymentTypes, BANK_CARD_TYPES.GOLOMT)
  const [terminalID, setTerminalID] = useState(getLocal("golomtId") || "")

  if (!paymentType) return null

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLocal("golomtId", terminalID)
    toast({ description: "Амжилттай" })
  }

  return (
    <form className="w-full pb-5" onSubmit={handleSubmit}>
      <Label htmlFor="golomtId">Golomt Terminal ID</Label>
      <div className="flex items-center space-x-2 pt-1">
        <Input
          id="golomtId"
          placeholder="Терминалийн ID-г оруулана уу"
          required
          value={terminalID}
          onChange={(e) => setTerminalID(e.target.value)}
        />
        <Button className="font-semibold">Хадгалах</Button>
      </div>
    </form>
  )
}

export default GolomtConfig
