import {
  ApolloError,
  MutationFunctionOptions,
  useMutation,
} from '@apollo/client';
import { UPDATE_RESPONSE } from '@/responseTemplate/graphql/mutations/updateResponse';
import { useToast } from 'erxes-ui';
import { GET_RESPONSES } from '../graphql/queries/getResponses';
import { useTranslation } from 'react-i18next';
export const useUpdateResponse = () => {
  const { t } = useTranslation('frontline');
  const { toast } = useToast();
  const [_updateResponse, { loading }] = useMutation(UPDATE_RESPONSE);
  const updateResponse = (options: MutationFunctionOptions) => {
    return _updateResponse({
      ...options,
      onCompleted: (data) => {
        toast({
          title: t('response-updated-successfully'),
          variant: 'default',
        });
        options.onCompleted?.(data);
      },
      onError: (error: ApolloError) => {
        toast({
          title: t('error'),
          variant: 'destructive',
          description: error.message,
        });
        options.onError?.(error);
      },
      refetchQueries: [{ query: GET_RESPONSES }],
    });
  };
  return { updateResponse, loading };
};
