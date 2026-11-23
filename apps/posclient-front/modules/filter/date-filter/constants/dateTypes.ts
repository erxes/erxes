export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

export const QUARTERS = ["quarter-1", "quarter-2", "quarter-3", "quarter-4"]

export const HALVES = ["half-1", "half-2"]

export const FIXED_DATES = [
  "today",
  "in-the-past",
  "last-1-day",
  "last-3-days",
  "last-7-days",
  "last-3-months",
]

export const FIXED_DATE_LABELS: Record<string, string> = {
  today: "Өнөөдөр",
  "in-the-past": "Бүх хугацаанд",
  "last-1-day": "Сүүлийн 1 өдөр",
  "last-3-days": "Сүүлийн 3 өдөр",
  "last-7-days": "Сүүлийн 7 өдөр",
  "last-3-months": "Сүүлийн 3 сар",
}

export const RENAMED_FIXED_DATES: Record<string, string> = {
  "1-day-from-now": "last-1-day",
  "3-days-from-now": "last-3-days",
  "1-week-from-now": "last-7-days",
  "3-months-from-now": "last-3-months",
}
