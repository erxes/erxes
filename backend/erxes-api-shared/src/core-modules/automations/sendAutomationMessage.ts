import { sendWorkerQueue } from '../../utils/mq-worker';
import type { DefaultJobOptions } from 'bullmq';
import { createTRPCUntypedClient, httpBatchLink } from '@trpc/client';
import {
  encodeTRPCContextHeader,
  trpcContextHeaderName,
} from '../../utils/trpc';
import { redis } from '../../utils/redis';

type TSendAutomationTriggerProps = {
  transport?: 'bullmq' | 'trpc';
  jobOptions?: DefaultJobOptions;
};

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
  { transport = 'bullmq', jobOptions }: TSendAutomationTriggerProps = {},
) => {
  if (transport === 'trpc') {
    const address = await redis.get('erxes-service-automations');
    const trpcUrl = address ? `${address}/trpc` : null;

    if (!trpcUrl) {
      throw new Error(
        'Missing trpcUrl for sendAutomationTrigger. Provide props.trpcUrl or ensure service discovery has erxes-service-automations set.',
      );
    }

    const contextHeader = encodeTRPCContextHeader(subdomain, 'mutation', {});

    const client = createTRPCUntypedClient({
      links: [
        httpBatchLink({
          url: trpcUrl,
          headers: () => ({
            [trpcContextHeaderName]: contextHeader,
          }),
        }),
      ],
    });

    const result = (await client.mutation('automations.trigger', {
      type,
      targets,
      repeatOptions,
      recordType,
    })) as { id: string } | null;

    return result?.id || null;
  }

  const queue = sendWorkerQueue('automations', 'trigger');
  const job = await queue.add(
    'trigger',
    {
      subdomain,
      data: { type, targets, repeatOptions, recordType },
    },
    jobOptions,
  );
  return job.id;
};
