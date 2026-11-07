import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { TDashboardWidgetConfig } from 'ui-modules';
import {
  SALES_LOYALTY_WIDGET_DEFAULT_CONFIG,
  salesLoyaltyWidgetConfigSchema,
  TSalesLoyaltyWidgetConfig,
} from '../salesDashboardConfig';

const asList = (value: string[] | string) =>
  Array.isArray(value) ? value : value ? [value] : [];

/** The settings form, seeded from the stored config while it still parses. */
export const useSalesLoyaltyConfigForm = (
  config: TDashboardWidgetConfig | null | undefined,
  onSubmit: (config: TDashboardWidgetConfig) => void,
) => {
  const parsed = salesLoyaltyWidgetConfigSchema.safeParse(config);
  const form = useForm<TSalesLoyaltyWidgetConfig>({
    resolver: zodResolver(salesLoyaltyWidgetConfigSchema),
    defaultValues: parsed.success
      ? parsed.data
      : SALES_LOYALTY_WIDGET_DEFAULT_CONFIG,
  });

  // Another board's pipelines no longer apply.
  const changeBoard = (value: string[] | string) => {
    form.setValue('boardId', asList(value)[0] || undefined);
    form.setValue('pipelineIds', []);
  };

  const changePipelines = (value: string[] | string) =>
    form.setValue('pipelineIds', asList(value), { shouldValidate: true });

  return {
    form,
    boardId: form.watch('boardId'),
    changeBoard,
    changePipelines,
    clearBoard: () => changeBoard([]),
    submit: form.handleSubmit((values) => onSubmit(values)),
  };
};
