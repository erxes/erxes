import type { PmsBranchDetailQuery, PmsBranchListQuery } from '~/gql/graphql';

export interface IPmsPaymentType {
  _id: string;
  type: string;
  title: string;
  icon?: string;
  config?: string;
}

export interface IPmsUiOptions {
  logo?: string;
  website?: string;
  colors?: { primary?: string; secondary?: string; third?: string };
}
export interface IPmsPipelineConfig {
  boardId: string;
  pipelineId: string;
  stageId: string;
}

export type IPmsBranch = NonNullable<
  NonNullable<PmsBranchListQuery['pmsBranchList']>[number]
>;

export type IPmsBranchDetail = NonNullable<
  PmsBranchDetailQuery['pmsBranchDetail']
>;
