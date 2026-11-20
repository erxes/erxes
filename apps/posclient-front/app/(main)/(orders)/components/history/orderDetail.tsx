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
  HistoryIcon,
  InfoIcon,
  LampIcon,
  Luggage,
  PackageIcon,
  ReceiptTextIcon,
  StopCircle,
  StoreIcon,
  TruckIcon,
  User,
  UserCog,
  XIcon,
} from "lucide-react"

import { IOrderStatus } from "@/types/order.types"
import {
  ORDER_ITEM_STATUSES,
  ORDER_STATUSES,
  typeTextDef,
} from "@/lib/constants"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { statusVariant } from "./columns"
import Items from "./items"
import OrderChangeLogs, { OrderChangeLog } from "./orderChangeLogs"
import { PanelField, PanelSection } from "./panel"
import Payment from "./payment"

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

  const customerName = customer
    ? customer.firstName || customer.lastName
      ? `${customer.firstName || ""} ${customer.lastName || ""}`.trim()
      : `${customer.primaryEmail || customer.email || ""} ${customer.primaryPhone || ""}`.trim()
    : ""
  const StatusIcon = StatusIcons[status as IOrderStatus] || CircleIcon
  const TypeIcon = TypeIcons[type as keyof typeof TypeIcons] || StoreIcon

  return (
    <Sheet open={!!detailId} onOpenChange={() => setDetailId(null)}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        <SheetTitle className="sr-only">Захиалгын дэлгэрэнгүй</SheetTitle>
        <div className="box-content flex h-10 flex-none items-center gap-1 border-b bg-sidebar px-2">
          <div className="flex h-6 w-6 flex-none items-center justify-center rounded-sm bg-primary/10 text-primary">
            <ReceiptTextIcon className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0 flex-1 truncate px-1 text-sm font-medium tabular-nums">
            {number}
          </div>
          <Badge variant={statusVariant[status] || "secondary"}>{status}</Badge>
          <SheetClose asChild>
            <Button variant="ghost" className="h-7 w-7 p-0" title="Хаах">
              <XIcon className="h-4 w-4" />
            </Button>
          </SheetClose>
        </div>
        <Tabs defaultValue="detail" className="flex min-h-0 flex-1 flex-col">
          <TabsList className="h-9 w-full flex-none justify-start gap-1 rounded-none border-b bg-transparent p-0 px-2">
            <TabsTrigger value="detail" className={tabClass}>
              <InfoIcon className="h-4 w-4" />
              Дэлгэрэнгүй
            </TabsTrigger>
            <TabsTrigger value="items" className={tabClass}>
              <PackageIcon className="h-4 w-4" />
              Бараа
              <span className="text-muted-foreground">
                {(items || []).length}
              </span>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="activity" className={tabClass}>
                <HistoryIcon className="h-4 w-4" />
                Түүх
              </TabsTrigger>
            )}
          </TabsList>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <TabsContent value="detail" className="mt-0 px-3 pb-3">
              <PanelSection title="Ерөнхий">
                <PanelField icon={HashIcon} label="Захиалгын дугаар">
                  <span className="tabular-nums">{number}</span>
                </PanelField>
                <PanelField icon={StatusIcon} label="Төлөв">
                  <Badge variant={statusVariant[status] || "secondary"}>
                    {status}
                  </Badge>
                </PanelField>
                <PanelField icon={TypeIcon} label="Төрөл">
                  {!!type && <Badge>{typeTextDef[type] || type}</Badge>}
                </PanelField>
                {!!slotCode && (
                  <PanelField icon={LampIcon} label="Байрлал">
                    {slotCode}
                  </PanelField>
                )}
                {!!isPre && (
                  <PanelField icon={AlarmClockIcon} label="Урьдчилсан">
                    Тийм
                  </PanelField>
                )}
              </PanelSection>
              <PanelSection title="Хүмүүс">
                <PanelField icon={UserCog} label="Кассчин">
                  {`${primaryEmail || email || ""} ${primaryPhone || ""}`.trim()}
                </PanelField>
                <PanelField icon={User} label="Харилцагч">
                  {customerName}
                </PanelField>
              </PanelSection>
              <PanelSection title="Огноо">
                <PanelField icon={CalendarPlusIcon} label="Үүсгэсэн">
                  <span className="tabular-nums">{formatDate(createdAt)}</span>
                </PanelField>
                <PanelField icon={CalendarIcon} label="Өөрчилсөн">
                  <span className="tabular-nums">{formatDate(modifiedAt)}</span>
                </PanelField>
                <PanelField icon={CalendarCheckIcon} label="Төлбөр төлсөн">
                  <span className="tabular-nums">{formatDate(paidDate)}</span>
                </PanelField>
                {!!dueDate && (
                  <PanelField icon={CalendarClockIcon} label="Дуусах огноо">
                    <span className="tabular-nums">{formatDate(dueDate)}</span>
                  </PanelField>
                )}
              </PanelSection>
              <Payment
                cashAmount={cashAmount}
                mobileAmount={mobileAmount}
                totalAmount={totalAmount}
                finalAmount={finalAmount}
                paidAmounts={paidAmounts}
              />
              {!!description && (
                <PanelSection title="Тайлбар">
                  <p className="whitespace-pre-wrap px-1 text-xs">
                    {description}
                  </p>
                </PanelSection>
              )}
            </TabsContent>
            <TabsContent value="items" className="mt-0 px-3 pb-3">
              <Items items={items} />
            </TabsContent>
            {isAdmin && (
              <TabsContent value="activity" className="mt-0 px-3 pb-3">
                <OrderChangeLogs
                  logs={changeLogData?.orderChangeLogs || []}
                  items={items}
                />
              </TabsContent>
            )}
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

const tabClass =
  "relative h-full gap-1.5 rounded-none bg-transparent px-2 text-xs font-medium text-muted-foreground shadow-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:after:bg-primary"

export default OrderDetail
