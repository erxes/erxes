import { paymentDataAtom } from "@/store"
import { useAtomValue } from "jotai"

import { cn } from "@/lib/utils"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import Image from "@/components/ui/image"

const PaymentDialog = () => {
  const paymentData = useAtomValue(paymentDataAtom)

  return (
    <Dialog open={!!paymentData}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="flex-row gap-2 w-full pb-2 items-center">
          <Image
            src={`/payments/${paymentData?.kind}.png`}
            alt="storepay"
            className="object-contain rounded-lg p-1 bg-white"
            height={48}
            width={48}
          />
          <div className="flex-auto text-left">
            <div className="font-bold text-sm capitalize">
              {paymentData?.kind}
            </div>
            <p
              className={cn(
                "text-black opacity-60 group-hover:opacity-100 transition"
              )}
            >
              апп-р төлөх
            </p>
          </div>
          {/* <div className="flex-auto text-right">4500</div> */}
        </DialogHeader>
        <div className="relative mx-auto max-w-xs w-full">
          <div className=" w-full border rounded-2xl">
            <AspectRatio />
            <div className="absolute inset-0 bg-white rounded-3xl" />
            {!!paymentData?.qrData && (
              <Image
                src={paymentData?.qrData}
                className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2"
                alt=""
                height={256}
                width={256}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PaymentDialog
