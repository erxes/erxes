import { IModels } from '~/connectionResolvers';
export const resolvePlaceholderValue = (target: any, attribute: string) => {
  const [propertyName, valueToCheck, valueField] = attribute.split('-');

  const parent = target[propertyName] || {};
  // Case 1: customer-customFieldsData-1  (look up in customFieldsData)
  if (valueToCheck?.includes('customFieldsData')) {
    const fieldId = attribute.split('.').pop(); // extract the field number after '.'
    const obj = (parent.customFieldsData || []).find(
      (item: any) => item.field === fieldId,
    );
    return obj?.value ?? '0';
  }

  // Case 2: paymentsData-loyalty-amount  (find in array/object by type)
  if (valueToCheck && valueField) {
    const obj = Array.isArray(parent)
      ? parent.find((item: any) => item.type === valueToCheck)
      : parent[valueToCheck] || {};
    return obj[valueField] || '0';
  }

  // Case 3: customer-loyalty (simple nested property)
  if (valueToCheck) {
    const property = parent[valueToCheck];
    return typeof property === 'object'
      ? property?.value || '0'
      : property || '0';
  }

  // Case 4: simple top-level value (e.g. {{score}})
  return target[attribute] || '0';
};

export const doScoreCampaign = async (models: IModels, data: any) => {
  const { ownerType, ownerId, actionMethod, targetId } = data;

  try {
    await models.ScoreCampaign.checkScoreAviableSubtract(data);

    const scoreLogs =
      (await models.ScoreLog.find({
        ownerId,
        ownerType,
        targetId,
        action: actionMethod,
      }).lean()) || [];

    if (scoreLogs.length) {
      return;
    }

    return await models.ScoreCampaign.doCampaign(data);
  } catch (error: any) {
    throw new Error(error?.message || 'Score campaign execution failed');
  }
};


export const refundLoyaltyScore = async (
  models: IModels,
  { targetId, ownerType, ownerId, scoreCampaignIds, checkInId }
) => {
  if (!scoreCampaignIds.length) return;

  const scoreCampaigns =
    (await models.ScoreCampaign.find({
      _id: { $in: scoreCampaignIds },
    }).lean()) || [];

  for (const scoreCampaign of scoreCampaigns) {
    const { additionalConfig } = scoreCampaign || {};

    const checkInIds =
      additionalConfig?.cardBasedRule?.flatMap(
        ({ refundStageIds }) => refundStageIds
      ) || [];

    if (checkInIds.includes(checkInId)) {
      try {
        await models.ScoreCampaign.refundLoyaltyScore(
          targetId,
          ownerType,
          ownerId
        );
      } catch (error) {
        if (
          error.message ===
          "Cannot refund loyalty score cause already refunded loyalty score"
        ) {
          return;
        }
      }
    }
  }
};
