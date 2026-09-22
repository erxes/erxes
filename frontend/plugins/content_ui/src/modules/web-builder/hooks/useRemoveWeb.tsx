import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { REMOVE_WEB } from '../graphql/mutations/removeWeb';
import { GET_WEB_LIST } from '../graphql/queries/getWebList';

export const useRemoveWeb = () => {
  const { t } = useTranslation('content');
  const [removeWebMutation, { loading }] = useMutation(REMOVE_WEB, {
    refetchQueries: [{ query: GET_WEB_LIST }],
    onCompleted: () => {
      toast({ title: t('success'), description: t('web-project-removed') });
    },
    onError: (e) => {
      toast({ title: t('error'), description: e.message, variant: 'destructive' });
    },
  });

  const removeWeb = (id: string) => removeWebMutation({ variables: { id } });

  return { removeWeb, loading };
};
