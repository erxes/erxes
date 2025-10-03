import { IModels } from '~/connectionResolvers';
import { cfRecordUrl, toCamelCase } from '../utils';

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
    return await updateExistingCdr(models, existingCdr, conversationId);
  }

  const newCdr = await createNewCdr(models, cdrParams, inboxId, conversationId);
  await processRecordUrl(models, cdrParams, inboxId, subdomain, acctId);

  return newCdr;
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
  const { AcctId: acctId, ...filteredParams } = camelCaseParams as any;

  return await models.CallCdrs.create({
    acctId,
    ...filteredParams,
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
      retryCount: 1,
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

  if (userfield === 'Inbound' && lastapp === 'Queue') {
    return dstanswer || dstchannel_ext || dst;
  }
};

export const extractOperatorId = (params) => {
  const { userfield, dst, src, lastapp, action_type } = params;

  if (lastapp !== 'Queue') {
    return null;
  }

  const match = action_type?.match(/FOLLOWME\[(\d+)\]/);
  if (match && match[1]) {
    return match[1];
  }

  return userfield === 'Inbound' ? dst : src;
};

export const getConversationContent = async (models: IModels, cdrParams) => {
  const { disposition } = cdrParams;

  if (!cdrParams.uniqueid) {
    return 'uniqueId not found';
  }

  const relatedCdrs = await models.CallCdrs.find({
    uniqueid: cdrParams.uniqueid,
  });
  if (relatedCdrs) {
    const answered = relatedCdrs.some(
      (cdr) =>
        cdr.disposition?.toLowerCase() === 'answered' &&
        cdr.lastapp !== 'ForkCDR' &&
        !cdr.actionType?.includes('IVR'),
    );

    if (answered) return 'ANSWERED';
  }

  if (cdrParams.userfield === 'Outbound') return 'OUTBOUND';
  if (
    cdrParams.action_type?.includes('IVR') &&
    cdrParams.disposition?.toLowerCase() === 'answered' &&
    cdrParams.userfield?.toLowerCase() === 'inbound'
  ) {
    return 'IVR';
  }

  switch (disposition) {
    case 'ANSWERED':
      return disposition;
    case 'NO ANSWER':
      return disposition;
    case 'BUSY':
      return disposition;
    case 'FAILED':
      return disposition;
    default:
      return 'MISSED';
  }
};

export function selectRelevantCdr(histories: any[]): any | null {
  if (!Array.isArray(histories) || histories.length === 0) return null;

  const answered = histories.find(
    (h) =>
      h.disposition === 'ANSWERED' && h.billsec > 0 && h.lastapp === 'Queue',
  );

  const ivr = histories.find(
    (h) =>
      h.disposition === 'ANSWERED' &&
      h.billsec > 0 &&
      h.lastapp !== 'ForkCDR' &&
      h.actionType.includes('IVR'),
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
