import { useSearchParams } from "next/navigation"
import {
  calcCashAtom,
  cashAtom,
  currentCashTotalAtom,
} from "@/store/cover.store"
import { useAtom, useAtomValue } from "jotai"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const CashAmounts = () => {
  const [cash, setCash] = useAtom(cashAtom)
  const calcCash = useAtomValue(calcCashAtom)
  const cashTotal = useAtomValue(currentCashTotalAtom)
  const id = useSearchParams().get("id")

  const onChange = (value: string, idx: number) => {
    const formatedValue = Number(value) > 0 ? Number(value) : 0
    setCash({
      ...cash,
      paidSummary: (cash.paidSummary || []).map((p, i) =>
        i !== idx
          ? p
          : {
              ...p,
              value: formatedValue > 0 ? formatedValue : 0,
              amount: formatedValue * p.kindOfVal,
              kind: p.kindOfVal + "",
            }
      ),
    })
  }

  const calcAmount = id === "create" ? calcCash : cash.paidDetail

  return (
    <Card>
      <CardHeader>
        <CardTitle>Мөнгөн дэвсгэртийн задаргаа</CardTitle>
        <CardDescription>
          Дэвсгэрт тус бүрийн тоог оруулж, системээс гаргасан дүнтэй харьцуулж
          хянана уу
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 pb-1">
          <Label className="w-1/3">Дэвсгэрт</Label>
          <Label className="w-1/3">Дэвсгэртийн тоо</Label>
          <Label className="w-1/3">Дүн</Label>
        </div>
        {(cash.paidSummary || []).map(({ kindOfVal, value }, idx) => (
          <div className="flex items-center space-x-2 pb-2" key={kindOfVal}>
            <Input
              className="w-1/3 text-right"
              disabled
              value={kindOfVal.toLocaleString()}
            />
            <Input
              className="w-1/3"
              type="number"
              value={value}
              onChange={(e) => onChange(e.target.value, idx)}
            />
            <Input
              className="w-1/3 text-right"
              disabled
              value={((value || 0) * kindOfVal).toLocaleString()}
            />
          </div>
        ))}

        <CardFooter className="flex items-center space-x-2 p-0 ">
          <div className="w-1/3">
            <Label>Систем дүн</Label>
            <Input disabled value={(calcAmount || 0).toLocaleString()} />
          </div>
          <div className="w-1/3">
            <Label>Зөрүү</Label>
            <Input
              disabled
              value={(Number(calcAmount) - cashTotal).toLocaleString()}
            />
          </div>
          <div className="w-1/3">
            <Label>Бүгд</Label>
            <Input value={cashTotal.toLocaleString()} disabled />
          </div>
        </CardFooter>
      </CardContent>
    </Card>
  )
}

export default CashAmounts
