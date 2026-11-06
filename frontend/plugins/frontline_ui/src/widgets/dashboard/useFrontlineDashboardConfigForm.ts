import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { useGetPipelines } from '@/pipelines/hooks/useGetPipelines';
import { useFacebookPages } from '@/report/hooks/useFacebookReport';
import { ResponsesChartType } from '@/report/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { isDefined, MultiSelectOption } from 'erxes-ui';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { TDashboardWidgetConfig } from 'ui-modules';
import {
  DEFAULT_FRONTLINE_DASHBOARD_CONFIG,
  frontlineDashboardConfigSchema,
  TFrontlineDashboardConfig,
} from './frontlineDashboardConfig';
import {
  TFrontlineDashboardGroup,
  TFrontlineDashboardWidget,
} from './frontlineDashboardWidgets';

/** A tile's filter form, seeded from the stored config when it still parses. */
export const useFrontlineDashboardConfigForm = (
  widget: TFrontlineDashboardWidget,
  config: TDashboardWidgetConfig | null | undefined,
  onSubmit: (config: TDashboardWidgetConfig) => void,
) => {
  const parsed = frontlineDashboardConfigSchema.safeParse(config);

  const form = useForm<TFrontlineDashboardConfig>({
    resolver: zodResolver(frontlineDashboardConfigSchema),
    defaultValues: parsed.success
      ? parsed.data
      : {
          ...DEFAULT_FRONTLINE_DASHBOARD_CONFIG,
          // What the report card shows before a chart type is picked.
          visualType: widget.visualTypes ? ResponsesChartType.Line : undefined,
        },
  });

  return {
    form,
    submit: form.handleSubmit((values) => onSubmit(values)),
  };
};

const toOptions = (
  records: { _id?: string | null; name?: string | null }[] | undefined,
): MultiSelectOption[] =>
  (records ?? [])
    .map(({ _id, name }) => (_id ? { value: _id, label: name || _id } : null))
    .filter(isDefined);

/** Channels, pipelines and Facebook pages the tile can be filtered by. */
export const useFrontlineDashboardFilterOptions = (
  group: TFrontlineDashboardGroup,
  channelIds: string[] | undefined,
) => {
  const { channels, loading: channelsLoading } = useGetChannels({
    skip: group === 'facebook',
  });
  // Pipelines are listed per channel, as in the ticket report filter.
  const pipelineChannelId = channelIds?.[0];
  const { pipelines, loading: pipelinesLoading } = useGetPipelines({
    variables: {
      filter: { channelId: pipelineChannelId, applyVisibilityFilter: true },
    },
    skip: group !== 'ticket' || !pipelineChannelId,
  });
  const { facebookPages, loading: pagesLoading } = useFacebookPages({
    skip: group !== 'facebook',
  });

  return useMemo(
    () => ({
      channelOptions: toOptions(channels),
      pipelineOptions: toOptions(pipelines),
      pageOptions: toOptions(facebookPages),
      channelsLoading,
      pipelinesLoading,
      pagesLoading,
      hasPipelineChannel: Boolean(pipelineChannelId),
    }),
    [
      channels,
      pipelines,
      facebookPages,
      channelsLoading,
      pipelinesLoading,
      pagesLoading,
      pipelineChannelId,
    ],
  );
};
