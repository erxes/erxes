import { currentAmountAtom } from "@/store"
import { useAtomValue } from "jotai"
import { AlertCircleIcon, BanIcon } from "lucide-react"

import { formatNum } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Badge } from "@/components/ui/badge"
import Image from "@/components/ui/image"

const QrDetail = ({
  errorDescription,
  status,
  qrCode,
}: {
  errorDescription?: string
  status: string
  qrCode: string
}) => {
  const amount = useAtomValue(currentAmountAtom)
  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <div className="text-black/60 mb-1">QR код уншуулах</div>
        <div className="relative">
          <div className="border rounded-lg flex justify-center p-6 ">
            <AspectRatio />
            <div className="absolute inset-0 bg-white rounded-3xl" />
            {qrCode ? (
              <Image
                src={qrCode}
                className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2"
                height={192}
                width={192}
                alt=""
              />
            ) : (
              <BanIcon
                className="h-20 w-20 text-input absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 "
                strokeWidth={1}
              />
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-center flex-col">
        <p className="text-black/60 font-medium">Захиалгийн дүн</p>
        <div className="flex items-center justify-between w-full mb-3">
          <h1 className="font-black text-2xl">{formatNum(amount)}₮</h1>

          <Badge className="border-yellow-400 text-amber-400" variant="outline">
            {status}
          </Badge>
        </div>

        {!!errorDescription && (
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Алдаа !</AlertTitle>
            <AlertDescription className="break-all">
              *{`${errorDescription}`}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}

export default QrDetail
