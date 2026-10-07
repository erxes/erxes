import { queries } from "@/modules/orders/graphql"
import { configAtom, isAdminAtom } from "@/store/config.store"
import { detailIdAtom } from "@/store/history.store"
import { gql, useQuery, useSubscription } from "@apollo/client"
import { format } from "date-fns"
import { useAtom, useAtomValue } from "jotai"
import {
  AlarmClockIcon,
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
  User,
  UserCog,
  XIcon,
} from "lucide-react"

import { IOrderStatus } from "@/types/order.types"
import { ORDER_ITEM_STATUSES, ORDER_STATUSES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetClose, SheetContent } from "@/components/ui/sheet"

import Items from "./items"
import Payment from "./payment"

type OrderChangeEntry = {
  field: string
  oldValue?: unknown
  newValue?: unknown
}

type OrderChangeLog = {
  _id: string
  createdAt?: string
  changes?: OrderChangeEntry[]
  user?: {
    email?: string
    primaryEmail?: string
  }
}

type OrderChangeLogsData = {
  orderChangeLogs?: OrderChangeLog[]
}

const orderLogUpdates = gql`
  subscription posclientOrderLogOrderUpdates(
    $token: String
    $statuses: [String]
  ) {
    ordersOrdered(posToken: $token, statuses: $statuses) {
      _id
    }
  }
`

const itemLogUpdates = gql`
  subscription posclientOrderLogItemUpdates(
    $token: String
    $statuses: [String]
  ) {
    orderItemsOrdered(posToken: $token, statuses: $statuses) {
      _id
    }
  }
`

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

const OrderDetail = () => {
  const [detailId, setDetailId] = useAtom(detailIdAtom)
  const isAdmin = useAtomValue(isAdminAtom)
  const { token } = useAtomValue(configAtom) || {}
  const { loading, data } = useQuery(queries.historyDetail, {
    skip: !detailId,
    variables: { id: detailId },
  })
  const { data: changeLogData, refetch: refetchChangeLogs } =
    useQuery<OrderChangeLogsData>(queries.orderChangeLogs, {
      skip: !detailId || !isAdmin,
      variables: { orderId: detailId || "" },
      fetchPolicy: "network-only",
    })

  useSubscription<{ ordersOrdered?: { _id: string } }>(orderLogUpdates, {
    skip: !detailId || !isAdmin || !token,
    variables: { token, statuses: ORDER_STATUSES.ALL },
    onData({ data: event }) {
      if (event.data?.ordersOrdered?._id === detailId) {
        void refetchChangeLogs()
      }
    },
  })
  useSubscription<{ orderItemsOrdered?: { _id: string } }>(itemLogUpdates, {
    skip: !detailId || !isAdmin || !token,
    variables: { token, statuses: ORDER_ITEM_STATUSES.ALL },
    onData() {
      void refetchChangeLogs()
    },
  })

  const {
    number,
    status,
    type,
    modifiedAt,
    createdAt,
    dueDate,
    isPre,
    slotCode,
    user,
    cashAmount,
    mobileAmount,
    totalAmount,
    finalAmount,
    paidAmounts,
    paidDate,
    items,
    description,
    customer,
  } = data?.orderDetail || {}
  const { primaryPhone, primaryEmail, email } = user || {}

  const formatDate = (date: string) =>
    !!date ? format(new Date(date), "yyyy.MM.dd HH:mm") : ""

  if (loading || !detailId) {
    return null
  }

  return (
    <Sheet open={!!detailId} onOpenChange={() => setDetailId(null)}>
      <SheetContent className="sm:max-w-3xl w-full p-4 overflow-y-auto">
        <div className="pb-3 text-sm font-bold flex items-start justify-between">
          Захиалгын дэлгэрэнгүй
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="-mt-2.5">
              <XIcon className="h-5 w-5" />
            </Button>
          </SheetClose>
        </div>
        <div className="space-y-3">
          <div className="grid md:grid-cols-3 gap-2">
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
            {!!isPre && (
              <DescriptionCard
                title="Урьдчилсан захиалга эсэх"
                value={isPre ? "Тийм" : "Үгүй"}
                Icon={AlarmClockIcon}
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
            {!!customer && (
              <DescriptionCard
                title="Харилцагч"
                value={
                  customer?.firstName || customer?.lastName
                    ? `${customer.firstName || ""} ${customer.lastName || ""}`
                    : `${customer.primaryEmail || customer.email || ""} ${
                        customer.primaryPhone || ""
                      }`
                }
                Icon={User}
              />
            )}
            {!!description && (
              <Card className="col-span-3">
                <CardHeader className="p-2 pb-1">
                  <CardTitle className="text-xs text-slate-500 font-medium ">
                    Тайлбар
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex px-2 pb-2 items-center">
                  <div className="text-sm text-slate-800">{description}</div>
                </CardContent>
              </Card>
            )}
          </div>
          <Payment
            cashAmount={cashAmount}
            mobileAmount={mobileAmount}
            totalAmount={totalAmount}
            finalAmount={finalAmount}
            paidAmounts={paidAmounts}
          />
          <Items items={items} />
          {isAdmin && (
            <OrderChangeLogs
              logs={changeLogData?.orderChangeLogs || []}
              formatDate={formatDate}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

const fieldLabels: Record<string, string> = {
  itemActions: "Барааны үйлдэл",
  items: "Бараанууд",
  status: "Төлөв",
  saleStatus: "Борлуулалтын төлөв",
  totalAmount: "Нийт дүн",
  directDiscount: "Хөнгөлөлт",
  directIsAmount: "Хөнгөлөлт дүнгээр",
  customerId: "Харилцагч",
  customerType: "Харилцагчийн төрөл",
  brokerId: "Зуучлагч",
  brokerType: "Зуучлагчийн төрөл",
  type: "Захиалгын төрөл",
  billType: "Баримтын төрөл",
  registerNumber: "Регистрийн дугаар",
  slotCode: "Ширээ",
  subBranchId: "Дэд салбар",
  departmentId: "Хэлтэс",
  taxInfo: "Татварын мэдээлэл",
  extraInfo: "Нэмэлт мэдээлэл",
  dueDate: "Дуусах огноо",
  branchId: "Салбар",
  deliveryInfo: "Хүргэлтийн мэдээлэл",
  description: "Тайлбар",
}

const formatChangeValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return "-"
  }

  if (typeof value === "string" || typeof value === "number") {
    return `${value}`
  }

  if (typeof value === "boolean") {
    return value ? "Тийм" : "Үгүй"
  }

  return JSON.stringify(value)
}

const OrderChangeLogs = ({
  logs,
  formatDate,
}: {
  logs: OrderChangeLog[]
  formatDate: (date: string) => string
}) => {
  if (!logs.length) {
    return null
  }

  return (
    <Card>
      <CardHeader className="p-2 pb-1">
        <CardTitle className="text-xs text-slate-500 font-medium">
          Өөрчлөлтийн лог
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-2 pb-2">
        {logs.map((log) => (
          <div
            key={log._id}
            className="border-b pb-2 last:border-b-0 last:pb-0"
          >
            <div className="mb-1 text-xs text-slate-500">
              {formatDate(log.createdAt || "")}
              {log.user?.primaryEmail || log.user?.email
                ? ` · ${log.user.primaryEmail || log.user.email}`
                : ""}
            </div>
            <div className="space-y-1">
              {(log.changes || []).map((change) => (
                <div
                  key={`${log._id}-${change.field}`}
                  className="text-sm text-slate-800 break-words min-w-0"
                >
                  <span className="font-semibold">
                    {fieldLabels[change.field] || change.field}:
                  </span>{" "}
                  {formatChangeValue(change.oldValue)} →{" "}
                  {formatChangeValue(change.newValue)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
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
  <Card>
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
