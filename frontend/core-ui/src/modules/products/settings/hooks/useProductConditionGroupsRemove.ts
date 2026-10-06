import { useMutation } from '@apollo/client';
import { useConfirm, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PRODUCT_CONDITION_GROUPS_REMOVE } from '@/products/settings/graphql/mutations/productConditionGroups';

export const useProductConditionGroupsRemove = () => {
  const { t } = useTranslation('product');
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const [removeGroups, { loading }] = useMutation(
    PRODUCT_CONDITION_GROUPS_REMOVE,
    { refetchQueries: ['productConditionGroups'] },
  );

  const remove = (_ids: string[]) =>
    confirm({
      message: t(
        'condition-group-remove-confirm',
        'Products using these groups will lose their conditions. Delete?',
      ),
      options: { confirmationValue: 'delete' },
    }).then(() =>
      removeGroups({
        variables: { _ids },
        onCompleted: () =>
          toast({ title: t('condition-group-removed', 'Deleted') }),
        onError: (e) =>
          toast({
            title: t('error', 'Error'),
            description: e.message,
            variant: 'destructive',
          }),
      }),
    );

  return { remove, loading };
};
