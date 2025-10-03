import { EDIT_INTEGRATION } from '@/integrations/graphql/mutations/EditIntegration';
import { useMutation, MutationFunctionOptions } from '@apollo/client';

export const useIntegrationEdit = () => {
  const [editIntegration, { loading }] = useMutation(EDIT_INTEGRATION);

  const mutate = (options: MutationFunctionOptions) => {
    editIntegration({
      ...options,
      update: (cache, { data }) => {
        cache.modify({
          id: cache.identify(data.integrationsEditCommonFields),
          fields: Object.keys(options.variables || {}).reduce(
            (fields: any, field) => {
              fields[field] = () => (options.variables || {})[field];
              return fields;
            },
            {},
          ),
        });
      },
    });
  };

  return {
    editIntegration: mutate,
    loading,
  };
};

export const useIntegrationEditField = (
  cellData: MutationFunctionOptions['variables'],
) => {
  const { editIntegration, loading } = useIntegrationEdit();

  const editIntegrationField = (
    options: MutationFunctionOptions,
    skip = false,
  ) => {
    if (skip) return;

    editIntegration({
      ...options,
      variables: {
        ...cellData,
        ...options.variables,
      },
    });
  };

  return {
    editIntegrationField,
    loading,
  };
};
