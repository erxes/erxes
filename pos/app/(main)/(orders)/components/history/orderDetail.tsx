import { queries } from "@/modules/orders/graphql"
import { detailIdAtom } from "@/store/history.store"
import { useQuery } from "@apollo/client"
import { format } from "date-fns"
import { useAtom } from "jotai"
import {
  CalendarCheckIcon,
  CalendarClockIcon,
  CalendarIcon,
  CalendarPlusIcon,
  CheckCircle,
  CircleIcon,
  GaugeCircle,
  HashIcon,
  LampIcon,
  LucideIcon,
  Luggage,
  StopCircle,
  StoreIcon,
  TruckIcon,
  UserCog,
} from "lucide-react"

import { IOrderStatus } from "@/types/order.types"
import { ORDER_STATUSES } from "@/lib/constants"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent } from "@/components/ui/sheet"

import Items from "./items"
import Payment from "./payment"

const StatusIcons = {
  [ORDER_STATUSES.NEW]: CircleIcon,
  [ORDER_STATUSES.DOING]: StopCircle,
  [ORDER_STATUSES.REDOING]: StopCircle,
  [ORDER_STATUSES.PENDING]: GaugeCircle,
  [ORDER_STATUSES.DONE]: CircleIcon,
  [ORDER_STATUSES.COMPLETE]: CheckCircle,
}

const TypeIcons = {
  eat: StoreIcon,
  take: Luggage,
  delivery: TruckIcon,
}
const typeLabel = {
  eat: "",
}

const OrderDetail = () => {
  const [detailId, setDetailId] = useAtom(detailIdAtom)
  const { loading, data } = useQuery(queries.historyDetail, {
    skip: !detailId,
    variables: { id: detailId },
  })

  const {
    number,
    status,
    type,
    modifiedAt,
    createdAt,
    dueDate,
    slotCode,
    user,
    cashAmount,
    mobileAmount,
    totalAmount,
    finalAmount,
    paidAmounts,
    paidDate,
    items,
  } = data?.orderDetail || {}
  const { primaryPhone, primaryEmail, email } = user || {}

  const formatDate = (date: string) =>
    !!date ? format(new Date(date), "yyyy.MM.dd HH:mm") : ""

  if (loading || !detailId) return null

  return (
    <Sheet open={!!detailId} onOpenChange={() => setDetailId(null)}>
      <SheetContent className="sm:max-w-3xl w-full p-4 overflow-y-auto">
        <div className="pb-3 text-sm font-bold">Захиалгын дэлгэрэнгүй</div>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <DescriptionCard
              title="Захиалгын дугаар"
              value={number}
              Icon={HashIcon}
            />
            <DescriptionCard
              title="Төлөв"
              value={status}
              Icon={StatusIcons[status as IOrderStatus]}
            />
            <DescriptionCard
              title="Төрөл"
              value={type}
              Icon={TypeIcons[type as keyof typeof TypeIcons]}
            />
            <DescriptionCard
              title="Үүсгэсэн огноо"
              value={formatDate(createdAt)}
              Icon={CalendarPlusIcon}
            />
            <DescriptionCard
              title="Төлбөр төлсөн огноо"
              value={formatDate(paidDate)}
              Icon={CalendarCheckIcon}
            />
            <DescriptionCard
              title="Өөрчилсөн огноо"
              value={formatDate(modifiedAt)}
              Icon={CalendarIcon}
            />
            {!!dueDate && (
              <DescriptionCard
                title="Дуусах огноо /DueDate/"
                value={formatDate(dueDate)}
                Icon={CalendarClockIcon}
              />
            )}
            {!!slotCode && (
              <DescriptionCard
                title="Байрлал"
                value={slotCode || ""}
                Icon={LampIcon}
              />
            )}

            <DescriptionCard
              title="Кассчин"
              value={`${primaryEmail || email || ""} ${primaryPhone || ""}`}
              Icon={UserCog}
            />
          </div>
          <Payment
            cashAmount={cashAmount}
            mobileAmount={mobileAmount}
            totalAmount={totalAmount}
            finalAmount={finalAmount}
            paidAmounts={paidAmounts}
          />
          <Items items={items} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

const DescriptionCard = ({
  title,
  value,
  Icon,
}: {
  title: string
  value: string
  Icon: LucideIcon
}) => (
  <Card className="">
    <CardHeader className="p-2 pb-1">
      <CardTitle className="text-xs text-slate-500 font-medium ">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="flex px-2 pb-2 items-center">
      <Icon className="mr-1 h-5 w-5 text-slate-800" strokeWidth={1.9} />
      <div className="text-sm font-semibold text-slate-800">{value}</div>
    </CardContent>
  </Card>
)

export default OrderDetail
