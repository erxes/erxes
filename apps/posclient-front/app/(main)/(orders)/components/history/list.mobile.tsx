import { filterAtom } from "@/store/history.store"
import { format } from "date-fns"
import { useAtomValue } from "jotai"
import { SoupIcon, TruckIcon } from "lucide-react"

import { IOrderHistory } from "@/types/order.types"
import { typeTextDef } from "@/lib/constants"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

import HistoryItemAction from "./historyItemAction"

const ListMobile = ({
  orders,
  loading,
}: {
  orders: IOrderHistory[]
  loading: boolean
}) => {
  return (
    <div className="m-3 md:m-5 grid md:grid-cols-2 gap-4">
      {loading ? (
        <Loading />
      ) : (
        orders.map((order) => <OrderItem {...order} key={order._id} />)
      )}
    </div>
  )
}

const Loading = () => {
  const { perPage } = useAtomValue(filterAtom)
  const uniqueIndexes = []
  for (let i = 0; i < perPage; i++) {
    uniqueIndexes.push(i)
  }
  return (
    <>
      {uniqueIndexes.map((key) => (
        <Card className="text-sm" key={key}>
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-2">
                <Skeleton className="h-4 w-full" />
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">Үүсгэсэн огноо</span>
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">Өөрчилсөн огноо</span>
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">Үүсгэсэн огноо</span>
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
          <Separator />
          <CardFooter className="justify-between pt-2 pb-2 pr-2">
            <div className="font-bold">
              #<Skeleton className="h-4 w-full" />
            </div>
          </CardFooter>
        </Card>
      ))}
    </>
  )
}

const OrderItem = (props: IOrderHistory) => {
  const { type, status, number, createdAt, modifiedAt, paidDate } = props
  const TypeIcon = type === "eat" ? SoupIcon : TruckIcon
  const fd = (date: string) =>
    date ? format(new Date(date), "yyyy.MM.dd HH:mm") : "-"
  return (
    <Card className="text-sm">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-2">
            <TypeIcon />
            {typeTextDef[type]}
          </span>
          <Badge>{status}</Badge>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-600">Үүсгэсэн огноо</span>
          {fd(createdAt)}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-600">Өөрчилсөн огноо</span>
          {fd(modifiedAt)}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-600">Төлбөр төлсөн огноо</span>
          {fd(paidDate)}
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="justify-between pt-2 pb-2 pr-2">
        <div className="font-bold"># {number.split("_")[1]}</div>
        <div>
          <HistoryItemAction {...props} />
        </div>
      </CardFooter>
    </Card>
  )
}

export default ListMobile
