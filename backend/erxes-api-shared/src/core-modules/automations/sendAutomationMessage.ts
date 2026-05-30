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
    eventUpdateDescription,
  }: {
    type: string;
    targets: any;
    repeatOptions?: {
      executionId: string;
      actionId: string;
      optionalConnectId?: string;
    };
    recordType?: 'new' | 'existing';
    eventUpdateDescription?: Record<string, any>;
  },
  { transport = 'bullmq', jobOptions }: TSendAutomationTriggerProps = {},
): void => {
  const automtionTriggerPayload = {
    type,
    targets,
    repeatOptions,
    recordType,
    eventUpdateDescription,
  };

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
          .mutation('automations.trigger', automtionTriggerPayload)
          .catch((error) => {
            console.error('Error sending  trpc request ', error);
          });
      })
      .catch((error) => {
        console.error('Error sending  trpc request ', error);
      });
    return;
  }

  const queue = sendWorkerQueue('automations', 'trigger');

  queue
    .add(
      'trigger',
      {
        subdomain,
        data: automtionTriggerPayload,
      },
      jobOptions,
    )
    .catch((error) => {
      console.error('Error adding job to queue:', error);
    });
};
