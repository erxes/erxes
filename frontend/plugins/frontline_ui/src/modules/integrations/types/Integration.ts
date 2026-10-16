import type {
  IntegrationDetailQuery,
  IntegrationsGetUsedTypesByChannelQuery,
  IntegrationsGetUsedTypesQuery,
  IntegrationsQuery,
} from '~/gql/graphql';

export type IIntegration = NonNullable<
  NonNullable<NonNullable<IntegrationsQuery['integrations']>['list']>[number]
>;

export type IIntegrationDetail = NonNullable<
  IntegrationDetailQuery['integrationDetail']
>;

export type IIntegrationType = NonNullable<
  NonNullable<IntegrationsGetUsedTypesQuery['integrationsGetUsedTypes']>[number]
>;

export type IIntegrationTypeByChannel = NonNullable<
  NonNullable<
    IntegrationsGetUsedTypesByChannelQuery['integrationsGetUsedTypesByChannel']
  >[number]
>;
