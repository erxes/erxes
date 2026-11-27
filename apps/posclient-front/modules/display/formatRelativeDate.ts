import {
  differenceInDays,
  formatDistance,
  formatDistanceStrict,
  isToday,
  startOfDay,
} from "date-fns"
import { mn } from "date-fns/locale"

export const formatRelativeDate = (
  isoDate: string | Date,
  isDayMaximumPrecision = false
) => {
  const now = new Date()
  const targetDate = new Date(isoDate)

  if (isDayMaximumPrecision && isToday(targetDate)) return "Өнөөдөр"

  const isWithin24h = Math.abs(differenceInDays(targetDate, now)) < 1

  if (isDayMaximumPrecision || !isWithin24h)
    return formatDistance(startOfDay(targetDate), startOfDay(now), {
      addSuffix: true,
      locale: mn,
    })

  return formatDistance(targetDate, now, { addSuffix: true, locale: mn })
}

export const formatRelativeDateShort = (isoDate: string | Date) =>
  formatDistanceStrict(new Date(isoDate), new Date(), {
    addSuffix: false,
    locale: mn,
  })
