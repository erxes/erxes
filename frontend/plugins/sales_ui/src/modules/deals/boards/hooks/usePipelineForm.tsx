import { PIPELINE_CREATE_SCHEMA } from '@/deals/schemas/pipelineFormSchema';
import { TPipelineForm } from '@/deals/types/pipelines';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export const usePipelineForm = () => {
  const methods = useForm<TPipelineForm>({
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      boardId: '',
      tagId: '',
      departmentIds: [],
      branchIds: [],
      memberIds: [],
      stages: [],
    },
    resolver: zodResolver(PIPELINE_CREATE_SCHEMA),
  });

  return {
    methods,
  };
};
