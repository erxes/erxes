import {
  addWorkingTime,
  hasWorkingTime,
  IAutomationExecution,
  nextWorkingMoment,
  segmentTimeZone,
  TDelayActionConfig,
  TWorkingCalendar,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import moment from 'moment';

type TBranchHours = {
  workhours?: TWorkingCalendar['workhours'];
  holidays?: TWorkingCalendar['holidays'];
};

const readBranchId = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    return readBranchId(value[0]);
  }

  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
};

/**
 * The branch whose hours a step keeps: the record's own branch (a ticket's
 * branchId, a deal's first branch), else the one the step names.
 */
export const resolveCalendarBranchId = (
  target: IAutomationExecution['target'],
  configuredBranchId?: string,
) =>
  readBranchId(target?.branchId) ||
  readBranchId(target?.branchIds) ||
  readBranchId(configuredBranchId);

/**
 * The working calendar of a branch, in the organization's time zone. Undefined
 * when there is no branch or it keeps no working hours, and then time is plain
 * clock time.
 */
export const loadWorkingCalendar = async (
  subdomain: string,
  branchId?: string,
): Promise<TWorkingCalendar | undefined> => {
  if (!branchId) {
    return undefined;
  }

  const branch: TBranchHours | null = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'branches',
    action: 'findOne',
    input: { query: { _id: branchId } },
    defaultValue: null,
  });

  if (!branch) {
    return undefined;
  }

  const calendar: TWorkingCalendar = {
    timeZone: await segmentTimeZone(subdomain),
    workhours: branch.workhours,
    holidays: branch.holidays,
  };

  return hasWorkingTime(calendar) ? calendar : undefined;
};

const WORKING_MINUTES: Partial<Record<TDelayActionConfig['type'], number>> = {
  minute: 1,
  hour: 60,
};

/**
 * When a delay that keeps working hours ends. Minutes and hours count only
 * open time; days and longer move on the calendar, then wait for opening.
 */
export const workingDelayEndsAt = (
  calendar: TWorkingCalendar | undefined,
  from: Date,
  { value, type }: Pick<TDelayActionConfig, 'value' | 'type'>,
): Date => {
  const amount = Number(value) || 0;
  const unitMinutes = WORKING_MINUTES[type];

  if (unitMinutes) {
    return addWorkingTime(calendar, from, amount * unitMinutes);
  }

  return nextWorkingMoment(
    calendar,
    moment(from).add(amount, type).toDate(),
  );
};

/** The end of a delay step, with or without working hours. */
export const computeDelayEndsAt = async ({
  subdomain,
  target,
  config,
  from,
}: {
  subdomain: string;
  target: IAutomationExecution['target'];
  config: TDelayActionConfig;
  from: Date;
}): Promise<Date> => {
  if (!config.workingTime) {
    return moment(from).add(Number(config.value), config.type).toDate();
  }

  const calendar = await loadWorkingCalendar(
    subdomain,
    resolveCalendarBranchId(target, config.branchId),
  );

  return workingDelayEndsAt(calendar, from, config);
};
