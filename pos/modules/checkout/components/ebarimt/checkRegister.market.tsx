import { useState } from "react"
import useCheckRegister from "@/modules/checkout/hooks/useCheckRegister"
import { registerNumberAtom } from "@/store/order.store"
import { useAtom } from "jotai"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoaderIcon } from "@/components/ui/loader"

const CheckRegister = () => {
  const [current, setCurrent] = useState("")
  const [, setRegister] = useAtom(registerNumberAtom)
  const { checkRegister, loading, data } = useCheckRegister()
  const { found, name } = data || {}
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
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
          type="number"
          disabled={loading}
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        ></Input>
        {loading && (
          <LoaderIcon className="absolute right-2 top-2" strokeWidth={1} />
        )}
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

      <input
        type="submit"
        className="absolute"
        style={{ left: -9999, width: 1, height: 1 }}
        tabIndex={-1}
      />
    </form>
  )
}

export default CheckRegister
