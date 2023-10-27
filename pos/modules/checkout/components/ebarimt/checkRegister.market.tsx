import { useState } from "react"
import useCheckRegister from "@/modules/checkout/hooks/useCheckRegister"
import { registerNumberAtom } from "@/store/order.store"
import { useSetAtom } from "jotai"
import { CornerDownLeft } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

const CheckRegister = () => {
  const [current, setCurrent] = useState("")
  const setRegister = useSetAtom(registerNumberAtom)
  const { checkRegister, loading, data } = useCheckRegister()
  const { found, name } = data || {}
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!current.match(/^[А-ЯЁӨҮ]{2}[0-9]{8}$|^\d{7}$/))
      return toast({
        description: "Зөв регистерийн дугаараа оруулана уу",
        variant: "destructive",
      })
    checkRegister({
      variables: {
        registerNumber: current,
      },
      onCompleted(data) {
        const { ordersCheckCompany } = data || {}
        if (ordersCheckCompany.found) {
          setRegister(current)
        }
      },
    })
  }
  return (
    <form onSubmit={handleSubmit}>
      <Label className="block pb-2" htmlFor="registerNumber">
        Байгууллагын РД
      </Label>
      <div className="relative">
        <Input
          className="pl-4 pr-8"
          id="registerNumber"
          placeholder="Байгууллагын РД"
          disabled={loading}
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        ></Input>
        <Button
          className="absolute right-0 top-0 bg-white"
          type="submit"
          loading={loading}
          variant={"outline"}
        >
          {!loading && <CornerDownLeft className="h-4 w-4 -ml-1 mr-2" />}
          Enter
        </Button>
      </div>
      {data && (
        <p
          className={cn(
            "mt-[6px] font-bold",
            found ? "text-green-500" : "text-red-500"
          )}
        >
          {found ? name || "Test company" : "Байгуулга олдсонгүй"}
        </p>
      )}
    </form>
  )
}

export default CheckRegister
