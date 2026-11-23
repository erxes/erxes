import type { ICallIntegrationDocument } from '@/integrations/call/@types/integrations';
import type { IModels } from '~/connectionResolvers';

const QUEUE_ACTION = /QUEUE\[([^\]]+)\]/;

export const queueFromActionType = (
  actionType?: string | null,
): string | null => QUEUE_ACTION.exec(actionType ?? '')?.[1] ?? null;

export const integrationForQueue = (
  integrations: ICallIntegrationDocument[],
  queue?: string | null,
): ICallIntegrationDocument | null => {
  if (!queue) return null;
  const wanted = String(queue);
  const owners = new Map<string, ICallIntegrationDocument>();
  for (const integration of integrations) {
    if ((integration.queues || []).some((owned) => String(owned) === wanted)) {
      owners.set(String(integration.inboxId), integration);
    }
  }
  return owners.size === 1 ? [...owners.values()][0] : null;
};

export const resolveQueueIntegration = async (
  models: IModels,
  integration: ICallIntegrationDocument,
  queue?: string | null,
): Promise<ICallIntegrationDocument | null> => {
  if (!queue) return null;
  const peers = await models.CallIntegrations.findPeers(integration);
  return integrationForQueue(peers, queue);
};

export interface ICallKeys {
  uniqueid?: string;
  linkedid?: string;
}

const callIds = ({ uniqueid, linkedid }: ICallKeys): string[] =>
  [uniqueid, linkedid].filter((id): id is string => Boolean(id));

export const rehomeCallRecords = async (
  models: IModels,
  keys: ICallKeys,
  inboxIntegrationId: string,
  operatorPhone?: string,
): Promise<void> => {
  const ids = callIds(keys);
  if (!ids.length) return;

  await models.CallSessions.updateMany(
    {
      $or: [{ uniqueid: { $in: ids } }, { linkedid: { $in: ids } }],
      inboxIntegrationId: { $ne: inboxIntegrationId },
    },
    {
      $set: {
        inboxIntegrationId,
        ...(operatorPhone ? { operatorPhone } : {}),
      },
    },
  );

  await models.CallCdrs.updateMany(
    { uniqueid: { $in: ids }, inboxIntegrationId: { $ne: inboxIntegrationId } },
    { $set: { inboxIntegrationId } },
  );
};
