import { MutationHookOptions, useMutation } from '@apollo/client';
import { ADJUST_CLOSING_ENTRIES_EDIT } from '../graphql/adjustClosingEdit';
import { IAdjustClosingDetail } from '../types/AdjustClosing';
import { toast } from 'erxes-ui';

export const useAdjustClosingEntryEdit = () => {
  const [mutate, { loading }] = useMutation(ADJUST_CLOSING_ENTRIES_EDIT);

  const adjustClosingEdit = ({
    variables,
    onError,
    ...options
  }: MutationHookOptions<
    { adjustClosingEntry: { _id: string } },
    Partial<IAdjustClosingDetail>
  >) => {
    mutate({
      ...options,
      variables,
      update: (cache, { data }) => {
        if (!data?.adjustClosingEntry || !variables) return;

        cache.modify({
          id: cache.identify(data.adjustClosingEntry),
          fields: (
            Object.keys(variables) as (keyof IAdjustClosingDetail)[]
          ).reduce((acc, field) => {
            acc[field] = () => variables[field];
            return acc;
          }, {} as Record<string, () => any>),
          optimistic: true,
        });
      },

      onError: (error) => {
        if (onError) {
          onError(error);
        }
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };
  return { adjustClosingEdit, loading };
};
