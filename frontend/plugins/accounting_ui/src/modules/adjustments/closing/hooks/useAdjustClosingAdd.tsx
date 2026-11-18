import type { ApolloError } from '@apollo/client';
import type { GraphqlMutationOptions } from '@/utils/graphqlMutation';
import { useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { ADJUST_CLOSING_ADD } from '../graphql/adjustClosingAdd';
import { toast } from 'erxes-ui';
import { ADJUST_CLOSING_QUERY } from '../graphql/adjustClosingQueries';

export const useAdjustClosingAdd = (
  options?: GraphqlMutationOptions<typeof ADJUST_CLOSING_ADD>,
) => {
  const { t } = useTranslation('accounting');
  const navigate = useNavigate();

  const [_addAdjustClosing, { loading }] = useMutation(
    ADJUST_CLOSING_ADD,
    options,
  );

  const addAdjustClosing = (
    mutationOptions?: GraphqlMutationOptions<typeof ADJUST_CLOSING_ADD>,
  ) => {
    return _addAdjustClosing({
      ...mutationOptions,
      onError: (error: ApolloError) => {
        toast({
          title: t('error'),
          description: t(error.message, { nsSeparator: false }),
          variant: 'destructive',
        });
        mutationOptions?.onError?.(error);
      },
      onCompleted: (data) => {
        toast({
          title: t('success'),
          description: t('Adjust Closing created successfully'),
        });

        const newId = data?.adjustClosingAdd?._id;

        const pathname = newId
          ? `/accounting/adjustment/closing/${newId}`
          : '/accounting/adjustment/closing';
        navigate(pathname);

        mutationOptions?.onCompleted?.(data);
      },
      refetchQueries: [ADJUST_CLOSING_QUERY],
      awaitRefetchQueries: false,
    });
  };

  return {
    addAdjustClosing,
    loading,
  };
};
