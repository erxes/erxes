import { useForm } from 'react-hook-form';
import { TPipelineConfig } from '../../../types';
import { zodResolver } from '@hookform/resolvers/zod';
import { PIPELINE_CONFIG_SCHEMA } from '../schema';
import { useParams } from 'react-router-dom';

export const usePipelineConfigForm = () => {
  const { id } = useParams<{ id: string }>();
  const { pipelineId } = useParams<{ pipelineId: string }>();
  const methods = useForm<TPipelineConfig>({
    mode: 'onBlur',
    defaultValues: {
      name: '',
      channelId: id,
      pipelineId,
      selectedStatusId: undefined,
      ticketBasicFields: {
        isShowAttachment: false,
        isShowDescription: false,
        isShowName: false,
        isShowTags: false,
      },
      contactType: undefined,
    },
    resolver: zodResolver(PIPELINE_CONFIG_SCHEMA),
  });

  return {
    methods,
  };
};
