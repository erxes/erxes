import type { MutationHookOptions, ApolloError } from '@apollo/client';
import type { ResultOf, VariablesOf } from '@graphql-typed-document-node/core';
import { toast } from 'erxes-ui';
import { getI18n } from 'react-i18next';

export type GraphqlMutationOptions<
  Document,
  Injected extends keyof VariablesOf<Document> = never,
> = Omit<
  MutationHookOptions<ResultOf<Document>, VariablesOf<Document>>,
  'variables'
> & {
  variables?: Omit<VariablesOf<Document>, Injected> &
    Partial<Pick<VariablesOf<Document>, Injected>>;
};

export const notifyMutationResult = (success: boolean, description: string) => {
  toast({
    title: getI18n().t(success ? 'success' : 'error', { ns: 'accounting' }),
    description: description || undefined,
    variant: success ? 'success' : 'destructive',
  });
};

export const withMutationErrorToast = <
  Data,
  Variables extends Record<string, unknown>,
>(
  options: MutationHookOptions<Data, Variables>,
): MutationHookOptions<Data, Variables> => ({
  ...options,
  onError: (error: ApolloError) => {
    notifyMutationResult(false, error.message);
    options.onError?.(error);
  },
});

export const withMutationToast = <
  Data,
  Variables extends Record<string, unknown>,
>(
  options: MutationHookOptions<Data, Variables>,
  notify: (success: boolean, message: string) => void,
  message: string,
): MutationHookOptions<Data, Variables> => ({
  ...options,
  onError: (error: ApolloError) => {
    notify(false, error.message);
    options.onError?.(error);
  },
  onCompleted: (data: Data) => {
    notify(true, message);
    options.onCompleted?.(data);
  },
});
