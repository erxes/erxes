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

export const sendAutomationTrigger = (
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
): void => {
  if (transport === 'trpc') {
    redis
      .get('erxes-service-automations')
      .then((address) => {
        const trpcUrl = address ? `${address}/trpc` : null;

        if (!trpcUrl) {
          throw new Error(
            'Missing trpcUrl for sendAutomationTrigger. Provide props.trpcUrl or ensure service discovery has erxes-service-automations set.',
          );
        }

        const contextHeader = encodeTRPCContextHeader(
          subdomain,
          'mutation',
          {},
        );

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

        client
          .mutation('automations.trigger', {
            type,
            targets,
            repeatOptions,
            recordType,
          })
          .catch((error) => {
            console.error('Error sending  trpc request ', error);
          });
      })
      .catch((error) => {
        console.error('Error sending  trpc request ', error);
      });
  }

  const queue = sendWorkerQueue('automations', 'trigger');

  void queue
    .add(
      'trigger',
      {
        subdomain,
        data: { type, targets, repeatOptions, recordType },
      },
      jobOptions,
    )
    .catch((error) => {
      console.error('Error adding job to queue:', error);
    });
};
