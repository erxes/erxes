import { useMutation } from '@apollo/client';
import { REMOVE_BRANDS } from '../graphql';
import { useToast } from 'erxes-ui';

export const useBrandsRemove = () => {
  const { toast } = useToast();
  const [brandsRemove, { loading, error }] = useMutation(REMOVE_BRANDS, {
    onCompleted: () => toast({ title: 'Removed successfully!' }),
    refetchQueries: ['Brands'],
  });
  return {
    brandsRemove,
    loading,
    error,
  };
};
