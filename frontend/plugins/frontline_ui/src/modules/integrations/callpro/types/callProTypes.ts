import type {
  CallProConfigQuery,
  CallProCustomersByPhoneQuery,
  CallProIntegrationDetailQuery,
} from '~/gql/graphql';

export type ICallProConfig = NonNullable<CallProConfigQuery['callProConfig']>;

export type ICallProIntegrationDetail = NonNullable<
  CallProIntegrationDetailQuery['callProIntegrationDetail']
>;

export type ICallProCustomerByPhone = NonNullable<
  NonNullable<CallProCustomersByPhoneQuery['callProCustomersByPhone']>[number]
>;
