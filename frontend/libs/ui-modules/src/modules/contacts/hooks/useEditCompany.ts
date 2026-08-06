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
  }: MutationHookOptions<{ companiesEdit: ICompany }, ICompany>) => {
    return mutate({
      ...options,
      variables,
      update: (cache, { data }) => {
        const updated = data?.companiesEdit;

        if (!updated) {
          return;
        }

        const nextValues: Record<string, unknown> = {
          ...variables,
          ...updated,
        };
        delete nextValues.__typename;

        cache.modify({
          id: cache.identify(updated),
          fields: Object.keys(nextValues).reduce(
            (fields: Record<string, () => any>, field) => {
              fields[field] = () => nextValues[field];
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
