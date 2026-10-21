import { EDIT_INTEGRATION } from '@/integrations/graphql/mutations/EditIntegration';
import { useMutation, MutationFunctionOptions } from '@apollo/client';
import type {
  IntegrationsEditCommonFieldsMutation,
  IntegrationsEditCommonFieldsMutationVariables,
} from '~/gql/graphql';

type IntegrationEditOptions = MutationFunctionOptions<
  IntegrationsEditCommonFieldsMutation,
  IntegrationsEditCommonFieldsMutationVariables
>;

export const useIntegrationEdit = () => {
  const [editIntegration, { loading }] = useMutation(EDIT_INTEGRATION);

  const mutate = (options: IntegrationEditOptions) => {
    editIntegration({
      ...options,
      update: (cache, { data }) => {
        const integration = data?.integrationsEditCommonFields;
        if (!integration) return;

        cache.modify({
          id: cache.identify(integration),
          fields: Object.fromEntries(
            Object.entries(options.variables || {}).map(([field, value]) => [
              field,
              () => value,
            ]),
          ),
        });
      },
      refetchQueries: [
        'Integrations',
        'IntegrationDetail',
        'ChannelIntegrationsPeek',
      ],
    });
  };

  return {
    editIntegration: mutate,
    loading,
  };
};

export const useIntegrationEditField = (
  cellData: IntegrationsEditCommonFieldsMutationVariables,
) => {
  const { editIntegration, loading } = useIntegrationEdit();

  const editIntegrationField = (
    options: Omit<IntegrationEditOptions, 'variables'> & {
      variables?: Partial<IntegrationsEditCommonFieldsMutationVariables>;
    },
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
