import type { MongolianMnConfigsQuery } from '~/gql/graphql';

export type IMSDynamicConfig = {
  title: string;
  brandId: string;
  itemApi: string;
  itemCategoryApi: string;
  pricePriority: string;
  priceApi: string;
  customerApi: string;
  salesApi: string;
  salesLineApi: string;
  exchangeRateApi: string;
  username: string;
  password: string;
  genBusPostingGroup: string;
  vatBusPostingGroup: string;
  paymentTermsCode: string;
  paymentMethodCode: string;
  customerPostingGroup: string;
  customerPricingGroup: string;
  customerDiscGroup: string;
  locationCode: string;
  reminderCode: string;
  responsibilityCenter: string;
  billType: string;
  dealType: string;
  syncType: string;
  defaultUserCode: string;
  defaultCompanyCode: string;
  useBoard: boolean;
  boardId: string;
  pipelineId: string;
  stageId: string;
  custCode: {
    fieldId: string;
    groupId: string;
  };
  userLocationCode: {
    fieldId: string;
    groupId: string;
  };
};

export type IMSDynamicConfigMap = Record<string, IMSDynamicConfig>;

export type IConfigsMap = {
  DYNAMIC: IMSDynamicConfigMap;
};

export type IMnConfig = NonNullable<
  NonNullable<MongolianMnConfigsQuery['mnConfigs']>[number]
>;
