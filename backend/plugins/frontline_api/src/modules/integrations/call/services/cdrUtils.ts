import { IModels } from '~/connectionResolvers';
import { cfRecordUrl, toCamelCase } from '../utils';
import { CallOperator } from '@/integrations/call/@types/integrations';

const CDR_TIME_OFFSET = '+08:00';
const CDR_TIME_OFFSET_MS = 8 * 60 * 60 * 1000;

export const parseCdrDate = (
  value?: string | Date | null,
): Date | undefined => {
  if (!value) return undefined;
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? undefined : value;
  }

  const trimmed = String(value).trim();
  if (!trimmed) return undefined;

  const normalized = trimmed.includes('T')
    ? trimmed
    : trimmed.replace(' ', 'T');
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalized);
  const date = new Date(
    hasZone ? normalized : `${normalized}${CDR_TIME_OFFSET}`,
  );

  return isNaN(date.getTime()) ? undefined : date;
};

export const getPbxDayRange = (now: Date = new Date()) => {
  const local = new Date(now.getTime() + CDR_TIME_OFFSET_MS);
  const dateFrom = new Date(
    Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) -
      CDR_TIME_OFFSET_MS,
  );
  const dateTo = new Date(dateFrom.getTime() + 24 * 60 * 60 * 1000);
  return { dateFrom, dateTo };
};

export const formatCdrApiDate = (value?: string | Date | null): string => {
  if (typeof value === 'string') {
    return value.includes(' ') ? value.replace(' ', 'T') : value;
  }

  const date = parseCdrDate(value);
  if (!date) return '';

  return new Date(date.getTime() + CDR_TIME_OFFSET_MS)
    .toISOString()
    .slice(0, 19);
};

export const findOrCreateCdr = async (
  models: IModels,
  subdomain,
  cdrParams,
  inboxId,
  conversationId,
) => {
  validateRequiredParams(cdrParams);

  const { AcctId: acctId } = cdrParams;
  const existingCdr = await findExistingCdr(models, acctId);

  if (existingCdr) {
    const cdr = await updateExistingCdr(models, existingCdr, conversationId);
    return { cdr, created: false };
  }

  const newCdr = await createNewCdr(models, cdrParams, inboxId, conversationId);
  await processRecordUrl(models, cdrParams, inboxId, subdomain, acctId);

  return { cdr: newCdr, created: true };
};

const validateRequiredParams = (cdrParams) => {
  const { AcctId } = cdrParams;
  if (!AcctId) {
    throw new Error('AcctId is required');
  }
};

const findExistingCdr = async (models: IModels, acctId) => {
  return await models.CallCdrs.findOne({ acctId });
};

const updateExistingCdr = async (models: IModels, cdr, conversationId) => {
  if (conversationId && cdr.conversationId !== conversationId) {
    await models.CallCdrs.updateOne(
      { _id: cdr._id },
      { $set: { conversationId } },
    );
    cdr.conversationId = conversationId;
  }
  return cdr;
};

const createNewCdr = async (
  models: IModels,
  cdrParams,
  inboxId,
  conversationId,
) => {
  const camelCaseParams = toCamelCase(cdrParams);
  const {
    AcctId: acctId,
    disposition,
    ...filteredParams
  } = camelCaseParams as any;

  return await models.CallCdrs.create({
    acctId,
    disposition,
    ...filteredParams,
    start: parseCdrDate(filteredParams.start),
    answer: parseCdrDate(filteredParams.answer),
    end: parseCdrDate(filteredParams.end),
    inboxIntegrationId: inboxId,
    conversationId,
    createdAt: new Date(),
  });
};

const processRecordUrl = async (
  models: IModels,
  cdrParams,
  inboxId,
  subdomain,
  acctId,
) => {
  const { recordfiles, lastapp, disposition } = cdrParams;

  if (!shouldProcessRecordUrl(recordfiles, disposition, lastapp)) {
    return;
  }

  try {
    const recordUrl = await generateRecordUrl(
      cdrParams,
      inboxId,
      models,
      subdomain,
    );

    if (recordUrl) {
      await updateCdrWithRecordUrl(models, acctId, recordUrl);
    }
  } catch (error) {
    console.error('Failed to process record URL:', error);
  }
};

const shouldProcessRecordUrl = (recordfiles, disposition, lastapp) => {
  return (
    recordfiles &&
    disposition === 'ANSWERED' &&
    (lastapp === 'Dial' || lastapp === 'Queue')
  );
};

const generateRecordUrl = async (cdrParams, inboxId, models, subdomain) => {
  const fileDir = calculateFileDir(cdrParams);

  return await cfRecordUrl(
    {
      fileDir,
      recordfiles: cdrParams.recordfiles,
      inboxIntegrationId: inboxId,
      retryCount: 3,
    },
    {},
    models,
    subdomain,
  );
};

const updateCdrWithRecordUrl = async (models: IModels, acctId, recordUrl) => {
  await models.CallCdrs.updateOne({ acctId }, { $set: { recordUrl } });
};

export const determinePrimaryPhone = (params) => {
  const { userfield, dst, src, action_type } = params;
  if (userfield === 'Outbound' && !action_type?.includes('FOLLOWME')) {
    return dst;
  }
  return src;
};

export const determineExtension = (params) => {
  const {
    userfield,
    src,
    dst,
    action_type,
    lastapp,
    dstchannel_ext,
    dstanswer,
    channel_ext,
    new_src,
  } = params;

  if (userfield === 'Outbound' && !action_type?.includes('FOLLOWME')) {
    return channel_ext || new_src || src;
  }

  if (userfield === 'Inbound' && (lastapp === 'Queue' || lastapp === 'Dial')) {
    return dstanswer || dstchannel_ext || dst;
  }
};

export const extractOperatorId = (params) => {
  const { userfield, dst, src, lastapp, action_type } = params;

  if (lastapp !== 'Queue' && lastapp !== 'Dial') {
    return null;
  }

  const match = action_type?.match(/FOLLOWME\[(\d+)\]/);
  if (match?.[1]) {
    return match[1];
  }

  return userfield === 'Inbound' ? dst : src;
};

export const isHumanAnsweredLeg = (leg: any): boolean => {
  const lastapp = leg?.lastapp;
  const actionType = String(leg?.actionType ?? leg?.action_type ?? '');
  return (
    (leg?.disposition || '').toLowerCase() === 'answered' &&
    Number(leg?.billsec) > 0 &&
    (lastapp === 'Queue' || lastapp === 'Dial') &&
    !actionType.includes('VM')
  );
};

/** The CDR leg fields the wait-time helpers read. */
export interface ICdrLegTiming {
  uniqueid?: string;
  lastapp?: string;
  disposition?: string;
  billsec?: number;
  duration?: number;
  actionType?: string;
  start?: Date | string | null;
  answer?: Date | string | null;
  end?: Date | string | null;
}

/** The apps that hold the caller while the PBX looks for an agent. */
const WAITING_LASTAPPS = ['Queue', 'Dial'];

/** Seconds the caller waited on this leg before it answered. */
export const legRingSeconds = (leg: ICdrLegTiming): number => {
  const start = parseCdrDate(leg.start);
  const answer = parseCdrDate(leg.answer);

  if (!start || !answer) return 0;

  const seconds = (answer.getTime() - start.getTime()) / 1000;

  return seconds > 0 ? seconds : 0;
};

export const callSpeedOfAnswer = (legs: ICdrLegTiming[]): number | null => {
  const answeredLeg = legs.find(isHumanAnsweredLeg);

  if (!answeredLeg) return null;

  const ring = legRingSeconds(answeredLeg);
  if (ring > 0) return ring;

  const waits = legs
    .filter(
      (leg) =>
        leg !== answeredLeg && WAITING_LASTAPPS.includes(leg.lastapp ?? ''),
    )
    .map(legRingSeconds);

  return waits.length ? Math.max(...waits) : 0;
};

export const callRingSeconds = (legs: ICdrLegTiming[]): number | null => {
  const held = legs
    .filter((leg) => WAITING_LASTAPPS.includes(leg.lastapp ?? ''))
    .map((leg) => Number(leg.duration ?? 0) - Number(leg.billsec ?? 0))
    .filter((seconds) => seconds > 0);

  if (held.length) return Math.max(...held);

  const stamps = (
    pick: (leg: ICdrLegTiming) => Date | string | null | undefined,
  ): number[] =>
    legs
      .map((leg) => parseCdrDate(pick(leg)))
      .filter((date): date is Date => Boolean(date))
      .map((date) => date.getTime());

  const starts = stamps((leg) => leg.start);
  const ends = stamps((leg) => leg.end);

  if (!starts.length || !ends.length) return null;

  const span = (Math.max(...ends) - Math.min(...starts)) / 1000;

  return span > 0 ? span : null;
};

export const averageSpeedOfAnswer = (legs: ICdrLegTiming[]): number => {
  const byCall = new Map<string, ICdrLegTiming[]>();

  for (const leg of legs) {
    if (!leg.uniqueid) continue;
    byCall.set(leg.uniqueid, [...(byCall.get(leg.uniqueid) ?? []), leg]);
  }

  const waits = [...byCall.values()]
    .map(callSpeedOfAnswer)
    .filter((wait): wait is number => wait !== null);

  if (!waits.length) return 0;

  return waits.reduce((sum, wait) => sum + wait, 0) / waits.length;
};

export const deriveCallStatusFromLegs = (legs: any[]): string => {
  const actionTypeOf = (leg: any) => leg.actionType ?? leg.action_type ?? '';

  if (legs.some(isHumanAnsweredLeg)) return 'ANSWERED';

  const answeredBy = (type: string) =>
    legs.some(
      (leg) =>
        actionTypeOf(leg).includes(type) &&
        (leg.disposition || '').toLowerCase() === 'answered',
    );

  if (answeredBy('VM')) return 'VOICEMAIL';

  if (legs.some((leg) => actionTypeOf(leg).includes('FOLLOWME'))) {
    return 'FOLLOWME';
  }

  const dispositions = legs.map((leg) => (leg.disposition || '').toUpperCase());
  if (dispositions.includes('BUSY')) return 'BUSY';
  if (dispositions.includes('FAILED')) return 'FAILED';
  if (dispositions.includes('NO ANSWER')) return 'NO ANSWER';

  if (answeredBy('IVR')) return 'IVR';

  return 'MISSED';
};

export const getConversationContent = async (
  models: IModels,
  cdrParams,
  conversationId?: string,
) => {
  const { userfield } = cdrParams;
  const isFollowmeLeg = !!cdrParams.action_type?.includes('FOLLOWME');
  const direction =
    userfield === 'Outbound' && !isFollowmeLeg ? 'Outbound' : 'Inbound';

  if (!cdrParams.uniqueid) {
    return 'uniqueId not found';
  }

  const legSelector = conversationId
    ? { $or: [{ uniqueid: cdrParams.uniqueid }, { conversationId }] }
    : { uniqueid: cdrParams.uniqueid };

  const storedCdrs = await models.CallCdrs.find(legSelector);
  const legs: any[] = [...storedCdrs, cdrParams];

  const status = deriveCallStatusFromLegs(legs);

  if (status === 'ANSWERED') return `ANSWERED · ${direction}`;

  if (direction === 'Outbound') return `OUTBOUND`;

  if (status === 'FOLLOWME') return `NO ANSWER · ${direction}`;

  return `${status} · ${direction}`;
};

export function selectRelevantCdr(histories: any[]): any | null {
  if (!Array.isArray(histories) || histories.length === 0) return null;

  const answered = histories.find(isHumanAnsweredLeg);

  const ivr = histories.find(
    (h) =>
      h.disposition === 'ANSWERED' &&
      h.billsec > 0 &&
      h.lastapp !== 'ForkCDR' &&
      h.actionType?.includes('IVR'),
  );

  const noAnswer = histories.find(
    (h) =>
      h.disposition === 'NO ANSWER' && h.billsec === 0 && h.lastapp === 'Queue',
  );

  return answered || noAnswer || ivr || histories[histories.length - 1] || null;
}
export const calculateFileDir = (doc) => {
  let fileDir = 'monitor';

  if (
    ['QUEUE', 'TRANSFER'].some((substring) =>
      doc?.action_type?.includes(substring),
    )
  ) {
    fileDir = 'queue';
  }
  return fileDir;
};

export interface ICdrOperatorParams {
  userfield?: string;
  src?: string;
  dst?: string;
  dstanswer?: string;
  dstchannel_ext?: string;
  channel_ext?: string;
  new_src?: string;
  lastapp?: string;
  action_type?: string;
}

export const resolveCdrOperator = (
  operators: CallOperator[] = [],
  params: ICdrOperatorParams,
): { operator?: CallOperator; extension?: string } => {
  const extension = determineExtension(params);

  const candidates = [
    extension,
    extractOperatorId(params),
    params.dstchannel_ext,
    params.channel_ext,
    params.dstanswer,
    params.new_src,
    params.userfield === 'Outbound' ? params.src : params.dst,
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    const operator = operators.find((op) => op.gsUsername === candidate);
    if (operator) {
      return { operator, extension: candidate };
    }
  }

  return { extension: extension || undefined };
};
