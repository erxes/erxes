import { paymentTypesAtom } from "@/store/config.store"
import { useAtomValue } from "jotai"

import { CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const Payment = ({
  cashAmount,
  mobileAmount,
  totalAmount,
  finalAmount,
  paidAmounts,
}: {
  cashAmount: number
  mobileAmount: number
  totalAmount: number
  finalAmount: number
  paidAmounts: {
    _id: string
    type: string
    amount: string
    info: any
  }[]
}) => {
  const paymentTypes = useAtomValue(paymentTypesAtom)

  return (
    <div>
      <CardTitle className="pb-1">Төлбөр</CardTitle>
      <div className="border rounded-lg">
        <Table>
          <TableHeader className="border-b">
            <TableHead className="h-8">Төрөл</TableHead>
            <TableHead className="h-8">Дүн</TableHead>
          </TableHeader>
          <TableBody>
            <TableRow className="border-b">
              <TableCell className="h-8">Нийт дүн</TableCell>
              <TableCell className="h-8">
                {(totalAmount || 0).toLocaleString()}
              </TableCell>
              <TableCell />
            </TableRow>
            <TableRow className="border-b">
              <TableCell className="h-8">Бэлнээр</TableCell>
              <TableCell className="h-8">
                {(cashAmount || 0).toLocaleString()}
              </TableCell>
              <TableCell />
            </TableRow>
            <TableRow className="border-b">
              <TableCell className="h-8">Цахимаар</TableCell>
              <TableCell className="h-8">
                {(mobileAmount || 0).toLocaleString()}
              </TableCell>
              <TableCell />
            </TableRow>
            {(paymentTypes || []).map((type) => {
              const pAmounts = paidAmounts.filter((pt) => pt.type === type.type)
              if (!pAmounts.length) {
                <TableRow className="border-b" key={type._id}>
                  <TableCell className="h-8">{type.title}</TableCell>
                  <TableCell className="h-8">
                    {(0).toLocaleString()}
                  </TableCell>
                  <TableCell className="h-8">
                    {"-"}
                  </TableCell>
                </TableRow>
              }
              return pAmounts.map(pa => (
                <TableRow className="border-b" key={type._id}>
                  <TableCell className="h-8">{type.title}</TableCell>
                  <TableCell className="h-8">
                    {(pa?.amount || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="h-8">
                    {!!pa?.info ? <div /> : "-"}
                  </TableCell>
                </TableRow>
              ))
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default Payment
