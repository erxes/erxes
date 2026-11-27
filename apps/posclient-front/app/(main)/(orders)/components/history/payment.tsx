import { PanelField, PanelSection } from "@/modules/record-side-panel"
import { paymentTypesAtom } from "@/store/config.store"
import { useAtomValue } from "jotai"
import {
  BanknoteIcon,
  CreditCardIcon,
  SmartphoneIcon,
  WalletIcon,
} from "lucide-react"

const formatAmount = (amount?: number | string) =>
  `${Number(amount || 0).toLocaleString()}₮`

const Payment = ({
  cashAmount,
  mobileAmount,
  totalAmount,
  paidAmounts,
}: {
  cashAmount: number
  mobileAmount: number
  totalAmount: number
  finalAmount?: number
  paidAmounts: {
    _id: string
    type: string
    amount: string
  }[]
}) => {
  const paymentTypes = useAtomValue(paymentTypesAtom)

  return (
    <PanelSection title="Төлбөр" nested>
      <PanelField icon={WalletIcon} label="Нийт дүн">
        <span className="font-semibold tabular-nums">
          {formatAmount(totalAmount)}
        </span>
      </PanelField>
      <PanelField icon={BanknoteIcon} label="Бэлнээр">
        <span className="tabular-nums">{formatAmount(cashAmount)}</span>
      </PanelField>
      <PanelField icon={SmartphoneIcon} label="Цахимаар">
        <span className="tabular-nums">{formatAmount(mobileAmount)}</span>
      </PanelField>
      {(paymentTypes || []).flatMap((type) =>
        (paidAmounts || [])
          .filter((paid) => paid.type === type.type)
          .map((paid) => (
            <PanelField key={paid._id} icon={CreditCardIcon} label={type.title}>
              <span className="tabular-nums">{formatAmount(paid.amount)}</span>
            </PanelField>
          ))
      )}
    </PanelSection>
  )
}

export default Payment
