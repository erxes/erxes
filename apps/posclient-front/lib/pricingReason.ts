// Words a cashier reads for why a line is or is not discounted by a
// scheduled pricing plan. No imports, so it can be tested on its own.

export type PricingWindow = {
  type: string
  startTime: string
  endTime: string
  weekDays?: number[] | null
  monthDays?: number[] | null
  fromMonthDay?: string | null
  toMonthDay?: string | null
}

export type PricingReason = {
  planId: string
  planName: string
  kind: "discount" | "bonus"
  value: number
  window?: PricingWindow
  matchedMoment?: "checkout" | "orderCreated"
}

export type PricingScheduleStatus = {
  planId: string
  planName?: string | null
  scheduleMoment?: string | null
  active?: boolean | null
  matchedMoment?: "checkout" | "orderCreated" | null
  window?: PricingWindow | null
  endsAt?: string | null
  startsAt?: string | null
  endedAt?: string | null
}

const WEEKDAYS = ["Ня", "Да", "Мя", "Лх", "Пү", "Ба", "Бя"]
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]
// Fifteen minutes or less left is worth a warning.
export const ENDING_SOON_MINUTES = 15

const monthDay = (value?: string | null) =>
  value ? `${Number(value.slice(0, 2))}/${Number(value.slice(3))}` : ""

const pad = (value: number) => String(value).padStart(2, "0")

export const formatWindow = (window?: PricingWindow | null) => {
  if (!window) return ""

  const time =
    window.startTime === "00:00" && window.endTime === "24:00"
      ? "Бүтэн өдөр"
      : `${window.startTime}–${window.endTime}`

  switch (window.type) {
    case "weekly":
      return `${WEEK_ORDER.filter((day) => window.weekDays?.includes(day))
        .map((day) => WEEKDAYS[day])
        .join(" ")} · ${time}`
    case "monthly":
      return `Сарын ${(window.monthDays || []).join(", ")} · ${time}`
    case "yearly":
      return `${monthDay(window.fromMonthDay)}–${monthDay(
        window.toMonthDay
      )} · ${time}`
    default:
      return `Өдөр бүр · ${time}`
  }
}

export const formatReason = (reason: PricingReason) =>
  [
    reason.planName,
    formatWindow(reason.window),
    reason.matchedMoment === "orderCreated"
      ? "захиалга энэ цонхонд үүссэн"
      : reason.window
      ? "тооцоо энэ цонхонд"
      : "",
  ]
    .filter(Boolean)
    .join(" · ")

const clockTime = (at: Date) => `${pad(at.getHours())}:${pad(at.getMinutes())}`

// Today: just the time; another day: its date as well.
export const formatWhen = (value: string, now: Date) => {
  const at = new Date(value)
  const sameDay = at.toDateString() === now.toDateString()

  return sameDay
    ? clockTime(at)
    : `${at.getMonth() + 1}/${at.getDate()} ${clockTime(at)}`
}

export const minutesUntil = (value: string, now: Date) =>
  Math.max(0, Math.ceil((new Date(value).getTime() - now.getTime()) / 60000))

export type ScheduleTone = "active" | "ending" | "idle"

// One line per plan: what holds now and what comes next. A saved order that
// matched by its creation keeps the discount whenever the window closes.
export const describeSchedule = (
  status: PricingScheduleStatus,
  now: Date,
  hasOrder = false
): { tone: ScheduleTone; text: string } => {
  const name = status.planName || "Үнийн хямдрал"

  if (status.active) {
    if (
      status.matchedMoment === "orderCreated" &&
      (hasOrder || !status.endsAt)
    ) {
      return {
        tone: "active",
        text: `${name} · захиалга цонхонд үүссэн тул хүчинтэй`,
      }
    }

    if (status.endsAt) {
      const left = minutesUntil(status.endsAt, now)

      return left <= ENDING_SOON_MINUTES
        ? { tone: "ending", text: `${name} · ${left} минутын дараа дуусна` }
        : {
            tone: "active",
            text: `${name} · ${formatWhen(status.endsAt, now)} хүртэл`,
          }
    }

    return { tone: "active", text: `${name} · хүчинтэй` }
  }

  // Open now, but this order was started before or after it.
  if (status.endsAt && status.scheduleMoment === "orderCreated") {
    return {
      tone: "idle",
      text: `${name} · захиалга цонхны гадна үүссэн`,
    }
  }

  const parts = [name]

  if (status.endedAt) parts.push(`${formatWhen(status.endedAt, now)}-д дууссан`)
  if (status.startsAt)
    parts.push(`${formatWhen(status.startsAt, now)}-с эхэлнэ`)
  if (!status.endedAt && !status.startsAt) parts.push("одоо хүчингүй")

  return { tone: "idle", text: parts.join(" · ") }
}

// The next moment a line's state can change: a window closing or opening.
export const nextBoundary = (statuses: PricingScheduleStatus[]) =>
  statuses
    .flatMap(({ endsAt, startsAt }) => [endsAt, startsAt])
    .filter((value): value is string => !!value)
    .map((value) => new Date(value).getTime())
    .sort((a, b) => a - b)[0]
