import { useMutation } from '@apollo/client';
import { useConfirm, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PRODUCT_CONDITIONS_REMOVE } from '@/products/settings/graphql/mutations/productConditions';

export const useProductConditionsRemove = () => {
  const { t } = useTranslation('product');
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const [removeConditions, { loading }] = useMutation(
    PRODUCT_CONDITIONS_REMOVE,
    { refetchQueries: ['productConditions'] },
  );

  const remove = (_ids: string[]) =>
    confirm({
      message: t(
        'condition-remove-confirm',
        'Products keep the code and get the condition back if one with the same code is created again. Delete?',
      ),
      options: { confirmationValue: 'delete' },
    }).then(() =>
      removeConditions({
        variables: { _ids },
        onCompleted: () => toast({ title: t('condition-removed', 'Deleted') }),
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
