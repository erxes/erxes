import { MutationHookOptions, useMutation } from '@apollo/client';
import { EDIT_COMPANIES } from '../graphql/mutations/editCompanies';
import { toast } from 'erxes-ui';
import { ICompany } from '../types';

export const useCompaniesEdit = () => {
  const [mutate, { loading }] = useMutation(EDIT_COMPANIES);

  const companiesEdit = ({
    variables,
    onError,
    ...options
  }: MutationHookOptions<{ companiesEdit: { _id: string } }, ICompany>) => {
    return mutate({
      ...options,
      variables,
      update: (cache, { data: { companiesEdit } }) => {
        cache.modify({
          id: cache.identify(companiesEdit),
          fields: Object.keys(variables || {}).reduce(
            (fields: Record<string, () => any>, field) => {
              fields[field] = () => (variables || {})[field as keyof ICompany];
              return fields;
            },
            {},
          ),
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

  return { companiesEdit, loading };
};
