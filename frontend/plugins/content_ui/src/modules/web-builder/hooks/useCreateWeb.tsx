import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CREATE_WEB } from '../graphql/mutations/createWeb';
import { GET_WEB_LIST } from '../graphql/queries/getWebList';

export const useCreateWeb = () => {
  const { t } = useTranslation('content');
  const [createWebMutation, { loading }] = useMutation(CREATE_WEB, {
    refetchQueries: [{ query: GET_WEB_LIST }],
    onCompleted: () => {
      toast({ title: t('success'), description: t('web-project-created') });
    },
    onError: (e) => {
      toast({ title: t('error'), description: e.message, variant: 'destructive' });
    },
  });

  return { createWeb: createWebMutation, loading };
};
