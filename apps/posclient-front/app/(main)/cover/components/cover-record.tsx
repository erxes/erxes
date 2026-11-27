"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  IRecordSidePanelTab,
  RecordSidePanel,
  usePanelWidth,
} from "@/modules/record-side-panel"
import { modeAtom } from "@/store"
import {
  coverStatusAtom,
  isCoverAmountsFetchedAtom,
  terminalFetchBusyAtom,
} from "@/store/cover.store"
import { format } from "date-fns"
import { useAtomValue, useSetAtom } from "jotai"
import {
  AlertCircleIcon,
  CheckIcon,
  ChevronRightIcon,
  CreditCardIcon,
  InfoIcon,
  LandmarkIcon,
  Loader2Icon,
  SearchXIcon,
  TimerResetIcon,
} from "lucide-react"

import { Cover } from "@/types/cover.types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import { CoverAutosaveState, useCoverAutosave } from "../hooks/useCoverAutosave"
import { useCoverDetail } from "../hooks/useCoverDetail"
import { useCoverPayments } from "../hooks/useCoverPayments"
import { CoverTabFieldset, EmptyAmounts, useCoverBanks } from "./amounts"
import CashAmounts from "./cash-amounts"
import { CoverPeriodSection } from "./cover-detail-dates"
import { CoverStatusBadge } from "./cover-status"
import { CoverTotals } from "./cover-summary"
import { CoverCU } from "./coverCU"
import CustomAmounts from "./custom-amounts"
import { Description } from "./description"

const coverTitle = ({ status, endDate }: Cover) =>
  status === "draft" || !endDate
    ? "Шинэ хаалт"
    : `Хаалт · ${format(new Date(endDate), "yyyy.MM.dd HH:mm")}`

const CoverTabBody = ({ children }: { children: React.ReactNode }) => {
  const fetched = useAtomValue(isCoverAmountsFetchedAtom)

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6">
      {fetched ? (
        <CoverTabFieldset>{children}</CoverTabFieldset>
      ) : (
        <EmptyAmounts />
      )}
    </div>
  )
}

const CoverRecordMessage = ({
  icon: Icon,
  title,
  description,
  alert,
  children,
}: {
  icon: typeof SearchXIcon
  title: string
  description?: string
  alert?: boolean
  children?: React.ReactNode
}) => (
  <div
    role={alert ? "alert" : undefined}
    className="flex flex-auto flex-col items-center justify-center px-6 py-20 text-center"
  >
    <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <Icon className="size-5" aria-hidden="true" />
    </div>
    <h2 className="text-sm font-medium">{title}</h2>
    {description && (
      <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">
        {description}
      </p>
    )}
    {children && <div className="mt-5">{children}</div>}
  </div>
)

const CoverRecordLoading = () => (
  <div className="flex flex-col gap-2 p-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <Skeleton key={index} className="h-7 w-full" />
    ))}
  </div>
)

const AUTOSAVE_LABEL: Record<CoverAutosaveState, string> = {
  idle: "Өөрчлөлт шууд хадгалагдана",
  saving: "Хадгалж байна…",
  saved: "Хадгалагдсан",
}

const CoverOverview = () => {
  const fetched = useAtomValue(isCoverAmountsFetchedAtom)
  const status = useAtomValue(coverStatusAtom)
  const busy = useAtomValue(terminalFetchBusyAtom)
  const autosave = useCoverAutosave()
  const locked = busy || status === "confirm" || status === "confirming"

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="border-b px-3 pb-2">
          <CoverPeriodSection />
          {fetched && (
            <fieldset disabled={locked} className="min-w-0">
              <CashAmounts />
            </fieldset>
          )}
          <CoverTotals />
        </div>
        <div className="px-3 py-2">
          <Description />
        </div>
      </div>
      {fetched && !locked && (
        <div className="flex flex-none flex-col gap-1.5 border-t bg-background p-2">
          <p
            role="status"
            className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground"
          >
            {autosave === "saving" ? (
              <Loader2Icon
                className="size-3.5 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <CheckIcon className="size-3.5" aria-hidden="true" />
            )}
            {AUTOSAVE_LABEL[autosave]}
          </p>
          <CoverCU />
        </div>
      )}
    </>
  )
}

const CoverRecordTabs = ({ isPage }: { isPage: boolean }) => {
  const [tab, setTab] = useState("detail")
  const { payments } = useCoverPayments()
  const banks = useCoverBanks()

  const otherTabs: IRecordSidePanelTab[] = [
    ...(payments.length
      ? [
          {
            value: "payments",
            label: "Бусад төлбөр",
            icon: CreditCardIcon,
            count: payments.length,
            content: (
              <CoverTabBody>
                <CustomAmounts />
              </CoverTabBody>
            ),
          },
        ]
      : []),
    ...(banks.length
      ? [
          {
            value: "terminals",
            label: "Терминал",
            icon: LandmarkIcon,
            count: banks.length,
            content: <CoverTabBody>{banks}</CoverTabBody>,
          },
        ]
      : []),
  ]

  if (!otherTabs.length) {
    return (
      <div
        className={cn(
          "flex min-h-0 w-full flex-1 flex-col",
          isPage && "mx-auto max-w-xl border-x"
        )}
      >
        <CoverOverview />
      </div>
    )
  }

  return (
    <RecordSidePanel.Tabs
      overviewTab="detail"
      overviewHeader={
        <span className="text-[13px] font-medium">Хаалтын мэдээлэл</span>
      }
      expandedDefaultTab={otherTabs[0].value}
      tabs={[
        {
          value: "detail",
          label: "Дэлгэрэнгүй",
          icon: InfoIcon,
          content: <CoverOverview />,
        },
        ...otherTabs,
      ]}
      value={tab}
      onValueChange={setTab}
    />
  )
}

export const CoverRecord = ({
  mode,
  onClose,
}: {
  mode: "page" | "panel"
  onClose?: () => void
}) => {
  const { cover, loading, error } = useCoverDetail()
  const setCoverStatus = useSetAtom(coverStatusAtom)
  const coverStatus = cover?.status

  useEffect(() => {
    if (coverStatus) setCoverStatus(coverStatus)
  }, [coverStatus, setCoverStatus])
  const isMobile = useAtomValue(modeAtom) === "mobile"
  const [panelWidth, setPanelWidth] = usePanelWidth("pos_cover_panel_width")
  const isPage = mode === "page"

  let body: React.ReactNode
  if (error) {
    body = (
      <CoverRecordMessage
        icon={AlertCircleIcon}
        title="Хаалтыг нээж чадсангүй"
        description={error}
        alert
      >
        <Button
          className="h-8 rounded px-3 text-[13px] font-medium"
          onClick={() => window.location.reload()}
        >
          Дахин оролдох
        </Button>
      </CoverRecordMessage>
    )
  } else if (loading) {
    body = <CoverRecordLoading />
  } else if (!cover) {
    body = (
      <CoverRecordMessage
        icon={SearchXIcon}
        title="Хаалт олдсонгүй"
        description="Устсан эсвэл буруу холбоос байж магадгүй."
      />
    )
  } else {
    body = <CoverRecordTabs isPage={isPage} />
  }

  const title = cover ? coverTitle(cover) : "Хаалт"

  return (
    <RecordSidePanel
      {...(isPage
        ? { expanded: true, expandedMode: "page" as const, expandable: false }
        : {
            width: panelWidth,
            onWidthChange: isMobile ? undefined : setPanelWidth,
            expanded: isMobile || undefined,
            expandable: false,
          })}
    >
      <RecordSidePanel.Header
        avatar={
          <span className="flex size-7 flex-none items-center justify-center rounded-full bg-muted text-muted-foreground">
            <TimerResetIcon className="size-4" aria-hidden="true" />
          </span>
        }
        title={
          isPage ? (
            <span className="flex min-w-0 items-center gap-1">
              <Link
                href="/cover"
                className="rounded-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Хаалтууд
              </Link>
              <ChevronRightIcon
                className="size-3.5 flex-none text-zinc-400"
                aria-hidden="true"
              />
              <span className="truncate tabular-nums">{title}</span>
            </span>
          ) : (
            <span className="tabular-nums">{title}</span>
          )
        }
        actions={cover && <CoverStatusBadge status={cover.status} />}
        onClose={isPage ? undefined : onClose}
      />
      {body}
    </RecordSidePanel>
  )
}
