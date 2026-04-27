import { USE_TEMPLATE } from '@/templates/graphql/mutations';
import { QUERY_TEMPLATES } from '@/templates/graphql/queries';
import { MutationHookOptions, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useNavigate } from 'react-router';

export const useTemplateAction = () => {
  const navigate = useNavigate();

  const [_useTemplate, { loading }] = useMutation(USE_TEMPLATE, {
    refetchQueries: [QUERY_TEMPLATES],
  });

  const useTemplate = async (
    templateId: string,
    options?: MutationHookOptions,
  ) => {
    const result = await _useTemplate({
      ...options,
      variables: { ...options?.variables, id: templateId },
    });

    if (!result.data?.templateUse) {
      toast({
        title: 'Template use failed',
        variant: 'destructive',
      });

      return;
    }

    return navigate(result.data.templateUse);
  };

  return { useTemplate, loading };
};
