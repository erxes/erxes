import {
  CheckCircle2Icon,
  CircleIcon,
  LucideIcon,
  XCircleIcon,
} from "lucide-react"

import { Cover } from "@/types/cover.types"
import { Badge, BadgeProps } from "@/components/ui/badge"

type CoverStatus = Cover["status"]

export const COVER_STATUSES: Record<
  CoverStatus,
  { label: string; icon: LucideIcon; variant: BadgeProps["variant"] }
> = {
  draft: { label: "Ноорог", icon: CircleIcon, variant: "secondary" },
  new: { label: "Шинэ", icon: CircleIcon, variant: "info" },
  confirming: {
    label: "Баталгаажуулж буй",
    icon: CircleIcon,
    variant: "warning",
  },
  confirm: {
    label: "Баталгаажсан",
    icon: CheckCircle2Icon,
    variant: "success",
  },
  reconf: {
    label: "Дахин баталгаажуулах",
    icon: XCircleIcon,
    variant: "warning",
  },
  unconfirm: {
    label: "Баталгаажаагүй",
    icon: XCircleIcon,
    variant: "destructive",
  },
}

export const COVER_STATUS_OPTIONS = (
  Object.keys(COVER_STATUSES) as CoverStatus[]
).map((value) => ({ value, label: COVER_STATUSES[value].label }))

export const CoverStatusBadge = ({ status }: { status: string }) => {
  const meta = COVER_STATUSES[status as CoverStatus]

  return (
    <Badge
      variant={meta?.variant || "secondary"}
      className="h-6 rounded-sm py-0"
    >
      {meta?.label || status}
    </Badge>
  )
}
