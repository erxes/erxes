import { memo } from "react"

import { IPaymentOption } from "@/types/payment.types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Image from "@/components/ui/image"
import { RadioGroupItem } from "@/components/ui/radio-group"

const PaymentType = ({
  selected,
  _id,
  kind,
}: IPaymentOption & { selected: boolean }) => {
  return (
    <div className="relative">
      <Button
        variant="outline"
        className={cn(
          "h-auto justify-start p-3 gap-2 group rounded-lg w-full",
          selected && "bg-accent"
        )}
        Component={"div"}
      >
        <RadioGroupItem value={_id} id={_id} />

        <Image
          src={`/payments/${kind}.png`}
          alt="storepay"
          className="object-contain rounded-lg p-0.5 bg-white"
          height={48}
          width={48}
        />
        <div className="flex-auto text-left">
          <div className="font-bold text-sm capitalize">{kind}</div>
          <p
            className={cn(
              "text-black opacity-60 group-hover:opacity-100 transition",
              selected && "opacity-100"
            )}
          >
            апп-р төлөх
          </p>
        </div>
        <label
          className={cn(
            "absolute inset-0 rounded-lg ease-in transition-colors cursor-pointer",
            selected && "border-2  border-gray-700"
          )}
          htmlFor={_id}
        />
      </Button>
    </div>
  )
}

export default memo(PaymentType)
