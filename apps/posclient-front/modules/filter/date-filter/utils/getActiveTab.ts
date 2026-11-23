import { MONTHS } from "../constants/dateTypes"
import { YEAR_TOKEN } from "./dateTokens"

export const getActiveTab = (date: string) => {
  if (date.includes("half")) {
    return "halfYear"
  }
  if (date.includes("quarter")) {
    return "quarter"
  }
  if (MONTHS.some((month) => date.includes(month))) {
    return "month"
  }
  if (YEAR_TOKEN.test(date)) {
    return "year"
  }
  return "day"
}
