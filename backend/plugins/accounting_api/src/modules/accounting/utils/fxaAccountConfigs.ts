import type { IModels } from '~/connectionResolvers';

export type TFxaAccounts = {
  depreciation?: string;
  asset?: string;
  liability?: string;
  reserve?: string;
  loss?: string;
};

export const getFxaAccounts = async (
  models: IModels,
): Promise<Map<string, TFxaAccounts>> => {
  const configs = await models.Configs.getConfigs('FIXEDASSET_ACCOUNTS');
  const mappings = new Map<string, TFxaAccounts>();
  for (const config of configs) {
    const value: unknown = config.value;
    if (!config.subId || !value || typeof value !== 'object') continue;
    mappings.set(config.subId, {
      depreciation:
        'depreciationAccountId' in value &&
        typeof value.depreciationAccountId === 'string'
          ? value.depreciationAccountId
          : undefined,
      asset:
        'taxAssetAccountId' in value &&
        typeof value.taxAssetAccountId === 'string'
          ? value.taxAssetAccountId
          : undefined,
      liability:
        'taxLiabilityAccountId' in value &&
        typeof value.taxLiabilityAccountId === 'string'
          ? value.taxLiabilityAccountId
          : undefined,
      reserve:
        'revaluationReserveAccountId' in value &&
        typeof value.revaluationReserveAccountId === 'string'
          ? value.revaluationReserveAccountId
          : undefined,
      loss:
        'revaluationLossAccountId' in value &&
        typeof value.revaluationLossAccountId === 'string'
          ? value.revaluationLossAccountId
          : undefined,
    });
  }
  return mappings;
};

export const getFxaDepreciationAccounts = async (
  models: IModels,
): Promise<Map<string, string>> => {
  const mappings = await getFxaAccounts(models);
  const accounts = new Map<string, string>();
  for (const [accountId, mapping] of mappings) {
    if (mapping.depreciation) accounts.set(accountId, mapping.depreciation);
  }
  return accounts;
};
