import { useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import type { IPipeline, TPipelineForm } from '@/deals/types/pipelines';
import type { IStage } from '@/deals/types/stages';

const formatPaymentConfig = (config: unknown): string => {
  if (!config) {
    return '';
  }

  return typeof config === 'string' ? config : JSON.stringify(config) || '';
};

const mapPipelineStages = (
  stages: IStage[],
): NonNullable<TPipelineForm['stages']> =>
  stages.map((stage) => ({
    _id: stage._id || '',
    code: stage.code || '',
    name: stage.name || '',
    type: stage.type || '',
    visibility: stage.visibility || 'public',
    status: stage.status || 'active',
    age: stage.age || 0,
    canMoveMemberIds: stage.canMoveMemberIds ?? [],
    canEditMemberIds: stage.canEditMemberIds ?? [],
    probability: stage.probability || '',
    memberIds: stage.memberIds ?? [],
    departmentIds: stage.departmentIds ?? [],
  }));

const getPipelineFormValues = (
  pipelineDetail: IPipeline | undefined,
  boardId: string | null,
  stages: TPipelineForm['stages'],
): TPipelineForm => {
  if (!pipelineDetail) {
    return {
      name: '',
      visibility: 'public',
      boardId: boardId || '',
      tagId: '',
      departmentIds: [],
      branchIds: [],
      memberIds: [],
      stages: [],
      numberConfig: '',
      numberSize: '',
      nameConfig: '',
      isCheckDate: false,
      isCheckUser: false,
      isCheckDepartment: false,
      initialCategoryIds: [],
      excludeCategoryIds: [],
      excludeProductIds: [],
      excludeCheckUserIds: [],
      paymentIds: [],
      paymentTypes: [],
    };
  }

  return {
    name: pipelineDetail.name || '',
    visibility: pipelineDetail.visibility || 'public',
    boardId: pipelineDetail.boardId || boardId || '',
    tagId: pipelineDetail.tagId || '',
    departmentIds: pipelineDetail.departmentIds || [],
    branchIds: pipelineDetail.branchIds || [],
    memberIds: pipelineDetail.memberIds || [],
    stages: stages || [],
    numberConfig: pipelineDetail.numberConfig || '',
    numberSize: pipelineDetail.numberSize || '',
    nameConfig: pipelineDetail.nameConfig || '',
    isCheckDate: pipelineDetail.isCheckDate || false,
    isCheckUser: pipelineDetail.isCheckUser || false,
    isCheckDepartment: pipelineDetail.isCheckDepartment || false,
    initialCategoryIds: pipelineDetail.initialCategoryIds || [],
    excludeCategoryIds: pipelineDetail.excludeCategoryIds || [],
    excludeProductIds: pipelineDetail.excludeProductIds || [],
    excludeCheckUserIds: pipelineDetail.excludeCheckUserIds || [],
    paymentIds: pipelineDetail.paymentIds || [],
    paymentTypes: (pipelineDetail.paymentTypes || []).map((paymentType) => ({
      ...paymentType,
      config: formatPaymentConfig(paymentType.config),
    })),
  };
};

type UsePipelineFormSyncProps = {
  boardId: string | null;
  initialStages: IStage[];
  methods: UseFormReturn<TPipelineForm>;
  pipelineDetail?: IPipeline;
  pipelineId: string | null;
};

export const usePipelineFormSync = ({
  boardId,
  initialStages,
  methods,
  pipelineDetail,
  pipelineId,
}: UsePipelineFormSyncProps) => {
  const { getValues, reset, setValue } = methods;

  useEffect(() => {
    if (initialStages.length) {
      setValue('stages', mapPipelineStages(initialStages), {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [initialStages, setValue]);

  useEffect(() => {
    reset(
      getPipelineFormValues(
        pipelineId ? pipelineDetail : undefined,
        boardId,
        getValues('stages') || [],
      ),
    );
  }, [boardId, getValues, pipelineDetail, pipelineId, reset]);
};
