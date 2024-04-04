import { OrderItem } from "@/types/order.types"
import { CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const Items = ({ items }: { items: OrderItem[] }) => {
  return (
    <div>
      <CardTitle className="pb-1">Барааны нэр төрөл</CardTitle>
      <div className="col-span-3 border rounded-lg">
        <Table>
          <TableHeader className="border-b whitespace-nowrap">
            <TableHead className="h-8">Бүтээгдэхүүний нэр</TableHead>
            <TableHead className="h-8">Нэгж үнэ</TableHead>
            <TableHead className="h-8">Тоо ширхэг</TableHead>
            <TableHead className="h-8">Дүн</TableHead>
            <TableHead className="h-8">Хямдрал</TableHead>
            <TableHead className="h-8">Төлөв</TableHead>
            <TableHead className="h-8">Сав баглаа эсэх</TableHead>
            <TableHead className="h-8">Aвч явах</TableHead>
            <TableHead className="h-8">Үйлдвэрлэсэн огноо</TableHead>
          </TableHeader>
          <TableBody>
            {items.map(
              ({
                _id,
                productName,
                unitPrice,
                count,
                discountAmount,
                status,
                isPackage,
                isTake,
                manufacturedDate,
              }) => (
                <TableRow className="border-b" key={_id}>
                  <TableCell className="h-8 whitespace-nowrap">
                    {productName}
                  </TableCell>
                  <TableCell className="h-8">
                    {unitPrice.toLocaleString()}
                  </TableCell>
                  <TableCell className="h-8">{count}</TableCell>
                  <TableCell className="h-8">
                    {(unitPrice * count).toLocaleString()}
                  </TableCell>
                  <TableCell className="h-8">
                    {(discountAmount || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="h-8">{status}</TableCell>
                  <TableCell className="h-8">{isPackage}</TableCell>
                  <TableCell className="h-8">{isTake}</TableCell>
                  <TableCell className="h-8">{manufacturedDate}</TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default Items
