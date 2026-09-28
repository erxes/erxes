import { FilterQuery } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { debugCall } from '@/integrations/call/debuggers';
import { ICallIntegrationDocument } from '@/integrations/call/@types/integrations';
import { determineExtension } from '@/integrations/call/services/cdrUtils';

export interface ICallRoutingHints {
  srcTrunk?: string;
  dstTrunk?: string;
  uniqueids: (string | undefined)[];
  queues: (string | undefined)[];
  extensions: (string | undefined)[];
}

export interface ICallRouting {
  integration: ICallIntegrationDocument | null;
  candidates: ICallIntegrationDocument[];
  decisive: boolean;
  uniqueids: string[];
}

const QUEUE_ACTION_PATTERN = /^QUEUE\[([^\]]+)\]/i;

const compact = (values: unknown[]): string[] => [
  ...new Set(
    values
      .filter((value) => value !== undefined && value !== null && value !== '')
      .map(String),
  ),
];

const queueFromActionType = (actionType?: string) =>
  String(actionType || '').match(QUEUE_ACTION_PATTERN)?.[1];

export const cdrRoutingHints = (params: any): ICallRoutingHints => {
  const isOutbound = params.userfield === 'Outbound';

  return {
    srcTrunk: params.src_trunk_name,
    dstTrunk: params.dst_trunk_name,
    uniqueids: [params.uniqueid, params.linkedid],
    queues: [queueFromActionType(params.action_type)],
    extensions: [
      determineExtension(params),
      params.dstanswer,
      params.dstchannel_ext,
      ...(isOutbound ? [params.channel_ext, params.new_src, params.src] : []),
    ],
  };
};

const servesQueue = (integration: ICallIntegrationDocument, queues: string[]) =>
  [...(integration.queues || []), ...(integration.queueNames || [])].some(
    (queue) => queues.includes(String(queue)),
  );

const findTrunkCandidates = async (
  models: IModels,
  anchor: ICallIntegrationDocument | null | undefined,
  hints: ICallRoutingHints,
): Promise<ICallIntegrationDocument[]> => {
  const srcTrunk = anchor ? anchor.srcTrunk : hints.srcTrunk;
  const dstTrunk = anchor ? anchor.dstTrunk : hints.dstTrunk;

  const trunkSelectors: FilterQuery<ICallIntegrationDocument>[] = [];
  if (srcTrunk) {
    trunkSelectors.push({ srcTrunk });
  }
  if (dstTrunk) {
    trunkSelectors.push({ dstTrunk });
  }

  if (!trunkSelectors.length) {
    return anchor ? [anchor] : [];
  }

  const candidates = await models.CallIntegrations.find({
    $or: trunkSelectors,
  }).sort({ _id: 1 });

  if (!anchor) {
    return candidates;
  }

  return [
    anchor,
    ...candidates.filter((candidate) => candidate.inboxId !== anchor.inboxId),
  ];
};

const findQueueAnchoredIntegration = async (
  models: IModels,
  candidates: ICallIntegrationDocument[],
  uniqueids: string[],
) => {
  const queueLegs = await models.CallCdrs.find(
    {
      uniqueid: { $in: uniqueids },
      actionType: { $regex: '^QUEUE\\[' },
    },
    { actionType: 1 },
  ).lean();

  const queues = compact(
    queueLegs.map((leg) => queueFromActionType(leg.actionType)),
  );

  const anchored = candidates.filter((candidate) =>
    servesQueue(candidate, queues),
  );

  return anchored.length === 1 ? anchored[0] : null;
};

const findStickyIntegration = async (
  models: IModels,
  candidates: ICallIntegrationDocument[],
  uniqueids: string[],
) => {
  const inboxIds = candidates.map((candidate) => candidate.inboxId);

  const session = await models.CallSessions.findOne(
    {
      $or: [{ uniqueid: { $in: uniqueids } }, { linkedid: { $in: uniqueids } }],
      inboxIntegrationId: { $in: inboxIds },
    },
    { inboxIntegrationId: 1 },
  ).lean();

  const inboxId =
    session?.inboxIntegrationId ||
    (
      await models.CallCdrs.findOne(
        {
          uniqueid: { $in: uniqueids },
          inboxIntegrationId: { $in: inboxIds },
        },
        { inboxIntegrationId: 1 },
      )
        .sort({ createdAt: 1 })
        .lean()
    )?.inboxIntegrationId;

  return candidates.find((candidate) => candidate.inboxId === inboxId) || null;
};

export const resolveCallIntegration = async (
  models: IModels,
  anchor: ICallIntegrationDocument | null | undefined,
  hints: ICallRoutingHints,
): Promise<ICallRouting> => {
  const uniqueids = compact(hints.uniqueids);
  const candidates = await findTrunkCandidates(models, anchor, hints);

  const routing = (
    integration: ICallIntegrationDocument | null,
    decisive: boolean,
  ): ICallRouting => ({ integration, candidates, decisive, uniqueids });

  if (candidates.length <= 1) {
    return routing(candidates[0] || null, true);
  }

  const byQueue = candidates.filter((candidate) =>
    servesQueue(candidate, compact(hints.queues)),
  );
  if (byQueue.length === 1) {
    return routing(byQueue[0], true);
  }

  if (uniqueids.length) {
    const queueAnchored = await findQueueAnchoredIntegration(
      models,
      candidates,
      uniqueids,
    );
    if (queueAnchored) {
      return routing(queueAnchored, false);
    }
  }

  const extensions = compact(hints.extensions);
  const byExtension = candidates.filter((candidate) =>
    (candidate.operators || []).some((operator) =>
      extensions.includes(String(operator.gsUsername)),
    ),
  );
  if (byExtension.length === 1) {
    return routing(byExtension[0], true);
  }

  const sticky = uniqueids.length
    ? await findStickyIntegration(models, candidates, uniqueids)
    : null;

  return routing(sticky || candidates[0], false);
};

export const rehomeCallLegs = async (
  models: IModels,
  { integration, candidates, decisive, uniqueids }: ICallRouting,
) => {
  if (!integration || !decisive || !uniqueids.length) {
    return;
  }

  const otherInboxIds = candidates
    .map((candidate) => candidate.inboxId)
    .filter((inboxId) => inboxId !== integration.inboxId);

  if (!otherInboxIds.length) {
    return;
  }

  const cdrSelector = {
    uniqueid: { $in: uniqueids },
    inboxIntegrationId: { $in: otherInboxIds },
  };
  const sessionSelector = {
    $or: [{ uniqueid: { $in: uniqueids } }, { linkedid: { $in: uniqueids } }],
    inboxIntegrationId: { $in: otherInboxIds },
  };

  const [cdrs, sessions] = await Promise.all([
    models.CallCdrs.find(cdrSelector, { conversationId: 1 }).lean(),
    models.CallSessions.find(sessionSelector, { conversationId: 1 }).lean(),
  ]);

  if (!cdrs.length && !sessions.length) {
    return;
  }

  const conversationIds = compact([
    ...cdrs.map((cdr) => cdr.conversationId),
    ...sessions.map((session) => session.conversationId),
  ]);

  await Promise.all([
    models.CallCdrs.updateMany(cdrSelector, {
      $set: { inboxIntegrationId: integration.inboxId },
    }),
    models.CallSessions.updateMany(sessionSelector, {
      $set: {
        inboxIntegrationId: integration.inboxId,
        operatorPhone: integration.phone,
      },
    }),
    conversationIds.length
      ? models.Conversations.updateMany(
          {
            _id: { $in: conversationIds },
            integrationId: { $in: otherInboxIds },
          },
          { $set: { integrationId: integration.inboxId } },
        )
      : null,
  ]);

  debugCall(
    `Rehomed call ${uniqueids.join(',')} to integration ${
      integration.inboxId
    } ` +
      `(cdrs=${cdrs.length}, sessions=${sessions.length}, conversations=${conversationIds.length})`,
  );
};
