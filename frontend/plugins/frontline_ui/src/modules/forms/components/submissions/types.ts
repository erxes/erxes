import type {
  FrontlineFormSubmissionDetailQuery,
  FrontlineFormSubmissionsQuery,
} from '~/gql/graphql';

export type IFormSubmission = NonNullable<
  NonNullable<
    NonNullable<FrontlineFormSubmissionsQuery['formSubmissions']>['list']
  >[number]
>;

export type IFormSubmissionDetail = NonNullable<
  FrontlineFormSubmissionDetailQuery['formSubmissionDetail']
>;

export type ISubmissionItem = NonNullable<
  NonNullable<IFormSubmissionDetail['submissions']>[number]
>;
