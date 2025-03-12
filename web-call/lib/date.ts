import { format as formatTz, utcToZonedTime } from "date-fns-tz"
import mnLocale from "date-fns/locale/mn"

export const formatInMongolian = (date: Date, formatString: string) => {
  const zonedDate = utcToZonedTime(date, "Asia/Ulaanbaatar")

  return formatTz(zonedDate, formatString, { locale: mnLocale })
}
