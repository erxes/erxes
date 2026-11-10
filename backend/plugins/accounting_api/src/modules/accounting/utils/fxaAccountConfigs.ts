import type { IModels } from '~/connectionResolvers';

export const getFxaDepreciationAccounts = async (
  models: IModels,
): Promise<Map<string, string>> => {
  const configs = await models.Configs.getConfigs('FIXEDASSET_ACCOUNTS');
  const accounts = new Map<string, string>();
  for (const config of configs) {
    const value: unknown = config.value;
    if (
      config.subId &&
      value &&
      typeof value === 'object' &&
      'depreciationAccountId' in value &&
      typeof value.depreciationAccountId === 'string'
    ) {
      accounts.set(config.subId, value.depreciationAccountId);
    }
  }
  return accounts;
};
