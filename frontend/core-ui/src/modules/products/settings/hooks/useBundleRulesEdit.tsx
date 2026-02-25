import { MutationHookOptions, useMutation } from '@apollo/client';
import { BUNDLE_RULES_EDIT } from '../graphql/mutations/bundleRules';
import { useToast } from 'erxes-ui';

export const useBundleRulesEdit = () => {
  const [editMutation, { loading, error }] = useMutation(BUNDLE_RULES_EDIT);
  const { toast } = useToast();

  const mutate = ({ variables, ...options }: MutationHookOptions) => {
    editMutation({
      ...options,
      variables,
      update: (cache, { data: { bundleRulesEdit } }) => {
        cache.modify({
          id: cache.identify(bundleRulesEdit),
          fields: Object.keys(variables || {}).reduce(
            (fields: Record<string, () => unknown>, field) => {
              if (field !== '_id') {
                fields[field] = () => (variables || {})[field];
              }
              return fields;
            },
            {},
          ),
        });
      },
      onCompleted: (data) => {
        if (data?.bundleRulesEdit) {
          toast({
            title: 'Bundle rule updated successfully',
            variant: 'success',
          });
          options?.onCompleted?.(data);
        }
      },
      onError: (err) => {
        toast({
          title: err.message,
          variant: 'destructive',
        });
        options?.onError?.(err);
      },
    });
  };

  return { bundleRulesEdit: mutate, loading, error };
};
