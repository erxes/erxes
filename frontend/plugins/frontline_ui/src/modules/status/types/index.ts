import type {
  GetAccessibleTicketStatusesQuery,
  GetTicketStatusesByTypeQuery,
  GetTicketStatusesChoicesPipelineQuery,
  GetTicketStatusQuery,
} from '~/gql/graphql';

export type ITicketStatus = NonNullable<
  NonNullable<GetTicketStatusesByTypeQuery['getTicketStatusesByType']>[number]
>;

export type ITicketStatusDetail = NonNullable<
  GetTicketStatusQuery['getTicketStatus']
>;

export type ITicketStatusChoice =
  GetAccessibleTicketStatusesQuery['getAccessibleTicketStatuses'][number];

export type ITicketStatusPermissionChoice =
  GetTicketStatusesChoicesPipelineQuery['getTicketStatusesChoicesPipeline'][number];
