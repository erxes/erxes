import { z } from 'zod';

import { IMSDynamicConfig, IConfigsMap } from './types';
import { KEY_LABELS } from '../constants/constants';
import { addMSDynamicConfigSchema } from './addMSDynamicConfigSchema';

export type TMSDynamicConfig = z.infer<typeof addMSDynamicConfigSchema>;

export type MSMDynamicConfigRow = IMSDynamicConfig & {
  _id: string;
  configKey: string;
};

export type MSMDynamicConfigSubmit = (
  data: TMSDynamicConfig,
  mode: 'create' | 'update',
  currentKey?: string,
) => Promise<boolean>;

export const createEmptyMSDynamicConfig = (): IMSDynamicConfig => ({
  title: 'New MSDynamic Config',
  brandId: '',
  itemApi: '',
  itemCategoryApi: '',
  pricePriority: '',
  priceApi: '',
  customerApi: '',
  salesApi: '',
  salesLineApi: '',
  exchangeRateApi: '',
  username: '',
  password: '',
  genBusPostingGroup: '',
  vatBusPostingGroup: '',
  paymentTermsCode: '',
  paymentMethodCode: '',
  customerPostingGroup: '',
  customerPricingGroup: '',
  customerDiscGroup: '',
  locationCode: '',
  reminderCode: '',
  responsibilityCenter: '',
  billType: '',
  dealType: '',
  syncType: '',
  defaultUserCode: '',
  defaultCompanyCode: '',
  useBoard: false,
  boardId: '',
  pipelineId: '',
  stageId: '',
  posConf: '',
  productUrl: '',
});

export const normalizeMSDynamicConfig = (
  configKey: string,
  config: IMSDynamicConfig,
): MSMDynamicConfigRow => ({
  ...createEmptyMSDynamicConfig(),
  ...config,
  _id: configKey,
  configKey,
  brandId: config.brandId || configKey,
});

export const getMSDynamicConfigs = (configsMap: IConfigsMap) =>
  configsMap.DYNAMIC;

export const getMSDynamicErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export const getMSDynamicFieldLabel = (name: keyof TMSDynamicConfig) =>
  KEY_LABELS[name] || name;

export const toMSDynamicFormValues = (
  row: MSMDynamicConfigRow,
): TMSDynamicConfig => ({
  title: row.title,
  brandId: row.brandId,
  itemApi: row.itemApi,
  itemCategoryApi: row.itemCategoryApi,
  pricePriority: row.pricePriority,
  priceApi: row.priceApi,
  customerApi: row.customerApi,
  salesApi: row.salesApi,
  salesLineApi: row.salesLineApi,
  exchangeRateApi: row.exchangeRateApi,
  username: row.username,
  password: row.password,
  genBusPostingGroup: row.genBusPostingGroup,
  vatBusPostingGroup: row.vatBusPostingGroup,
  paymentTermsCode: row.paymentTermsCode,
  paymentMethodCode: row.paymentMethodCode,
  customerPostingGroup: row.customerPostingGroup,
  customerPricingGroup: row.customerPricingGroup,
  customerDiscGroup: row.customerDiscGroup,
  locationCode: row.locationCode,
  reminderCode: row.reminderCode,
  responsibilityCenter: row.responsibilityCenter,
  billType: row.billType,
  dealType: row.dealType,
  syncType: row.syncType,
  defaultUserCode: row.defaultUserCode,
  defaultCompanyCode: row.defaultCompanyCode,
  useBoard: row.useBoard,
  boardId: row.boardId,
  pipelineId: row.pipelineId,
  stageId: row.stageId,
  posConf: row.posConf,
  productUrl: row.productUrl,
});
