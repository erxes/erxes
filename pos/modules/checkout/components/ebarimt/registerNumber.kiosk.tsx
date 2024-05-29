import { useState } from "react"
import useOrderCU from "@/modules/orders/hooks/useOrderCU"
import { kioskModalView } from "@/store"
import { registerNumberAtom } from "@/store/order.store"
import { useAtom, useSetAtom } from "jotai"
import { DeleteIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Button } from "@/components/ui/button"
import { DialogContent } from "@/components/ui/dialog"

import useCheckRegister from "../../hooks/useCheckRegister"

const RegisterNumber = () => {
  const [value, setValue] = useState<number[]>([])
  const [registerNumber, setRegister] = useAtom(registerNumberAtom)
  const { checkRegister, loading, data } = useCheckRegister()
  const { found, name } = data || {}
  const setView = useSetAtom(kioskModalView)
  const { loading: loadingEdit, orderCU } = useOrderCU(() => {
    setView("choosePay")
  })

  const handleClick = (val: number | "x") => {
    if (val === "x") {
      const newValue = value.slice(0, -1)
      setValue(newValue)
    } else {
      const newValue = [...value, val]
      setValue(newValue.length === 8 ? newValue.slice(1) : newValue)
    }
    return setRegister("")
  }

  const handleSubmit = () => {
    checkRegister({
      variables: {
        registerNumber: value.join(""),
      },
      onCompleted(data) {
        const { ordersCheckCompany } = data || {}
        if (ordersCheckCompany.found) {
          setRegister(value.join(""))
        }
      },
    })
  }
  const handlePay = () => {
    orderCU()
  }

  const canPay = found && value.length === 7 && !!registerNumber

  return (
    <DialogContent className="max-w-full bg-transparent w-full h-screen flex flex-col justify-between p-0 border-none">
      <div />
      <div className="p-6 bg-black rounded-2xl text-white space-y-6 mx-10 pb-12">
        <h2 className="text-3xl font-black text-center">
          Байгууллагын РД <br />
          оруулна уу.
        </h2>
        <div className="space-y-3">
          <div className="border text-4xl font-extrabold py-3 px-5 rounded-lg grid grid-cols-7 gap-2 text-black ">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                className="h-16 bg-white rounded-xl flex items-center justify-center"
                key={i}
              >
                {typeof value[i] === "undefined" ? "*" : value[i]}
              </div>
            ))}
          </div>
          {!!data && (
            <h3
              className={cn(
                "font-extrabold text-destructive text-lg text-center",
                canPay ? "text-green-500" : "text-red-500"
              )}
            >
              {canPay ? name || "Test company" : "Байгуулга олдсонгүй"}
            </h3>
          )}
          <Button
            className={"w-full h-14 rounded-2xl text-lg"}
            size="lg"
            disabled={value.length < 7}
            onClick={found && value.length === 7 ? handlePay : handleSubmit}
            loading={loading || loadingEdit}
          >
            {canPay ? "Төлбөр төлөх" : "Шалгах"}
          </Button>
        </div>
      </div>
      <div className="bg-black py-10 text-white">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-5">
          {Array.from({ length: 10 }, (_, i) => (
            <AspectRatio key={i}>
              <Button
                className="w-full h-full text-xl font-black rounded-full hover:bg-white/10 hover:text-white border-2"
                variant="outline"
                size="lg"
                onClick={() => handleClick(i === 9 ? 0 : i + 1)}
                disabled={loading || loadingEdit}
              >
                {i === 9 ? "0" : i + 1}
              </Button>
            </AspectRatio>
          ))}
          <AspectRatio>
            <Button
              className="w-full h-full text-xl font-black rounded-full hover:bg-white/10 hover:text-white border-2"
              variant="outline"
              size="lg"
              onClick={() => handleClick("x")}
              disabled={loading || loadingEdit}
            >
              <DeleteIcon className="h-12 w-12" strokeWidth={1.5} />
            </Button>
          </AspectRatio>
        </div>
      </div>
    </DialogContent>
  )
}

export default RegisterNumber
