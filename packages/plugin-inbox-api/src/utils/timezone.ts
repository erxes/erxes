import * as dayjs from "dayjs";
import * as timezone from "dayjs/plugin/timezone";
import * as utc from "dayjs/plugin/utc";

dayjs.extend(timezone);
dayjs.extend(utc);

/**
 * Get current date/time in Asia/Ulaanbaatar timezone
 */
export const getMongoliaNow = (): Date => {
  return dayjs().add(8, "hour").toDate();
};

/**
 * Convert any date to Asia/Ulaanbaatar timezone
 */
export const toMongoliaTime = (date: Date | string): Date => {
  return dayjs(date).add(8, "hour").toDate();
};

/**
 * Format date in Asia/Ulaanbaatar timezone
 */
export const formatMongoliaDate = (
  date: Date | string,
  format: string = "YYYY-MM-DD HH:mm:ss",
): string => {
  return dayjs(date).add(8, "hour").format(format);
};

/**
 * Get start of day in Asia/Ulaanbaatar timezone
 */
export const getMongoliaStartOfDay = (date?: Date | string): Date => {
  return dayjs(date).add(8, "hour").startOf("day").toDate();
};

/**
 * Get end of day in Asia/Ulaanbaatar timezone
 */
export const getMongoliaEndOfDay = (date?: Date | string): Date => {
  return dayjs(date).add(8, "hour").endOf("day").toDate();
};
