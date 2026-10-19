import type { SalesDealStagesQuery } from '~/gql/graphql';
export type IStage = NonNullable<
  NonNullable<SalesDealStagesQuery['salesStages']>[number]
>;

export interface ISelectStagesContext {
  stageIds: string[];
  stages: IStage[];
  setStages: (stages: IStage[]) => void;
  onSelect: (stage: IStage) => void;
  loading: boolean;
  error: string | null;
  pipelineId?: string;
}
