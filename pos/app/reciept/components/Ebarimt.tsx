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
            <span className="text-[10px]">Компанийн РД:</span>{" "}
            <span className="font-semibold">{registerNumber}</span>
          </p>
          <p>
            Hэр: <span className="font-semibold">{lottery}</span>
          </p>
        </div>
      )

    return (
      <>
        <p>НӨАТ: {formatNum(vat || 0)}</p>
        <p>НXАТ: {formatNum(cityTax || 0)}</p>
        <p>Дүн: {formatNum(amount || 0)}</p>
        {!type && (
          <p>
            Сугалаа: <span className="font-semibold">{lottery}</span>
          </p>
        )}
      </>
    )
  }

  return (
    <div className="flex items-center border-t pt-1">
      {!type && (
        <div className="w-1/2">
          {!!qrData && <QRCodeSVG value={qrData || ""} />}
        </div>
      )}
      <div className="font-base w-1/2 text-[11px]">{renderLotteryCode()}</div>
    </div>
  )
}

export default Ebarimt
