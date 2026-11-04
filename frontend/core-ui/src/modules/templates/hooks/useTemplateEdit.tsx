import { TEMPLATE_EDIT } from '@/templates/graphql/mutations';
import { QUERY_TEMPLATES } from '@/templates/graphql/queries';
import { TemplateDetail } from '@/templates/hooks/useTemplateDetail';
import { MutationHookOptions, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export interface ITemplateEdit {
  _id: string;
  name: string;
  description?: string;
  categoryIds: string[];
}

export interface ITemplateEditResponse {
  templateEdit: TemplateDetail;
}

export const useTemplateEdit = () => {
  const { t } = useTranslation('templates', { keyPrefix: 'template' });
  const [mutate, { loading }] = useMutation<
    ITemplateEditResponse,
    ITemplateEdit
  >(TEMPLATE_EDIT, {
    refetchQueries: [QUERY_TEMPLATES],
  });

  const templateEdit = ({
    variables,
    onError,
    onCompleted,
    ...options
  }: MutationHookOptions<ITemplateEditResponse, ITemplateEdit>) => {
    return mutate({
      ...options,
      variables,
      onCompleted: (data) => {
        if (onCompleted) {
          onCompleted(data);
        }
        toast({
          title: t('success'),
          description: t('update-success'),
          variant: 'default',
        });
      },
      onError: (error) => {
        if (onError) {
          onError(error);
        }
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { templateEdit, loading };
};
