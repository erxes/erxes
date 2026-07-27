import { USE_TEMPLATE } from '@/templates/graphql/mutations';
import { QUERY_TEMPLATES } from '@/templates/graphql/queries';
import { MutationHookOptions, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

export const useTemplateAction = () => {
  const { t } = useTranslation('templates');
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
        title: t('messages.use-failed', 'Template use failed'),
        variant: 'destructive',
      });

      return;
    }

    return navigate(result.data.templateUse);
  };

  return { useTemplate, loading };
};
