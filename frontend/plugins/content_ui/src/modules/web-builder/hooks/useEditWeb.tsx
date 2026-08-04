import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { EDIT_WEB } from '../graphql/mutations/editWeb';
import { GET_WEB_LIST } from '../graphql/queries/getWebList';

export const useEditWeb = () => {
  const { t } = useTranslation('content');
  const [editWebMutation, { loading }] = useMutation(EDIT_WEB, {
    refetchQueries: [{ query: GET_WEB_LIST }],
    onCompleted: () => {
      toast({ title: t('success'), description: t('web-project-updated') });
    },
    onError: (e) => {
      toast({ title: t('error'), description: e.message, variant: 'destructive' });
    },
  });

  return { editWeb: editWebMutation, loading };
};
