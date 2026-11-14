import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';
import { useUpdatePipeline } from '@/pipelines/hooks/useUpdatePipeline';
import {
  pipelineSlaFormSchema,
  SLA_FORM_PRIORITIES,
  TPipelineSlaForm,
} from '@/pipelines/states/pipelineSlaForm';

type TSlaPolicy = {
  enabled?: boolean | null;
  warnBeforeMinutes?: number | null;
  rules?: Array<{
    priority: number;
    firstResponseMinutes?: number | null;
    resolutionMinutes?: number | null;
  } | null> | null;
} | null;

const toHours = (minutes?: number | null) =>
  minutes ? String(Math.round((minutes / 60) * 100) / 100) : '';

const toMinutes = (hours?: string) => {
  const value = Number(hours);

  return hours && Number.isFinite(value) && value > 0
    ? Math.round(value * 60)
    : undefined;
};

const toForm = (policy?: TSlaPolicy): TPipelineSlaForm => ({
  enabled: !!policy?.enabled,
  warnBeforeHours: toHours(policy?.warnBeforeMinutes),
  rules: SLA_FORM_PRIORITIES.map((priority) => {
    const rule = (policy?.rules || []).find((item) => item?.priority === priority);

    return {
      priority,
      firstResponseHours: toHours(rule?.firstResponseMinutes),
      resolutionHours: toHours(rule?.resolutionMinutes),
    };
  }),
});

/** The SLA policy form of one pipeline; saving writes the whole policy. */
export const usePipelineSlaForm = (pipelineId?: string) => {
  const { pipeline, loading } = useGetPipeline(pipelineId);
  const { updatePipeline, loading: saving } = useUpdatePipeline();
  const slaPolicy = pipeline?.slaPolicy;

  const form = useForm<TPipelineSlaForm>({
    resolver: zodResolver(pipelineSlaFormSchema),
    defaultValues: toForm(slaPolicy),
  });

  useEffect(() => {
    form.reset(toForm(slaPolicy));
  }, [form, slaPolicy]);

  const save = form.handleSubmit((values) => {
    if (!pipelineId) {
      return;
    }

    updatePipeline({
      variables: {
        _id: pipelineId,
        slaPolicy: {
          enabled: values.enabled,
          warnBeforeMinutes: toMinutes(values.warnBeforeHours),
          rules: values.rules
            .map((rule) => ({
              priority: rule.priority,
              firstResponseMinutes: toMinutes(rule.firstResponseHours),
              resolutionMinutes: toMinutes(rule.resolutionHours),
            }))
            .filter(
              (rule) => rule.firstResponseMinutes || rule.resolutionMinutes,
            ),
        },
      },
      onCompleted: () => form.reset(values),
    });
  });

  return { form, loading, saving, save };
};
