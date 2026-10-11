import type { MutationHookOptions } from '@apollo/client';
import { withMutationToast } from '@/utils/graphqlMutation';
import type { ResultOf, VariablesOf } from '@graphql-typed-document-node/core';
import { z } from 'zod';
import { useMemo } from 'react';

import type { GraphqlMutationOptions } from '@/utils/graphqlMutation';
import { toGraphqlView } from '@/utils/graphql';
import { useMutation, useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import {
  ACCOUNTINGS_CONFIGS_ADD,
  ACCOUNTINGS_CONFIGS_EDIT,
  ACCOUNTINGS_CONFIGS_REMOVE,
} from '@/settings/graphql/mutations/updateConfig';
import { GET_ACCOUNTING_CONFIGS } from '@/settings/graphql/queries/mainConfigs';

import { fixedAssetAccountConfigSchema } from '../constants/schema';

const FIXED_ASSET_ACCOUNTS_CODE = 'FIXEDASSET_ACCOUNTS';

type AccountConfigOptions<Document> = Omit<
  GraphqlMutationOptions<Document>,
  'variables'
> & {
  variables: Omit<VariablesOf<Document>, 'code' | 'subId' | 'value'> &
    z.infer<typeof fixedAssetAccountConfigSchema>;
};

const withToast = <Data, Variables extends Record<string, unknown>>(
  options: MutationHookOptions<Data, Variables>,
  message: string,
) =>
  withMutationToast(
    options,
    (success, description) => {
      toast({
        title: success ? 'Амжилттай' : 'Алдаа',
        description,
        variant: success ? 'success' : 'destructive',
      });
    },
    message,
  );

export const useFixedAssetAccountConfigs = () => {
  const {
    data: queryData,
    loading,
    error,
  } = useQuery(GET_ACCOUNTING_CONFIGS, {
    variables: { code: FIXED_ASSET_ACCOUNTS_CODE },
  });
  const data = toGraphqlView(queryData);

  const configs = useMemo(
    () =>
      (data?.accountingsConfigs ?? []).flatMap((config) => {
        if (!config.subId) return [];
        const parsed = fixedAssetAccountConfigSchema.shape.value.safeParse(
          config.value,
        );
        const value = parsed.success
          ? parsed.data
          : { accountId: config.subId };
        const accountId = value.accountId || config.subId;
        return [{ _id: config._id, accountId, value: { ...value, accountId } }];
      }),
    [data?.accountingsConfigs],
  );

  return { configs, loading, error };
};

const mutationOptions = { refetchQueries: ['AccountingsConfigs'] };

export const useFixedAssetAccountConfigMutations = () => {
  const [add, addState] = useMutation(ACCOUNTINGS_CONFIGS_ADD, mutationOptions);
  const [edit, editState] = useMutation(
    ACCOUNTINGS_CONFIGS_EDIT,
    mutationOptions,
  );
  const [remove, removeState] = useMutation(
    ACCOUNTINGS_CONFIGS_REMOVE,
    mutationOptions,
  );

  return {
    add: (options: AccountConfigOptions<typeof ACCOUNTINGS_CONFIGS_ADD>) => {
      const { accountId, value } = options.variables;
      return add(
        withToast<
          ResultOf<typeof ACCOUNTINGS_CONFIGS_ADD>,
          VariablesOf<typeof ACCOUNTINGS_CONFIGS_ADD>
        >(
          {
            ...options,
            variables: {
              code: FIXED_ASSET_ACCOUNTS_CODE,
              subId: accountId,
              value: { ...value, accountId },
            },
          },
          'Дансны багц нэмэгдлээ',
        ),
      );
    },
    edit: (options: AccountConfigOptions<typeof ACCOUNTINGS_CONFIGS_EDIT>) => {
      const { _id, accountId, value } = options.variables;
      return edit(
        withToast<
          ResultOf<typeof ACCOUNTINGS_CONFIGS_EDIT>,
          VariablesOf<typeof ACCOUNTINGS_CONFIGS_EDIT>
        >(
          {
            ...options,
            variables: {
              _id,
              subId: accountId,
              value: { ...value, accountId },
            },
          },
          'Дансны багц шинэчлэгдлээ',
        ),
      );
    },
    remove: (
      options: GraphqlMutationOptions<typeof ACCOUNTINGS_CONFIGS_REMOVE>,
    ) => remove(withToast(options, 'Дансны багц устгагдлаа')),
    adding: addState.loading,
    editing: editState.loading,
    removing: removeState.loading,
  };
};
