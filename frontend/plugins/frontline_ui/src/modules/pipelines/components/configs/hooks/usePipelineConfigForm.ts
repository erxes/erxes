import { useForm } from 'react-hook-form';
import { TPipelineConfig } from '../../../types';
import { zodResolver } from '@hookform/resolvers/zod';
import { PIPELINE_CONFIG_SCHEMA } from '../schema';
import { useSettingsParams } from '@/settings/contexts/SettingsPanelContext';

// `scope` lets hosts outside the pipeline pages (e.g. the messenger setup)
// name the channel and pipeline instead of reading them from the route.
export const usePipelineConfigForm = (scope?: {
  channelId?: string;
  pipelineId?: string;
}) => {
  const params = useSettingsParams();
  const id = scope?.channelId ?? params.id;
  const pipelineId = scope?.pipelineId ?? params.pipelineId;
  const methods = useForm<TPipelineConfig>({
    mode: 'onBlur',
    defaultValues: {
      name: '',
      channelId: id,
      pipelineId,
      selectedStatusId: undefined,
      propertyFields: [],
    },
    resolver: zodResolver(PIPELINE_CONFIG_SCHEMA),
  });

  return {
    methods,
  };
};
