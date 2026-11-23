import { format } from "date-fns"

import { FIXED_DATE_LABELS, MONTHS } from "../constants/dateTypes"
import {
  normalizeFixedDate,
  parseHalfToken,
  parseQuarterToken,
  YEAR_TOKEN,
} from "./dateTokens"

export const getDisplayValue = (rawValue: string) => {
  const value = normalizeFixedDate(rawValue)

  if (FIXED_DATE_LABELS[value]) {
    return FIXED_DATE_LABELS[value]
  }

  const monthIndex = MONTHS.findIndex((month) => value.includes(month))
  if (monthIndex > -1) {
    return `${value.split("-")[0]} / ${monthIndex + 1}-р сар`
  }

  const quarter = parseQuarterToken(value)
  if (quarter) {
    return `${quarter.year} Q${quarter.quarter}`
  }

  const half = parseHalfToken(value)
  if (half) {
    return `${half.year} H${half.half}`
  }

  if (YEAR_TOKEN.test(value)) {
    return value.replace("-y", "")
  }

  if (value.includes(",")) {
    const [from, to] = value.split(",")
    return `${format(new Date(from), "yyyy.MM.dd")} - ${format(new Date(to), "yyyy.MM.dd")}`
  }

  return ""
}
