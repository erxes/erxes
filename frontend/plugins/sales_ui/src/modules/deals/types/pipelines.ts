import { MutationHookOptions, OperationVariables } from "@apollo/client";

import { IUser } from "ui-modules";
import { PIPELINE_CREATE_SCHEMA } from "../schemas/pipelineFormSchema";
import { z } from "zod";

export interface IPipeline {
    _id: string;
    name: string;
    boardId: string;
    tagId?: string;
    visibility: string;
    status: string;
    createdAt: Date;
    createdUser: IUser;
    members?: IUser[];
    departmentIds?: string[];
    branchIds?: string[];
    memberIds?: string[];
    condition?: string;
    label?: string;
    bgColor?: string;
    isWatched: boolean;
    startDate?: Date;
    endDate?: Date;
    metric?: string;
    hackScoringType?: string;
    templateId?: string;
    state?: string;
    itemsTotalCount?: number;
    isCheckDate?: boolean;
    isCheckUser?: boolean;
    isCheckDepartment?: boolean;
    excludeCheckUserIds?: string[];
    numberConfig?: string;
    numberSize?: string;
    nameConfig?: string;
    initialCategoryIds: string[];
    excludeCategoryIds: string[];
    excludeProductIds: string[];
  
    paymentIds?: string[];
    paymentTypes?: any[];
    erxesAppToken?: string;
  }

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
    options?: (newSelectedLabelIds: string[]) => MutationHookOptions<
      {
        LabelsMain: {
          totalCount: number;
          list: IPipelineLabel[];
        };
      },
      OperationVariables
    >;
  };

  export interface IPipelineLabel {
    _id?: string;
    name: string;
    colorCode: string;
    pipelineId?: string;
    createdBy?: string;
    createdAt?: Date;
  }
  
  export interface IPipelineLabelVariables {
    name: string;
    colorCode: string;
    pipelineId: string;
  }
  
  export enum PipelineHotKeyScope {
    PipelineSettingsPage = 'pipeline-settings-page',
    PipelineAddSheet = 'pipeline-add-sheet',
  }

  export type TPipelineForm = z.infer<typeof PIPELINE_CREATE_SCHEMA>;
