import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/modules/record-table"

import { cn } from "@/lib/utils"

import { useCoverPayments } from "../hooks/useCoverPayments"
import Amount from "./amount"
import { CoverBlock, coverTableFrameClass } from "./cover-ui"

const CustomAmounts = () => {
  const { payments } = useCoverPayments()

  if (!payments.length) {
    return null
  }

  return (
    <CoverBlock
      title="Бусад төлбөр"
      description="Карт, цахим болон бусад төлбөрийн тоолсон дүн"
    >
      <div className={coverTableFrameClass}>
        <Table>
          <TableHeader>
            <TableRow className="[&>td]:border-b-0">
              <TableHead className="w-[34%]">Төрөл</TableHead>
              <TableHead className="text-right">Систем</TableHead>
              <TableHead className="text-right">Тоолсон</TableHead>
              <TableHead className="text-right">Зөрүү</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment, index) => (
              <Amount
                key={payment.type}
                {...payment}
                className={cn(index === 0 && "[&>td]:border-t")}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </CoverBlock>
  )
}

export default CustomAmounts
