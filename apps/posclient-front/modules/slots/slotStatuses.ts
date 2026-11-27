export type SlotStatus = "available" | "serving" | "reserved"

export const SLOT_STATUSES: {
  value: SlotStatus
  label: string
  dotClassName: string
  badgeClassName: string
}[] = [
  {
    value: "available",
    label: "Сул",
    dotClassName: "bg-success",
    badgeClassName: "border-success/15 bg-success/10 text-success",
  },
  {
    value: "serving",
    label: "Үйлчилж байна",
    dotClassName: "bg-warning",
    badgeClassName: "border-warning/20 bg-warning/10 text-warning",
  },
  {
    value: "reserved",
    label: "Захиалгатай",
    dotClassName: "bg-info",
    badgeClassName: "border-info/15 bg-info/10 text-info",
  },
]

export const slotStatusOf = (status?: SlotStatus) =>
  SLOT_STATUSES.find((item) => item.value === status) || SLOT_STATUSES[0]

export const SLOT_MENU_ITEM_CLASS =
  "h-8 gap-2 rounded px-2 text-[13px] [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-muted-foreground"
