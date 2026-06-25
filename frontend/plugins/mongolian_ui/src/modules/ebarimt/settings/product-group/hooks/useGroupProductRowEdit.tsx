import { useMutation } from '@apollo/client';
import { EBARIMT_PRODUCT_GROUP_EDIT } from '@/ebarimt/settings/product-group/graphql/mutations/productGroupMutations';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useGroupProductRowEdit = () => {
  const { t } = useTranslation('mongolian');
  const [editGroupProductRow, { loading }] = useMutation(
    EBARIMT_PRODUCT_GROUP_EDIT,
    {
      refetchQueries: ['EbarimtProductGroups'],
      awaitRefetchQueries: true,
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message || t('failed-to-update-product-group'),
          variant: 'destructive',
        });
      },
    },
  );

  return {
    editGroupProductRow,
    loading,
  };
};
