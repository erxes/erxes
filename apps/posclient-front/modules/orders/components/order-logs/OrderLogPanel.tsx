"use client"

import { useState } from "react"
import {
  IRecordSidePanelTab,
  PanelField,
  PanelSection,
  RecordSidePanel,
  usePanelWidth,
} from "@/modules/record-side-panel"
import { modeAtom } from "@/store"
import { format } from "date-fns"
import { useAtomValue } from "jotai"
import {
  ArrowRightIcon,
  CircleDotIcon,
  ClockIcon,
  FileDiffIcon,
  HashIcon,
  HistoryIcon,
  InfoIcon,
  LayersIcon,
  PackageIcon,
  UserIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"

import {
  getOrderAuditUserLabel,
  isCartLogItem,
  isItemAction,
  OrderAuditLog,
} from "../../graphql/orderAudit"
import {
  fieldChanges,
  isEmptyValue,
  itemChanges,
  logDate,
  logTarget,
  objectEntries,
  ORDER_LOG_ACTIONS,
  sourceOf,
  valueText,
} from "./orderLogUtils"

const badgeClassName = "h-6 rounded-sm py-0"

const ValueView = ({ value }: { value: unknown }) => {
  const entries = objectEntries(value)

  if (!entries || !entries.length) {
    return <span className="break-all">{valueText(value)}</span>
  }

  return (
    <span className="flex flex-col gap-0.5">
      {entries.map(([key, entry]) => (
        <span key={key} className="flex min-w-0 gap-2">
          <span className="flex-none text-muted-foreground">{key}</span>
          <span className="min-w-0 break-all">{valueText(entry)}</span>
        </span>
      ))}
    </span>
  )
}

const ChangeValue = ({
  before,
  after,
}: {
  before: unknown
  after: unknown
}) => {
  if (isEmptyValue(before)) {
    return (
      <span className="block min-w-0 py-1.5 font-medium">
        <ValueView value={after} />
      </span>
    )
  }

  return (
    <span className="flex min-w-0 items-start gap-1.5 py-1.5">
      <span className="min-w-0 text-muted-foreground line-through decoration-muted-foreground/40">
        <ValueView value={before} />
      </span>
      <ArrowRightIcon
        className="mt-0.5 size-3 flex-none text-zinc-400"
        aria-label="болсон"
      />
      <span className="min-w-0 font-medium">
        <ValueView value={after} />
      </span>
    </span>
  )
}

const ItemsSnapshot = ({ title, value }: { title: string; value: unknown }) => {
  const items = Array.isArray(value) ? value.filter(isCartLogItem) : []

  return (
    <PanelSection title={`${title} (${items.length})`} nested>
      {!items.length && (
        <p className="px-1 text-xs text-muted-foreground">Бараагүй</p>
      )}
      {items.map((item) => (
        <PanelField
          key={item._id}
          icon={PackageIcon}
          label={item.productName || item.productId}
        >
          <span className="flex w-full items-baseline justify-between gap-2 tabular-nums">
            <span>
              {item.count} × {item.unitPrice.toLocaleString()}₮
            </span>
            {!!item.discountAmount && (
              <span className="text-muted-foreground">
                −{item.discountAmount.toLocaleString()}₮
              </span>
            )}
          </span>
        </PanelField>
      ))}
    </PanelSection>
  )
}

export const OrderLogPanel = ({
  log,
  onClose,
}: {
  log: OrderAuditLog
  onClose: () => void
}) => {
  const [tab, setTab] = useState("detail")
  const isMobile = useAtomValue(modeAtom) === "mobile"
  const [panelWidth, setPanelWidth] = usePanelWidth("pos_order_log_panel_width")
  const date = logDate(log)
  const source = sourceOf(log)
  const action = log.action ? ORDER_LOG_ACTIONS[log.action] : null
  const changes = fieldChanges(log)
  const { items, actions, afterCount } = itemChanges(log)
  const itemActions = actions.filter(isItemAction)

  const tabs: IRecordSidePanelTab[] = [
    {
      value: "detail",
      label: "Дэлгэрэнгүй",
      icon: InfoIcon,
      content: (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="border-b px-3 pb-2">
            <PanelSection title="Ерөнхий" nested>
              <PanelField icon={HashIcon} label="Объект">
                <span className="tabular-nums">{logTarget(log)}</span>
              </PanelField>
              <PanelField icon={LayersIcon} label="Эх үүсвэр">
                <Badge variant={source.variant} className={badgeClassName}>
                  {source.label}
                </Badge>
              </PanelField>
              <PanelField icon={CircleDotIcon} label="Үйлдэл">
                <Badge
                  variant={action?.variant || "secondary"}
                  className={badgeClassName}
                >
                  {action?.label || "Тодорхойгүй"}
                </Badge>
              </PanelField>
              <PanelField icon={UserIcon} label="Хэрэглэгч">
                {getOrderAuditUserLabel(log)}
              </PanelField>
              <PanelField icon={ClockIcon} label="Хэзээ">
                {date && (
                  <span className="tabular-nums">
                    {format(date, "yyyy.MM.dd HH:mm:ss")}
                  </span>
                )}
              </PanelField>
            </PanelSection>
          </div>
          <div className="px-3 pb-2">
            <PanelSection title={`Өөрчлөлт (${changes.length})`} nested>
              {!changes.length && (
                <p className="px-1 text-xs text-muted-foreground">
                  Өөрчлөгдсөн талбар байхгүй
                </p>
              )}
              {changes.map((change) => (
                <PanelField
                  key={change.field}
                  icon={FileDiffIcon}
                  label={change.field}
                  bare
                >
                  <div className="px-2 text-xs">
                    <ChangeValue
                      before={change.oldValue}
                      after={change.newValue}
                    />
                  </div>
                </PanelField>
              ))}
            </PanelSection>
          </div>
        </div>
      ),
    },
    ...(items
      ? [
          {
            value: "items",
            label: "Бараа",
            icon: PackageIcon,
            count: afterCount,
            content: (
              <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-2">
                {!!itemActions.length && (
                  <PanelSection title="Үйлдэл" nested>
                    {itemActions.map((item) => (
                      <PanelField
                        key={item.itemId}
                        icon={HistoryIcon}
                        label={item.productName || item.productId}
                      >
                        <span className="tabular-nums">
                          {item.action === "removed"
                            ? "Устгасан"
                            : "Тоо бууруулсан"}
                          : {item.beforeCount} → {item.afterCount}
                        </span>
                      </PanelField>
                    ))}
                  </PanelSection>
                )}
                <ItemsSnapshot title="Өмнө" value={items.oldValue} />
                <ItemsSnapshot title="Дараа" value={items.newValue} />
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
                <HistoryIcon className="size-4" aria-hidden="true" />
              </span>
            }
            title={<span className="tabular-nums">{logTarget(log)}</span>}
            actions={
              action && (
                <Badge variant={action.variant} className={badgeClassName}>
                  {action.label}
                </Badge>
              )
            }
            onClose={onClose}
          />
        }
        tabs={tabs}
        value={tab}
        onValueChange={setTab}
      />
    </RecordSidePanel>
  )
}
