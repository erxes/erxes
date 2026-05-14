import { currentAmountsAtom } from "@/store/cover.store"
import { useAtom } from "jotai"

import { IPaymentType } from "@/types/config.types"
import { Detail } from "@/types/cover.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const Amount = ({
  title,
  type,
  amount,
}: IPaymentType & { amount?: number }) => {
  const [amounts, setAmounts] = useAtom(currentAmountsAtom)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <div className="w-1/3 space-y-1">
            <Label>Систем дүн</Label>
            <Input disabled value={amount || 0} />
          </div>
          <div className="w-1/3 space-y-1">
            <Label>Зөрүү</Label>
            <Input disabled value={(amount || 0) - (amounts[type] || 0)} />
          </div>
          <div className="w-1/3 space-y-1">
            <Label>Бүгд</Label>
            <Input
              value={amounts[type] || 0}
              onChange={(e) =>
                setAmounts({
                  ...amounts,
                  [type]:
                    Number(e.target.value) > 0 ? Number(e.target.value) : 0,
                })
              }
              type="number"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export const getValueOfPayment = (detail: any) =>
  ((detail?.paidSummary || [])[0] || {}).value || 0

export const handleMap = (arr: Detail[], type: string, value: any) => {
  return arr.map((el) => {
    if (el.paidType === type) {
      return {
        ...el,
        paidSummary: [
          {
            ...el.paidSummary[0],
            amount: value,
            value,
          },
        ],
      }
    }
    return el
  })
}

export default Amount
