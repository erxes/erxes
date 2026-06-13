import { IModels } from '~/connectionResolvers';

export interface IDynamicConfig extends Record<string, unknown> {
  brandId: string;
  itemApi?: string;
  itemCategoryApi?: string;
  customerApi?: string;
  username?: string;
  password?: string;
}

type DynamicConfigMap = Record<string, IDynamicConfig>;

/* Utga object mun esehiig shalgaj config parse hiih ued hamgaalna */
const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

/* Neg config object shuud MS Dynamic endpoint aguulsan esehiig shalgana */
const hasDynamicEndpoint = (value: Record<string, unknown>) => {
  return Boolean(value.itemApi || value.itemCategoryApi || value.customerApi);
};

/* Config-iin brandId dutuu bol key-aar nooj neg format ruu oruulna */
const normalizeConfig = (
  key: string,
  value: unknown,
): IDynamicConfig | null => {
  if (!isRecord(value)) {
    return null;
  }

  const brandId =
    typeof value.brandId === 'string' && value.brandId
      ? value.brandId
      : key || 'noBrand';

  return {
    ...value,
    brandId,
  };
};

/* Grouped bolon single config utgiig brandId-aar key hiisen map bolgono */
const normalizeConfigMap = (value: unknown): DynamicConfigMap => {
  if (!isRecord(value)) {
    return {};
  }

  if (hasDynamicEndpoint(value)) {
    const config = normalizeConfig('noBrand', value);
    return config ? { [config.brandId]: config } : {};
  }

  return Object.entries(value).reduce<DynamicConfigMap>(
    (acc, [key, config]) => {
      const normalized = normalizeConfig(key || 'noBrand', config);

      if (normalized) {
        acc[key || 'noBrand'] = normalized;
      }

      return acc;
    },
    {},
  );
};

/* Songoson brandiin config-iig avna, brand songoogui bol default config avna */
const pickDynamicConfig = (
  configsMap: DynamicConfigMap,
  brandId?: string,
): IDynamicConfig => {
  const hasSelectedBrand = Boolean(brandId && brandId !== 'noBrand');
  const config = hasSelectedBrand
    ? configsMap[brandId as string]
    : configsMap.noBrand || Object.values(configsMap)[0];

  if (!config) {
    throw new Error(
      hasSelectedBrand
        ? `MS Dynamic config not found for selected brand: ${brandId}`
        : 'MS Dynamic config not found.',
    );
  }

  return config;
};

/* DYNAMIC config-iig grouped storage ees ehleed, daraa ni split rows-oos haij avna */
export const getDynamicConfig = async (
  models: IModels,
  brandId?: string,
): Promise<IDynamicConfig> => {
  const groupedConfig = await models.Configs.getConfig('DYNAMIC', '');
  const groupedConfigsMap = normalizeConfigMap(groupedConfig?.value);

  if (Object.keys(groupedConfigsMap).length) {
    return pickDynamicConfig(groupedConfigsMap, brandId);
  }

  const configs = await models.Configs.getConfigs('DYNAMIC');

  if (!configs?.length) {
    throw new Error('MS Dynamic config not found.');
  }

  const splitConfigsMap = configs.reduce<DynamicConfigMap>((acc, config) => {
    const normalized = normalizeConfig(config.subId || 'noBrand', config.value);

    if (normalized) {
      acc[config.subId || 'noBrand'] = normalized;
    }

    return acc;
  }, {});

  return pickDynamicConfig(splitConfigsMap, brandId);
};
