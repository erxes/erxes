import { useState } from "react"
import { queries } from "@/modules/orders/graphql"
import {
  IRecordSidePanelTab,
  PanelField,
  PanelSection,
  RecordSidePanel,
  usePanelWidth,
} from "@/modules/record-side-panel"
import { modeAtom } from "@/store"
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
} from "lucide-react"

import { IOrderStatus } from "@/types/order.types"
import {
  ORDER_ITEM_STATUSES,
  ORDER_STATUSES,
  typeTextDef,
} from "@/lib/constants"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

import { StatusBadge } from "./columns"
import Items from "./items"
import OrderChangeLogs, { OrderChangeLog } from "./orderChangeLogs"
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
  const isMobile = useAtomValue(modeAtom) === "mobile"
  const [tab, setTab] = useState("detail")
  const [panelWidth, setPanelWidth] = usePanelWidth(
    "pos_order_detail_panel_width"
  )
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
    date ? format(new Date(date), "yyyy.MM.dd HH:mm") : ""

  if (!detailId) {
    return null
  }

  const customerName = customer
    ? customer.firstName || customer.lastName
      ? `${customer.firstName || ""} ${customer.lastName || ""}`.trim()
      : `${customer.primaryEmail || customer.email || ""} ${customer.primaryPhone || ""}`.trim()
    : ""
  const cashier = `${primaryEmail || email || ""} ${primaryPhone || ""}`.trim()
  const StatusIcon = StatusIcons[status as IOrderStatus] || CircleIcon
  const TypeIcon = TypeIcons[type as keyof typeof TypeIcons] || StoreIcon
  const isLoading = loading && !data?.orderDetail

  const detailContent = isLoading ? (
    <PanelLoading />
  ) : (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="border-b px-3 pb-2">
        <PanelSection title="Ерөнхий" nested>
          <PanelField icon={HashIcon} label="Захиалгын дугаар">
            <span className="tabular-nums">{number}</span>
          </PanelField>
          <PanelField icon={StatusIcon} label="Төлөв">
            {!!status && <StatusBadge status={status} />}
          </PanelField>
          <PanelField icon={TypeIcon} label="Төрөл">
            {!!type && (
              <Badge className="h-6 rounded-sm py-0">
                {typeTextDef[type] || type}
              </Badge>
            )}
          </PanelField>
          <PanelField icon={LampIcon} label="Байрлал">
            {slotCode}
          </PanelField>
          {!!isPre && (
            <PanelField icon={AlarmClockIcon} label="Урьдчилсан">
              Тийм
            </PanelField>
          )}
        </PanelSection>
        <PanelSection title="Хүмүүс" nested>
          <PanelField icon={UserCog} label="Кассчин">
            {cashier}
          </PanelField>
          <PanelField icon={User} label="Харилцагч">
            {customerName}
          </PanelField>
        </PanelSection>
        <PanelSection title="Огноо" nested>
          <PanelField icon={CalendarPlusIcon} label="Үүсгэсэн">
            <span className="tabular-nums">{formatDate(createdAt)}</span>
          </PanelField>
          <PanelField icon={CalendarIcon} label="Өөрчилсөн">
            <span className="tabular-nums">{formatDate(modifiedAt)}</span>
          </PanelField>
          <PanelField icon={CalendarCheckIcon} label="Төлбөр төлсөн">
            {!!paidDate && (
              <span className="tabular-nums">{formatDate(paidDate)}</span>
            )}
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
      </div>
      {!!description && (
        <PanelSection title="Тайлбар">
          <p className="whitespace-pre-wrap px-1 text-xs">{description}</p>
        </PanelSection>
      )}
    </div>
  )

  const tabs: IRecordSidePanelTab[] = [
    {
      value: "detail",
      label: "Дэлгэрэнгүй",
      icon: InfoIcon,
      content: detailContent,
    },
    {
      value: "items",
      label: "Бараа",
      icon: PackageIcon,
      count: (items || []).length,
      content: isLoading ? (
        <PanelLoading />
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
          <Items items={items} />
        </div>
      ),
    },
    ...(isAdmin
      ? [
          {
            value: "activity",
            label: "Түүх",
            icon: HistoryIcon,
            content: (
              <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
                <OrderChangeLogs
                  logs={changeLogData?.orderChangeLogs || []}
                  items={items}
                />
              </div>
            ),
          },
        ]
      : []),
  ]

  return (
    <RecordSidePanel
      width={panelWidth}
      onWidthChange={isMobile ? undefined : setPanelWidth}
      expanded={isMobile || undefined}
      expandable={false}
    >
      <RecordSidePanel.Layout
        header={
          <RecordSidePanel.Header
            avatar={
              <span className="flex size-7 flex-none items-center justify-center rounded-full bg-muted text-muted-foreground">
                <ReceiptTextIcon className="size-4" aria-hidden="true" />
              </span>
            }
            title={
              isLoading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                <span className="tabular-nums">{number}</span>
              )
            }
            onClose={() => setDetailId(null)}
          />
        }
        tabs={tabs}
        value={tab}
        onValueChange={setTab}
      />
    </RecordSidePanel>
  )
}

const PanelLoading = () => (
  <div className="flex flex-col gap-2 p-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <Skeleton key={index} className="h-7 w-full" />
    ))}
  </div>
)

export default OrderDetail
