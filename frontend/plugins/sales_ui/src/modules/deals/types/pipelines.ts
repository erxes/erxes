import type {
  SalesPipelineDetailQuery,
  SalesPipelineLabelsQuery,
  SalesPipelinesQuery,
} from '~/gql/graphql';

import type { z } from 'zod';
import { createPipelineFormSchema } from '../schemas/pipelineFormSchema';

export type IPipeline = NonNullable<
  NonNullable<
    NonNullable<SalesPipelinesQuery['salesPipelines']>['list']
  >[number]
>;
export type IPipelineDetail = NonNullable<
  SalesPipelineDetailQuery['salesPipelineDetail']
>;

export interface ISelectLabelContext {
  selectedLabels: IPipelineLabel[];
  setSelectedLabels: (labels: IPipelineLabel[]) => void;
  value?: string[] | string;
  onSelect: (label: IPipelineLabel) => void;
  newLabelName: string;
  setNewLabelName: (labelName: string) => void;
  mode: 'single' | 'multiple';
  labelIds?: string[];
}

export type ISelectLabelProviderProps = {
  targetIds?: string[];
  value?: string[] | string;
  onValueChange?: (labels?: (string | undefined)[] | string) => void;
  mode?: 'single' | 'multiple';
  labelIds?: string[];
  children?: React.ReactNode;
};

export type IPipelineLabel = NonNullable<
  NonNullable<SalesPipelineLabelsQuery['salesPipelineLabels']>[number]
>;

export enum PipelineHotKeyScope {
  PipelineSettingsPage = 'pipeline-settings-page',
  PipelineAddSheet = 'pipeline-add-sheet',
}

export type TPipelineForm = z.infer<
  ReturnType<typeof createPipelineFormSchema>
>;

export interface ISelectPipelinesContext {
  pipelineIds: string[];
  pipelines: IPipeline[];
  setPipelines: (pipelines: IPipeline[]) => void;
  onSelect: (pipeline: IPipeline) => void;
  loading: boolean;
  error: string | null;
  boardId?: string;
}
