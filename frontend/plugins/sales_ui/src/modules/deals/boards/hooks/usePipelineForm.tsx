import { createPipelineFormSchema } from '@/deals/schemas/pipelineFormSchema';
import type { TPipelineForm } from '@/deals/types/pipelines';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';

export const usePipelineForm = () => {
  const { t } = useTranslation('sales');
  const schema = useMemo(
    () =>
      createPipelineFormSchema({
        boardRequired: t('pipeline-board-required'),
        duplicatePaymentType: t('pipeline-payment-type-duplicate'),
        invalidPipelineVisibility: t('pipeline-visibility-invalid'),
        invalidStageProbability: t('pipeline-stage-probability-invalid'),
        invalidStageStatus: t('pipeline-stage-status-invalid'),
        invalidStageVisibility: t('pipeline-stage-visibility-invalid'),
        numberConfigRequired: t('pipeline-number-config-required'),
        numberSizeRequired: t('pipeline-number-size-required'),
        paymentIconRequired: t('pipeline-payment-icon-required'),
        paymentTitleRequired: t('pipeline-payment-title-required'),
        paymentTypeInvalid: t('pipeline-payment-type-invalid'),
        paymentTypeRequired: t('pipeline-payment-type-required'),
        pipelineNameRequired: t('pipeline-name-required'),
        stageNameRequired: t('pipeline-stage-name-required'),
      }),
    [t],
  );

  const methods = useForm<TPipelineForm>({
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      visibility: 'public',
      boardId: '',
      tagId: '',
      departmentIds: [],
      branchIds: [],
      memberIds: [],
      initialCategoryIds: [],
      excludeCategoryIds: [],
      excludeProductIds: [],
      excludeCheckUserIds: [],
      paymentIds: [],
      paymentTypes: [],
      stages: [],
    },
    resolver: zodResolver(schema),
  });

  return {
    methods,
  };
};
