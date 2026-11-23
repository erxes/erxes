import { endOfDay, startOfDay, subDays, subMonths } from "date-fns"

import { MONTHS } from "../constants/dateTypes"
import {
  normalizeFixedDate,
  parseHalfToken,
  parseQuarterToken,
  YEAR_TOKEN,
} from "./dateTokens"

export const parseDateRangeFromString = (
  rawValue?: string | null
): { from: Date; to: Date } | undefined => {
  if (!rawValue) return undefined

  const value = normalizeFixedDate(rawValue)
  const today = new Date()

  const fixedRanges: Record<string, { from: Date; to: Date }> = {
    today: { from: startOfDay(today), to: endOfDay(today) },
    "in-the-past": {
      from: startOfDay(new Date(1979, 0, 1)),
      to: endOfDay(today),
    },
    "last-1-day": { from: startOfDay(subDays(today, 1)), to: endOfDay(today) },
    "last-3-days": {
      from: startOfDay(subDays(today, 3)),
      to: endOfDay(today),
    },
    "last-7-days": {
      from: startOfDay(subDays(today, 7)),
      to: endOfDay(today),
    },
    "last-3-months": {
      from: startOfDay(subMonths(today, 3)),
      to: endOfDay(today),
    },
  }

  if (fixedRanges[value]) return fixedRanges[value]

  if (MONTHS.some((month) => value.includes(month))) {
    const [year, month] = value.split("-")
    const monthIndex = MONTHS.indexOf(month)
    return {
      from: startOfDay(new Date(Number.parseInt(year, 10), monthIndex, 1)),
      to: endOfDay(new Date(Number.parseInt(year, 10), monthIndex + 1, 0)),
    }
  }

  const quarter = parseQuarterToken(value)
  if (quarter) {
    return {
      from: startOfDay(new Date(quarter.year, (quarter.quarter - 1) * 3, 1)),
      to: endOfDay(new Date(quarter.year, quarter.quarter * 3, 0)),
    }
  }

  const half = parseHalfToken(value)
  if (half) {
    return {
      from: startOfDay(new Date(half.year, (half.half - 1) * 6, 1)),
      to: endOfDay(new Date(half.year, half.half * 6, 0)),
    }
  }

  if (YEAR_TOKEN.test(value)) {
    const year = Number.parseInt(value, 10)
    return {
      from: startOfDay(new Date(year, 0, 1)),
      to: endOfDay(new Date(year, 11, 31)),
    }
  }

  if (value.includes(",")) {
    const [from, to] = value.split(",")
    const fromDate = new Date(from)
    const toDate = new Date(to)
    if (Number.isNaN(fromDate.getTime())) return undefined
    return {
      from: startOfDay(fromDate),
      to: endOfDay(Number.isNaN(toDate.getTime()) ? fromDate : toDate),
    }
  }

  return undefined
}
