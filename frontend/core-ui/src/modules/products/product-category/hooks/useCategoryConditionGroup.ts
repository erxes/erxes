import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PRODUCT_CATEGORY_SET_CONDITION_GROUP } from '@/products/settings/graphql/mutations/productConditionGroups';

export const useCategoryConditionGroup = (onDone: () => void) => {
  const { t } = useTranslation('product');
  const { toast } = useToast();
  const [setGroup, { loading }] = useMutation<{
    productCategorySetConditionGroup: number;
  }>(PRODUCT_CATEGORY_SET_CONDITION_GROUP, {
    refetchQueries: ['ProductsMain', 'PRODUCT_DETAIL_QUERY'],
  });

  const apply = (categoryId: string, conditionGroupId: string | null) =>
    setGroup({
      variables: { categoryId, conditionGroupId },
      onCompleted: (data) => {
        toast({
          title: t(
            'condition-group-applied',
            'Condition group set on {{count}} products',
            { count: data.productCategorySetConditionGroup },
          ),
        });
        onDone();
      },
      onError: (e) =>
        toast({
          title: t('error', 'Error'),
          description: e.message,
          variant: 'destructive',
        }),
    });

  return { apply, loading };
};
