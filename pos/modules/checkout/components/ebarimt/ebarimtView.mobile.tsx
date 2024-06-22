import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { checkoutDialogOpenAtom, checkoutModalViewAtom } from "@/store"
import { setInitialAtom } from "@/store/order.store"
import { useSetAtom } from "jotai"
import { CheckIcon } from "lucide-react"

import useReciept from "@/lib/useReciept"
import { Button } from "@/components/ui/button"

const EbarimtView = () => {
  const activeOrder = useSearchParams().get("orderId")
  const [printed, setPrinted] = useState(false)
  const setInitial = useSetAtom(setInitialAtom)
  const router = useRouter()
  const setOpen = useSetAtom(checkoutDialogOpenAtom)
  const setView = useSetAtom(checkoutModalViewAtom)

  const { iframeRef } = useReciept({
    onCompleted() {
      setPrinted(true)
    },
  })

  if (printed)
    return (
      <div className="aspect-square md:h-[50vh] md:aspect-auto text-center">
        <div className="p-4 rounded-full bg-primary/20 inline-block mb-6 mt-16">
          <CheckIcon
            className="h-8 w-8 text-primary animate-bounce"
            strokeWidth={3}
          />
        </div>
        <div className="font-semibold text-lg text-center text-primary">
          Баримт хэвлэгдлээ
        </div>
        <Button
          className="mt-6 px-8 font-medium"
          size="lg"
          onClick={() => {
            setInitial()
            setOpen(false)
            router.push("/")
            setView("")
          }}
        >
          Дуусгах
        </Button>
      </div>
    )

  return (
    <iframe
      title="Payment"
      ref={iframeRef}
      src={"/reciept/ebarimt?id=" + activeOrder}
      className="aspect-square md:h-[50vh] md:aspect-auto"
    />
  )
}

export default EbarimtView
