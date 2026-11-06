import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const [editIntegration, { loading }] = useMutation(EDIT_INTEGRATION);

  const mutate = (options: IntegrationEditOptions) => {
    return editIntegration({
      ...options,
      onCompleted: (data) => {
        if (!data.integrationsEditCommonFields?._id) {
          toast({
            title: t(
              'integration-save-failed',
              'Integration could not be saved. Please try again.',
            ),
            variant: 'destructive',
          });
          return;
        }
        options.onCompleted?.(data);
      },
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
      refetchQueries: (result) => {
        const requestedQueries =
          typeof options.refetchQueries === 'function'
            ? options.refetchQueries(result)
            : options.refetchQueries;
        if (typeof requestedQueries === 'string') return requestedQueries;
        return Array.from(
          new Set([
            'Integrations',
            'IntegrationDetail',
            'ChannelIntegrationsPeek',
            ...(requestedQueries ?? []),
          ]),
        );
      },
      awaitRefetchQueries: true,
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
