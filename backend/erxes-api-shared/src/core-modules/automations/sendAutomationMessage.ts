import { sendWorkerQueue } from '../../utils/mq-worker';
import type { DefaultJobOptions } from 'bullmq';

export const sendAutomationTrigger = async (
  subdomain: string,
  {
    type,
    targets,
    repeatOptions,
    recordType,
  }: {
    type: string;
    targets: any;
    repeatOptions?: {
      executionId: string;
      actionId: string;
      optionalConnectId?: string;
    };
    recordType?: 'new' | 'existing';
  },
  jobOptions?: DefaultJobOptions,
) => {
  sendWorkerQueue('automations', 'trigger').add(
    'trigger',
    {
      subdomain,
      data: { type, targets, repeatOptions, recordType },
    },
    jobOptions,
  );
};
