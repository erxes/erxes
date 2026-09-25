export type ZonedDate = { year: number; month: number; day: number };

export const DEFAULT_SEGMENT_TIME_ZONE = 'UTC';

const formatters = new Map<string, Intl.DateTimeFormat>();

const formatterFor = (timeZone: string): Intl.DateTimeFormat => {
  const cached = formatters.get(timeZone);

  if (cached) {
    return cached;
  }

  const created = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  formatters.set(timeZone, created);

  return created;
};

const partsOf = (instant: Date, timeZone: string) =>
  Object.fromEntries(
    formatterFor(timeZone)
      .formatToParts(instant)
      .map((part) => [part.type, part.value]),
  ) as Record<string, string>;

export const zonedDate = (instant: Date, timeZone: string): ZonedDate => {
  const parts = partsOf(instant, timeZone);

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
  };
};

const utcAt = (
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
): number => {
  const at = new Date(0);

  at.setUTCFullYear(year, month - 1, day);
  at.setUTCHours(hour, minute, second, 0);

  return at.getTime();
};

export const zonedDayStart = (date: ZonedDate, timeZone: string): Date => {
  const wanted = utcAt(date.year, date.month, date.day);

  let instant = wanted;

  for (let round = 0; round < 3; round++) {
    const parts = partsOf(new Date(instant), timeZone);

    const seen = utcAt(
      Number(parts.year),
      Number(parts.month),
      Number(parts.day),
      Number(parts.hour) % 24,
      Number(parts.minute),
      Number(parts.second),
    );

    instant = wanted - (seen - instant);
  }

  return new Date(instant);
};

export const shiftZonedDays = (date: ZonedDate, days: number): ZonedDate => {
  const at = new Date(0);

  at.setUTCFullYear(date.year, date.month - 1, date.day + days);

  return {
    year: at.getUTCFullYear(),
    month: at.getUTCMonth() + 1,
    day: at.getUTCDate(),
  };
};

export const isLeapYear = (year: number): boolean =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

const daysInMonth = (year: number, month: number): number =>
  month === 2
    ? isLeapYear(year)
      ? 29
      : 28
    : [4, 6, 9, 11].includes(month)
      ? 30
      : 31;

const WINDOW_BACK = 150;
const WINDOW_FORWARD = 20;

export const anniversaryRanges = (
  target: ZonedDate,
  timeZone: string,
): { gte: Date; lt: Date }[] => {
  const days = [{ month: target.month, day: target.day }];

  if (target.month === 2 && target.day === 28 && !isLeapYear(target.year)) {
    days.push({ month: 2, day: 29 });
  }

  const ranges: { gte: Date; lt: Date }[] = [];

  for (
    let year = target.year - WINDOW_BACK;
    year <= target.year + WINDOW_FORWARD;
    year++
  ) {
    for (const { month, day } of days) {
      if (day > daysInMonth(year, month)) {
        continue;
      }

      ranges.push({
        gte: zonedDayStart({ year, month, day }, timeZone),
        lt: zonedDayStart(shiftZonedDays({ year, month, day }, 1), timeZone),
      });
    }
  }

  return ranges;
};

export const isAnniversary = (
  instant: Date,
  target: ZonedDate,
  timeZone: string,
): boolean => {
  const on = zonedDate(instant, timeZone);

  if (on.month === target.month && on.day === target.day) {
    return true;
  }

  return (
    target.month === 2 &&
    target.day === 28 &&
    !isLeapYear(target.year) &&
    on.month === 2 &&
    on.day === 29
  );
};
