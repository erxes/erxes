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
  const owners = integrations.filter((integration) =>
    (integration.queues || []).some((owned) => String(owned) === wanted),
  );
  return owners.length === 1 ? owners[0] : null;
};

export const resolveQueueIntegration = async (
  models: IModels,
  integration: ICallIntegrationDocument,
  queue?: string | null,
): Promise<ICallIntegrationDocument | null> => {
  if (!queue) return null;
  const peers = await models.CallIntegrations.findPeers(integration);
  return integrationForQueue([integration, ...peers], queue);
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
