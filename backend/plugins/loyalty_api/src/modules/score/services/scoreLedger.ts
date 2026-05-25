import { IScoreLogDocument } from '@/score/@types/scoreLog';
import { SCORE_ACTION } from '@/score/constants';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { getLoyaltyOwner } from '~/utils';

export type ScoreAction = 'add' | 'subtract' | 'set' | 'refund';
export type ScoreStorageMode = 'legacy' | 'signed';

export type OwnerScoreUpdate = {
  updatedCustomFieldsData?: Record<string, any>;
  updatedScore?: number;
};

export type ScoreLogLike = {
  action?: string;
  changeScore?: number;
};

export type ScoreOwner = {
  _id: string;
  score?: number;
  propertiesData?: Record<string, any>;
  customFieldsData?: Array<{
    field?: string;
    value?: any;
    numberValue?: any;
  }>;
};

export type ScoreTarget = {
  targetId?: string;
  serviceName?: string;
};

export type ScoreChangeDoc = ScoreTarget & {
  ownerType: string;
  ownerId: string;
  campaignId?: string;
  fieldId?: string;
  action?: ScoreAction;
  changeScore?: number;
  signedChangeScore?: number;
  description?: string;
  createdBy?: string;
  sourceScoreLogId?: string;
  amount?: number;
  quantity?: number;
  createdAt?: Date;
  owner?: ScoreOwner;
  storageMode?: ScoreStorageMode;
  preventNegativeBalance?: boolean;
};

export type RefundScoreDoc = ScoreTarget & {
  ownerType: string;
  ownerId: string;
  sourceScoreLogId?: string;
  scoreCampaignIds?: string[];
  checkInId?: string;
  description?: string;
  createdBy?: string;
  storageMode?: ScoreStorageMode;
  netTargetAddsForSubtract?: boolean;
};

export type ScoreBalanceQuery = {
  ownerType: string;
  ownerId: string;
  campaignId?: string;
  campaignIds?: string[];
  fieldId?: string;
};

export const fixScoreNumber = (value: number, fractionDigits = 4) => {
  const numberValue = Number(value) || 0;
  const multiplier = 10 ** fractionDigits;

  return Math.round((numberValue + Number.EPSILON) * multiplier) / multiplier;
};

export const getOwnerScoreValue = (owner: ScoreOwner, fieldId?: string) => {
  if (!fieldId) {
    return Number(owner?.score) || 0;
  }

  return (
    Number(
      owner?.propertiesData?.[fieldId] ??
        (owner?.customFieldsData || []).find(({ field }) => field === fieldId)
          ?.numberValue ??
        (owner?.customFieldsData || []).find(({ field }) => field === fieldId)
          ?.value,
    ) || 0
  );
};

export const getSignedChangeScore = (log: ScoreLogLike) => {
  const changeScore = Number(log?.changeScore) || 0;

  if (log?.action === SCORE_ACTION.SUBTRACT) {
    return -Math.abs(changeScore);
  }

  if (log?.action === SCORE_ACTION.ADD) {
    return Math.abs(changeScore);
  }

  return changeScore;
};

const buildSwitchBranch = (caseExpression: any, thenExpression: any) => {
  const branch = { case: caseExpression };

  Object.assign(branch, { ['then']: thenExpression });

  return branch;
};

export const buildSignedScoreExpression = (
  changeScoreField = '$changeScore',
  actionField = '$action',
) => ({
  $switch: {
    branches: [
      buildSwitchBranch(
        { $eq: [actionField, SCORE_ACTION.SUBTRACT] },
        { $multiply: [{ $abs: changeScoreField }, -1] },
      ),
      buildSwitchBranch(
        { $eq: [actionField, SCORE_ACTION.ADD] },
        { $abs: changeScoreField },
      ),
      buildSwitchBranch(
        { $eq: [actionField, SCORE_ACTION.REFUND] },
        changeScoreField,
      ),
    ],
    default: changeScoreField,
  },
});

export const resolveScoreAction = (
  signedChangeScore: number,
  action?: ScoreAction,
): ScoreAction => {
  if (action) {
    return action;
  }

  return signedChangeScore < 0 ? 'subtract' : 'add';
};

export const prepareScoreLogChange = ({
  action,
  signedChangeScore,
  storageMode = 'legacy',
}: {
  action?: ScoreAction;
  signedChangeScore: number;
  storageMode?: ScoreStorageMode;
}) => {
  const normalizedSignedChangeScore = fixScoreNumber(signedChangeScore);
  const resolvedAction = resolveScoreAction(
    normalizedSignedChangeScore,
    action,
  );

  if (
    storageMode === 'signed' ||
    resolvedAction === SCORE_ACTION.REFUND ||
    resolvedAction === SCORE_ACTION.SET
  ) {
    return {
      action: resolvedAction,
      changeScore: normalizedSignedChangeScore,
      signedChangeScore: normalizedSignedChangeScore,
    };
  }

  return {
    action: resolvedAction,
    changeScore: fixScoreNumber(Math.abs(normalizedSignedChangeScore)),
    signedChangeScore: normalizedSignedChangeScore,
  };
};

export const getOwnerScoreUpdate = ({
  owner,
  fieldId,
  newScore,
}: {
  owner: ScoreOwner;
  fieldId?: string;
  newScore: number;
}): OwnerScoreUpdate => {
  if (fieldId) {
    return {
      updatedCustomFieldsData: {
        ...owner?.propertiesData,
        [fieldId]: newScore,
      },
    };
  }

  return { updatedScore: newScore };
};

export const updateOwnerScoreCache = async ({
  subdomain,
  ownerId,
  ownerType,
  updatedCustomFieldsData,
  updatedScore,
}: OwnerScoreUpdate & {
  subdomain: string;
  ownerId: string;
  ownerType: string;
}) => {
  const $set: Record<string, any> = {};

  if (updatedCustomFieldsData !== undefined) {
    $set.propertiesData = updatedCustomFieldsData;
  }

  if (updatedScore !== undefined) {
    $set.score = updatedScore;
  }

  if (!Object.keys($set).length) {
    return null;
  }

  if (ownerType === 'cpUser') {
    const cpUser = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'cpUsers',
      action: 'get',
      input: { id: ownerId },
      defaultValue: null,
    });

    if (!cpUser) {
      throw new Error('Not Found Owner');
    }

    return sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'mutation',
      module: 'customers',
      action: 'updateMany',
      input: {
        selector: { _id: cpUser.erxesCustomerId },
        modifier: { $set },
      },
      defaultValue: null,
    });
  }

  const actionsObj = {
    user: { module: 'users', action: 'updateOne' },
    customer: { module: 'customers', action: 'updateMany' },
    company: { module: 'companies', action: 'updateMany' },
  };
  const actionConfig = actionsObj[ownerType];

  if (!actionConfig) {
    throw new Error(`Unsupported owner type: ${ownerType}`);
  }

  return sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'mutation',
    module: actionConfig.module,
    action: actionConfig.action,
    input: {
      selector: { _id: ownerId },
      modifier: { $set },
    },
    defaultValue: null,
  });
};

export const getScoreBalanceFromLogs = async (
  models: IModels,
  query: ScoreBalanceQuery,
) => {
  const { ownerType, ownerId, campaignId, campaignIds, fieldId } = query;
  const filter: Record<string, any> = { ownerType, ownerId };

  if (campaignId) {
    filter.campaignId = campaignId;
  } else if (campaignIds?.length) {
    filter.campaignId = { $in: campaignIds };
  } else if (fieldId) {
    const ids = await models.ScoreCampaigns.find({ fieldId }).distinct('_id');
    filter.campaignId = { $in: ids };
  }

  const [result] = await models.ScoreLogs.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        balance: { $sum: buildSignedScoreExpression() },
      },
    },
  ]);

  return Number(result?.balance) || 0;
};

const getCampaignFieldId = async (
  models: IModels,
  campaignId?: string,
  fieldId?: string,
) => {
  if (fieldId || !campaignId) {
    return fieldId;
  }

  const campaign = await models.ScoreCampaigns.findOne({ _id: campaignId })
    .select('fieldId')
    .lean();

  if (!campaign) {
    throw new Error('Campaign not found');
  }

  return campaign?.fieldId;
};

const getSignedChangeFromInput = (doc: ScoreChangeDoc) => {
  if (doc.signedChangeScore !== undefined) {
    return Number(doc.signedChangeScore) || 0;
  }

  const changeScore = Number(doc.changeScore) || 0;

  if (doc.action === SCORE_ACTION.SUBTRACT) {
    return -Math.abs(changeScore);
  }

  if (doc.action === SCORE_ACTION.ADD) {
    return Math.abs(changeScore);
  }

  return changeScore;
};

export const applyScoreChange = async ({
  models,
  subdomain,
  doc,
}: {
  models: IModels;
  subdomain: string;
  doc: ScoreChangeDoc;
}) => {
  const {
    ownerType,
    ownerId,
    campaignId,
    targetId,
    serviceName,
    description,
    createdBy = '',
    sourceScoreLogId,
    amount,
    quantity,
    createdAt = new Date(),
    storageMode = 'legacy',
    preventNegativeBalance = true,
  } = doc;

  if (!ownerType || !ownerId) {
    throw new Error('You must provide a owner');
  }

  const owner =
    doc.owner || (await getLoyaltyOwner(subdomain, { ownerType, ownerId }));

  if (!owner) {
    throw new Error('Owner not found');
  }

  const signedChangeScore = fixScoreNumber(getSignedChangeFromInput(doc));

  if (!signedChangeScore) {
    throw new Error('Score change must not be zero');
  }

  const fieldId = await getCampaignFieldId(models, campaignId, doc.fieldId);
  const previousScore = getOwnerScoreValue(owner, fieldId);
  const newScore = fixScoreNumber(previousScore + signedChangeScore);

  if (preventNegativeBalance && newScore < 0) {
    throw new Error('There has no enough score to subtract');
  }

  const updateResponse = await updateOwnerScoreCache({
    subdomain,
    ownerId,
    ownerType,
    ...getOwnerScoreUpdate({ owner, fieldId, newScore }),
  });

  const preparedChange = prepareScoreLogChange({
    action: doc.action,
    signedChangeScore,
    storageMode,
  });

  const log = await models.ScoreLogs.create({
    ownerId,
    ownerType,
    campaignId,
    changeScore: preparedChange.changeScore,
    createdAt,
    description,
    createdBy,
    serviceName,
    targetId,
    action: preparedChange.action,
    sourceScoreLogId,
    amount,
    quantity,
  });

  return {
    log,
    fieldId,
    previousScore,
    newScore,
    signedChangeScore,
    updateResponse,
  };
};

const findRefundSourceLog = async (
  models: IModels,
  {
    sourceScoreLogId,
    targetId,
    ownerType,
    ownerId,
  }: Pick<
    RefundScoreDoc,
    'sourceScoreLogId' | 'targetId' | 'ownerType' | 'ownerId'
  >,
) => {
  if (sourceScoreLogId) {
    return models.ScoreLogs.findOne({ _id: sourceScoreLogId });
  }

  if (!targetId) {
    throw new Error('Please provide target or source score log');
  }

  return (
    (await models.ScoreLogs.findOne({
      targetId,
      ownerId,
      ownerType,
      action: SCORE_ACTION.SUBTRACT,
    })) ||
    (await models.ScoreLogs.findOne({
      targetId,
      ownerId,
      ownerType,
      action: SCORE_ACTION.ADD,
    }))
  );
};

const getRefundSignedChange = async ({
  models,
  sourceLog,
  netTargetAddsForSubtract = true,
}: {
  models: IModels;
  sourceLog: IScoreLogDocument;
  netTargetAddsForSubtract?: boolean;
}) => {
  const sourceSignedChangeScore = getSignedChangeScore(sourceLog);

  if (sourceLog.action !== SCORE_ACTION.SUBTRACT || !netTargetAddsForSubtract) {
    return -sourceSignedChangeScore;
  }

  const addedScoreLogs = await models.ScoreLogs.find({
    targetId: sourceLog.targetId,
    ownerId: sourceLog.ownerId,
    ownerType: sourceLog.ownerType,
    action: SCORE_ACTION.ADD,
  });

  const totalAddedScore = addedScoreLogs.reduce(
    (sum, log) => sum + getSignedChangeScore(log),
    0,
  );

  return -sourceSignedChangeScore - totalAddedScore;
};

export const refundScoreChange = async ({
  models,
  subdomain,
  doc,
}: {
  models: IModels;
  subdomain: string;
  doc: RefundScoreDoc;
}) => {
  const sourceLog = await findRefundSourceLog(models, doc);

  if (!sourceLog) {
    throw new Error('Cannot find score log on this target');
  }

  const refundScoreLog = await models.ScoreLogs.exists({
    targetId: sourceLog.targetId,
    ownerId: sourceLog.ownerId,
    ownerType: sourceLog.ownerType,
    action: SCORE_ACTION.REFUND,
    sourceScoreLogId: sourceLog._id,
  });

  if (refundScoreLog) {
    throw new Error(
      'Cannot refund loyalty score cause already refunded loyalty score',
    );
  }

  const signedChangeScore = await getRefundSignedChange({
    models,
    sourceLog,
    netTargetAddsForSubtract: doc.netTargetAddsForSubtract,
  });

  return applyScoreChange({
    models,
    subdomain,
    doc: {
      ownerId: sourceLog.ownerId,
      ownerType: sourceLog.ownerType,
      campaignId: sourceLog.campaignId,
      serviceName: sourceLog.serviceName,
      targetId: sourceLog.targetId,
      sourceScoreLogId: sourceLog._id,
      action: 'refund',
      signedChangeScore,
      description: doc.description,
      createdBy: doc.createdBy,
      storageMode: doc.storageMode,
    },
  });
};
