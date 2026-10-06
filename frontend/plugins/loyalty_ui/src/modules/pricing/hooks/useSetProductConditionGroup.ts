import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { PRICING_PRODUCT_SET_CONDITION_GROUP } from '@/pricing/graphql/mutations';

export const useSetProductConditionGroup = () => {
  const { toast } = useToast();
  const [mutate, { loading }] = useMutation(
    PRICING_PRODUCT_SET_CONDITION_GROUP,
    { refetchQueries: ['PricingFixedValuesPage'], awaitRefetchQueries: true },
  );

  const setGroup = (productId: string, groupId: string, groupName: string) =>
    mutate({
      variables: { productIds: [productId], conditionGroupId: groupId },
      // Core skips deleted products and reports how many it changed.
      onCompleted: (data: { productsSetConditionGroup?: number }) =>
        data.productsSetConditionGroup
          ? toast({ title: `Added "${groupName}" to the product` })
          : toast({
              title: 'Product is deleted or missing',
              description: 'Its condition group was not changed.',
              variant: 'destructive',
            }),
      onError: (e) =>
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        }),
    });

  return { setGroup, loading };
};
