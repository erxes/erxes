import { sendWorkerQueue } from '../../utils/mq-worker';

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
    repeatOptions?: { executionId: string; actionId: string };
    recordType?: 'new' | 'existing';
  },
) => {
  sendWorkerQueue('automations', 'trigger').add('trigger', {
    subdomain,
    data: { type, targets, repeatOptions, recordType },
  });
};
