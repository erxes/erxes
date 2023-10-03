import useAddPayment from "@/modules/checkout/hooks/useAddPayment"
import { currentAmountAtom } from "@/store"
import { activeOrderAtom, unPaidAmountAtom } from "@/store/order.store"
import { paymentSheetAtom } from "@/store/ui.store"
import { useAtom } from "jotai"

import { formatNum } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"

const CashSheet = () => {
  const [_id] = useAtom(activeOrderAtom)
  const [currentAmount, setCurrentAmount] = useAtom(currentAmountAtom)
  const [unpaidAmount] = useAtom(unPaidAmountAtom)
  const odd = currentAmount - unpaidAmount
  const { addPayment, loading } = useAddPayment()
  const [, setOpenSheet] = useAtom(paymentSheetAtom)

  const handleAddPayment = () =>
    addPayment({
      variables: { cashAmount: odd > 0 ? unpaidAmount : currentAmount, _id },
      onCompleted: () => setOpenSheet(false),
    })

  return (
    <>
      <SheetHeader className="flex-none border-b pb-2">
        <SheetTitle className="text-sm">Бэлнээр</SheetTitle>
      </SheetHeader>
      <div className="flex-auto">
        <div className="space-y-2">
          <Label>Дүн</Label>
          <Input
            value={currentAmount}
            onChange={(e) => setCurrentAmount(Number(e.target.value))}
          />
          {odd > 0 && (
            <div className="font-semibold">Хариулт дүн: {formatNum(odd)}₮</div>
          )}
        </div>
      </div>
      <SheetFooter>
        <Button
          className="w-full bg-green-500 text-sm font-bold hover:bg-green-500/90"
          loading={loading}
          onClick={handleAddPayment}
        >
          Төлбөр төлөх
        </Button>
      </SheetFooter>
    </>
  )
}

export default CashSheet
