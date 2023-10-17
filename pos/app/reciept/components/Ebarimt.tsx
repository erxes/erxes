import { printTypeAtom, registerNumberAtom } from "@/store/order.store"
import { useAtom } from "jotai"
import { QRCodeSVG } from "qrcode.react"

import { IPutResponse } from "@/types/order.types"
import { formatNum } from "@/lib/utils"

const Ebarimt = ({
  qrData,
  vat,
  cityTax,
  amount,
  lottery,
  billType,
}: IPutResponse) => {
  const [registerNumber] = useAtom(registerNumberAtom)
  const [type] = useAtom(printTypeAtom)

  const renderLotteryCode = () => {
    if (!amount) return null
    if (billType === "3")
      return (
        <div>
          <p>
            <span className="text-[10px]">РД:</span>{" "}
            <span className="font-semibold">{registerNumber}</span>
          </p>
          <p>
            Hэр: <span className="font-semibold">{lottery}</span>
          </p>
        </div>
      )

    return (
      <>
        {Number(vat) > 0 && <p>НӨАТ: {formatNum(Number(vat))}</p>}
        {Number(cityTax) > 0 && <p>НXАТ: {formatNum(Number(cityTax))}</p>}
        <p>Дүн: {formatNum(amount || 0)}</p>
        {!type && (
          <p>
            Сугалаа: <p className="font-semibold">{lottery}</p>
          </p>
        )}
      </>
    )
  }

  return (
    <div className="flex items-center border-t pt-1 px-2 gap-2">
      {!type && !!qrData && <QRCodeSVG value={qrData || ""} />}
      <div className="font-base text-[11px] ">{renderLotteryCode()}</div>
    </div>
  )
}

export default Ebarimt
