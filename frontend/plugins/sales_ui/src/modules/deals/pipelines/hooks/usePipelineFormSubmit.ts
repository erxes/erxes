import type { FormEvent } from 'react';
import { useCallback } from 'react';
import type {
  FieldErrors,
  SubmitErrorHandler,
  SubmitHandler,
  UseFormReturn,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useConfirm, useQueryState, useToast } from 'erxes-ui';

import {
  usePipelineAdd,
  usePipelineEdit,
} from '@/deals/boards/hooks/usePipelines';
import type { TPipelineForm } from '@/deals/types/pipelines';

const PIPELINE_FIELD_TABS: Record<string, string> = {
  stages: 'stages',
  initialCategoryIds: 'productConfig',
  excludeCategoryIds: 'productConfig',
  excludeProductIds: 'productConfig',
  paymentIds: 'productConfig',
  paymentTypes: 'productConfig',
};

const findErrorMessage = (error: unknown): string | undefined => {
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  if ('message' in error && typeof error.message === 'string') {
    return error.message;
  }

  for (const [key, nestedError] of Object.entries(error)) {
    if (key === 'ref' || key === 'type' || key === 'types') {
      continue;
    }

    const message = findErrorMessage(nestedError);

    if (message) {
      return message;
    }
  }

  return undefined;
};

const findFirstFormError = (errors: FieldErrors<TPipelineForm>) => {
  for (const [fieldName, error] of Object.entries(errors)) {
    const message = findErrorMessage(error);

    if (message) {
      return { fieldName, message };
    }
  }

  return undefined;
};

const removeEmptyPaymentTypes = (paymentTypes: TPipelineForm['paymentTypes']) =>
  (paymentTypes || []).filter((paymentType) =>
    [
      paymentType.type,
      paymentType.title,
      paymentType.icon,
      paymentType.config,
      paymentType.scoreCampaignId,
    ].some((value) => value?.trim()),
  );

type UsePipelineFormSubmitProps = {
  methods: UseFormReturn<TPipelineForm>;
  onCompleted: () => void;
  pipelineId: string | null;
};

export const usePipelineFormSubmit = ({
  methods,
  onCompleted,
  pipelineId,
}: UsePipelineFormSubmitProps) => {
  const { t } = useTranslation('sales');
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [, setActiveTab] = useQueryState<string>('tab');
  const { addPipeline, loading: addLoading } = usePipelineAdd();
  const { pipelineEdit, loading: editLoading } = usePipelineEdit();

  const submitHandler: SubmitHandler<TPipelineForm> = useCallback(
    (data) => {
      const managePipeline = pipelineId ? pipelineEdit : addPipeline;
      const successTitle = pipelineId
        ? t('pipeline-updated')
        : t('pipeline-added');

      const { paymentTypes, paymentIds, ...rest } = data;
      const variables = {
        ...(pipelineId && { _id: pipelineId }),
        ...rest,
        paymentTypes: paymentTypes || [],
        paymentIds: paymentIds || [],
      };

      void confirm({
        message: t('are-you-absolutely-sure-to-continue'),
      }).then(() => {
        managePipeline({
          variables,
          onCompleted: () => {
            toast({ title: successTitle });
            onCompleted();
          },
        });
      });
    },
    [addPipeline, confirm, onCompleted, pipelineEdit, pipelineId, t, toast],
  );

  const onInvalid: SubmitErrorHandler<TPipelineForm> = useCallback(
    (errors) => {
      const firstError = findFirstFormError(errors);

      setActiveTab(
        firstError
          ? PIPELINE_FIELD_TABS[firstError.fieldName] || 'general'
          : 'general',
      );
      toast({
        title: firstError?.message || t('error'),
        variant: 'destructive',
      });
    },
    [setActiveTab, t, toast],
  );

  const handleFormSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      const paymentTypes = methods.getValues('paymentTypes');
      const populatedPaymentTypes = removeEmptyPaymentTypes(paymentTypes);

      if (populatedPaymentTypes.length !== (paymentTypes || []).length) {
        methods.setValue('paymentTypes', populatedPaymentTypes, {
          shouldDirty: true,
        });
      }

      void methods.handleSubmit(submitHandler, onInvalid)(event);
    },
    [methods, onInvalid, submitHandler],
  );

  return {
    handleFormSubmit,
    loading: addLoading || editLoading,
  };
};
