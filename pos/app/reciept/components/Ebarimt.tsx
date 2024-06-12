import { printTypeAtom, registerNumberAtom } from "@/store/order.store"
import { useAtom } from "jotai"
import { QRCodeSVG } from "qrcode.react"

import { IPutResponse } from "@/types/order.types"
import { formatNum } from "@/lib/utils"

const Ebarimt = ({
  qrData,
  totalVAT,
  totalCityTax,
  totalAmount,
  customerTin,
  customerName,
  lottery,
  type,
}: IPutResponse) => {
  const [registerNumber] = useAtom(registerNumberAtom)
  const [printType] = useAtom(printTypeAtom)

  const renderLotteryCode = () => {
    if (!totalAmount) {
      return null
    }

    if (type === "B2B_RECEIPT")
      return (
        <div>
          {customerTin !== registerNumber ? <p>
            <span className="text-[10px]">ТТД:</span>{" "}
            <span className="font-semibold">{customerTin}</span>
          </p> : ''}
          <p>
            <span className="text-[10px]">РД:</span>{" "}
            <span className="font-semibold">{registerNumber}</span>
          </p>
          <p>
            Hэр: <span className="font-semibold">{customerName}</span>
          </p>
          {Number(totalVAT) > 0 && <p>НӨАТ: {formatNum(Number(totalVAT))}</p>}
          {Number(totalCityTax) > 0 && (
            <p>НXАТ: {formatNum(Number(totalCityTax))}</p>
          )}
          <p>Дүн: {formatNum(totalAmount || 0)}</p>
        </div>
      )

    return (
      <>
        {Number(totalVAT) > 0 && <p>НӨАТ: {formatNum(Number(totalVAT))}</p>}
        {Number(totalCityTax) > 0 && (
          <p>НXАТ: {formatNum(Number(totalCityTax))}</p>
        )}
        <p>Дүн: {formatNum(totalAmount || 0)}</p>
        {!printType && !!lottery && (
          <div>
            Сугалаа: <div className="font-semibold">{lottery}</div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="flex items-center border-t pt-1 px-2 gap-2">
      {!printType && !!qrData && <QRCodeSVG value={qrData || ""} />}
      <div className="font-base text-[11px] ">{renderLotteryCode()}</div>
    </div>
  )
}

export default Ebarimt
