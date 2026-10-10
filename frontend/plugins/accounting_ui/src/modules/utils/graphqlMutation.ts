import type { MutationHookOptions, ApolloError } from '@apollo/client';
import type { ResultOf, VariablesOf } from '@graphql-typed-document-node/core';

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
