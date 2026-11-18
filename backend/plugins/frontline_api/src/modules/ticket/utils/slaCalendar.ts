import {
  hasWorkingTime,
  segmentTimeZone,
  TWorkingCalendar,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

type TBranchHours = {
  workhours?: TWorkingCalendar['workhours'];
  holidays?: TWorkingCalendar['holidays'];
};

/**
 * The working calendar of the ticket's branch, in the organization's time
 * zone. Undefined without a branch or working hours: SLA then counts clock
 * time.
 */
export const loadBranchCalendar = async (
  subdomain: string,
  branchId?: string | null,
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
