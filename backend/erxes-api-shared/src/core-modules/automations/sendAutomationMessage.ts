import { TCreatedVia } from '../../core-types/common';
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

/**
 * Runs one named automation against one target the caller already chose.
 *
 * Unlike `sendAutomationTrigger`, which announces an event and lets the
 * service decide which automations enrol which targets, this addresses an
 * automation directly. The caller is responsible for choosing the target and
 * for its own idempotency.
 */
export const sendAutomationRun = (
  subdomain: string,
  {
    automationId,
    target,
    triggerId,
    createdVia,
  }: {
    automationId: string;
    target: Record<string, any>;
    triggerId?: string;
    /**
     * What is asking for this run — the caller's own configuration and whoever
     * set it going. Only the caller knows: to the automations service this is
     * just an automation being addressed.
     */
    createdVia?: TCreatedVia;
  },
  { transport = 'bullmq', jobOptions }: TSendAutomationTriggerProps = {},
): void => {
  const payload = { automationId, target, triggerId, createdVia };

  if (transport === 'trpc') {
    redis
      .get('erxes-service-automations')
      .then((address) => {
        const trpcUrl = address ? `${address}/trpc` : null;

        if (!trpcUrl) {
          throw new Error(
            'Missing trpcUrl for sendAutomationRun. Ensure service discovery has erxes-service-automations set.',
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

        client.mutation('automations.runForTarget', payload).catch((error) => {
          console.error('Error sending trpc request ', error);
        });
      })
      .catch((error) => {
        console.error('Error sending trpc request ', error);
      });
    return;
  }

  sendWorkerQueue('automations', 'runForTarget')
    .add('runForTarget', { subdomain, data: payload }, jobOptions)
    .catch((error) => {
      console.error('Error adding job to queue:', error);
    });
};

export type TDeferredCompletion = {
  executionId: string;
  actionId: string;
  jobId: string;
  status: 'success' | 'error' | 'dropped';
  result?: any;
};

/**
 * Reports a deferred action back to the automations service. The plugin that
 * queued the work owns the callback, so this is the other half of the marker
 * returned from `receiveActions`.
 */
export const sendAutomationDeferredCompletion = async (
  subdomain: string,
  completion: TDeferredCompletion,
): Promise<void> => {
  const address = await redis.get('erxes-service-automations');

  if (!address) {
    throw new Error(
      'Missing address for sendAutomationDeferredCompletion. Ensure service discovery has erxes-service-automations set.',
    );
  }

  const client = createTRPCUntypedClient({
    links: [
      httpBatchLink({
        url: `${address}/trpc`,
        headers: () => ({
          [trpcContextHeaderName]: encodeTRPCContextHeader(
            subdomain,
            'mutation',
            {},
          ),
        }),
      }),
    ],
  });

  await client.mutation('automations.completeDeferredAction', completion);
};
