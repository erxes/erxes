import { IStructureSchedule } from 'ui-modules';
import { z } from 'zod';
import { workingHours } from '../constants/work-days';
import { HOLIDAY_SCHEMA } from '../schemas/workHoursSchema';
import {
  IHoliday,
  IWorkDay,
  IWorkhoursForm,
  WorkDay,
} from '../types/workhours';

const STORED_DAY_SCHEMA = z.object({
  inactive: z.boolean().optional(),
  startFrom: z.string().optional(),
  endTo: z.string().optional(),
  lunchStartFrom: z.string().optional(),
  lunchEndTo: z.string().optional(),
});

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toWorkDay = (defaults: IWorkDay, value: unknown): IWorkDay => {
  const parsed = STORED_DAY_SCHEMA.safeParse(value);

  if (!parsed.success) {
    return defaults;
  }

  const day = parsed.data;

  return {
    inactive: day.inactive ?? false,
    startFrom: day.startFrom ?? defaults.startFrom,
    endTo: day.endTo ?? defaults.endTo,
    lunchStartFrom: day.lunchStartFrom ?? defaults.lunchStartFrom,
    lunchEndTo: day.lunchEndTo ?? defaults.lunchEndTo,
  };
};

const toHolidays = (
  holidays: IStructureSchedule['holidays'] = [],
): IHoliday[] =>
  holidays.flatMap((holiday) => {
    const parsed = HOLIDAY_SCHEMA.safeParse(holiday);

    return parsed.success ? [parsed.data] : [];
  });

export const toWorkhoursFormValues = (
  schedule?: IStructureSchedule | null,
): IWorkhoursForm => {
  const stored = schedule?.workhours ?? {};
  const values: IWorkhoursForm = { holidays: toHolidays(schedule?.holidays) };

  for (const day of Object.values(WorkDay)) {
    values[day] = toWorkDay(workingHours[day], stored[day]);
  }

  return values;
};

export const toStructureScheduleInput = ({
  holidays = [],
  ...days
}: IWorkhoursForm) => {
  const workhours: Partial<Record<WorkDay, IWorkDay>> = {};

  for (const day of Object.values(WorkDay)) {
    const value = days[day];

    if (value && !value.inactive) {
      workhours[day] = {
        inactive: false,
        startFrom: value.startFrom,
        endTo: value.endTo,
        lunchStartFrom: value.lunchStartFrom,
        lunchEndTo: value.lunchEndTo,
      };
    }
  }

  return {
    workhours: Object.keys(workhours).length ? workhours : null,
    holidays: holidays.filter(
      ({ name, startDate, endDate }) => name || startDate || endDate,
    ),
  };
};

type TScheduleRun = { from: WorkDay; to: WorkDay; hours: string };

export const formatStructureScheduleSummary = (
  schedule: IStructureSchedule | null | undefined,
  dayLabel: (day: WorkDay) => string,
) => {
  const stored = schedule?.workhours ?? {};
  const runs: TScheduleRun[] = [];
  let previousIndex = -1;

  Object.values(WorkDay).forEach((day, index) => {
    const value = toWorkDay(workingHours[day], stored[day]);

    if (value.inactive) {
      return;
    }

    const hours = `${value.startFrom}–${value.endTo}`;
    const last = runs[runs.length - 1];

    if (last && previousIndex === index - 1 && last.hours === hours) {
      last.to = day;
    } else {
      runs.push({ from: day, to: day, hours });
    }

    previousIndex = index;
  });

  if (!runs.length) {
    return null;
  }

  return runs
    .map(({ from, to, hours }) =>
      from === to
        ? `${dayLabel(from)} ${hours}`
        : `${dayLabel(from)}–${dayLabel(to)} ${hours}`,
    )
    .join(', ');
};
