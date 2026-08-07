import { ApolloError } from '@apollo/client';

export const getErroredAliases = (error?: ApolloError): Set<string> =>
  new Set(
    (error?.graphQLErrors ?? [])
      .map((graphQLError) => graphQLError.path?.[0])
      .filter((alias): alias is string => typeof alias === 'string'),
  );

export const isPermissionError = (message: string): boolean =>
  /permission required/i.test(message);

const INVALID_FIELD_PATTERN = /Cannot query field "([^"]+)"/;

export const getInvalidFieldNames = (error?: ApolloError): string[] =>
  (error?.graphQLErrors ?? [])
    .map(
      (graphQLError) => graphQLError.message.match(INVALID_FIELD_PATTERN)?.[1],
    )
    .filter((field): field is string => typeof field === 'string');
