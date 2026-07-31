import { useMutation } from '@apollo/client';
import { REMOVE_BRANDS } from '../graphql';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useBrandsRemove = () => {
  const { toast } = useToast();
  const { t } = useTranslation('settings', { keyPrefix: 'brands' });
  const [brandsRemove, { loading, error }] = useMutation(REMOVE_BRANDS, {
    onCompleted: () =>
      toast({
        title: t('removed-successfully', 'Removed successfully!'),
        variant: 'success',
      }),
    refetchQueries: ['Brands'],
  });
  return {
    brandsRemove,
    loading,
    error,
  };
};
