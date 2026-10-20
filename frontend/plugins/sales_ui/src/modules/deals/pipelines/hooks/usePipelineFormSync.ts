import { paymentTypesSchema } from '@/deals/utils/dealJson';
import { isDefined } from 'erxes-ui';
import { useEffect, useMemo } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import type { IPipelineDetail, TPipelineForm } from '@/deals/types/pipelines';
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
    canMoveMemberIds: stage.canMoveMemberIds?.filter(isDefined) ?? [],
    canEditMemberIds: stage.canEditMemberIds?.filter(isDefined) ?? [],
    probability: stage.probability || '',
    memberIds: stage.memberIds?.filter(isDefined) ?? [],
    departmentIds: stage.departmentIds?.filter(isDefined) ?? [],
    defaultTick: stage.defaultTick ?? true,
    // Left unset, the stage's probability decides.
  }));

const getPipelineFormValues = (
  pipelineDetail: IPipelineDetail | null | undefined,
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
      propertyIds: [],
    };
  }

  return {
    name: pipelineDetail.name || '',
    visibility: pipelineDetail.visibility || 'public',
    boardId: pipelineDetail.boardId || boardId || '',
    tagId: pipelineDetail.tagId || '',
    departmentIds: pipelineDetail.departmentIds?.filter(isDefined) || [],
    branchIds: pipelineDetail.branchIds?.filter(isDefined) || [],
    memberIds: pipelineDetail.memberIds?.filter(isDefined) || [],
    stages: stages || [],
    numberConfig: pipelineDetail.numberConfig || '',
    numberSize:
      pipelineDetail.numberSize == null
        ? ''
        : String(pipelineDetail.numberSize),
    nameConfig: pipelineDetail.nameConfig || '',
    isCheckDate: pipelineDetail.isCheckDate || false,
    isCheckUser: pipelineDetail.isCheckUser || false,
    isCheckDepartment: pipelineDetail.isCheckDepartment || false,
    initialCategoryIds:
      pipelineDetail.initialCategoryIds?.filter(isDefined) || [],
    excludeCategoryIds:
      pipelineDetail.excludeCategoryIds?.filter(isDefined) || [],
    excludeProductIds:
      pipelineDetail.excludeProductIds?.filter(isDefined) || [],
    excludeCheckUserIds:
      pipelineDetail.excludeCheckUserIds?.filter(isDefined) || [],
    paymentIds: pipelineDetail.paymentIds?.filter(isDefined) || [],
    paymentTypes: paymentTypesSchema
      .parse(pipelineDetail.paymentTypes ?? [])
      .map((paymentType) => ({
        ...paymentType,
        config: formatPaymentConfig(paymentType.config),
      })),
    propertyIds: pipelineDetail.propertyIds?.filter(isDefined) || [],
  };
};

type UsePipelineFormSyncProps = {
  boardId: string | null;
  initialStages: IStage[];
  methods: UseFormReturn<TPipelineForm>;
  pipelineDetail?: IPipelineDetail | null;
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
  const paymentTypes = useMemo(
    () =>
      paymentTypesSchema.safeParse(
        pipelineId ? pipelineDetail?.paymentTypes ?? [] : [],
      ),
    [pipelineId, pipelineDetail?.paymentTypes],
  );

  useEffect(() => {
    if (initialStages.length) {
      setValue('stages', mapPipelineStages(initialStages), {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [initialStages, setValue]);

  useEffect(() => {
    if (!paymentTypes.success) return;
    reset(
      getPipelineFormValues(
        pipelineId ? pipelineDetail : undefined,
        boardId,
        getValues('stages') || [],
      ),
    );
  }, [boardId, getValues, pipelineDetail, pipelineId, reset, paymentTypes]);
  return paymentTypes.success ? undefined : paymentTypes.error;
};
