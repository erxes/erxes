import { PIPELINE_CREATE_SCHEMA } from '@/deals/schemas/pipelineFormSchema';
import { TPipelineForm } from '@/deals/types/pipelines';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export const usePipelineForm = () => {
  const methods = useForm<TPipelineForm>({
    mode: 'onBlur',
    defaultValues: {
      title: '',
    },
    resolver: zodResolver(PIPELINE_CREATE_SCHEMA),
  });
  return {
    methods,
  };
};
