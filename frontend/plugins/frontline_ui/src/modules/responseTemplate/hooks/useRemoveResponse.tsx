import { useMutation } from '@apollo/client';
import { REMOVE_RESPONSE } from '../graphql/mutations/deleteResponse';
import { toast } from 'erxes-ui';
import { GET_RESPONSES } from '../graphql/queries/getResponses';
import { useTranslation } from 'react-i18next';

export const useRemoveResponse = () => {
  const { t } = useTranslation('frontline');
  const [removeResponse, { loading, error }] = useMutation(REMOVE_RESPONSE, {
    onCompleted: () => {
      toast({ title: t('response-removed-successfully') });
    },
    refetchQueries: [{ query: GET_RESPONSES }],
  });
  return { removeResponse, loading, error };
};
